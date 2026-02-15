import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskService } from '../services/task-service';
import { taskRepository } from '../services/task-repository';
import { ValidationError } from '../../../core/errors/app-error';
import { TASK_STATUS } from '../../../shared/constants/app-constants';
import type { Task } from '../types/task.types';

vi.mock('../services/task-repository');

describe('TaskService', () => {
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
    vi.clearAllMocks();
  });

  describe('getAllTasks', () => {
    it('should fetch all tasks from repository', async () => {
      const mockTasks = [mockTask];
      vi.spyOn(taskRepository, 'getAll').mockResolvedValue(mockTasks);

      const result = await taskService.getAllTasks();

      expect(result).toEqual(mockTasks);
      expect(taskRepository.getAll).toHaveBeenCalledOnce();
    });
  });

  describe('getTasksByBoardId', () => {
    it('should fetch tasks for a specific board', async () => {
      const mockTasks = [mockTask];
      vi.spyOn(taskRepository, 'getByBoardId').mockResolvedValue(mockTasks);

      const result = await taskService.getTasksByBoardId('board1');

      expect(result).toEqual(mockTasks);
      expect(taskRepository.getByBoardId).toHaveBeenCalledWith('board1');
    });
  });

  describe('getTaskById', () => {
    it('should fetch a single task by ID', async () => {
      vi.spyOn(taskRepository, 'getById').mockResolvedValue(mockTask);

      const result = await taskService.getTaskById('1');

      expect(result).toEqual(mockTask);
      expect(taskRepository.getById).toHaveBeenCalledWith('1');
    });
  });

  describe('createTask', () => {
    it('should create a task with valid data', async () => {
      const createRequest = {
        title: 'New Task',
        status: TASK_STATUS.TODO,
        position: 0,
        boardId: 'board1',
      };
      vi.spyOn(taskRepository, 'create').mockResolvedValue(mockTask);

      const result = await taskService.createTask(createRequest);

      expect(result).toEqual(mockTask);
      expect(taskRepository.create).toHaveBeenCalledWith(createRequest);
    });

    it('should throw ValidationError for empty title', async () => {
      const createRequest = {
        title: '',
        status: TASK_STATUS.TODO,
        position: 0,
        boardId: 'board1',
      };

      await expect(taskService.createTask(createRequest)).rejects.toThrow(ValidationError);
      await expect(taskService.createTask(createRequest)).rejects.toThrow('Title is required');
    });

    it('should throw ValidationError for title exceeding max length', async () => {
      const createRequest = {
        title: 'a'.repeat(501),
        status: TASK_STATUS.TODO,
        position: 0,
        boardId: 'board1',
      };

      await expect(taskService.createTask(createRequest)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for negative position', async () => {
      const createRequest = {
        title: 'Valid Title',
        status: TASK_STATUS.TODO,
        position: -1,
        boardId: 'board1',
      };

      await expect(taskService.createTask(createRequest)).rejects.toThrow(ValidationError);
      await expect(taskService.createTask(createRequest)).rejects.toThrow(
        'Position must be non-negative'
      );
    });

    it('should accept position 0', async () => {
      const createRequest = {
        title: 'Valid Title',
        status: TASK_STATUS.TODO,
        position: 0,
        boardId: 'board1',
      };
      vi.spyOn(taskRepository, 'create').mockResolvedValue(mockTask);

      await expect(taskService.createTask(createRequest)).resolves.toBeDefined();
    });
  });

  describe('updateTask', () => {
    it('should update a task with valid data', async () => {
      const updates = { title: 'Updated Task' };
      vi.spyOn(taskRepository, 'update').mockResolvedValue({ ...mockTask, ...updates });

      const result = await taskService.updateTask('1', updates);

      expect(result.title).toBe('Updated Task');
      expect(taskRepository.update).toHaveBeenCalledWith('1', updates);
    });

    it('should validate title if provided in updates', async () => {
      const updates = { title: '' };

      await expect(taskService.updateTask('1', updates)).rejects.toThrow(ValidationError);
    });

    it('should validate position if provided in updates', async () => {
      const updates = { position: -1 };

      await expect(taskService.updateTask('1', updates)).rejects.toThrow(ValidationError);
    });

    it('should allow updates without validation if fields not provided', async () => {
      const updates = { description: 'New description' };
      vi.spyOn(taskRepository, 'update').mockResolvedValue({ ...mockTask, ...updates });

      await expect(taskService.updateTask('1', updates)).resolves.toBeDefined();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      vi.spyOn(taskRepository, 'delete').mockResolvedValue(undefined);

      await taskService.deleteTask('1');

      expect(taskRepository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('searchTasks', () => {
    it('should search tasks with query', async () => {
      const mockTasks = [mockTask];
      vi.spyOn(taskRepository, 'search').mockResolvedValue(mockTasks);

      const result = await taskService.searchTasks('test');

      expect(result).toEqual(mockTasks);
      expect(taskRepository.search).toHaveBeenCalledWith('test', undefined);
    });

    it('should search tasks with query and board ID', async () => {
      const mockTasks = [mockTask];
      vi.spyOn(taskRepository, 'search').mockResolvedValue(mockTasks);

      const result = await taskService.searchTasks('test', 'board1');

      expect(result).toEqual(mockTasks);
      expect(taskRepository.search).toHaveBeenCalledWith('test', 'board1');
    });

    it('should return empty array for empty query', async () => {
      const result = await taskService.searchTasks('');

      expect(result).toEqual([]);
      expect(taskRepository.search).not.toHaveBeenCalled();
    });

    it('should return empty array for whitespace query', async () => {
      const result = await taskService.searchTasks('   ');

      expect(result).toEqual([]);
      expect(taskRepository.search).not.toHaveBeenCalled();
    });
  });
});
