import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BoardRepository } from '../services/board-repository';
import { ApiError } from '../../../core/errors/app-error';
import type { Board, CreateBoardRequest } from '../types/board.types';

describe('BoardRepository', () => {
  let repository: BoardRepository;
  let fetchMock: ReturnType<typeof vi.fn>;

  const mockBoard: Board = {
    id: '1',
    name: 'Test Board',
    description: 'Test Description',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    repository = new BoardRepository();
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all boards successfully', async () => {
      const mockBoards = [mockBoard];
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockBoards),
      });

      const result = await repository.getAll();

      expect(result).toEqual(mockBoards);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/boards',
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
          text: async () => JSON.stringify([mockBoard]),
        });

      const promise = repository.getAll();

      // Fast-forward through retry delays
      await vi.runAllTimersAsync();

      const result = await promise;

      expect(result).toEqual([mockBoard]);
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    it('should not retry on 4xx client errors', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => 'Forbidden',
      });

      await expect(repository.getAll()).rejects.toThrow(ApiError);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should throw ApiError after max retries', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      // Catch the promise before running timers to avoid unhandled rejection
      const promise = repository.getAll();
      const errorPromise = promise.catch(() => {
        /* Expected to fail */
      });

      // Fast-forward through all retry delays
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow(ApiError);
      await errorPromise; // Ensure promise is settled
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('getById', () => {
    it('should fetch a single board by ID', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockBoard),
      });

      const result = await repository.getById('1');

      expect(result).toEqual(mockBoard);
      expect(fetchMock).toHaveBeenCalledWith('/api/boards/1', expect.any(Object));
    });

    it('should throw ApiError with user-friendly message for 404', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Board not found',
      });

      await expect(repository.getById('999')).rejects.toThrow(ApiError);
      await expect(repository.getById('999')).rejects.toThrow('Board not found');
    });
  });

  describe('create', () => {
    it('should create a new board', async () => {
      const createRequest: CreateBoardRequest = {
        name: 'New Board',
        description: 'New Description',
      };
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(mockBoard),
      });

      const result = await repository.create(createRequest);

      expect(result).toEqual(mockBoard);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/boards',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(createRequest),
        })
      );
    });

    it('should handle validation errors from API', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid board name',
      });

      await expect(repository.create({ name: '' })).rejects.toThrow(ApiError);
    });
  });

  describe('update', () => {
    it('should update a board', async () => {
      const updates = { name: 'Updated Board' };
      const updatedBoard = { ...mockBoard, ...updates };
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(updatedBoard),
      });

      const result = await repository.update('1', updates);

      expect(result).toEqual(updatedBoard);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/boards/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updates),
        })
      );
    });
  });

  describe('delete', () => {
    it('should delete a board', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => '',
      });

      await repository.delete('1');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/boards/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should handle empty response for delete', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => '',
      });

      const result = await repository.delete('1');

      expect(result).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should throw ApiError for 500 server error', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      });

      const promise = repository.getAll();
      const errorPromise = promise.catch(() => {
        /* Expected to fail */
      });
      await vi.runAllTimersAsync();

      try {
        await promise;
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).userMessage).toBe('Server error. Please try again later.');
      }
      await errorPromise; // Ensure promise is settled
    });

    it('should throw ApiError for 403 forbidden error', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => 'Forbidden',
      });

      try {
        await repository.getById('1');
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).userMessage).toBe(
          'You do not have permission to access this board'
        );
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
