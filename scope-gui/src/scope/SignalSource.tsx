import React from "react";
import { SignalData, SignalType } from "./Signal";

/**
 * Common to all signal fetchers
 */
export interface SignalSourceBlockProps {
    signalType: SignalType;
    onAcquireSignal: (data: SignalData) => void;
}

/**
 * If the file is already read, the read button is disabled
 */
interface SignalSourceBlockFileState {
    fileSelected?: File;
    selectedFileRead: boolean;
}

export class SignalSourceBlockFile extends React.Component<SignalSourceBlockProps, SignalSourceBlockFileState> {
    constructor(props: SignalSourceBlockProps) {
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
                        const data = event.target?.result as ArrayBuffer;
                        if (this.props.signalType === "analog")
                            this.props.onAcquireSignal(Array.from(new Uint16Array(data)));
                        else
                            this.props.onAcquireSignal(Array.from(new Uint8Array(data)));
                        this.setState({selectedFileRead: true});
                    });
                    reader.readAsArrayBuffer(this.state.fileSelected);
                }
            }}>Read</button>

        </div>
    }
}