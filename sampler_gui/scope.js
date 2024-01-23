"use strict";
var ScopeSerialResponse;
(function (ScopeSerialResponse) {
    ScopeSerialResponse[ScopeSerialResponse["OK"] = 0] = "OK";
    ScopeSerialResponse[ScopeSerialResponse["BUSY"] = 1] = "BUSY";
    ScopeSerialResponse[ScopeSerialResponse["ERROR"] = 2] = "ERROR";
})(ScopeSerialResponse || (ScopeSerialResponse = {}));
var ScopeSerialCommand;
(function (ScopeSerialCommand) {
    ScopeSerialCommand[ScopeSerialCommand["ANALOG_TRIGGER"] = 0] = "ANALOG_TRIGGER";
})(ScopeSerialCommand || (ScopeSerialCommand = {}));
class Scope {
    constructor(hardware_config) {
        this.port = null;
        this.hardware_config = hardware_config;
        this.analog_config = {
            sample_rate: 1,
            sample_size: 2,
            active_channels: 1
        };
    }
    async port_connect() {
        const filters = [
            { usbVendorId: 0x0483, usbProductId: 0x374b }, /* STM32L476RG */
        ];
        try {
            // @ts-expect-error
            const port = await navigator.serial.requestPort({ filters });
            await port.open({ baudRate: 115200 });
            this.port = port;
            this.start_receive_handler()
                .then(() => {
                console.log("Receive handler exited while loop");
            })
                .catch((e) => {
                console.log("Port receive process error");
            });
        }
        catch (e) {
            console.log("Couldn't connect to scope device!");
        }
    }
    port_info() {
        console.assert(this.port != null);
        return this.port.getInfo();
    }
    async port_read_bytes(length) {
        const reader = this.port.readable.getReader({ mode: "byob" });
        let buffer = new ArrayBuffer(length);
        let offset = 0;
        while (offset < length) {
            const { value, done } = await reader.read(new Uint8Array(buffer, offset));
            if (done) {
                break;
            }
            buffer = value.buffer;
            offset += value.byteLength;
        }
        reader.releaseLock();
        return buffer;
    }
    async handle_command(command) {
        switch (command) {
            case ScopeSerialCommand.ANALOG_TRIGGER:
                console.log("Scope analog trigger!");
                const message_format = new Uint16Array(await this.port_read_bytes(16));
                const sample_rate = message_format[0] + (message_format[1] << 16);
                const sample_size = message_format[2];
                const buff_len_per_ch = message_format[3];
                const trigger_position = message_format[4];
                const trigger_level = message_format[5];
                const buffer_count = message_format[6];
                let parsed_samples = [];
                for (let buff = 0; buff < buffer_count; buff++) {
                    const buffer_channels = new Uint16Array(await this.port_read_bytes(2))[0];
                    const buffer_size = buff_len_per_ch * buffer_channels * sample_size;
                    const buffer_recv = new Uint8Array(await this.port_read_bytes(buffer_size));
                    const buffer_parsed = parse_analog_sample_block(buffer_recv, sample_size, buffer_channels);
                    parsed_samples.push(...buffer_parsed);
                }
                analog_plot_samples(parsed_samples, trigger_position, trigger_level, sample_rate);
                break;
            default:
                console.warn("Scope serial command not recognized!");
        }
    }
    async start_receive_handler() {
        while (1) {
            const command = new Uint8Array(await this.port_read_bytes(1))[0];
            try {
                await this.handle_command(command);
            }
            catch (e) {
                console.warn("Error handling the command");
            }
        }
    }
}
function parse_analog_sample_block(block, sample_size = 2, channels = 2) {
    const samples_per_ch = block.length / sample_size / channels;
    console.assert(Math.trunc(samples_per_ch) == samples_per_ch);
    let out_samples = new Array(channels).fill(null).map((v) => new Uint16Array(samples_per_ch));
    for (let s = 0; s < samples_per_ch; s++) {
        for (let ch = 0; ch < channels; ch++) {
            const block_pos = (s * channels + ch) * sample_size;
            out_samples[ch][s] = block[block_pos];
            if (sample_size > 1) {
                out_samples[ch][s] += 256 * block[block_pos + 1];
            }
        }
    }
    return out_samples;
}
function test_parse_analog_sample_block() {
    const analog_range = [0, 3.3];
    const sample_size = 2;
    const channels = 2;
    const sample_count = 64;
    const sample_block = new Uint8Array(sample_count * sample_size * channels);
    const clamp = (value, min, max) => Math.min(max, Math.max(value, min));
    const adc = (value, min, max, bits) => clamp(Math.round((value - min) / (max - min) * Math.pow(2, bits)), 0, Math.pow(2, bits) - 1);
    for (let i = 0; i < sample_count; i++) {
        const analog_sample_0 = Math.sin(i * 0.2) + 1.4;
        const analog_sample_1 = Math.cos(i * 0.2) + 1.2;
        const digital_sample_0 = adc(analog_sample_0, analog_range[0], analog_range[1], 12);
        const digital_sample_1 = adc(analog_sample_1, analog_range[0], analog_range[1], 12);
        sample_block[i * sample_size * channels + 0] = digital_sample_0 & 255;
        sample_block[i * sample_size * channels + 1] = digital_sample_0 >> 8;
        sample_block[i * sample_size * channels + 2] = digital_sample_1 & 255;
        sample_block[i * sample_size * channels + 3] = digital_sample_1 >> 8;
    }
    const result = parse_analog_sample_block(sample_block, sample_size, channels);
    analog_plot_samples(result, 16);
}

