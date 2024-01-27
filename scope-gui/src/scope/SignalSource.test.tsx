import { Signal, SignalData, SignalType } from "./Signal";
import { SignalSourceFile, SignalSourceProps } from "./SignalSource";

export function TestSignalSourceFile() {
    const signalType: SignalType = "decoded";
    const onAcquireSignal = (signal: Signal): void => {
        console.log(signal);
    };

    const props: SignalSourceProps = {
        onAcquireSignal: onAcquireSignal
    }
    return <SignalSourceFile {...props}></SignalSourceFile>;
}