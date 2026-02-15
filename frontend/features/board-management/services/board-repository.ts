import { logger } from '../../../shared/utils/logger';
import { ApiError } from '../../../core/errors/app-error';
import {
  MAX_RETRIES,
  RETRY_DELAY_MS,
  HTTP_STATUS,
  API_BASE_URL,
} from '../../../shared/constants/app-constants';
import type { Board, CreateBoardRequest, UpdateBoardRequest } from '../types/board.types';

/**
 * Repository for board data access
 * Handles all API calls related to boards
 */
export class BoardRepository {
  /**
   * Fetches all boards with retry logic
   */
  async getAll(): Promise<Board[]> {
    return this.fetchWithRetry<Board[]>('/boards');
  }

  /**
   * Fetches a single board by ID
   */
  async getById(id: string): Promise<Board> {
    return this.fetchWithRetry<Board>(`/boards/${id}`);
  }

  /**
   * Creates a new board
   */
  async create(board: CreateBoardRequest): Promise<Board> {
    return this.fetchApi<Board>('/boards', {
      method: 'POST',
      body: JSON.stringify(board),
    });
  }

  /**
   * Updates an existing board
   */
  async update(id: string, updates: UpdateBoardRequest): Promise<Board> {
    return this.fetchApi<Board>(`/boards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Deletes a board
   */
  async delete(id: string): Promise<void> {
    return this.fetchApi<void>(`/boards/${id}`, {
      method: 'DELETE',
    });
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
        return 'Board not found';
      case HTTP_STATUS.FORBIDDEN:
        return 'You do not have permission to access this board';
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return 'Server error. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

export const boardRepository = new BoardRepository();
