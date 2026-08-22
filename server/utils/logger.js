const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'nifty-pulse-server' },
  transports: [
    // Write all logs with level 'error' to error.log
    new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    // Write all logs with level 'info' and below to app.log
    new transports.File({ filename: path.join(logDir, 'app.log') })
  ]
});

// Also log to console in non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, stack }) => {
          return `[${timestamp}] ${level}: ${stack || message}`;
        })
      )
    })
  );
}

module.exports = logger;
