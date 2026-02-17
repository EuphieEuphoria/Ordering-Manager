import winston from "winston";
const { combine, timestamp, printf, colorize, align, errors } = winston.format;

// Log Levels
//   error: 0
//   warn: 1
//   info: 2
//   http: 3
//   verbose: 4
//   debug: 5
//   silly: 6

function level() {
  if (process.env.LOG_LEVEL) {
    if (process.env.LOG_LEVEL === "0" || process.env.LOG_LEVEL === "error") {
      return "error";
    }
    if (process.env.LOG_LEVEL === "1" || process.env.LOG_LEVEL === "warn") {
      return "warn";
    }
    if (process.env.LOG_LEVEL === "2" || process.env.LOG_LEVEL === "info") {
      return "info";
    }
    if (process.env.LOG_LEVEL === "3" || process.env.LOG_LEVEL === "http") {
      return "http";
    }
    if (process.env.LOG_LEVEL === "4" || process.env.LOG_LEVEL === "verbose") {
      return "verbose";
    }
    if (process.env.LOG_LEVEL === "5" || process.env.LOG_LEVEL === "debug") {
      return "debug";
    }
    if (process.env.LOG_LEVEL === "6" || process.env.LOG_LEVEL === "sql") {
      return "sql";
    }
    if (process.env.LOG_LEVEL === "7" || process.env.LOG_LEVEL === "silly") {
      return "silly";
    }
  }
  return "http";
}

// Custom logging levels for the application
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  sql: 6,
  silly: 7,
};

// Custom colors
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "green",
  verbose: "cyan",
  debug: "blue",
  sql: "gray",
  silly: "magenta",
};

winston.addColors(colors);

const logger = winston.createLogger({
  // call `level` function to get default log level
  level: level(),
  levels: levels,
  // Format configuration
  format: combine(
    colorize({ all: true }),
    errors({ stack: true }),
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    align(),
    printf(
      (info) =>
        `[${info.timestamp}] ${info.level}: ${info.stack ? info.stack : info.message}`,
    ),
  ),
  // Output configuration
  transports: [new winston.transports.Console()],
});

export default logger;
