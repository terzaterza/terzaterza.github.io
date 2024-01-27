import { SignalData, SignalType } from "./Signal";
import { SignalSourceBlockFile, SignalSourceBlockProps } from "./SignalSource";

export function TestSignalSourceBlockFile() {
    const signalType: SignalType = "decoded";
    const onAcquireSignal = (data: SignalData): void => {
        console.log(data);
    };

    const props: SignalSourceBlockProps = {
        signalType: signalType,
        onAcquireSignal: onAcquireSignal
    }
    return <SignalSourceBlockFile {...props}></SignalSourceBlockFile>;
}