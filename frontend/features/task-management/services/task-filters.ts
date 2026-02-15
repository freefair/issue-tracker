import { TASK_STATUS, ARCHIVE_THRESHOLD_DAYS } from '../../../shared/constants/app-constants';
import { isOlderThanDays } from '../../../shared/utils/date-utils';
import type { Task } from '../types/task.types';
import type { TaskStatus } from '../../../shared/constants/app-constants';

/**
 * Checks if task should be archived
 */
export function shouldArchiveTask(task: Task): boolean {
  return (
    task.status === TASK_STATUS.DONE &&
    !!task.updatedAt &&
    isOlderThanDays(task.updatedAt, ARCHIVE_THRESHOLD_DAYS)
  );
}

/**
 * Filters tasks by board
 */
export function filterTasksByBoard(tasks: Task[], boardId: string): Task[] {
  return tasks.filter(t => t.boardId === boardId);
}

/**
 * Filters tasks by status
 */
export function filterTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter(t => t.status === status);
}

/**
 * Filters archivable tasks
 */
export function filterArchivableTasks(tasks: Task[]): Task[] {
  return tasks.filter(shouldArchiveTask);
}

/**
 * Filters active tasks by status (excluding archived)
 */
export function filterActiveTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter(t => t.status === status && !shouldArchiveTask(t));
}

/**
 * Groups tasks by category
 */
export function groupTasksByCategory(tasks: Task[]): Map<string | null, Task[]> {
  const groups = new Map<string | null, Task[]>();
  tasks.forEach(task => {
    const key = task.backlogCategoryId || null;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(task);
  });
  return groups;
}

/**
 * Sorts tasks by position
 */
export function sortTasksByPosition(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.position - b.position);
}
