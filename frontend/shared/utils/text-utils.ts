/**
 * Converts markdown to plain text by removing syntax
 * @param markdown - Markdown string
 * @returns Plain text
 */
export function convertMarkdownToPlainText(markdown: string): string {
  return markdown
    .replace(/#+\s/g, '') // Headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
    .replace(/\*(.+?)\*/g, '$1') // Italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
    .trim();
}

/**
 * Truncates text to max length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
