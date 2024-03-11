const { SerialPort } = require('serialport');

const serialport = new SerialPort({ path: 'COM3', baudRate: 115200 })

SerialPort.list().then(ports => {
  console.log(ports)
})


window.addEventListener('DOMContentLoaded', () => {
  //const button = document.getElementById('test')
  //button.addEventListener('click', () => {
  //  console.log('Hello, World!')
  //})

  
});