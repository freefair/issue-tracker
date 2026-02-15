export interface SearchQuery {
  text: string;
  board?: string;
  tags?: string[];
  status?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  boardId: string;
  boardName?: string;
  tags: string[];
  status: string;
}

export interface ParsedQuery {
  freeText: string;
  chips: QueryChip[];
}

export interface QueryChip {
  type: 'board' | 'tag' | 'status';
  value: string;
  displayText: string;
}
