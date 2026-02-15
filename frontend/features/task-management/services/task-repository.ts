import { logger } from '../../../shared/utils/logger';
import { ApiError } from '../../../core/errors/app-error';
import {
  MAX_RETRIES,
  RETRY_DELAY_MS,
  HTTP_STATUS,
  API_BASE_URL,
} from '../../../shared/constants/app-constants';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task.types';

/**
 * Repository for task data access
 * Handles all API calls related to tasks
 */
export class TaskRepository {
  /**
   * Fetches all tasks with retry logic
   */
  async getAll(): Promise<Task[]> {
    return this.fetchWithRetry<Task[]>('/tasks');
  }

  /**
   * Fetches tasks by board ID
   */
  async getByBoardId(boardId: string): Promise<Task[]> {
    return this.fetchWithRetry<Task[]>(`/tasks?boardId=${boardId}`);
  }

  /**
   * Fetches a single task by ID
   */
  async getById(id: string): Promise<Task> {
    return this.fetchWithRetry<Task>(`/tasks/${id}`);
  }

  /**
   * Creates a new task
   */
  async create(task: CreateTaskRequest): Promise<Task> {
    return this.fetchApi<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  /**
   * Updates an existing task
   */
  async update(id: string, updates: UpdateTaskRequest): Promise<Task> {
    return this.fetchApi<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Deletes a task
   */
  async delete(id: string): Promise<void> {
    return this.fetchApi<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Searches tasks by query
   */
  async search(query: string, boardId?: string): Promise<Task[]> {
    const params = new URLSearchParams({ q: query });
    if (boardId) {
      params.append('boardId', boardId);
    }
    return this.fetchWithRetry<Task[]>(`/tasks/search?${params.toString()}`);
  }

  /**
   * Core fetch function with error handling
   */
  private async fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${path}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(
          response.status,
          errorText || response.statusText,
          this.getUserFriendlyError(response.status)
        );
      }

      const text = await response.text();
      return text ? (JSON.parse(text) as T) : (undefined as T);
    } catch (error) {
      if (error instanceof ApiError) throw error;

      logger.error(error as Error, { url, method: options?.method });
      throw new ApiError(0, `Network error: ${(error as Error).message}`);
    }
  }

  /**
   * Fetch with retry logic for GET requests (idempotent)
   */
  private async fetchWithRetry<T>(path: string, maxRetries: number = MAX_RETRIES): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.fetchApi<T>(path);
      } catch (error) {
        lastError = error as Error;

        // Don't retry client errors (4xx)
        if (
          error instanceof ApiError &&
          error.statusCode >= HTTP_STATUS.BAD_REQUEST &&
          error.statusCode < HTTP_STATUS.INTERNAL_SERVER_ERROR
        ) {
          throw error;
        }

        // Exponential backoff
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (i + 1)));
        }
      }
    }

    throw lastError!;
  }

  /**
   * User-friendly error messages
   */
  private getUserFriendlyError(statusCode: number): string {
    switch (statusCode) {
      case HTTP_STATUS.NOT_FOUND:
        return 'Task not found';
      case HTTP_STATUS.FORBIDDEN:
        return 'You do not have permission to access this task';
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return 'Server error. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

export const taskRepository = new TaskRepository();
