import { Board, Task, CreateTaskRequest, UpdateTaskRequest, BacklogCategory, CreateBacklogCategoryRequest, UpdateBacklogCategoryRequest } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  // Handle empty responses (e.g., DELETE operations)
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

// Board API
export const boardApi = {
  getAll: () => fetchApi<Board[]>('/boards'),
  getById: (id: string) => fetchApi<Board>(`/boards/${id}`),
  create: (name: string, description?: string) =>
    fetchApi<Board>('/boards', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),
  update: (id: string, name: string, description?: string) =>
    fetchApi<Board>(`/boards/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description }),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/boards/${id}`, { method: 'DELETE' }),
};

// Task API
export const taskApi = {
  getAll: (boardId: string) => fetchApi<Task[]>(`/boards/${boardId}/tasks`),
  getById: (id: string) => fetchApi<Task>(`/tasks/${id}`),
  getByStatus: (boardId: string, status: string) =>
    fetchApi<Task[]>(`/boards/${boardId}/tasks/status/${status}`),
  create: (request: CreateTaskRequest) => {
    const { boardId, ...taskData } = request;
    return fetchApi<Task>(`/boards/${boardId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },
  update: (id: string, request: UpdateTaskRequest) =>
    fetchApi<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    }),
  delete: (id: string) => fetchApi<void>(`/tasks/${id}`, { method: 'DELETE' }),
  searchByBoard: (boardId: string, query: string) =>
    fetchApi<Task[]>(`/tasks/search?boardId=${boardId}&q=${encodeURIComponent(query)}`),
  searchGlobal: (query: string) =>
    fetchApi<Task[]>(`/tasks/search/global?q=${encodeURIComponent(query)}`),
};

// Backlog Category API
export const backlogCategoryApi = {
  getAll: (boardId: string) => fetchApi<BacklogCategory[]>(`/boards/${boardId}/backlog-categories`),
  getById: (id: string) => fetchApi<BacklogCategory>(`/backlog-categories/${id}`),
  create: (boardId: string, request: CreateBacklogCategoryRequest) =>
    fetchApi<BacklogCategory>(`/boards/${boardId}/backlog-categories`, {
      method: 'POST',
      body: JSON.stringify(request),
    }),
  update: (id: string, request: UpdateBacklogCategoryRequest) =>
    fetchApi<BacklogCategory>(`/backlog-categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    }),
  delete: (id: string) => fetchApi<void>(`/backlog-categories/${id}`, { method: 'DELETE' }),
};
