npm install logger-smartify
```bash
const createLogger = require("logger-smartify");

const logger = createLogger({
  level: "debug",             // Log level: error, warn, info, debug
  enableFile: true,           // Enable file logging
  logDir: "logs",             // Directory for log files
  filename: "app-%DATE%.log", // File name pattern
  context: "exampleController", // optional 
   format = "combined",    // combined or simple
});

logger.info("Logger initialized");
logger.error("Something went wrong");
logger.debug("Debugging info");

this file logDir, filename is optional in comment lines and enableFile true/false

### silent (boolean)
Suppresses all logging. Useful for testing environments where output is unwanted.
```
```bash
// Multiple strings and objects
logger.info("Order placed", "for user", { userId: 1 }, { orderId: 123 });

// Keyed objects
logger.info("Order processed", { user: { id: 1, name: 'Anji' }, order: { id: 123 } });

```
