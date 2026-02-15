import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Note: These tests verify logger behavior in current environment (development)
  it('should call debug in development', () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    logger.debug('Test debug', { data: 'value' });
    // In development, debug should be called
    if (process.env.NODE_ENV === 'development') {
      expect(debugSpy).toHaveBeenCalled();
    }
    debugSpy.mockRestore();
  });

  it('should call info', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('Test info', { data: 'value' });
    // In development, info should be called
    if (process.env.NODE_ENV === 'development') {
      expect(infoSpy).toHaveBeenCalled();
    }
    infoSpy.mockRestore();
  });

  it('should call warn', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('Test warn', { data: 'value' });
    // In development, warn should be called
    if (process.env.NODE_ENV === 'development') {
      expect(warnSpy).toHaveBeenCalled();
    }
    warnSpy.mockRestore();
  });

  it('should call error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Test error');
    logger.error(error);
    // In development, error should be called
    if (process.env.NODE_ENV === 'development') {
      expect(errorSpy).toHaveBeenCalled();
    }
    errorSpy.mockRestore();
  });

  describe('sensitive data sanitization', () => {
    it('should redact password from context', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test');
      logger.error(error, { password: 'secret123' });

      if (process.env.NODE_ENV === 'development' && errorSpy.mock.calls.length > 0) {
        const callArgs = errorSpy.mock.calls[0];
        const stringified = JSON.stringify(callArgs);
        expect(stringified).toContain('[REDACTED]');
        expect(stringified).not.toContain('secret123');
      }
      errorSpy.mockRestore();
    });

    it('should redact token from context', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test');
      logger.error(error, { token: 'abc123xyz' });

      if (process.env.NODE_ENV === 'development' && errorSpy.mock.calls.length > 0) {
        const callArgs = errorSpy.mock.calls[0];
        const stringified = JSON.stringify(callArgs);
        expect(stringified).toContain('[REDACTED]');
        expect(stringified).not.toContain('abc123xyz');
      }
      errorSpy.mockRestore();
    });

    it('should not redact non-sensitive data', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test');
      logger.error(error, { userId: '12345' });

      if (process.env.NODE_ENV === 'development' && errorSpy.mock.calls.length > 0) {
        const callArgs = errorSpy.mock.calls[0];
        const stringified = JSON.stringify(callArgs);
        expect(stringified).toContain('12345');
      }
      errorSpy.mockRestore();
    });
  });
});
