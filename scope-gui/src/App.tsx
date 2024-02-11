import React from 'react';
import logo from './logo.svg';
import './App.css';
import { TestAnalogWaveform, TestBinaryWaveform, TestDecodedWaveform } from './scope/Waveform.test';
import { TestSignalSourceFile } from './scope/SignalSource.test';
import { TestSignalDisplay } from './scope/Signal.test';
import { TestSignalEditor } from './scope/SignalEditor.test';
import { TestPlotAnalog, TestPlotBinary } from './scope/Plot.test';

function App() {
  return (
    <div className="App">
      <TestPlotAnalog></TestPlotAnalog>
      <TestPlotBinary></TestPlotBinary>
      <TestSignalSourceFile></TestSignalSourceFile>
      {/* <TestSignalDisplay></TestSignalDisplay> */}
      <TestSignalEditor></TestSignalEditor>
    </div>
  );
}

export default App;
