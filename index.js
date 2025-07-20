const winston = require("winston");
require("winston-daily-rotate-file");
require('dotenv').config();

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
 * @param {Object} options
 * @param {string} [options.level="info"]
 * @param {boolean} [options.enableFile=false]
 * @param {string} [options.context] - Prefix all logs with [context]
 * @param {string} [options.format="simple"] - "simple", "json", "combined"
 * @param {string} [options.env] - Overrides default behavior via environment label
 */
function createLogger(options = {}) {
    const {
        level = "debug",
        enableFile = false,
        context,
        format = "combined",
        silent = false,
        env = process.env.NODE_ENV,
    } = options;

    const contextFormat = winston.format((info) => {
        if (typeof info.message === 'object') {
            info.message = JSON.stringify(info.message, null, 2);
        }
        if (typeof options.context === "string" && options.context.trim()) {
            info.message = `[${options.context.trim()}] ${info.message}`;
        }
        return info;
    })();

    const formatPresets = {
        simple: winston.format.simple(),
        json: winston.format.json(),
        combined: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                return `${timestamp} [${level}]: ${message}` +
                    (Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "");
            })
        ),
    };

    const finalFormat = winston.format.combine(
        winston.format.colorize(),
        contextFormat,
        formatPresets[format] || formatPresets.simple
    );

    const resolvedLevel = env === "production" ? "warn" : level;

    const transports = [
        new winston.transports.Console({ format: finalFormat })
    ];
    if (silent) {
        transports.forEach((t) => (t.silent = true));
    }

    if (enableFile) {
        transports.push(
            new winston.transports.DailyRotateFile({
                filename: `logs/${context || "application"}-%DATE%.log`,
                datePattern: "YYYY-MM-DD",
                maxSize: "20m",
                maxFiles: "14d",
                format: formatPresets[format],
            })
        );

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

    const logger = winston.createLogger({
        levels: customLevels.levels,
        level: resolvedLevel,
        transports,
    });

    // Wrap logger methods to support multiple arguments
    Object.keys(customLevels.levels).forEach(level => {
        const originalMethod = logger[level];

        logger[level] = function (...args) {
            let messageParts = [];
            let meta = {};

            args.forEach(arg => {
                if (typeof arg === 'string') {
                    messageParts.push(arg);
                } else if (typeof arg === 'object' && arg !== null) {
                    meta = { ...meta, ...arg };
                }
            });

            const message = messageParts.join(' ');
            return originalMethod.call(logger, message, meta);
        };
    });

    return logger;
}

module.exports = createLogger;
