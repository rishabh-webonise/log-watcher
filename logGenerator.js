const fs = require('fs');
const logger = fs.createWriteStream('logfile.txt', { flags: 'a' });

setInterval(() => {
    // const data = new Uint8Array(Buffer.from(Date().toString()));
    // fs.appendFile('logfile.txt', data, (err) => {
    //     if (err) throw err;
    // });
    logger.write(Date().toString() + "\n")
}, 2000);