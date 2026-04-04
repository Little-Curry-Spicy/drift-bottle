import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export function createWinstonTransports() {
  const logsDir = join(process.cwd(), 'logs');
  mkdirSync(logsDir, { recursive: true });

  return [
    new transports.Console({
      level: process.env.LOG_LEVEL ?? 'info',
      format: format.combine(
        format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike('DriftBottleAPI', {
          prettyPrint: true,
        }),
      ),
    }),

    new DailyRotateFile({
      level: process.env.LOG_LEVEL ?? 'info',
      dirname: logsDir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: process.env.LOG_MAX_FILES ?? '14d',
      zippedArchive: false,
      format: format.combine(format.timestamp(), format.json()),
    }),
    // 仅 error 级别（业务/框架里 Logger.error 或异常栈会进这里）。HTTP「非 2xx」若未走 error 日志则不会出现在此文件。
    new DailyRotateFile({
      level: 'error',
      dirname: logsDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: process.env.LOG_MAX_FILES ?? '30d',
      zippedArchive: false,
      format: format.combine(format.timestamp(), format.json()),
    }),
  ];
}
