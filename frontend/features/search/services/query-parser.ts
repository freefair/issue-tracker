import type { ParsedQuery, QueryChip, SearchQuery } from '../types/search.types';

/**
 * Parses search query with chips (Board:, Tag:, Status:)
 * Example: "urgent bug Board:ProjectA Tag:frontend"
 * -> freeText: "urgent bug", chips: [Board:ProjectA, Tag:frontend]
 */
export function parseSearchQuery(query: string): ParsedQuery {
  const chips: QueryChip[] = [];
  let remainingText = query;

  // Extract Board chips
  const boardRegex = /Board:(\S+)/gi;
  let match;
  while ((match = boardRegex.exec(query)) !== null) {
    chips.push({
      type: 'board',
      value: match[1],
      displayText: `Board:${match[1]}`,
    });
    remainingText = remainingText.replace(match[0], '');
  }

  // Extract Tag chips
  const tagRegex = /Tag:(\S+)/gi;
  while ((match = tagRegex.exec(query)) !== null) {
    chips.push({
      type: 'tag',
      value: match[1],
      displayText: `Tag:${match[1]}`,
    });
    remainingText = remainingText.replace(match[0], '');
  }

  // Extract Status chips
  const statusRegex = /Status:(\S+)/gi;
  while ((match = statusRegex.exec(query)) !== null) {
    chips.push({
      type: 'status',
      value: match[1],
      displayText: `Status:${match[1]}`,
    });
    remainingText = remainingText.replace(match[0], '');
  }

  return {
    freeText: remainingText.trim(),
    chips,
  };
}

/**
 * Converts parsed query to SearchQuery object
 */
export function toSearchQuery(parsed: ParsedQuery): SearchQuery {
  const query: SearchQuery = {
    text: parsed.freeText,
  };

  parsed.chips.forEach(chip => {
    switch (chip.type) {
      case 'board':
        query.board = chip.value;
        break;
      case 'tag':
        if (!query.tags) query.tags = [];
        query.tags.push(chip.value);
        break;
      case 'status':
        query.status = chip.value;
        break;
    }
  });

  return query;
}

/**
 * Generates autocomplete suggestions based on current query
 */
export function generateSuggestions(
  query: string,
  availableBoards: string[],
  availableTags: string[],
  availableStatuses: string[]
): string[] {
  const suggestions: string[] = [];
  const lowerQuery = query.toLowerCase();

  // Suggest boards when query contains "board:" or ends with " b"
  if (lowerQuery.includes('board:') || lowerQuery.endsWith(' b')) {
    availableBoards.forEach(board => {
      suggestions.push(`Board:${board}`);
    });
  }

  // Suggest tags when query contains "tag:" or ends with " t"
  if (lowerQuery.includes('tag:') || lowerQuery.endsWith(' t')) {
    availableTags.forEach(tag => {
      suggestions.push(`Tag:${tag}`);
    });
  }

  // Suggest statuses when query contains "status:" or ends with " s"
  if (lowerQuery.includes('status:') || lowerQuery.endsWith(' s')) {
    availableStatuses.forEach(status => {
      suggestions.push(`Status:${status}`);
    });
  }

  return suggestions;
}
