const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors: { origin: '*' } })
const fs = require('fs')
const readline = require('readline');

const PORT = process.env.PORT || 3000
const logfile = __dirname + '/logfile.txt'
var logs = []
var latestpos = null

//updateLogs
function updateLogs(log) {
    if (logs.length >= 10) logs.shift();
    logs.push(log);
}

//readfile
// var rd = readline.createInterface({
//     input: fs.createReadStream('logfile.txt'),
//     output: process.stdout,
//     console: false
// });
// rd.on('line', function (line) {
//     console.log(line);
// });

//On initial connection
io.on('connection', (socket) => {
    console.log("Hello: " + socket.id)

    // send latest 10 logs
    // logs.map((log) => socket.emit('message', log))

    //on disconnection
    socket.on('disconnect', function () {
        console.log('Bye: ' + socket.id);
    });
})

//Initial file contents
const file = fs.readFileSync(logfile, 'utf-8');
console.log(file);

// stream logs function
fs.watch(logfile, (eventType, filename) => {
    if (filename && eventType === 'change') {
        // var rs = fs.createReadStream(logfile, { start: latestpos, flags: 'r', encoding: 'utf8' });
        // rs.on('data', function (data) {
        //     updateLogs(data)
        //     //TODO: update latespos
        //     io.emit('message', data)
        // });
        const file = fs.readFileSync(logfile, 'utf-8');
        console.log(file);
    }
});

/*
const rs = fs.createReadStream(logfile, { start: latestpos, flags: 'r+', encoding: 'utf8' });
fs.watch(logfile, (eventType, filename) => {
    if (filename && eventType === 'change') {
        rs.on('data', (data) => {
            console.log(data);
            // updateLogs(data)
            //TODO: update latespos
            // io.emit('message', data)
        });
        rs.on('end', () => console.log("ENDED: "))
    }
});
*/

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

server.listen(PORT, () => {
    console.log('Listening on port ' + PORT)
})