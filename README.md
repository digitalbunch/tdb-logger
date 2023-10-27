### Installation:

```bash
$ npm install @thedigitalbunch/logger
```

### Importing:

```js
import { Logger } from '@thedigitalbunch/logger';
```

### Usage:

In a development environment, use environmental variable `LOGGER=dev`.

```js
const logger = new Logger('TestService');

logger.log('Hello World!');
```

You can also change the logger options, including the format:

```js
import { developmentConsoleColorFormat, Logger } from '@thedigitalbunch/logger';

Logger.setOptions({ format: developmentConsoleColorFormat() });
```

You can automatically capture errors with Sentry, by using:

```js
Logger.useSentry({ levels: ['error', 'warning'] });
```