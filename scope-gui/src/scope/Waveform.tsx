import React from "react";
import Plot, { PlotParams } from "react-plotly.js";
import { Sample, AnalogSignal, BinarySignal, DecodedSignal } from "./Signal";

export interface AnalogWaveformProps {
    waveforms: AnalogSignal[];
    yRange: [Sample, Sample];
    xTicks?: number[];
    sharedXAxis?: any;
    grid?: boolean;
    labels?: string[];
}

export class AnalogWaveform extends React.Component<AnalogWaveformProps> {
    private waveformLength: number;

    constructor(props: AnalogWaveformProps) {
        super(props);
        
        /* If there are multiple waveforms, check for same length */
        this.waveformLength = props.waveforms[0].length;
        if (props.waveforms.length > 1) {
            console.assert(props.waveforms.every((w) => w.length === this.waveformLength));
        }
    }

    render(): React.ReactNode {
        const waveformColors = ["FFEE00", "00FFFF", "AA00FF", "00FFAA"];
        const xTicks = this.props.xTicks ?? [...Array(this.waveformLength).keys()];
        const plotProps: PlotParams = {
            data: this.props.waveforms.map((w, i) => ({
                x: xTicks,
                y: w,
                mode: "lines",
                line: {color: waveformColors[i]}
            })),
            layout: {yaxis: {range: this.props.yRange}}
        };
        return <Plot {...plotProps}></Plot>;
    }
}

export interface BinaryWaveformProps {
    waveform: BinarySignal;
    xTicks?: number[];
    sharedXAxis?: any;
}

export class BinaryWaveform extends React.Component<BinaryWaveformProps> {
    render(): React.ReactNode {
        const xTicks = this.props.xTicks ?? [...Array(this.props.waveform.length).keys()];
        const plotProps: PlotParams = {
            data: [{
                x: xTicks,
                y: this.props.waveform,
                mode: "lines",
                line: {color: "00FF88", shape: "hvh"}
            }],
            layout: {yaxis: {range: [-0.1, 1.1]}}
        };
        return <Plot {...plotProps}></Plot>;
    }
}

export interface DecodedWaveformProps {
    waveform: DecodedSignal;
    xTicks?: number[];
    sharedXAxis?: boolean;
}

export class DecodedWaveform extends React.Component<DecodedWaveformProps> {
    render(): React.ReactNode {
        return <div></div>;
    }
}