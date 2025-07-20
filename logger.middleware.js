// logger.middleware.js
module.exports = function createLoggerMiddleware(logger) {
  return function (req, res, next) {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
      const duration = Number(process.hrtime.bigint() - start) / 1e6;
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}`, {
        duration: `${duration.toFixed(2)}ms`,
        ip: req.ip,
      });
    });

    next();
  };
};