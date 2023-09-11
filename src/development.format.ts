import clc from 'cli-color';
import type bare from 'cli-color/bare';
import type { Format } from 'logform';
import { inspect } from 'util';
import { format } from 'winston';

const devColorScheme: Record<string, bare.Format> = {
  info: clc.greenBright,
  error: clc.red,
  warn: clc.yellow,
  debug: clc.magentaBright,
  verbose: clc.cyanBright,
};

const getFormattedDate = () =>
  new Date().toISOString().split('.')[0].replace('T', ' ').replace(/-/g, '/');

const developmentConsoleColorFormat = (): Format =>
  format.printf(({ context, level, timestamp, message, ms, ...meta }) => {
    timestamp = getFormattedDate();

    const color = devColorScheme[level];
    const stringifyMeta = JSON.stringify(meta);
    const formattedMeta = inspect(JSON.parse(stringifyMeta), {
      colors: true,
      depth: null,
    });

    return (
      `${timestamp} ` +
      `${clc.blueBright(level.toUpperCase())} ` +
      (typeof context !== 'undefined'
        ? `${clc.yellow('[' + context + ']')} `
        : '') +
      `${color(message)}` +
      (stringifyMeta === '{}' ? '' : ` ${formattedMeta}`) +
      (typeof ms !== 'undefined' ? ` ${clc.yellow(ms)}` : '')
    );
  });

const developmentConsoleFormat = (): Format =>
  format.printf(({ context, level, timestamp, message, ms, ...meta }) => {
    timestamp = getFormattedDate();

    const stringifyMeta = JSON.stringify(meta);
    const formattedMeta = inspect(JSON.parse(stringifyMeta), {
      depth: null,
    });

    return (
      `${timestamp} ` +
      `${level.toUpperCase()} ` +
      (typeof context !== 'undefined' ? `${'[' + context + ']'} ` : '') +
      `${message}` +
      (stringifyMeta === '{}' ? '' : ` ${formattedMeta}`) +
      (typeof ms !== 'undefined' ? ` ${ms}` : '')
    );
  });

export { developmentConsoleColorFormat, developmentConsoleFormat };
