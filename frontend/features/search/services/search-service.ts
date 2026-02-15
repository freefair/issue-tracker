import { taskRepository } from '../../task-management/services/task-repository';
import { parseSearchQuery, toSearchQuery } from './query-parser';
import { MIN_SEARCH_QUERY_LENGTH } from '../../../shared/constants/app-constants';
import type { SearchQuery } from '../types/search.types';
import type { Task } from '../../task-management/types/task.types';

/**
 * Service for search business logic
 */
export class SearchService {
  /**
   * Searches tasks with query string (supports chips)
   */
  async searchTasks(queryString: string, boardId?: string): Promise<Task[]> {
    if (!this.isValidQuery(queryString)) {
      return [];
    }

    const parsed = parseSearchQuery(queryString);
    const searchQuery = toSearchQuery(parsed);

    // Use board from chip if available, otherwise use provided boardId
    const targetBoardId = searchQuery.board || boardId;

    // Perform search
    const results = await taskRepository.search(searchQuery.text || queryString, targetBoardId);

    // Apply client-side filtering for tags and status
    return this.filterResults(results, searchQuery);
  }

  /**
   * Validates search query
   */
  private isValidQuery(query: string): boolean {
    return query.trim().length >= MIN_SEARCH_QUERY_LENGTH;
  }

  /**
   * Filters search results by tags and status (client-side)
   */
  private filterResults(tasks: Task[], query: SearchQuery): Task[] {
    let filtered = tasks;

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      filtered = filtered.filter(task => query.tags!.some(tag => task.tags.includes(tag)));
    }

    // Filter by status
    if (query.status) {
      filtered = filtered.filter(task => task.status === query.status);
    }

    return filtered;
  }
}

export const searchService = new SearchService();
