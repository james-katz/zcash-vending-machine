const { SerialPort } = require('serialport');
const  { ReadlineParser } = require('@serialport/parser-readline');
const express = require('express');
const path = require('path');

const Litewallet = require('./zingolib-wrapper/litewallet');
const { TxBuilder, PaymentDetect } = require('./zingolib-wrapper/utils/utils')

async function listPorts() {
  try {
    const ports = await SerialPort.list();
    console.log(ports);
  } catch(err) {
    console.log(err);
  }
}

listPorts();

const port = new SerialPort({path: '/dev/ttyUSB0', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

const app = express();
const listen = 8080;

const client = new Litewallet("https://mainnet.lightwalletd.com:9067/", "main");
client.init().then(async () => {
  console.log("Lightwallet is ready!");

  const transaction = await client.getTransactionsList();
  console.log(transaction[0].txDetails);

  const pd = new PaymentDetect(client);
  pd.detectSimple(2000);
  pd.on('payment', async (tx) => {
    console.log("--------NEW TX--------\n\n")    
    const lastTx = await client.fetchLastTxId();
    const txns = await client.getTransactionsList();
    const myTx = txns.filter(t => t.txid === lastTx);
    // console.log(myTx);
    // console.log(myTx[0]);
    let memo = myTx[0].detailedTxns[0].memo;
    console.log(memo);
    
    let cmd;

    if(memo && memo.startsWith('1')) {
      cmd = "m1t1\n";
    }
    else if(memo && memo.startsWith('2')) {
      cmd = "m2t1\n";
    }

    if(cmd) {
      console.log(cmd);
      port.write(`${cmd}`, (err) => {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('Turning motor ON');    
    });  
    }    
    else {
      console.log("Invalid memo command");
    }
  });
});

// Read the port data
port.on("open", () => {
  console.log('serial port open');
});
parser.on('data', data =>{
  console.log('Arduino says:', data);
});

app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/zip321', async (req, res) => {
    const item = req.param('id');
    const value = 0.005;
    const addr = await client.fetchAllAddresses();
    console.log(addr[0].address);
    const zip321 = new TxBuilder()
      .setRecipient(addr[0].address)
      .setAmount(value)
      .setMemo(`${item}_item_purchase (Do NOT modify)`);
    const payURI = zip321.getPaymentURI().replace('&memo', '%26memo');
      console.log(payURI)
    res.send(payURI);
});

app.listen(listen, () => {
    console.log(`Express listening on port: ${listen}`);
});