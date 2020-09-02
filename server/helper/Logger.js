const winston = require('winston');
winston.emitErrs = true;

const logger = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: 'error',
      filename: './logs/all-logs.log',
      handleExceptions: false,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
    }),
    new winston.transports.Console(),
  ],
  exitOnError: false,
});

module.exports = logger;
