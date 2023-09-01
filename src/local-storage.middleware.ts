// Temporary solution
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { AsyncLocalStorage, AsyncResource } from 'async_hooks';
import { v4 as uuidV4 } from 'uuid';

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
  return (req: any, res: any, next: any) => {
    let requestId: string | undefined = undefined;
    if (useHeader) {
      requestId = req.headers[headerName.toLowerCase()];
    }
    requestId = requestId || requestIdFactory(req);

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

const wrapHttpEmitters = (req: any, res: any) => {
  const asyncResource = new AsyncResource('request-tracer');
  wrapEmitter(req, asyncResource);
  wrapEmitter(res, asyncResource);
};

function wrapEmitterMethod(emitter: any, method: any, wrapper: any) {
  if (emitter[method][isWrappedSymbol]) {
    return;
  }

  const original = emitter[method];
  const wrapped = wrapper(original);
  wrapped[isWrappedSymbol] = true;
  emitter[method] = wrapped;

  return wrapped;
}

function wrapEmitter(emitter, asyncResource) {
  for (const method of addMethods) {
    wrapEmitterMethod(
      emitter,
      method,
      (original) =>
        function (event, handler) {
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
      (original) =>
        function (event, handler) {
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
