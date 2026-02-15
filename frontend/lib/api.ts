import { Board, Task, CreateTaskRequest, UpdateTaskRequest } from '@/types';

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
  search: (boardId: string, query: string) =>
    fetchApi<Task[]>(`/boards/${boardId}/tasks/search?q=${encodeURIComponent(query)}`),
};
