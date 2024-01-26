import React from 'react';
import logo from './logo.svg';
import './App.css';
import { TestAnalogWaveform, TestBinaryWaveform, TestDecodedWaveform } from './scope/Waveform.test';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
      </header>
      <TestAnalogWaveform></TestAnalogWaveform>
      <TestBinaryWaveform></TestBinaryWaveform>
      <TestDecodedWaveform></TestDecodedWaveform>
    </div>
  );
}

export default App;
