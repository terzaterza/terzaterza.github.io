import React from "react";
import { Signal, signalDeserialize } from "./Signal";

/**
 * Common to all signal source types
 */
export interface SignalSourceProps {
    onAcquireSignal: (signal: Signal) => void;
}

/**
 * If the file is already read, the read button is disabled
 */
interface SignalSourceFileState {
    fileSelected?: File;
    selectedFileRead: boolean;
}

export class SignalSourceFile extends React.Component<SignalSourceProps, SignalSourceFileState> {
    constructor(props: SignalSourceProps) {
        super(props);
        this.state = {
            selectedFileRead: false
        };
    }

    render(): React.ReactNode {
        return <div className="signal-source-block signal-source-block-file">

            <input className="signal-source-file-input" type="file" onChange={(event) => {
                console.log(event?.target.files);
                if (event.target.files) {
                    this.setState({
                        fileSelected: event.target.files[0],
                        selectedFileRead: false
                    });
                }
            }}></input>

            <button className="signal-source-file-button" disabled={this.state.selectedFileRead} onClick={(event) => {
                if (this.state.fileSelected) {
                    const reader = new FileReader();
                    reader.addEventListener("load", (event) => {
                        try {
                            const signal = signalDeserialize(event.target?.result as string);
                            this.props.onAcquireSignal(signal);
                            this.setState({selectedFileRead: true});
                        } catch (e) {
                            console.error("Error parsing the file");
                        }
                    });
                    reader.readAsText(this.state.fileSelected);
                }
            }}>Read</button>

        </div>
    }
}