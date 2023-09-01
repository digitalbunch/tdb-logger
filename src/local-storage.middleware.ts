import { AsyncLocalStorage, AsyncResource } from 'async_hooks';
import type { Request, Response } from 'express';
import { v4 as uuidV4, V4Options } from 'uuid';

const als = new AsyncLocalStorage();

export interface RequestContext {
  readonly requestId?: string;
  readonly [other: string | number | symbol]: unknown;
}

const isRequestContext = (value: unknown): value is RequestContext =>
  typeof value === 'object' && value !== null && 'requestId' in value;

export const getRequestContext = (): RequestContext => {
  const store = als.getStore();
  if (!store || !isRequestContext(store)) {
    return {};
  }

  return store;
};
export const pushRequestContext = (key: string, value: unknown): void => {
  const context = getRequestContext();

  if (context && isRequestContext(context)) {
    Object.assign(context, { [key]: value });
  }
};

export const tracerMiddleware = ({
  useHeader = false,
  headerName = 'X-Request-Id',
  requestIdFactory = uuidV4,
  echoHeader = false,
} = {}) => {
  return (req: Request, res: Response, next: any) => {
    let requestId: string | undefined;
    if (useHeader) {
      requestId = req.header(headerName);
    }
    requestId ||= requestIdFactory(req as V4Options);

    if (echoHeader) {
      res.set(headerName, requestId);
    }

    als.run({ requestId }, () => {
      wrapHttpEmitters(req, res);
      next();
    });
  };
};

const addMethods = ['on', 'addListener', 'prependListener'];
const removeMethods = ['off', 'removeListener'];

const isWrappedSymbol = Symbol('tracer-is-wrapped');
const wrappedSymbol = Symbol('tracer-wrapped-function');

const wrapHttpEmitters = (req: Request, res: Response) => {
  const asyncResource = new AsyncResource('request-tracer');
  wrapEmitter(req, asyncResource);
  wrapEmitter(res, asyncResource);
};

function wrapEmitterMethod(emitter: any, method: string, wrapper: any) {
  if (emitter[method][isWrappedSymbol]) {
    return;
  }

  const original = emitter[method];
  const wrapped = wrapper(original);
  wrapped[isWrappedSymbol] = true;
  emitter[method] = wrapped;

  return wrapped;
}

function wrapEmitter(emitter: any, asyncResource: AsyncResource) {
  for (const method of addMethods) {
    wrapEmitterMethod(
      emitter,
      method,
      (original: (event: string, handler: any) => any) =>
        function (
          this: (event: string, handler: any) => any,
          event: string,
          handler: any,
        ) {
          let wrapped = emitter[wrappedSymbol];
          if (wrapped === undefined) {
            wrapped = {};
            emitter[wrappedSymbol] = wrapped;
          }
          const wrappedHandler = asyncResource.runInAsyncScope.bind(
            asyncResource,
            handler,
            emitter,
          );
          const existing = wrapped[event];
          if (existing === undefined) {
            wrapped[event] = wrappedHandler;
          } else if (typeof existing === 'function') {
            wrapped[event] = [existing, wrappedHandler];
          } else {
            wrapped[event].push(wrappedHandler);
          }
          return original.call(this, event, wrappedHandler);
        },
    );
  }

  for (const method of removeMethods) {
    wrapEmitterMethod(
      emitter,
      method,
      (original: (event: string, handler: any) => any) =>
        function (
          this: (event: string, handler: any) => any,
          event: string,
          handler: any,
        ) {
          let wrappedHandler;
          const wrapped = emitter[wrappedSymbol];
          if (wrapped !== undefined) {
            const existing = wrapped[event];
            if (existing !== undefined) {
              if (typeof existing === 'function') {
                wrappedHandler = existing;
                delete wrapped[event];
              } else {
                wrappedHandler = existing.pop();
              }
            }
          }
          return original.call(this, event, wrappedHandler || handler);
        },
    );
  }
}
