import winston, {createLogger, format, transports} from 'winston';
import 'dotenv/config';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({stack: true}),
    format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: `${process.env.IPINFO_LOG_PATH}/error.log`,
      level: 'error',
      format: winston.format.json()
    }),
    new winston.transports.File({
      filename: `${process.env.IPINFO_LOG_PATH}/warn.log`,
      level: 'warn',
      format: winston.format.json()
    }),
    new winston.transports.File({
      filename: `${process.env.IPINFO_LOG_PATH}/info.log`,
      level: 'info',
      format: winston.format.json()
    }),
  ],
  exceptionHandlers: [
    new transports.File({filename: `${process.env.IPINFO_LOG_PATH}/uncaught.log`})
  ],
});

export default logger;
