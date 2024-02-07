import { Signal, SignalType } from "./Signal";
import { SignalSourceFile, SignalSourceProps } from "./SignalSource";

export function TestSignalSourceFile() {
    const onAcquireSignal = (signal: Signal): void => {
        console.log(signal);
    };

    const props: SignalSourceProps = {
        onAcquireSignal: onAcquireSignal
    }
    return <SignalSourceFile {...props}></SignalSourceFile>;
}