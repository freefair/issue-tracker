import { describe, it, expect } from 'vitest';
import { validateTaskTitle, sanitizeInput } from './validation-utils';
import { MAX_TASK_TITLE_LENGTH } from '../constants/app-constants';

describe('validation-utils', () => {
  describe('validateTaskTitle', () => {
    it('should return null for valid title', () => {
      const result = validateTaskTitle('Valid title');
      expect(result).toBeNull();
    });

    it('should return error for empty title', () => {
      const result = validateTaskTitle('');
      expect(result).toBe('Title is required');
    });

    it('should return error for whitespace-only title', () => {
      const result = validateTaskTitle('   ');
      expect(result).toBe('Title is required');
    });

    it('should return error for title exceeding max length', () => {
      const longTitle = 'a'.repeat(MAX_TASK_TITLE_LENGTH + 1);
      const result = validateTaskTitle(longTitle);
      expect(result).toBe(`Title must be less than ${MAX_TASK_TITLE_LENGTH} characters`);
    });

    it('should accept title at max length', () => {
      const maxTitle = 'a'.repeat(MAX_TASK_TITLE_LENGTH);
      const result = validateTaskTitle(maxTitle);
      expect(result).toBeNull();
    });
  });

  describe('sanitizeInput', () => {
    it('should escape less than sign', () => {
      const result = sanitizeInput('<script>');
      expect(result).toContain('&lt;');
    });

    it('should escape greater than sign', () => {
      const result = sanitizeInput('<script>');
      expect(result).toContain('&gt;');
    });

    it('should escape double quotes', () => {
      const result = sanitizeInput('Say "hello"');
      expect(result).toBe('Say &quot;hello&quot;');
    });

    it('should escape single quotes', () => {
      const result = sanitizeInput("Say 'hello'");
      expect(result).toBe('Say &#x27;hello&#x27;');
    });

    it('should escape forward slashes', () => {
      const result = sanitizeInput('path/to/file');
      expect(result).toBe('path&#x2F;to&#x2F;file');
    });

    it('should sanitize XSS attempts', () => {
      const malicious = '<script>alert("XSS")</script>';
      const result = sanitizeInput(malicious);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('should handle normal text without changes to content', () => {
      const normal = 'This is normal text';
      const result = sanitizeInput(normal);
      expect(result).toBe('This is normal text');
    });
  });
});
