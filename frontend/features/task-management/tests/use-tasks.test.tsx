import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { TaskProvider, useTasks } from '../hooks/use-tasks';
import { taskService } from '../services/task-service';
import { TASK_STATUS } from '../../../shared/constants/app-constants';
import type { Task } from '../types/task.types';
import type { ReactNode } from 'react';

vi.mock('../services/task-service');

describe('useTasks', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      status: TASK_STATUS.TODO,
      position: 0,
      tags: [],
      boardId: 'board1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Task 2',
      status: TASK_STATUS.IN_PROGRESS,
      position: 1,
      tags: [],
      boardId: 'board1',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <TaskProvider>{children}</TaskProvider>
  );

  describe('initial load', () => {
    it('should load tasks on mount', async () => {
      vi.spyOn(taskService, 'getAllTasks').mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTasks(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.error).toBeNull();
    });

    it('should load tasks for specific board', async () => {
      vi.spyOn(taskService, 'getTasksByBoardId').mockResolvedValue(mockTasks);

      const wrapperWithBoard = ({ children }: { children: ReactNode }) => (
        <TaskProvider boardId="board1">{children}</TaskProvider>
      );

      const { result } = renderHook(() => useTasks(), { wrapper: wrapperWithBoard });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(taskService.getTasksByBoardId).toHaveBeenCalledWith('board1');
      expect(result.current.tasks).toEqual(mockTasks);
    });

    it('should handle load error', async () => {
      const error = new Error('Failed to load tasks');
      vi.spyOn(taskService, 'getAllTasks').mockRejectedValue(error);

      const { result } = renderHook(() => useTasks(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.tasks).toEqual([]);
    });
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      const newTask: Task = {
        id: '3',
        title: 'New Task',
        status: TASK_STATUS.TODO,
        position: 2,
        tags: [],
        boardId: 'board1',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      };

      vi.spyOn(taskService, 'getAllTasks').mockResolvedValue(mockTasks);
      vi.spyOn(taskService, 'createTask').mockResolvedValue(newTask);

      const { result } = renderHook(() => useTasks(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createTask({
          title: 'New Task',
          status: TASK_STATUS.TODO,
          position: 2,
          boardId: 'board1',
        });
      });

      expect(result.current.tasks).toHaveLength(3);
      expect(result.current.tasks[2]).toEqual(newTask);
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const updatedTask = { ...mockTasks[0], title: 'Updated Task' };

      vi.spyOn(taskService, 'getAllTasks').mockResolvedValue(mockTasks);
      vi.spyOn(taskService, 'updateTask').mockResolvedValue(updatedTask);

      const { result } = renderHook(() => useTasks(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateTask('1', { title: 'Updated Task' });
      });

      expect(result.current.tasks[0].title).toBe('Updated Task');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      vi.spyOn(taskService, 'getAllTasks').mockResolvedValue(mockTasks);
      vi.spyOn(taskService, 'deleteTask').mockResolvedValue(undefined);

      const { result } = renderHook(() => useTasks(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteTask('2');
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks.find(t => t.id === '2')).toBeUndefined();
    });
  });

  describe('reload', () => {
    it('should reload tasks', async () => {
      const updatedTasks = [
        ...mockTasks,
        {
          id: '3',
          title: 'Task 3',
          status: TASK_STATUS.DONE,
          position: 2,
          tags: [],
          boardId: 'board1',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
        },
      ];

      vi.spyOn(taskService, 'getAllTasks')
        .mockResolvedValueOnce(mockTasks)
        .mockResolvedValueOnce(updatedTasks);

      const { result } = renderHook(() => useTasks(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tasks).toHaveLength(2);

      await act(async () => {
        await result.current.reload();
      });

      expect(result.current.tasks).toHaveLength(3);
    });
  });

  describe('error handling', () => {
    it('should throw error if used outside TaskProvider', () => {
      expect(() => {
        renderHook(() => useTasks());
      }).toThrow('useTasks must be used within TaskProvider');
    });
  });
});
