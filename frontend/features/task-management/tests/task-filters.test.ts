import { describe, it, expect } from 'vitest';
import {
  shouldArchiveTask,
  filterTasksByBoard,
  filterTasksByStatus,
  filterArchivableTasks,
  filterActiveTasksByStatus,
  groupTasksByCategory,
  sortTasksByPosition,
} from '../services/task-filters';
import { TASK_STATUS } from '../../../shared/constants/app-constants';
import type { Task } from '../types/task.types';

describe('task-filters', () => {
  const now = new Date();
  const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString();
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      status: TASK_STATUS.TODO,
      position: 2,
      tags: [],
      boardId: 'board1',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: '2',
      title: 'Task 2',
      status: TASK_STATUS.DONE,
      position: 1,
      tags: [],
      boardId: 'board1',
      createdAt: now.toISOString(),
      updatedAt: eightDaysAgo,
    },
    {
      id: '3',
      title: 'Task 3',
      status: TASK_STATUS.IN_PROGRESS,
      position: 0,
      tags: [],
      boardId: 'board2',
      backlogCategoryId: 'cat1',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: '4',
      title: 'Task 4',
      status: TASK_STATUS.DONE,
      position: 3,
      tags: [],
      boardId: 'board1',
      createdAt: now.toISOString(),
      updatedAt: yesterday,
    },
  ];

  describe('shouldArchiveTask', () => {
    it('should return true for DONE tasks older than 7 days', () => {
      expect(shouldArchiveTask(mockTasks[1])).toBe(true);
    });

    it('should return false for DONE tasks newer than 7 days', () => {
      expect(shouldArchiveTask(mockTasks[3])).toBe(false);
    });

    it('should return false for non-DONE tasks', () => {
      expect(shouldArchiveTask(mockTasks[0])).toBe(false);
      expect(shouldArchiveTask(mockTasks[2])).toBe(false);
    });
  });

  describe('filterTasksByBoard', () => {
    it('should filter tasks by board ID', () => {
      const result = filterTasksByBoard(mockTasks, 'board1');
      expect(result).toHaveLength(3);
      expect(result.every(t => t.boardId === 'board1')).toBe(true);
    });

    it('should return empty array for non-existent board', () => {
      const result = filterTasksByBoard(mockTasks, 'nonexistent');
      expect(result).toHaveLength(0);
    });
  });

  describe('filterTasksByStatus', () => {
    it('should filter tasks by status', () => {
      const result = filterTasksByStatus(mockTasks, TASK_STATUS.DONE);
      expect(result).toHaveLength(2);
      expect(result.every(t => t.status === TASK_STATUS.DONE)).toBe(true);
    });

    it('should return empty array for status with no tasks', () => {
      const result = filterTasksByStatus(mockTasks, TASK_STATUS.READY_FOR_DEPLOYMENT);
      expect(result).toHaveLength(0);
    });
  });

  describe('filterArchivableTasks', () => {
    it('should return only archivable tasks', () => {
      const result = filterArchivableTasks(mockTasks);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });
  });

  describe('filterActiveTasksByStatus', () => {
    it('should return active tasks excluding archived', () => {
      const result = filterActiveTasksByStatus(mockTasks, TASK_STATUS.DONE);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('4'); // Recent DONE task, not archived
    });

    it('should return all tasks for non-DONE status', () => {
      const result = filterActiveTasksByStatus(mockTasks, TASK_STATUS.TODO);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('groupTasksByCategory', () => {
    it('should group tasks by category ID', () => {
      const result = groupTasksByCategory(mockTasks);
      expect(result.size).toBe(2); // null and 'cat1'
      expect(result.get('cat1')).toHaveLength(1);
      expect(result.get(null)).toHaveLength(3);
    });

    it('should handle tasks without category', () => {
      const result = groupTasksByCategory(mockTasks);
      const uncategorized = result.get(null);
      expect(uncategorized).toBeDefined();
      expect(uncategorized!.length).toBe(3);
    });
  });

  describe('sortTasksByPosition', () => {
    it('should sort tasks by position ascending', () => {
      const result = sortTasksByPosition(mockTasks);
      expect(result[0].position).toBe(0);
      expect(result[1].position).toBe(1);
      expect(result[2].position).toBe(2);
      expect(result[3].position).toBe(3);
    });

    it('should not mutate original array', () => {
      const original = [...mockTasks];
      sortTasksByPosition(mockTasks);
      expect(mockTasks).toEqual(original);
    });
  });
});
