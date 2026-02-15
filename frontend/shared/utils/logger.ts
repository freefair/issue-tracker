/**
 * Environment-aware logger
 * NO console.log in production builds
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Removes sensitive data from logging context
 */
function sanitizeForLogging(context: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...context };
  const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization'];

  sensitiveKeys.forEach(key => {
    if (key in sanitized) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
}

export const logger = {
  /**
   * Debug logs - ONLY in development
   */
  debug(message: string, ...args: unknown[]): void {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  /**
   * Info logs - development and production (to logging service)
   */
  info(message: string, meta?: Record<string, unknown>): void {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, meta);
    } else {
      // Production: Send to logging service (e.g., Sentry)
      // productionLogger.info(message, meta);
    }
  },

  /**
   * Warning logs
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, meta);
    } else {
      // Production: Send to logging service
      // productionLogger.warn(message, meta);
    }
  },

  /**
   * Error logs - NEVER log sensitive data
   */
  error(error: Error, context?: Record<string, unknown>): void {
    const sanitizedContext = context ? sanitizeForLogging(context) : {};

    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${error.message}`, {
        stack: error.stack,
        ...sanitizedContext,
      });
    } else {
      // Production: Send to logging service
      // productionLogger.error(error.message, { ...sanitizedContext });
    }
  },
};
