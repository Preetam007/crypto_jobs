const winston = require('winston');
const fs = require('fs');
const env = require('./env');
const logDir = 'log';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const tsFormat = () => (new Date()).toLocaleTimeString();
const logger = new (winston.Logger)({ // eslint-disable-line
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({ // eslint-disable-line
      timestamp: tsFormat,
      colorize: true,
      level: 'info'
    }),
    new (require('winston-daily-rotate-file'))({
      filename: `${logDir}/-results-%DATE%.log`,
      timestamp: tsFormat,
      datePattern: 'YYYY-MM-DD',
      // prepend: true,
      level: env === 'development' ? 'verbose' : 'info'
    })
  ]
});

logger.stream = {
  write: function (message, encoding) { // eslint-disable-line
    logger.info(message);
  }
};

module.exports = logger;
