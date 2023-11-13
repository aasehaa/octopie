/// <reference types="web-bluetooth" />
import React, { useState } from 'react';
import './App.css';


let device: any,
  server: any,
  service: any,
  tempChar: any,
  humidityChar: any,
  pressureChar: any,
  illuminanceChar: any;

function App() {
  let [connected, setConnected] = useState<string | null>(null)
  let [tempLog, setTempLog] = useState<number[] | null>(null)
  let [humidityLog, setHumidityLog] = useState<number[] | null>(null)
  let [pressureLog, setPressureLog] = useState<number[] | null>(null)
  let [illuminanceLog, setIlluminanceLog] = useState<number[] | null>(null)
  let [timeLog, setTimeLog] = useState<string[] | null>([])
  let [gpsLog, setGpsLog] = useState<string[] | null>([])


  async function connectBluetooth() {
    console.log('searching for devices...')

    // Connect Device
    // @ts-ignore
    let options = {
      acceptAllDevices: true,
      optionalServices: [0x180A, 0x2A6E, 0x2A6F, 0x2A6D, 0x2A77],
    }

    device = await navigator.bluetooth.requestDevice(options);

    console.log('requested device');
    server = await device.gatt.connect();
    console.log('server: ', server)

    setConnected('MKR WiFi 1010')
    console.log('Available Services:', await server.getPrimaryServices());

  }

  async function readValues() {

    service = await server.getPrimaryService('0000180a-0000-1000-8000-00805f9b34fb'); // UUID matching Arduino ENV Service
    console.log('got service');
    tempChar = await service.getCharacteristic(0x2A6E);
    humidityChar = await service.getCharacteristic(0x2A6F);
    pressureChar = await service.getCharacteristic(0x2A6D);
    illuminanceChar = await service.getCharacteristic(0x2A77);

    console.log('got characteristic');

    var rawTemp = await tempChar.readValue();
    var rawHumidity = await humidityChar.readValue();
    var rawPressure = await pressureChar.readValue();
    var rawIlluminance = await illuminanceChar.readValue();


    // Convert the value to a number
    const tempValue = new DataView(rawTemp.buffer).getUint32(0, true); // Assuming little-endian format
    const humidityValue = new DataView(rawHumidity.buffer).getUint32(0, true); // Assuming little-endian format
    const pressureValue = new DataView(rawPressure.buffer).getUint32(0, true); // Assuming little-endian format
    const illuminanceValue = new DataView(rawIlluminance.buffer).getUint32(0, true); // Assuming little-endian format

    // log the values in useState
    setTempLog((prevTempLog) => (prevTempLog ? [...prevTempLog, tempValue] : [tempValue]));
    setHumidityLog((prevHumidityLog) => (prevHumidityLog ? [...prevHumidityLog, humidityValue] : [humidityValue]));
    setPressureLog((prevPressureLog) => (prevPressureLog ? [...prevPressureLog, pressureValue] : [pressureValue]));
    setIlluminanceLog((prevIlluminanceLog) => (prevIlluminanceLog ? [...prevIlluminanceLog, illuminanceValue] : [illuminanceValue]));


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

    console.log('Read temp value:', tempValue);
    console.log('Read humidity value:', humidityValue);
    console.log('Read pressure value:', pressureValue);
    console.log('Read illuminance value:', illuminanceValue);

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
          <div key={index} className='env_var'>
            Time: {timeLog && timeLog[index]}
            - GPS: {gpsLog && gpsLog[index]}
            <p>
              Temperature: {value}°C
              - Humidity - {humidityLog && humidityLog[index]}%
              - Pressure - {pressureLog && pressureLog[index]}kPa
              - Illuminance - {illuminanceLog && illuminanceLog[index]}lx
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;
