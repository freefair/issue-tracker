import { describe, it, expect } from 'vitest';
import { convertMarkdownToPlainText, truncateText } from './text-utils';

describe('text-utils', () => {
  describe('convertMarkdownToPlainText', () => {
    it('should remove headers', () => {
      const markdown = '# Heading 1\n## Heading 2';
      const result = convertMarkdownToPlainText(markdown);
      expect(result).toBe('Heading 1\nHeading 2');
    });

    it('should remove bold formatting', () => {
      const markdown = 'This is **bold** text';
      const result = convertMarkdownToPlainText(markdown);
      expect(result).toBe('This is bold text');
    });

    it('should remove italic formatting', () => {
      const markdown = 'This is *italic* text';
      const result = convertMarkdownToPlainText(markdown);
      expect(result).toBe('This is italic text');
    });

    it('should remove links', () => {
      const markdown = 'Check [this link](https://example.com)';
      const result = convertMarkdownToPlainText(markdown);
      expect(result).toBe('Check this link');
    });

    it('should handle mixed markdown', () => {
      const markdown = '# Title\n\nThis is **bold** and *italic* with [link](url)';
      const result = convertMarkdownToPlainText(markdown);
      expect(result).toBe('Title\n\nThis is bold and italic with link');
    });

    it('should trim whitespace', () => {
      const markdown = '  Some text  ';
      const result = convertMarkdownToPlainText(markdown);
      expect(result).toBe('Some text');
    });
  });

  describe('truncateText', () => {
    it('should not truncate text shorter than maxLength', () => {
      const text = 'Short text';
      const result = truncateText(text, 20);
      expect(result).toBe('Short text');
    });

    it('should truncate text longer than maxLength', () => {
      const text = 'This is a very long text that needs to be truncated';
      const result = truncateText(text, 20);
      expect(result).toBe('This is a very lo...');
      expect(result.length).toBe(20);
    });

    it('should add ellipsis to truncated text', () => {
      const text = 'This is too long';
      const result = truncateText(text, 10);
      expect(result).toMatch(/\.\.\.$/);
    });

    it('should handle exact length', () => {
      const text = '12345678901234567890';
      const result = truncateText(text, 20);
      expect(result).toBe(text);
    });

    it('should handle very short maxLength', () => {
      const text = 'Hello';
      const result = truncateText(text, 3);
      expect(result).toBe('...');
    });
  });
});
