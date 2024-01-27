import React from "react";
import Plot, { PlotParams } from "react-plotly.js";
import { Sample, AnalogSignal, BinarySignal, DecodedSignal } from "./Signal";

export interface AnalogWaveformProps {
    waveforms: AnalogSignal | AnalogSignal[];
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
        
        /** @todo Maybe move this to render */
        /* If there are multiple waveforms, check for same length */
        if (props.waveforms[0] instanceof Array) {
            const waveforms = props.waveforms as AnalogSignal[];
            this.waveformLength = waveforms[0].length;
            console.assert(waveforms.every((w) => w.length === this.waveformLength));
        } else {
            this.waveformLength = props.waveforms.length;
        }
    }

    render(): React.ReactNode {
        const waveformColors = ["FFEE00", "00FFFF", "AA00FF", "00FFAA"];
        const waveforms = (this.props.waveforms[0] instanceof Array ?
            this.props.waveforms : [this.props.waveforms]) as AnalogSignal[];
        const xTicks = this.props.xTicks ?? [...Array(this.waveformLength).keys()];
        const plotProps: PlotParams = {
            data: waveforms.map((w, i) => ({
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
                line: {color: "00FF88", shape: "vh"}
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
        const xTicks = this.props.xTicks ?? [...Array(this.props.waveform.length).keys()];
        const xStep = xTicks[1] - xTicks[0];

        let noRepeatWaveform: DecodedSignal = [this.props.waveform[0]];
        let noRepeatTicks: number[] = [xTicks[0]];

        for (let i = 1; i < this.props.waveform.length; i++) {
            if (this.props.waveform[i] !== this.props.waveform[i-1]) {
                noRepeatWaveform.push(this.props.waveform[i]);
                noRepeatTicks.push(xTicks[i]);
            }
        }

        const waveformPaths = noRepeatTicks.map((t) => "L "+t+" 1 L "+t+" 0 M "+t+" 1");
        const waveformPath = "M " + xTicks[0] + " 1" + waveformPaths.join(" ");
        
        const plotProps: PlotParams = {
            data: [{
                x: noRepeatTicks.map((t) => t + xStep / 5),
                y: Array(noRepeatWaveform.length).fill(0.5),
                mode: "text",
                text: noRepeatWaveform
            }],
            layout: {
                yaxis: {range: [-0.1, 1.1]},
                shapes: [
                    {type: "path", path: waveformPath, line: {color: "00FF88", width: 1}}
                ]
            }
        };
        return <Plot {...plotProps}></Plot>;
    }
}