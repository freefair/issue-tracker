export interface BacklogCategory {
  id: string;
  name: string;
  position: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  position: number;
  boardId: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  position?: number;
}
