// Sistema de logging con niveles y timestamps

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const COLORS = {
  ERROR: '\x1b[31m',
  WARN: '\x1b[33m',
  INFO: '\x1b[36m',
  DEBUG: '\x1b[35m',
  RESET: '\x1b[0m'
};

const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'INFO' : 'DEBUG');

class Logger {
  constructor() {
    this.levelPriority = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
  }

  shouldLog(level) {
    return this.levelPriority[level] <= this.levelPriority[LOG_LEVEL];
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const color = COLORS[level];
    const reset = COLORS.RESET;
    
    let logMessage = `${color}[${timestamp}] [${level}]${reset} ${message}`;
    
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }
    
    return logMessage;
  }

  error(message, meta = {}) {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      console.error(this.formatMessage(LOG_LEVELS.ERROR, message, meta));
    }
  }

  warn(message, meta = {}) {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      console.warn(this.formatMessage(LOG_LEVELS.WARN, message, meta));
    }
  }

  info(message, meta = {}) {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.log(this.formatMessage(LOG_LEVELS.INFO, message, meta));
    }
  }

  debug(message, meta = {}) {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(this.formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  }

  audit(userId, action, resource, details = {}) {
    const auditLog = {
      userId,
      action,
      resource,
      timestamp: new Date().toISOString(),
      ...details
    };
    
    this.info(`AUDIT: ${action} on ${resource}`, auditLog);
  }
}

const logger = new Logger();

export default logger;
