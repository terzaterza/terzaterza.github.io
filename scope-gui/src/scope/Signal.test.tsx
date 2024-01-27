import { AnalogSignal, Signal, SignalDisplay, SignalProps } from "./Signal";

export function TestSignalDisplay() {
    const length = 2048;
    const offset0 = 512;
    const sampleRate = 1e6;

    const xTicks = [...Array(length).keys()].map((v) => (v - offset0) / sampleRate);
    const sinSignal: AnalogSignal = xTicks.map((x) => Math.sin(sampleRate * x / 32));
    const cosSignal: AnalogSignal = xTicks.map((x) => Math.cos(sampleRate * x / 32));
    
    const signalProps: SignalProps = {
        dataType: "analog",
        data: [sinSignal, cosSignal],
        ticks: xTicks,
        name: "Test signal",
        sourceType: "file",
        onAcquireSignal: (signal: Signal) => { console.log("Success acquiring"); }
    };
    return <SignalDisplay {...signalProps}></SignalDisplay>;
}