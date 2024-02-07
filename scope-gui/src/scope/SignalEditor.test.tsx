import { useState } from "react";
import { SignalList } from "./Analyzer";
import { SignalEditor, SignalEditorProps } from "./SignalEditor";

export function TestSignalEditor() {
    const [signals, setSignals] = useState<SignalList>({});
    const props: SignalEditorProps = {
        signals: signals,
        addSignal: (name, src) => {
            let addSignalList: SignalList = {...signals};
            addSignalList[name] = {name: name, source: src};
            setSignals(addSignalList);
        },
        acquireSignal: (name, signal) => {},
        deleteSignal: (name) => {}
    };
    return <SignalEditor {...props}></SignalEditor>;
}