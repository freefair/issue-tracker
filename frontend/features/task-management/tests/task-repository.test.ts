import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TaskRepository } from '../services/task-repository';
import { ApiError } from '../../../core/errors/app-error';
import { TASK_STATUS } from '../../../shared/constants/app-constants';
import type { Task, CreateTaskRequest } from '../types/task.types';

describe('TaskRepository', () => {
  let repository: TaskRepository;
  let fetchMock: ReturnType<typeof vi.fn>;

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: TASK_STATUS.TODO,
    position: 0,
    tags: ['test'],
    boardId: 'board1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    repository = new TaskRepository();
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all tasks successfully', async () => {
      const mockTasks = [mockTask];
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockTasks),
      });

      const result = await repository.getAll();

      expect(result).toEqual(mockTasks);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tasks',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should retry on network error', async () => {
      fetchMock
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify([mockTask]),
        });

      const promise = repository.getAll();
      await vi.runAllTimersAsync();

      const result = await promise;

      expect(result).toEqual([mockTask]);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('getByBoardId', () => {
    it('should fetch tasks by board ID', async () => {
      const mockTasks = [mockTask];
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockTasks),
      });

      const result = await repository.getByBoardId('board1');

      expect(result).toEqual(mockTasks);
      expect(fetchMock).toHaveBeenCalledWith('/api/tasks?boardId=board1', expect.any(Object));
    });
  });

  describe('getById', () => {
    it('should fetch a single task by ID', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockTask),
      });

      const result = await repository.getById('1');

      expect(result).toEqual(mockTask);
      expect(fetchMock).toHaveBeenCalledWith('/api/tasks/1', expect.any(Object));
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createRequest: CreateTaskRequest = {
        title: 'New Task',
        status: TASK_STATUS.TODO,
        position: 0,
        boardId: 'board1',
      };
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockTask),
      });

      const result = await repository.create(createRequest);

      expect(result).toEqual(mockTask);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tasks',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(createRequest),
        })
      );
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updates = { title: 'Updated Task' };
      const updatedTask = { ...mockTask, ...updates };
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(updatedTask),
      });

      const result = await repository.update('1', updates);

      expect(result).toEqual(updatedTask);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tasks/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updates),
        })
      );
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => '',
      });

      await repository.delete('1');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tasks/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('search', () => {
    it('should search tasks with query only', async () => {
      const mockTasks = [mockTask];
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockTasks),
      });

      const result = await repository.search('test');

      expect(result).toEqual(mockTasks);
      expect(fetchMock).toHaveBeenCalledWith('/api/tasks/search?q=test', expect.any(Object));
    });

    it('should search tasks with query and board ID', async () => {
      const mockTasks = [mockTask];
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockTasks),
      });

      const result = await repository.search('test', 'board1');

      expect(result).toEqual(mockTasks);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tasks/search?q=test&boardId=board1',
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    it('should throw ApiError with user-friendly message for 404', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Task not found',
      });

      try {
        await repository.getById('999');
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).userMessage).toBe('Task not found');
      }
    });

    it('should handle network errors', async () => {
      fetchMock.mockRejectedValue(new Error('Failed to fetch'));

      const promise = repository.getAll();
      const errorPromise = promise.catch(() => {
        /* Expected to fail */
      });
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow(ApiError);
      await expect(promise).rejects.toThrow('Network error');
      await errorPromise; // Ensure promise is settled
    });
  });
});
