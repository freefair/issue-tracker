import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isOlderThanDays, formatTaskDate } from './date-utils';

describe('date-utils', () => {
  describe('isOlderThanDays', () => {
    beforeEach(() => {
      // Mock current date to 2024-01-15
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    it('should return true for dates older than threshold', () => {
      const oldDate = new Date('2024-01-01T12:00:00Z'); // 14 days old
      expect(isOlderThanDays(oldDate, 7)).toBe(true);
    });

    it('should return false for dates newer than threshold', () => {
      const recentDate = new Date('2024-01-10T12:00:00Z'); // 5 days old
      expect(isOlderThanDays(recentDate, 7)).toBe(false);
    });

    it('should return false for dates equal to threshold', () => {
      const exactDate = new Date('2024-01-08T12:00:00Z'); // Exactly 7 days old
      expect(isOlderThanDays(exactDate, 7)).toBe(false);
    });

    it('should handle string dates', () => {
      const oldDateString = '2024-01-01T12:00:00Z';
      expect(isOlderThanDays(oldDateString, 7)).toBe(true);
    });

    it('should handle Date objects', () => {
      const oldDate = new Date('2024-01-01T12:00:00Z');
      expect(isOlderThanDays(oldDate, 7)).toBe(true);
    });
  });

  describe('formatTaskDate', () => {
    it('should format Date object', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const formatted = formatTaskDate(date);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should format string date', () => {
      const dateString = '2024-01-15T12:00:00Z';
      const formatted = formatTaskDate(dateString);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should use German locale format', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const formatted = formatTaskDate(date);
      // German format includes month name
      expect(formatted).toMatch(/\d{1,2}\.\s/);
    });
  });
});
