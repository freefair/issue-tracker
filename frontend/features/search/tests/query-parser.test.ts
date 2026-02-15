import { describe, it, expect } from 'vitest';
import { parseSearchQuery, toSearchQuery, generateSuggestions } from '../services/query-parser';

describe('query-parser', () => {
  describe('parseSearchQuery', () => {
    it('should parse free text without chips', () => {
      const result = parseSearchQuery('urgent bug fix');
      expect(result.freeText).toBe('urgent bug fix');
      expect(result.chips).toHaveLength(0);
    });

    it('should parse Board chip', () => {
      const result = parseSearchQuery('Board:ProjectA urgent');
      expect(result.freeText).toBe('urgent');
      expect(result.chips).toHaveLength(1);
      expect(result.chips[0]).toEqual({
        type: 'board',
        value: 'ProjectA',
        displayText: 'Board:ProjectA',
      });
    });

    it('should parse Tag chip', () => {
      const result = parseSearchQuery('Tag:frontend urgent bug');
      expect(result.freeText).toBe('urgent bug');
      expect(result.chips).toHaveLength(1);
      expect(result.chips[0]).toEqual({
        type: 'tag',
        value: 'frontend',
        displayText: 'Tag:frontend',
      });
    });

    it('should parse Status chip', () => {
      const result = parseSearchQuery('Status:TODO find all');
      expect(result.freeText).toBe('find all');
      expect(result.chips).toHaveLength(1);
      expect(result.chips[0]).toEqual({
        type: 'status',
        value: 'TODO',
        displayText: 'Status:TODO',
      });
    });

    it('should parse multiple chips', () => {
      const result = parseSearchQuery('Board:ProjectA Tag:urgent Tag:bug critical');
      expect(result.freeText).toBe('critical');
      expect(result.chips).toHaveLength(3);
    });

    it('should handle mixed case', () => {
      const result = parseSearchQuery('board:ProjectA TAG:urgent');
      expect(result.chips).toHaveLength(2);
      expect(result.chips[0].value).toBe('ProjectA');
      expect(result.chips[1].value).toBe('urgent');
    });

    it('should handle empty query', () => {
      const result = parseSearchQuery('');
      expect(result.freeText).toBe('');
      expect(result.chips).toHaveLength(0);
    });

    it('should trim whitespace from free text', () => {
      const result = parseSearchQuery('  Board:ProjectA   urgent   ');
      expect(result.freeText).toBe('urgent');
    });
  });

  describe('toSearchQuery', () => {
    it('should convert parsed query to SearchQuery', () => {
      const parsed = parseSearchQuery('Board:ProjectA Tag:urgent Tag:bug critical');
      const searchQuery = toSearchQuery(parsed);

      expect(searchQuery.text).toBe('critical');
      expect(searchQuery.board).toBe('ProjectA');
      expect(searchQuery.tags).toEqual(['urgent', 'bug']);
    });

    it('should handle query with only free text', () => {
      const parsed = parseSearchQuery('urgent bug');
      const searchQuery = toSearchQuery(parsed);

      expect(searchQuery.text).toBe('urgent bug');
      expect(searchQuery.board).toBeUndefined();
      expect(searchQuery.tags).toBeUndefined();
      expect(searchQuery.status).toBeUndefined();
    });

    it('should handle status chip', () => {
      const parsed = parseSearchQuery('Status:IN_PROGRESS find tasks');
      const searchQuery = toSearchQuery(parsed);

      expect(searchQuery.text).toBe('find tasks');
      expect(searchQuery.status).toBe('IN_PROGRESS');
    });
  });

  describe('generateSuggestions', () => {
    const boards = ['ProjectA', 'ProjectB'];
    const tags = ['urgent', 'bug', 'feature'];
    const statuses = ['TODO', 'IN_PROGRESS', 'DONE'];

    it('should suggest boards when query contains "board:"', () => {
      const suggestions = generateSuggestions('board:', boards, tags, statuses);
      expect(suggestions).toContain('Board:ProjectA');
      expect(suggestions).toContain('Board:ProjectB');
    });

    it('should suggest tags when query contains "tag:"', () => {
      const suggestions = generateSuggestions('tag:', boards, tags, statuses);
      expect(suggestions).toContain('Tag:urgent');
      expect(suggestions).toContain('Tag:bug');
      expect(suggestions).toContain('Tag:feature');
    });

    it('should suggest statuses when query contains "status:"', () => {
      const suggestions = generateSuggestions('status:', boards, tags, statuses);
      expect(suggestions).toContain('Status:TODO');
      expect(suggestions).toContain('Status:IN_PROGRESS');
      expect(suggestions).toContain('Status:DONE');
    });

    it('should suggest boards when query ends with "b"', () => {
      const suggestions = generateSuggestions('find all b', boards, tags, statuses);
      expect(suggestions).toContain('Board:ProjectA');
    });

    it('should return empty array for unmatched query', () => {
      const suggestions = generateSuggestions('just text', boards, tags, statuses);
      expect(suggestions).toHaveLength(0);
    });
  });
});
