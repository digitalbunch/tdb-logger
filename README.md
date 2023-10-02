### Installation:

```bash
$ npm install @thedigitalbunch/logger
```

### Importing:

```js
import { Logger } from '@thedigitalbunch/logger';
```

### Usage:

```js
const logger = new Logger('TestService');

logger.info('Hello World!');
```

You can also change the logger options, including the format:

```js
import { developmentConsoleColorFormat, Logger } from '@thedigitalbunch/logger';

Logger.setOptions({ format: developmentConsoleColorFormat() });
```
