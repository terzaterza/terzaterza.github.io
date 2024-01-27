import React from "react";
import { AnalogWaveform, BinaryWaveform, DecodedWaveform } from "./Waveform";

export type Sample = number;

export type AnalogSignal = Sample[];
export type BinarySignal = (0 | 1)[];
export type DecodedSignal = (number | string)[];

type SignalType = "analog" | "binary" | "decoded";
type SignalSourceType = Signal | "scope" | "file";
type SignalSources = Map<string, SignalSourceType>;
type SignalData = AnalogSignal | AnalogSignal[] | BinarySignal | DecodedSignal;

interface Signal {
    type: SignalType;
    sources: SignalSources;
    /* Data is optional since when type is "decoded", it is computed from the sources */
    data?: SignalData;
    decoder?: (sources: SignalSources) => SignalData;
}

class SignalDisplay extends React.Component<Signal> {
    constructor(props: Signal) {
        super(props);
        /* Assert that if no data, signal is decoded */
        console.assert(props.data ?? (props.type === "decoded" && props.decoder));
    }

    render(): React.ReactNode {
        // @ts-expect-error - decoder definition checked for in constructor
        const signalData: SignalData = this.props.data ?? this.props.decoder(this.props.sources);

        return (<div className="signalDisplay">
            <div className="signalInfo"></div>
            {this.props.type === "analog" &&
            (<AnalogWaveform
                waveforms={signalData as AnalogSignal | AnalogSignal[]}
                yRange={[-5, 5]}></AnalogWaveform>)}
            {this.props.type === "binary" &&
            <BinaryWaveform
                waveform={signalData as BinarySignal}></BinaryWaveform>}
            {this.props.type === "decoded" &&
            <DecodedWaveform
                waveform={signalData as DecodedSignal}></DecodedWaveform>}
        </div>);
    }
}