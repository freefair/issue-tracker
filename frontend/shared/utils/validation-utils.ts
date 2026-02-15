import { MAX_TASK_TITLE_LENGTH } from '../constants/app-constants';

/**
 * Validates task title
 * @param title - Title to validate
 * @returns Validation error or null
 */
export function validateTaskTitle(title: string): string | null {
  if (!title || title.trim().length === 0) {
    return 'Title is required';
  }
  if (title.length > MAX_TASK_TITLE_LENGTH) {
    return `Title must be less than ${MAX_TASK_TITLE_LENGTH} characters`;
  }
  return null;
}

/**
 * Sanitizes user input to prevent XSS
 * @param input - User input
 * @returns Sanitized input
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
