import { AnalogSignal, BinarySignal, DecodedSignal } from "./Signal";
import { AnalogWaveform, AnalogWaveformProps, BinaryWaveform, BinaryWaveformProps, DecodedWaveform, DecodedWaveformProps } from "./Waveform";

export function TestAnalogWaveform() {
    const length = 2048;
    const offset0 = 512;
    const sampleRate = 1e6;

    const xTicks = [...Array(length).keys()].map((v) => (v - offset0) / sampleRate);
    const sinSignal: AnalogSignal = xTicks.map((x) => Math.sin(sampleRate * x / 32));
    const cosSignal: AnalogSignal = xTicks.map((x) => Math.cos(sampleRate * x / 32));

    const props: AnalogWaveformProps = {
        waveforms: [sinSignal, cosSignal],
        yRange: [-2, 2],
        xTicks: xTicks,
    };
    return <AnalogWaveform {...props}></AnalogWaveform>
}

export function TestBinaryWaveform() {
    const length = 128;
    const offset0 = 32;
    const sampleRate = 1e6;

    const xTicks = [...Array(length).keys()].map((v) => (v - offset0) / sampleRate);
    const binSignal: BinarySignal = xTicks.map((x) => (Math.abs(x * sampleRate) % 2) as (0 | 1));

    const props: BinaryWaveformProps = {
        waveform: binSignal,
        xTicks: xTicks,
    };
    return <BinaryWaveform {...props}></BinaryWaveform>
}

export function TestDecodedWaveform() {
    const length = 128;
    const offset0 = 32;
    const sampleRate = 1e6;

    const xTicks = [...Array(length).keys()].map((v) => (v - offset0) / sampleRate);
    const decSignal: DecodedSignal = xTicks.map((x) => Math.round(Math.random() * 3));

    const props: DecodedWaveformProps = {
        waveform: decSignal,
        xTicks: xTicks,
    };
    return <DecodedWaveform {...props}></DecodedWaveform>
}