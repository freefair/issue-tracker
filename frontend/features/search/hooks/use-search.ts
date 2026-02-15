import { useState, useCallback } from 'react';
import { searchService } from '../services/search-service';
import { useDebounce } from '../../../shared/hooks/use-debounce';
import { SEARCH_DEBOUNCE_MS } from '../../../shared/constants/app-constants';
import { logger } from '../../../shared/utils/logger';
import type { Task } from '../../task-management/types/task.types';

/**
 * Hook for search functionality with debouncing
 */
export function useSearch(boardId?: string) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Task[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      try {
        setIsSearching(true);
        setError(null);
        const searchResults = await searchService.searchTasks(searchQuery, boardId);
        setResults(searchResults);
      } catch (err) {
        logger.error(err as Error, { context: 'search', query: searchQuery });
        setError(err as Error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [boardId]
  );

  // Auto-search when debounced query changes
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  // Manual search trigger
  const search = useCallback(() => {
    void performSearch(query);
  }, [query, performSearch]);

  // Clear search
  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    debouncedQuery,
    results,
    isSearching,
    error,
    setQuery: handleQueryChange,
    search,
    clear,
  };
}
