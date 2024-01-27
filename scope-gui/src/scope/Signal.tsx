import React from "react";
import { AnalogWaveform, BinaryWaveform, DecodedWaveform } from "./Waveform";
import { SignalSourceFile } from "./SignalSource";

export type AnalogSignal = number[];
export type BinarySignal = (0 | 1)[];
export type DecodedSignal = (number | string)[];

export type SignalData = AnalogSignal | AnalogSignal[] | BinarySignal | DecodedSignal;
export type SignalType = "analog" | "binary" | "decoded";
export type SignalSourceType = "scope" | "file" | "computed";

export interface Signal {
    dataType: SignalType;
    data: SignalData;
    ticks: number[];
}

export interface SignalProps extends Signal {
    name: string;
    sourceType: SignalSourceType;
    onAcquireSignal: (signal: Signal) => void;
}

export class SignalDisplay extends React.Component<SignalProps> {
    private saveSignal(event: React.MouseEvent) {
        const element = document.createElement("a");
        const signal: Signal = {data: this.props.data, dataType: this.props.dataType, ticks: this.props.ticks};
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(signalSerialize(signal)));
        element.setAttribute("download", "signal.json");
        element.style.display = "none";
        element.click();
    }

    render(): React.ReactNode {
        return (<div className="signalDisplay">
            {this.props.dataType === "analog" &&
            (<AnalogWaveform
                waveforms={this.props.data as AnalogSignal | AnalogSignal[]}
                xTicks={this.props.ticks} yRange={[-5, 5]}></AnalogWaveform>)}
            {this.props.dataType === "binary" &&
            <BinaryWaveform waveform={this.props.data as BinarySignal}></BinaryWaveform>}
            {this.props.dataType === "decoded" &&
            <DecodedWaveform waveform={this.props.data as DecodedSignal}></DecodedWaveform>}
            
            <button onClick={(event) => this.saveSignal(event)}>Save signal</button>
            {this.props.sourceType === "file" &&
            <SignalSourceFile onAcquireSignal={this.props.onAcquireSignal}></SignalSourceFile>}
        </div>);
    }
}

export function signalSerialize(signal: Signal): string {
    const numberArrayStringify = (key: string, value: any) => {
        if (!(value instanceof Array && value.length > 0 && typeof value[0] === "number"))
            return value;
        const floatBuff = new Float32Array(value);
        // @ts-expect-error
        return btoa(String.fromCharCode.apply(null, new Uint8Array(floatBuff.buffer)));
    };
    return JSON.stringify(signal, numberArrayStringify);
}

export function signalDeserialize(data: string): Signal {
    const base64toData = (key: string, value: any) => {
        if (typeof value === "string" && value.length > 32) {
            const uintBuff = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
            return new Float32Array(uintBuff.buffer);
        }
        return value;
    };
    return JSON.parse(data, base64toData) as Signal;
}