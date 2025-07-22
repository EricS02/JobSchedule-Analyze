// Simple structured logging for production
interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  service: string;
  userId?: string;
  action?: string;
  error?: string;
  stack?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private service: string;
  private isDevelopment: boolean;

  constructor(service: string = 'jobschedule') {
    this.service = service;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatLog(level: string, message: string, metadata?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      ...metadata
    };
  }

  private output(entry: LogEntry) {
    if (this.isDevelopment) {
      // Development: Pretty console output
      const color = {
        error: '\x1b[31m', // Red
        warn: '\x1b[33m',  // Yellow
        info: '\x1b[36m',  // Cyan
        debug: '\x1b[35m'  // Magenta
      }[entry.level] || '\x1b[0m';
      
      console.log(`${color}[${entry.level.toUpperCase()}]${'\x1b[0m'} ${entry.message}`, {
        ...entry,
        timestamp: undefined,
        level: undefined,
        message: undefined,
        service: undefined
      });
    } else {
      // Production: JSON structured logging
      console.log(JSON.stringify(entry));
    }
  }

  error(message: string, error?: Error, metadata?: Record<string, any>) {
    const entry = this.formatLog(LOG_LEVELS.ERROR, message, {
      ...metadata,
      error: error?.message,
      stack: error?.stack
    });
    this.output(entry);
  }

  warn(message: string, metadata?: Record<string, any>) {
    const entry = this.formatLog(LOG_LEVELS.WARN, message, metadata);
    this.output(entry);
  }

  info(message: string, metadata?: Record<string, any>) {
    const entry = this.formatLog(LOG_LEVELS.INFO, message, metadata);
    this.output(entry);
  }

  debug(message: string, metadata?: Record<string, any>) {
    if (this.isDevelopment) {
      const entry = this.formatLog(LOG_LEVELS.DEBUG, message, metadata);
      this.output(entry);
    }
  }

  // Security-specific logging
  security(message: string, metadata?: Record<string, any>) {
    const entry = this.formatLog(LOG_LEVELS.WARN, `SECURITY: ${message}`, {
      ...metadata,
      category: 'security'
    });
    this.output(entry);
  }

  // User action logging
  userAction(userId: string, action: string, metadata?: Record<string, any>) {
    const entry = this.formatLog(LOG_LEVELS.INFO, `User action: ${action}`, {
      ...metadata,
      userId,
      action,
      category: 'user_action'
    });
    this.output(entry);
  }

  // API request logging
  apiRequest(method: string, url: string, statusCode: number, duration: number, metadata?: Record<string, any>) {
    const entry = this.formatLog(LOG_LEVELS.INFO, `API ${method} ${url}`, {
      ...metadata,
      method,
      url,
      statusCode,
      duration,
      category: 'api_request'
    });
    this.output(entry);
  }

  // Database operation logging
  dbOperation(operation: string, table: string, duration: number, metadata?: Record<string, any>) {
    const entry = this.formatLog(LOG_LEVELS.DEBUG, `DB ${operation} on ${table}`, {
      ...metadata,
      operation,
      table,
      duration,
      category: 'database'
    });
    this.output(entry);
  }
}

// Create default logger instance
const logger = new Logger();

// Export both the class and default instance
export { Logger };
export default logger; 