import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const MAX_LOG_CHUNK_BYTES = 10 * 1024;

const splitLargeMessage = format((info) => {
  if (typeof info.message !== 'string') {
    return info;
  }

  const messageBuffer = Buffer.from(info.message, 'utf8');
  if (messageBuffer.byteLength <= MAX_LOG_CHUNK_BYTES) {
    return info;
  }

  const chunks: string[] = [];
  for (let offset = 0; offset < messageBuffer.length; offset += MAX_LOG_CHUNK_BYTES) {
    const currentChunk = messageBuffer.subarray(offset, offset + MAX_LOG_CHUNK_BYTES).toString('utf8');
    chunks.push(currentChunk);
  }

  info.message = chunks
    .map((chunk, index) => `[chunk ${index + 1}/${chunks.length}] ${chunk}`)
    .join('\n');

  return info;
});

export function createWinstonTransports() {
  const logsDir = join(process.cwd(), 'logs');
  mkdirSync(logsDir, { recursive: true });

  return [
    new transports.Console({
      level: process.env.LOG_LEVEL ?? 'info',
      format: format.combine(
        format.timestamp(),
        splitLargeMessage(),
        nestWinstonModuleUtilities.format.nestLike('DriftBottleApi', {
          prettyPrint: true,
        }),
      ),
    }),
    new DailyRotateFile({
      level: process.env.LOG_LEVEL ?? 'info',
      dirname: logsDir,
      filename: '%DATE%-application.%i.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '10k',
      maxFiles: process.env.LOG_MAX_FILES ?? '14d',
      zippedArchive: false,
      format: format.combine(format.timestamp(), splitLargeMessage(), format.json()),
    }),
    new DailyRotateFile({
      level: 'error',
      dirname: logsDir,
      filename: '%DATE%-error.%i.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '10k',
      maxFiles: process.env.LOG_MAX_FILES ?? '30d',
      zippedArchive: false,
      format: format.combine(format.timestamp(), splitLargeMessage(), format.json()),
    }),
  ];
}
