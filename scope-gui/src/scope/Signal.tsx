import React from "react";
import { AnalogWaveform, BinaryWaveform, DecodedWaveform } from "./Waveform";
import { SignalSourceFile } from "./SignalSource";

export type AnalogSignal = number[];
export type BinarySignal = (0 | 1)[];
export type DecodedSignal = (number | string)[];

export type SignalType = "analog" | "binary" | "decoded";
export type SignalSourceType = "scope" | "file" | "computed" | "mqtt";

export interface Signal {
    data: AnalogSignal | BinarySignal | DecodedSignal;
    dataType: SignalType;
    offset?: number;
    ticks?: number[];
    sampleRate?: number; // not used if ticks are specified
}

export function signalSave(signal: Signal) {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(signalSerialize(signal)));
    element.setAttribute("download", "signal.json");
    element.style.display = "none";
    element.click();
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