/**
 * Checks if a date is older than specified days
 * @param date - Date to check
 * @param days - Number of days threshold
 * @returns true if date is older than days
 */
export function isOlderThanDays(date: string | Date, days: number): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = now.getTime() - dateObj.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays > days;
}

/**
 * Formats a date for display
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatTaskDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
