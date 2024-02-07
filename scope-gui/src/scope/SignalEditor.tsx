import React from "react";
import { Signal, SignalSourceType } from "./Signal";
import { SignalInfo, SignalList } from "./Analyzer";
import { SignalSourceFile } from "./SignalSource";

export interface SignalEditorProps {
    signals: SignalList;
    addSignal: (name: string, source: SignalSourceType) => void;
    acquireSignal: (name: string, signal: Signal) => void;
    deleteSignal: (name: string) => void;
}

interface SignalEditorState {
    signalToAddName: string;
    signalToAddSource: SignalSourceType;
    selectedSignal?: SignalInfo;
}

export class SignalEditor extends React.Component<SignalEditorProps, SignalEditorState> {
    constructor(props: SignalEditorProps) {
        super(props);
        this.state = {
            signalToAddName: "",
            signalToAddSource: "file"
        };
    }
    render(): React.ReactNode {
        return (
        <div>
            <div className="signal-editor-add-signal-block">
                <input type="text" maxLength={16} value={this.state.signalToAddName} placeholder="Signal name"
                    onChange={(event) => { this.setState({signalToAddName: event.target.value}); }}></input>
                <select value={this.state.signalToAddSource}
                    onChange={(event) => { this.setState({signalToAddSource: event.target.value as SignalSourceType}); }}>
                    <option value={"file"}>From file</option>
                    <option value={"scope"}>From scope</option>
                    <option value={"computed"}>Computed</option>
                </select>
                <button onClick={(event) => {
                    this.props.addSignal(this.state.signalToAddName, this.state.signalToAddSource);
                }}>Add signal</button>
            </div>
            <select className="signal-editor-signal-list" size={8} onChange={(event) => {
                this.setState({selectedSignal: this.props.signals[event.target.value]});
            }}>
                {Object.entries(this.props.signals).map(([name, signalInfo]) => (
                    /** @todo Display signal source type, and signal data type if available */
                    <option key={name} value={name}>{name}</option>
                ))}
            </select>
            {this.state.selectedSignal &&
            <div className="signal-editor-selected-signal-info">
                <h3>{this.state.selectedSignal.name}</h3>
                
                {this.state.selectedSignal.source == "file" &&
                <SignalSourceFile onAcquireSignal={(signal: Signal) => {
                    // @ts-expect-error
                    this.props.acquireSignal(this.state.selectedSignal.name, signal);
                }}/>}
            </div>}
        </div>
        );
    }
}