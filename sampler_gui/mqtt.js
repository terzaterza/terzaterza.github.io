/**
 * Copyright 2013 dc-square GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author: Christoph Schäbel
 */

function randomClientId(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return "clientId-" + text;
}

var samplePayloadCounter = 0;
var samplePayloadBuffer = new Uint8Array(65536);
var samplePayloadParsingHeader = true;
function parsePayloadSamples(buffer) {
    const payloadHeaderSize = 16;
    if (samplePayloadParsingHeader && buffer.length != payloadHeaderSize)
        return;
    samplePayloadBuffer.set(buffer, samplePayloadCounter);
    samplePayloadCounter += buffer.length;
    if (samplePayloadParsingHeader && samplePayloadCounter >= payloadHeaderSize) {
        this.message_format = new Uint16Array(samplePayloadBuffer.slice(0, payloadHeaderSize).buffer);
        this.sample_rate = message_format[0] + (message_format[1] << 16);
        this.sample_size = message_format[2];
        this.buff_len_per_ch = message_format[3];
        this.trigger_position = message_format[4];
        this.trigger_level = message_format[5];
        this.buffer_count = message_format[6];
        this.buffer_0_channels = message_format[7];
        samplePayloadParsingHeader = false;
    }
    if (samplePayloadParsingHeader)
        return;
    const buffer_size = this.buff_len_per_ch * this.buffer_0_channels * this.sample_size;
    if (samplePayloadCounter - payloadHeaderSize >= buffer_size) {
        samplePayloadParsingHeader = true;
        samplePayloadCounter = 0;
        const buffer_recv = samplePayloadBuffer.slice(payloadHeaderSize, payloadHeaderSize + buffer_size);
        const buffer_parsed = parse_analog_sample_block(buffer_recv, this.sample_size, this.buffer_0_channels);
        analog_plot_samples(buffer_parsed, this.trigger_position, this.trigger_level, this.sample_rate);
    }
}

var websocketclient = {
    'client': null,
    'lastMessageId': 1,
    'lastSubId': 1,
    'subscriptions': [],
    'messages': [],
    'connected': false,

    'connect': function (host="mqtt-dashboard.com", port=8884, clientId=null, username="", password="", keepAlive=60) {
        if (clientId === null)
            clientId = randomClientId(10);
        var cleanSession = true;
        var lwTopic = "";
        var lwQos = 0;
        var lwRetain = false;
        var lwMessage = "";
        var ssl = true;

        this.client = new Messaging.Client(host, port, clientId);
        this.client.onConnectionLost = this.onConnectionLost;
        this.client.onMessageArrived = this.onMessageArrived;

        var options = {
            timeout: 3,
            keepAliveInterval: keepAlive,
            cleanSession: cleanSession,
            useSSL: ssl,
            onSuccess: this.onConnect,
            onFailure: this.onFail
        };

        if (username.length > 0) {
            options.userName = username;
        }
        if (password.length > 0) {
            options.password = password;
        }
        if (lwTopic.length > 0) {
            var willmsg = new Messaging.Message(lwMessage);
            willmsg.qos = lwQos;
            willmsg.destinationName = lwTopic;
            willmsg.retained = lwRetain;
            options.willMessage = willmsg;
        }

        this.client.connect(options);
    },

    'onConnect': function () {
        websocketclient.connected = true;
        console.log("connected");
    },

    'onFail': function (message) {
        websocketclient.connected = false;
        console.log("error: " + message.errorMessage);
    },

    'onConnectionLost': function (responseObject) {
        websocketclient.connected = false;
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
        // $('body.connected').removeClass('connected').addClass('notconnected').addClass('connectionbroke');

        //Cleanup messages
        websocketclient.messages = [];

        //Cleanup subscriptions
        websocketclient.subscriptions = [];
    },

    'onMessageArrived': function (message) {
       console.log("onMessageArrived:", message.payloadBytes);

        var subscription = websocketclient.getSubscriptionForTopic(message.destinationName);

        parsePayloadSamples(message.payloadBytes);
    },

    'disconnect': function () {
        this.client.disconnect();
    },

    'publish': function (topic, payload, qos, retain) {

        if (!websocketclient.connected) {
            return false;
        }

        var message = new Messaging.Message(payload);
        message.destinationName = topic;
        message.qos = qos;
        message.retained = retain;
        this.client.send(message);
    },

    'subscribe': function (topic, qosNr, color) {

        if (!websocketclient.connected) {
            return false;
        }

        if (topic.length < 1) {
            return false;
        }

        // if (_.find(this.subscriptions, { 'topic': topic })) {
        //     return false;
        // }

        this.client.subscribe(topic, {qos: qosNr});
        if (color.length < 1) {
            color = '999999';
        }

        var subscription = {'topic': topic, 'qos': qosNr, 'color': color};
        this.subscriptions.push(subscription);
        return true;
    },

    'unsubscribe': function (id) {
        var subs = _.find(websocketclient.subscriptions, {'id': id});
        this.client.unsubscribe(subs.topic);
        websocketclient.subscriptions = _.filter(websocketclient.subscriptions, function (item) {
            return item.id != id;
        });

    },

    'deleteSubscription': function (id) {
        var elem = $("#sub" + id);

        if (confirm('Are you sure ?')) {
            elem.remove();
            this.unsubscribe(id);
        }
    },

    'getSubscriptionForTopic': function (topic) {
        var i;
        for (i = 0; i < this.subscriptions.length; i++) {
            if (this.compareTopics(topic, this.subscriptions[i].topic)) {
                return this.subscriptions[i];
            }
        }
        return false;
    },

    'getColorForPublishTopic': function (topic) {
        var id = this.getSubscriptionForTopic(topic);
        return this.getColorForSubscription(id);
    },


    'compareTopics': function (topic, subTopic) {
        var pattern = subTopic.replace("+", "(.*?)").replace("#", "(.*)");
        var regex = new RegExp("^" + pattern + "$");
        return regex.test(topic);
    },
};

// websocketclient.prefill()