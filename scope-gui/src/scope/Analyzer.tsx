import React from "react";
import { Signal, SignalSourceType } from "./Signal";

export interface SignalInfo {
    name: string;
    source: SignalSourceType;
    signal?: Signal;
    // dependent: SignalInfo[]; // computed signals which use this as source
}

export type SignalList = {[name: string]: SignalInfo};

interface AnalyzerProps {

}

interface AnalyzerState {
    signals: SignalList;
    // scopes: {[name: string]: Scope}; // available scopes
}

class Analyzer extends React.Component<AnalyzerProps, AnalyzerState> {
    private addSignal(name: string, source: SignalSourceType) {
        const signals: SignalList = {
            ...this.state.signals,
            name: {
                name: name,
                source: source,
                // dependent: []
            }
        }
        this.setState({...this.state, signals: signals})
    }

    private updateSignal(name: string, signal: Signal) {
        let state: AnalyzerState = {...this.state};
        state.signals[name].signal = signal;
        // for (const dep of state.signals[name].dependent)
        //     state.signals[dep.name]
        this.setState({
            ...this.state,
            signals: {

            }
        });
    }
    
    constructor(props: AnalyzerProps) {
        super(props);
        this.state = {
            signals: {}
        };
    }
}