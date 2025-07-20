## logger-smartify


A highly customizable logger utility built on top of winston with:

Console & file logging with rotation
* Multiple argument support in logs
* Contextual log labeling
* Optional integrations with:


```bash
npm install logger-smartify

```
### Features

* Custom log levels: error, warn, info, debug

* Context prefix for each log

* Colorized & formatted outputs

* File logging with daily rotation

* Pass multiple messages & objects in a single log call

### Configuration Options

| Option       | Type      | Default                | Description                                                              |
| ------------ | --------- | ---------------------- | ------------------------------------------------------------------------ |
| `level`      | `string`  | `'debug'`              | Logging level: `'error'`, `'warn'`, `'info'`, `'debug'`                  |
| `enableFile` | `boolean` | `false`                | Enable rotating file logs                                                |
| `context`    | `string`  | -                      | Prefix logs with this context                                            |
| `format`     | `string`  | `'combined'`           | Log format: `'simple'`, `'json'`, `'combined'`                           |
| `silent`     | `boolean` | `false`                | Suppress all logs                                                        |
| `env`        | `string`  | `process.env.NODE_ENV` | Force environment setting                                                |
| `logstash`   | `object`  | -                      | `{ host, port }` Logstash config                                         |
| `fluentd`    | `object`  | -                      | `{ tag, host, port }` Fluentd config                                     |
| `cloudWatch` | `object`  | -                      | AWS CloudWatch config `{ logGroupName, logStreamName, awsRegion, etc. }` |


### Usage

**Import & Initialize**

```bash

const createLogger = require('logger-smartify');

const logger = createLogger({
  level: 'debug',
  context: 'UserService',
  enableFile: true
});

```

**Example Logs**

```bash
logger.info("User created", { userId: 123 });
logger.error("Failed to create user", { error: new Error("DB connection failed") });
logger.debug("Debug details", { query: "SELECT * FROM users" });

// Multiple arguments
logger.info("Processing order", "for user", { userId: 1 }, { orderId: 456 });
```

**File Logging**

```bash
enableFile: true
```

Logs stored in ./logs/

* Daily rotated files:

      Max size: 20MB

      Retention: 14 days  


**Log Formats**

simple: Plain text

json: Structured JSON

combined: Timestamp + level + colorized + meta data

```bash
2025-07-20T12:30:45.123Z [info]: [UserService] User created {"userId":123}

```

### Example Configuration with All Options

```bash
const logger = createLogger({
  level: 'debug',
  context: 'ExampleService',
  enableFile: true,
  format: 'combined',
});
```

**Environment-Aware**

Defaults to warn level when NODE_ENV=production

Use env: 'development' to override


### License

MIT
