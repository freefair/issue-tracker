import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { categoryService } from '../services/category-service';
import { logger } from '../../../shared/utils/logger';
import type {
  BacklogCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category.types';

interface CategoryContextValue {
  categories: BacklogCategory[];
  isLoading: boolean;
  error: Error | null;
  createCategory: (category: CreateCategoryRequest) => Promise<void>;
  updateCategory: (id: string, updates: UpdateCategoryRequest) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextValue | undefined>(undefined);

interface CategoryProviderProps {
  children: ReactNode;
  boardId: string;
}

/**
 * Category state provider
 * Manages backlog category state for a board
 */
export function CategoryProvider({ children, boardId }: CategoryProviderProps) {
  const [categories, setCategories] = useState<BacklogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedCategories = await categoryService.getCategoriesByBoardId(boardId);
      const sorted = categoryService.sortByPosition(loadedCategories);
      setCategories(sorted);
    } catch (err) {
      logger.error(err as Error, { context: 'loadCategories', boardId });
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const createCategory = useCallback(async (data: CreateCategoryRequest) => {
    const category = await categoryService.createCategory(data);
    setCategories(prev => categoryService.sortByPosition([...prev, category]));
  }, []);

  const updateCategory = useCallback(async (id: string, updates: UpdateCategoryRequest) => {
    const updated = await categoryService.updateCategory(id, updates);
    setCategories(prev => {
      const newCategories = prev.map(c => (c.id === id ? updated : c));
      return categoryService.sortByPosition(newCategories);
    });
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    await categoryService.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const value: CategoryContextValue = {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    reload: loadCategories,
  };

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

/**
 * Hook to access category context
 */
export function useCategories(): CategoryContextValue {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoryProvider');
  }
  return context;
}
