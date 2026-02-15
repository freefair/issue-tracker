import { useMemo } from 'react';
import {
  filterActiveTasksByStatus,
  filterArchivableTasks,
  groupTasksByCategory,
  sortTasksByPosition,
} from '../services/task-filters';
import { TASK_STATUS } from '../../../shared/constants/app-constants';
import type { Task } from '../types/task.types';
import type { TaskStatus } from '../../../shared/constants/app-constants';

/**
 * Hook for filtering and grouping tasks
 */
export function useTaskFilters(tasks: Task[]) {
  const byStatus = useMemo(() => {
    return (status: TaskStatus) => {
      const filtered = filterActiveTasksByStatus(tasks, status);
      return sortTasksByPosition(filtered);
    };
  }, [tasks]);

  const archivable = useMemo(() => {
    return sortTasksByPosition(filterArchivableTasks(tasks));
  }, [tasks]);

  const byCategory = useMemo(() => {
    return groupTasksByCategory(tasks);
  }, [tasks]);

  const backlogTasks = useMemo(() => {
    return byStatus(TASK_STATUS.BACKLOG);
  }, [byStatus]);

  return {
    byStatus,
    archivable,
    byCategory,
    backlogTasks,
  };
}
