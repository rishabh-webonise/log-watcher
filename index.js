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

//initial readFile (runs once only)
let initLogs = fs.readFileSync(logfile).toString().trim().split(eol)
for (let i = Math.max(0, initLogs.length - 10); i < initLogs.length; i++) {
    updateLogs(initLogs[i]);
}

//stream logs
const streamlogs = () => {
    fs.open(logfile, "r", (err, fd) => {
        if (err) {
            console.log(err);
            return;
        }
        fs.fstat(fd, (err, fstats) => {
            if (err) {
                console.log(err);
                return;
            }
            var diffSize = fstats.size - fileSize;
            console.log("diffSize", diffSize);

            if (diffSize > 0) {
                var buffer = new Buffer.alloc(diffSize)
                console.log("string", buffer.toString().length)
                fs.read(fd, buffer, 0, buffer.length, fileSize, (err, bytes) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    if (bytes > 0) {
                        var changedContent = buffer.slice(0, bytes).toString().trim()
                        console.log("Buffer: ", buffer.toString())
                        console.log("changedContent: ", changedContent)
                        changedContent.split("\n").forEach((log) => {
                            updateLogs(log)
                            io.emit('message', log)
                        })
                    } else console.log("bytes", bytes)
                })
            }
            fileSize = fstats.size
            console.log("New file size set");
        })
    })
}

//register file watcher
fs.watch(logfile, (eventType, filename) => {
    if (filename === null || eventType !== 'change' || watching) return;
    watching = true
    console.log("Change detected")
    streamlogs()
    setTimeout(() => { watching = false }, 100)
})

//on initial connection
io.on('connection', (socket) => {
    console.log("Hello: " + socket.id)

    //send latest 10 logs
    logs.forEach((log) => socket.emit('message', log))

    //on disconnect
    socket.on('disconnect', () => console.log('Bye: ' + socket.id));
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

server.listen(PORT, () => {
    console.log('Listening on port ' + PORT)
})