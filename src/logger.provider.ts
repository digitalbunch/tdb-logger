import { INestApplication } from '@nestjs/common';
import * as process from 'process';

import { tracerMiddleware } from './local-storage.middleware';
import { Logger } from './logger.service';
import { WinstonLogger } from './winston.logger';

export class LoggerProvider {
  private static readonly loggerInstance = new WinstonLogger(
    process.env.LOGGER === 'dev',
  );

  public static getInstance(): WinstonLogger {
    return this.loggerInstance;
  }

  public static initializeLogger(app: INestApplication): void {
    app.useLogger(this.loggerInstance);
    app.use(
      tracerMiddleware({
        useHeader: true,
        headerName: 'X-Request-Id-Header',
      }),
    );

    const logger: Logger = new Logger('Global');
    // Catch unhandled promise rejections and log them in 'Global' context as errors
    process.on('unhandledRejection', (error: Error) => {
      logger.error('Unhandled promise rejection caught', error);
    });

    // Catch uncaught exceptions and log them in 'Global' context as errors
    process.on('uncaughtException', (error: Error) => {
      logger.error('Unhandled exception caught', error);
    });
  }
}
