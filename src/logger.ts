import process from 'process';

import { WinstonLogger } from './winston.logger';

export class Logger {
  private static readonly loggerInstance = new WinstonLogger(
    process.env.LOGGER === 'dev',
  );

  constructor(context: string);
  constructor(protected context: string) {}

  protected get getInstance() {
    return Logger.loggerInstance;
  }

  public error(message: string, error: Error, context?: string): void;
  public error(message: string, meta?: unknown, context?: string): void;
  public error(message: any, error: any = {}, context?: string): any {
    return this.getInstance.error({ error, message }, context || this.context);
  }

  public warn(message: string, meta?: unknown, context?: string): void;
  public warn(message: any, meta: any = {}, context?: string): any {
    return this.getInstance.warn({ message, meta }, context || this.context);
  }

  public log(message: string, meta?: unknown, context?: string): void;
  public log(message: any, meta: any = {}, context?: string): any {
    return this.getInstance.log({ message, meta }, context || this.context);
  }

  public debug(message: string, meta?: unknown, context?: string): void;
  public debug(message: any, meta: any = {}, context?: string): any {
    return this.getInstance.debug({ message, meta }, context || this.context);
  }

  public verbose(message: string, meta?: unknown, context?: string): void;
  public verbose(message: any, meta: any = {}, context?: string): any {
    return this.getInstance.verbose({ message, meta }, context || this.context);
  }
}
