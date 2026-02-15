import { logger } from '../../shared/utils/logger';

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public userMessage?: string // User-facing message (safe to display)
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * API-related errors
 */
export class ApiError extends AppError {
  constructor(statusCode: number, message: string, userMessage?: string) {
    super(message, 'API_ERROR', statusCode, userMessage || 'An error occurred. Please try again.');
    this.name = 'ApiError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message, 'VALIDATION_ERROR', 400, message);
    this.name = 'ValidationError';
  }
}

/**
 * Security-related errors (always logged)
 */
export class SecurityError extends AppError {
  constructor(message: string) {
    super(message, 'SECURITY_ERROR', 403, 'Access Denied');
    this.name = 'SecurityError';
    logger.warn('Security violation', { message });
  }
}
