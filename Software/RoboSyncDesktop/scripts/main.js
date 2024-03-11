const { SerialPort } = require('serialport');

const serialport = new SerialPort({ path: 'COM3', baudRate: 115200 })

SerialPort.list().then(ports => {
  console.log(ports)
})