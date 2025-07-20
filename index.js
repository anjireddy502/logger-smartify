const winston = require("winston");
require("winston-daily-rotate-file");
require('dotenv').config();

const customLevels = {
    levels: { error: 0, warn: 1, info: 2, debug: 3 },
    colors: { error: "red", warn: "yellow", info: "green", debug: "blue" },
};

winston.addColors(customLevels.colors);

/**
 * @param {Object} options
 * @param {string} [options.level="debug"]
 * @param {boolean} [options.enableFile=false]
 * @param {string} [options.context]
 * @param {string} [options.format="simple"]
 * @param {string} [options.env]
 * @param {Object} [options.logstash] - { host, port }
 * @param {Object} [options.fluentd] - { tag, host, port }
 * @param {Object} [options.cloudWatch] - cloudwatch transport config
 */
function createLogger(options = {}) {
    const {
        level = "debug",
        enableFile = false,
        context,
        format = "combined",
        silent = false,
        env = process.env.NODE_ENV,
        logstash,
        fluentd,
        cloudWatch,
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
            }),
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

    // Optional: Logstash
    if (logstash) {
        const LogstashTransport = require('winston-logstash');
        transports.push(new LogstashTransport({
            port: logstash.port || 5000,
            host: logstash.host || '127.0.0.1',
            node_name: context || 'application',
        }));
    }

    // Optional: Fluentd
    if (fluentd) {
        const fluent = require('fluent-logger');
        fluent.configure(fluentd.tag || 'app', {
            host: fluentd.host || 'localhost',
            port: fluentd.port || 24224,
            timeout: 3.0,
            reconnectInterval: 600000
        });

        transports.push(new winston.transports.Stream({
            stream: fluent.sender,
        }));
    }

    // Optional: CloudWatch
    if (cloudWatch) {
        const WinstonCloudWatch = require('winston-cloudwatch');
        transports.push(new WinstonCloudWatch({
            logGroupName: cloudWatch.logGroupName,
            logStreamName: cloudWatch.logStreamName || context || 'application',
            awsRegion: cloudWatch.awsRegion || 'us-east-1',
            jsonMessage: true,
            ...cloudWatch
        }));
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
