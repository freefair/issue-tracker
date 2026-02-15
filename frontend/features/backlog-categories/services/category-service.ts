import { categoryRepository } from './category-repository';
import { ValidationError } from '../../../core/errors/app-error';
import type {
  BacklogCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category.types';

const MAX_CATEGORY_NAME_LENGTH = 100;

/**
 * Service for backlog category business logic
 */
export class CategoryService {
  /**
   * Gets categories by board ID
   */
  async getCategoriesByBoardId(boardId: string): Promise<BacklogCategory[]> {
    return categoryRepository.getByBoardId(boardId);
  }

  /**
   * Creates a new category with validation
   */
  async createCategory(data: CreateCategoryRequest): Promise<BacklogCategory> {
    this.validateCategoryData(data);
    return categoryRepository.create(data);
  }

  /**
   * Updates a category with validation
   */
  async updateCategory(id: string, updates: UpdateCategoryRequest): Promise<BacklogCategory> {
    if (updates.name !== undefined) {
      this.validateCategoryName(updates.name);
    }
    if (updates.position !== undefined) {
      this.validatePosition(updates.position);
    }
    return categoryRepository.update(id, updates);
  }

  /**
   * Deletes a category
   */
  async deleteCategory(id: string): Promise<void> {
    return categoryRepository.delete(id);
  }

  /**
   * Sorts categories by position
   */
  sortByPosition(categories: BacklogCategory[]): BacklogCategory[] {
    return [...categories].sort((a, b) => a.position - b.position);
  }

  /**
   * Validates category data
   */
  private validateCategoryData(data: CreateCategoryRequest): void {
    this.validateCategoryName(data.name);
    this.validatePosition(data.position);
  }

  /**
   * Validates category name
   */
  private validateCategoryName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Category name is required', 'name');
    }
    if (name.length > MAX_CATEGORY_NAME_LENGTH) {
      throw new ValidationError(
        `Category name must be less than ${MAX_CATEGORY_NAME_LENGTH} characters`,
        'name'
      );
    }
  }

  /**
   * Validates position
   */
  private validatePosition(position: number): void {
    if (position < 0) {
      throw new ValidationError('Position must be non-negative', 'position');
    }
  }
}

export const categoryService = new CategoryService();
