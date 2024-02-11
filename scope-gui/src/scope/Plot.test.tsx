import { PlotAnalog, PlotAnalogProps, PlotBinary, PlotBinaryProps } from "./Plot";
import { AnalogSignal, BinarySignal } from "./Signal";

export function TestPlotAnalog() {
    const length = 2048;
    const offset0 = 512;
    const sampleRate = 1e6;

    const ticks = [...Array(length).keys()].map((v) => (v - offset0) / sampleRate);
    const sinSignal: AnalogSignal = ticks.map((x) => Math.sin(sampleRate * x / 32));
    const cosSignal: AnalogSignal = ticks.map((x) => Math.cos(sampleRate * x / 32));

    const props: PlotAnalogProps = {
        y: [sinSignal, cosSignal],
        x: ticks,
        label: ["sin", "cos"]
    };
    return <PlotAnalog {...props}></PlotAnalog>
}

export function TestPlotBinary() {
    const length = 2048;
    const offset0 = 512;
    const sampleRate = 1e6;

    const ticks = [...Array(length).keys()].map((v) => (v - offset0) / sampleRate);
    const sinSignal: BinarySignal = ticks.map((x) => Math.sin(sampleRate * x / 32) > 0 ? 1 : 0);
    const cosSignal: BinarySignal = ticks.map((x) => Math.cos(sampleRate * x / 32 + 2) > 0 ? 1 : 0);

    const props: PlotBinaryProps = {
        y: [sinSignal, cosSignal],
        x: ticks,
        label: ["Q1", "Q2"]
    };
    return <PlotBinary {...props}></PlotBinary>
}