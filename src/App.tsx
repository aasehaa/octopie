/// <reference types="web-bluetooth" />
import React, { useState } from 'react';
import './App.css';


let device: any, server: any, service: any, characteristic: any;

function App() {
  let [connected, setConnected] = useState<string | null>(null)
  let [tempLog, setTempLog] = useState<number[] | null>(null)
  let [timeLog, setTimeLog] = useState<string[] | null>([]) // TODO: implement this
  let [gpsLog, setGpsLog] = useState<string[] | null>([]) // TODO: implement this
  // TODO: add this logging stuff on a map on the bottom of the page 


  async function connectBluetooth() {
    console.log('searching for devices...')

    // Connect Device
    // @ts-ignore
    let options = {
      acceptAllDevices: true,
      optionalServices: [0x180A],
    }

    device = await navigator.bluetooth.requestDevice(options);

    console.log('requested device');
    server = await device.gatt.connect();
    console.log('server: ', server)

    setConnected('MKR WiFi 1010')
    console.log('Available Services:', await server.getPrimaryServices());

  }

  async function readValues() {

    service = await server.getPrimaryService('0000180a-0000-1000-8000-00805f9b34fb');
    console.log('got service');
    characteristic = await service.getCharacteristic(0x2A6E);
    console.log('got characteristic');

    var rawTemp = await characteristic.readValue();
    // Convert the value to a number
    const floatValue = new DataView(rawTemp.buffer).getUint32(0, true); // Assuming little-endian format
    setTempLog((prevTempLog) => (prevTempLog ? [...prevTempLog, floatValue] : [floatValue]));

    // Get the current time and format it as a string
    const currentTime = new Date().toLocaleTimeString();
    setTimeLog((timeLog) => (timeLog ? [...timeLog, currentTime] : [currentTime]));

    // Get the current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsLog((prevGpsLog) => (prevGpsLog ? [
          ...prevGpsLog,
          `Lat: ${latitude}, Lng: ${longitude}`,
        ] : [`Lat: ${latitude}, Lng: ${longitude}`]));
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );

    console.log('Read value:', floatValue);
  }


  return (
    <div className="App">
      <p> Connect Bluetooth device</p>
      <div>
        <button id="ble" onClick={() => connectBluetooth()}>Connect Bluetooth</button>
        <br />
        <label>Connected to: {connected}</label>
        <p><button id='ble_again' onClick={() => readValues()}>Read value again</button></p>
        <p>Updated values:</p>
        {tempLog?.map((value, index) =>
          <p key={index}>
            Temperature: {value} - Time: {timeLog && timeLog[index]} - GPS: {gpsLog && gpsLog[index]}
          </p>
        )}
      </div>

    </div>
  );
}

export default App;
