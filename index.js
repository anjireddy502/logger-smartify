const winston = require("winston");
require("winston-daily-rotate-file");

// Define custom log levels and colors
const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "green",
        debug: "blue",
    },
};

winston.addColors(customLevels.colors);

/**
 * Create a configurable logger.
 * @param {Object} options - Logger configuration options.
 * @param {string} [options.level="info"] - Log level.
 * @param {boolean} [options.enableFile=false] - Whether to enable file logging.
 * @returns {winston.Logger} Configured logger instance.
 */
function createLogger(options = {}) {
    const { level = "info", enableFile = false } = options;

    const transports = [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
    ];

    if (enableFile) {
        transports.push(
            new winston.transports.DailyRotateFile({
                filename: "logs/application-%DATE%.log",
                datePattern: "YYYY-MM-DD",
                maxSize: "20m",
                maxFiles: "14d",
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                ),
            })
        );
    }

    return winston.createLogger({
        levels: customLevels.levels,
        level,
        transports,
    });
}

module.exports = createLogger;