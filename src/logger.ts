import type * as Sentry from '@sentry/node';
import type { SeverityLevel } from '@sentry/types/types/severity';
import process from 'process';
import { LoggerOptions } from 'winston';

import { WinstonLogger } from './winston.logger';

export class Logger {
  private static loggerInstance = new WinstonLogger(
    process.env.LOGGER === 'dev',
  );
  private static sentryLevels: Sentry.SeverityLevel[] = [];

  constructor(context: string);
  constructor(protected context: string) {}

  static setOptions(options: LoggerOptions) {
    this.loggerInstance = new WinstonLogger(
      process.env.LOGGER === 'dev',
      options,
    );
  }

  static useSentry({ levels = ['error'] as SeverityLevel[] } = {}) {
    this.sentryLevels = levels;
  }

  protected get getInstance() {
    return Logger.loggerInstance;
  }

  public error(message: string, error: Error, context?: string): void;
  public error(message: string, meta?: unknown, context?: string): void;
  public error(message: any, error: any = {}, context?: string): any {
    if (Logger.sentryLevels.includes('error')) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Sentry.captureException(error, { level: 'error', contexts: context });
    }
    return this.getInstance.error({ error, message }, context || this.context);
  }

  public warn(message: string, meta?: unknown, context?: string): void;
  public warn(message: string, error: Error, context?: string): void;
  public warn(message: any, meta: any = {}, context?: string): any {
    if (Logger.sentryLevels.includes('warning')) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Sentry.captureException(error, { level: 'warning', contexts: context });
    }
    return this.getInstance.warn({ message, meta }, context || this.context);
  }

  public log(message: string, meta?: unknown, context?: string): void;
  public log(message: any, meta: any = {}, context?: string): any {
    if (Logger.sentryLevels.includes('log')) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Sentry.captureMessage(message, { level: 'log', contexts: context });
    }
    return this.getInstance.log({ message, meta }, context || this.context);
  }

  public debug(message: string, meta?: unknown, context?: string): void;
  public debug(message: any, meta: any = {}, context?: string): any {
    if (Logger.sentryLevels.includes('debug')) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Sentry.captureMessage(message, { level: 'debug', contexts: context });
    }
    return this.getInstance.debug({ message, meta }, context || this.context);
  }

  public verbose(message: string, meta?: unknown, context?: string): void;
  public verbose(message: any, meta: any = {}, context?: string): any {
    if (Logger.sentryLevels.includes('info')) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Sentry.captureMessage(error, { level: 'info', contexts: context });
    }
    return this.getInstance.verbose({ message, meta }, context || this.context);
  }

  // public static initializeLogger(): void {
  //   const logger: Logger = new Logger('Global');
  //   // Catch unhandled promise rejections and log them in 'Global' context as errors
  //   process.on('unhandledRejection', (error: Error) => {
  //     logger.error('Unhandled promise rejection caught:', error);
  //   });
  //
  //   // Catch uncaught exceptions and log them in 'Global' context as errors
  //   process.on('uncaughtException', (error: Error) => {
  //     logger.error('Unhandled exception caught:', error);
  //   });
  // }
}
