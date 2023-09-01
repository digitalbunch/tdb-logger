import { LoggerService } from '@nestjs/common';
import { createLogger, format, Logger, transports as transport } from 'winston';

import developmentConsoleFormat from './development.format';
import { getRequestContext } from './local-storage.middleware';

// copied from axios
function isAxiosError(payload: any) {
  const isObject = (thing: unknown) =>
    thing !== null && typeof thing === 'object';
  return isObject(payload) && payload.isAxiosError === true;
}

// @Injectable()
export class WinstonLogger implements LoggerService {
  private readonly logger: Logger;

  public constructor(private readonly development: boolean = false) {
    this.logger = createLogger({
      format: development ? developmentConsoleFormat() : format.simple(),
      transports: [new transport.Console()],
    });
  }

  public error(payload: any, context?: string): Logger {
    const requestMeta = getRequestContext();
    const { error, message }: { error: any; message: string } = payload;

    if (typeof error === 'object' && isAxiosError(error)) {
      const { stack, code } = error;
      const request = error.config;

      return this.logger.error(message, {
        context,
        code,
        error: error.message,
        url: request.url,
        method: request.method,
        params: request.params,
        payload: request.data,
        status: error.response?.status,
        response: error.response?.data,
        stack,
        ...requestMeta,
      });
    }

    if (error instanceof Error) {
      const { stack, name } = error;

      return this.logger.error(message, {
        context,
        error: error.message,
        name,
        stack,
        ...requestMeta,
      });
    }

    if (typeof error === 'object') {
      return this.logger.error(message, {
        context,
        ...error,
        ...requestMeta,
      });
    }

    // Handling string with context
    return this.logger.error(error, {
      context,
      ...requestMeta,
    });
  }

  public warn(message: any, context?: string): Logger {
    const requestMeta = getRequestContext();

    if (typeof message === 'object') {
      const { message: unpackedMessage, meta } = message;
      return this.logger.warn(unpackedMessage, {
        context,
        ...meta,
        ...requestMeta,
      });
    }

    return this.logger.warn(message, {
      context,
      ...requestMeta,
    });
  }

  public log(message: any, context?: string): Logger {
    const requestMeta = getRequestContext();

    if (typeof message === 'object') {
      const { message: unpackedMessage, meta } = message;
      return this.logger.info(unpackedMessage, {
        context,
        ...meta,
        ...requestMeta,
      });
    }

    return this.logger.info(message, {
      context,
      ...requestMeta,
    });
  }

  public debug?(message: any, context?: string): Logger {
    const requestMeta = getRequestContext();

    if (typeof message === 'object') {
      const { message: unpackedMessage, ...meta } = message;
      return this.logger.debug(unpackedMessage as string, {
        context,
        ...meta,
        ...requestMeta,
      });
    }

    return this.logger.debug(message, {
      context,
      ...requestMeta,
    });
  }

  public verbose?(message: any, context?: string): Logger {
    const requestMeta = getRequestContext();

    if (typeof message === 'object') {
      const { message: unpackedMessage, ...meta } = message;
      return this.logger.verbose(unpackedMessage, {
        context,
        ...meta,
        ...requestMeta,
      });
    }

    return this.logger.verbose(message, {
      context,
      ...requestMeta,
    });
  }
}
