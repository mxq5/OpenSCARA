const { SerialPort } = require('serialport');

///const serialport = new SerialPort({ path: 'COM3', baudRate: 115200 })

/* Interactive components */
const connectButton = document.getElementById('connectButton');

/* Views */
const connectView = document.getElementById('connectView');

window.addEventListener('DOMContentLoaded', () => {
  SerialPort.list().then(ports => {
    console.log(ports)
  })

  console.log("Renderer.js loaded!");
});

connectButton.addEventListener('click', () => {
  console.log('Do some stuff...');
  
  connectView.style.display = 'none';
});