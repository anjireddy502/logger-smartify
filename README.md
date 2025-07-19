npm install logger-smartify
```bash
const createLogger = require("logger-smartify");

const logger = createLogger({
  level: "debug",             // Log level: error, warn, info, debug
  enableFile: true,           // Enable file logging
  logDir: "logs",             // Directory for log files
  filename: "app-%DATE%.log", // File name pattern
});

logger.info("Logger initialized");
logger.error("Something went wrong");
logger.debug("Debugging info");

this file logDir, filename is optional in comment lines and enableFile true/false