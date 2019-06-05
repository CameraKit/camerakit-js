import settings from "./settings";

type Logger = {
  log: (...args: any[]) => any;
  error: (...args: any[]) => any;
};

const LOG_TEXT = "[CK-WEB]";
let logger: Logger = console;

function setLogger(customLogger: Logger) {
  logger = customLogger;
}

function log (...args: any[]) {
  if (settings.debug) {
    logger.log(LOG_TEXT, ...args);
  }
}

function error (...args: any[]) {
  if (settings.debug) {
    logger.error(LOG_TEXT, ...args);
  }
}

export default {
  setLogger,
  log,
  error
};
