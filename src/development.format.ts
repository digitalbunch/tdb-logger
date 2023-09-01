import * as clc from 'cli-color';
import { Format } from 'logform';
import { inspect } from 'util';
import { format } from 'winston';

const devColorScheme = {
  info: clc.greenBright,
  error: clc.red,
  warn: clc.yellow,
  debug: clc.magentaBright,
  verbose: clc.cyanBright,
};

const developmentConsoleFormat = (): Format =>
  format.printf(({ context, level, timestamp, message, ms, ...meta }) => {
    timestamp = new Date()
      .toISOString()
      .split('.')[0]
      .replace('T', ' ')
      .replace(/-/g, '/');

    const color =
      devColorScheme[level as 'info' | 'error' | 'warn' | 'debug' | 'verbose'];
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

export default developmentConsoleFormat;
