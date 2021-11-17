const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors: { origin: '*' } })
const fs = require('fs')
const readline = require('readline');

const PORT = process.env.PORT || 3000
const logfile = __dirname + '/logfile.txt'
var logs = []
var latestpos = 0

//updateLogs
function updateLogs(log) {
    if (logs.length >= 10) logs.shift();
    logs.push(log);
}

const rd = readline.createInterface({
    input: fs.createReadStream(logfile, 'utf8'),
    output: process.stdout,
    console: false
});
rd.on('line', (line) => {
    console.log(line);
});

fs.watch(logfile, (eventType, filename) => {
    if (filename && eventType === 'change') {
        console.log('change');
    }
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