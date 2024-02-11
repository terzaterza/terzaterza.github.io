import { ReactNode } from "react";
import { AnalogSignal, BinarySignal, DecodedSignal } from "./Signal";
import Plot, { PlotParams } from "react-plotly.js";
import React from "react";

type Ticks = number[];

export interface PlotAnalogProps {
    y: AnalogSignal[];
    x?: Ticks;
    yRange?: [number, number];
    label?: string[];
    grid?: boolean;
}

export class PlotAnalog extends React.Component<PlotAnalogProps> {
    render(): ReactNode {
        const plotlyProps: PlotParams = {
            data: this.props.y.map((y, i) => ({
                y: y,
                x: this.props.x,
                mode: "lines",
                name: this.props.label && this.props.label[i]
            })),
            layout: {
                yaxis: {range: this.props.yRange}
            }
        };
        return <Plot {...plotlyProps}></Plot>
    }
}

export interface PlotBinaryProps {
    y: BinarySignal[];
    x?: Ticks;
    label?: string[];
}

export class PlotBinary extends React.Component<PlotBinaryProps> {
    render(): ReactNode {
        const signalCount = this.props.y.length;
        const yAxisDomainStep = 1 / signalCount;
        const layoutYAxis = Array(signalCount).fill(null).map((v, i) => ([
            "yaxis" + (i > 0 ? (i+1) : ""), {
                domain: [i*yAxisDomainStep, (i+1)*yAxisDomainStep]
            }
        ]));
        const plotlyProps: PlotParams = {
            data: this.props.y.map((y, i) => ({
                y: y,
                x: this.props.x,
                mode: "lines",
                line: {shape: "vh"},
                name: this.props.label && this.props.label[i],
                yaxis: "y" + (i+1)
            })),
            layout: {
                ...Object.fromEntries(layoutYAxis)
            }
        };
        return <Plot {...plotlyProps}></Plot>
    }
}

/*
export interface PlotDecodedProps {
    y: DecodedSignal;
    x?: Ticks;
    dx?: number;
    label?: string[];
}

export class PlotDecoded extends React.Component<PlotDecodedProps> {
    render(): ReactNode {
        
    }
}
*/