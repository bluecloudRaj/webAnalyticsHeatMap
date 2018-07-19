const winston = require('winston');
const path = require('path');

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ json: false, timestamp: true }),
        new winston.transports.File({ filename: path.join(__dirname, '../logs/debug.log'), json: false })
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({ json: false, timestamp: true }),
        new winston.transports.File({ filename: path.join(__dirname, '../logs/exceptions.log'), json: false })
    ],
    exitOnError: false
});

module.exports = logger;