const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors: { origin: '*' } })
const fs = require('fs')

const eol = require('os').EOL
const PORT = process.env.PORT || 3000
const logfile = __dirname + '/logfile.txt'

let logs = []
let watching = false
let fileSize = fs.statSync(logfile).size

//updateLogs
const updateLogs = (log) => {
    if (logs.length >= 10) logs.shift();
    logs.push(log);
}

fs.watch(logfile, (eventType, filename) => {
    if (watching || eventType !== 'change') return;
    watching = true;

    let newFileSize = fs.statSync(logfile).size;
    // let sizeDiff = newFileSize - fileSize;

    // if (sizeDiff < 0) {
    //     fileSize = 0;
    //     sizeDiff = newFileSize;
    // }
    console.log("Prev: " + fileSize);
    console.log("New: " + newFileSize);
    // console.log("Diff: " + sizeDiff);
    console.log("\n");

    // let buffer = new Buffer.alloc(sizeDiff);
    // let fileDescriptor = fs.openSync(logfile, 'r');
    // fs.readSync(fileDescriptor, buffer, 0, sizeDiff, fileSize);
    // fs.closeSync(fileDescriptor);
    fileSize = newFileSize;
    // buffer.toString().split(eol).forEach((line) => {
    //     console.log(line);
    // });

    setTimeout(() => {
        watching = false;
    }, 100);
});

//On initial connection
io.on('connection', (socket) => {
    console.log("Hello: " + socket.id)
    socket.on('disconnect', () => console.log('Bye: ' + socket.id));
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

server.listen(PORT, () => {
    console.log('Listening on port ' + PORT)
})