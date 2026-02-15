import { logger } from '../../../shared/utils/logger';
import { ApiError } from '../../../core/errors/app-error';
import { MAX_RETRIES, RETRY_DELAY_MS, HTTP_STATUS } from '../../../shared/constants/app-constants';
import type {
  BacklogCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Repository for backlog category data access
 */
export class CategoryRepository {
  /**
   * Fetches all categories for a board
   */
  async getByBoardId(boardId: string): Promise<BacklogCategory[]> {
    return this.fetchWithRetry<BacklogCategory[]>(`/categories?boardId=${boardId}`);
  }

  /**
   * Creates a new category
   */
  async create(category: CreateCategoryRequest): Promise<BacklogCategory> {
    return this.fetchApi<BacklogCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  /**
   * Updates a category
   */
  async update(id: string, updates: UpdateCategoryRequest): Promise<BacklogCategory> {
    return this.fetchApi<BacklogCategory>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Deletes a category
   */
  async delete(id: string): Promise<void> {
    return this.fetchApi<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Core fetch function
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
   * Fetch with retry logic
   */
  private async fetchWithRetry<T>(path: string, maxRetries: number = MAX_RETRIES): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.fetchApi<T>(path);
      } catch (error) {
        lastError = error as Error;

        if (
          error instanceof ApiError &&
          error.statusCode >= HTTP_STATUS.BAD_REQUEST &&
          error.statusCode < HTTP_STATUS.INTERNAL_SERVER_ERROR
        ) {
          throw error;
        }

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
        return 'Category not found';
      case HTTP_STATUS.FORBIDDEN:
        return 'You do not have permission to access this category';
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return 'Server error. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

export const categoryRepository = new CategoryRepository();
