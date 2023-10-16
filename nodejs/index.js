const { SerialPort } = require('serialport');
const  { ReadlineParser } = require('@serialport/parser-readline');
const express = require('express');
const path = require('path');

async function listPorts() {
  try {
    const ports = await SerialPort.list();
    console.log(ports);
  } catch(err) {
    console.log(err);
  }
}

listPorts();

// const port = new SerialPort({path: '/dev/ttyUSB0', baudRate: 9600 });
// const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

const app = express();
const listen = 8080;

// Read the port data
// port.on("open", () => {
//   console.log('serial port open');
// });
// parser.on('data', data =>{
//   console.log('Arduino says:', data);
// });

app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/motor', (req, res) => {
    port.write('m1t1\n', (err) => {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('Turning motor 1 ON');
        res.send('Motor on!');
    });    
});

app.listen(listen, () => {
    console.log(`Express listening on port: ${listen}`);
});