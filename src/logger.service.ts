import type { LoggerService } from '@nestjs/common';

import { LoggerProvider } from './logger.provider';

export class Logger implements LoggerService {
  constructor(context: string);
  constructor(protected context: string) {}

  protected get localInstance(): LoggerService {
    return LoggerProvider.getInstance();
  }

  public error(message: string, error: Error, context?: string): void;
  public error(message: string, meta?: unknown, context?: string): void;
  public error(message: any, error: any = {}, context?: string): void {
    return this.localInstance.error(
      { error, message },
      context || this.context,
    );
  }

  public warn(message: string, meta?: unknown, context?: string): void;
  public warn(message: any, meta: any = {}, context?: string): void {
    return this.localInstance.warn({ message, meta }, context || this.context);
  }

  public log(message: string, meta?: unknown, context?: string): void;
  public log(message: any, meta: any = {}, context?: string): void {
    return this.localInstance.log({ message, meta }, context || this.context);
  }

  public debug(message: string, meta?: unknown, context?: string): void;
  public debug(message: any, meta: any = {}, context?: string): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.localInstance.debug({ message, meta }, context || this.context);
  }

  public verbose(message: string, meta?: unknown, context?: string): void;
  public verbose(message: any, meta: any = {}, context?: string): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.localInstance.verbose(
      { message, meta },
      context || this.context,
    );
  }
}
