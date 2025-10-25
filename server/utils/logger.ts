import pino from 'pino';
import path from 'path';

const { logLevel, logToFile } = useRuntimeConfig().public;

const fileTransport = logToFile
  ? pino.transport({
      target: 'pino/file',
      options: { destination: path.join('.', 'app.log') },
    })
  : undefined;

export default pino(
  {
    level: logLevel,
  },
  fileTransport
);
