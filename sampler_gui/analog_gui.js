const analog_adc_res = 12; // 12-bit adc
const analog_vref_pos = 3.3; // 3.3V max voltage
const analog_vref_neg = 0;

let analog_active_channels = 2;
let analog_sample_rate = 48000; /* 48kHz */
let analog_buff_len_per_ch = 64;
let analog_window_len_time = analog_buff_len_per_ch / analog_sample_rate; /* 1us */
let analog_window_len_samples;
let analog_trigger_level_volts;
let analog_trigger_level_adc;
let analog_plot_div;

/* add pre_holdoff and post_holdoff */

function analog_init()
{
    analog_plot_div = document.getElementById("analog_plot");
    const layout = {yaxis: {range: [analog_vref_neg, analog_vref_pos]}, xaxis: {exponentformat: "SI"}};
    const channel_0_trace = {mode: "lines", line: {"color": "#80CAF6"}};
    const channel_1_trace = {mode: "lines", line: {"color": "#FCC060"}};
    Plotly.newPlot(analog_plot_div, [channel_0_trace, channel_1_trace], layout);
}

function time_to_analog_samples(time)
{
    return Math.ceil(time / analog_sample_rate);
}

function voltage_to_adc_level(voltage)
{
    if (voltage < analog_vref_neg || voltage > analog_vref_pos) {
        throw "Voltage level out of bounds";
    }
    v_full_scale = analog_vref_pos - analog_vref_neg;
    adc_max_val = Math.pow(2, analog_adc_res) - 1;
    return Math.round((voltage - analog_vref_neg) * adc_max_val / v_full_scale);
}

function analog_set_trigger_level(trig_level_volts)
{
    if (trig_level_volts < analog_vref_neg || trig_level_volts > analog_vref_pos) {
        throw "Trigger level out of bounds";
    }
    analog_trigger_level_volts = trig_level_volts;
    analog_trigger_level_adc = voltage_to_adc_level(trig_level_volts);
}

function analog_plot_samples(samples, trigger_position, trigger_level=2048, sample_rate=null, y_axis="voltage")
{
    const sample_count = samples[0].length;
    console.assert(samples.every((arr) => arr.length === sample_count));
    let x_ticks = [...Array(sample_count).keys()].map((v) => (v - trigger_position));

    if (sample_rate !== null) {
        x_ticks = x_ticks.map((v) => (v / sample_rate));
        
        if (sample_rate >= 1e6)
            sample_rate = Math.fround(sample_rate / 1e6) + "M";
        else if (sample_rate >= 1e3)
            sample_rate = Math.fround(sample_rate / 1e3) + "k";
        document.querySelector("#sample_rate").textContent = sample_rate + "sps";
    }
    if (y_axis === "voltage") {
        const res = Math.pow(2, analog_adc_res);
        const scale = (s) => (s / res * (analog_vref_pos - analog_vref_neg) + analog_vref_neg);
        samples = samples.map((arr) => Array.from(arr).map((v) => scale(v)));
        trigger_level = scale(trigger_level);
        document.querySelector("#trig_lvl").textContent = Math.round(trigger_level * 100) / 100 + "V";
    }
    const trigger_line = {color: 'ffdd44', width: 2};
    const plot_update_data = {x: Array(samples.length).fill(x_ticks), y: samples};
    const plot_update_layout = {shapes: [
        {type:"line", x0: x_ticks[0], x1: x_ticks[x_ticks.length-1], y0: trigger_level, y1: trigger_level, line: trigger_line, opacity: 0.6}
    ]};
    Plotly.update(analog_plot_div, plot_update_data, plot_update_layout);
}