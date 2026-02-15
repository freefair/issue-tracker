import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { taskService } from '../services/task-service';
import { logger } from '../../../shared/utils/logger';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task.types';

interface TaskContextValue {
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
  createTask: (task: CreateTaskRequest) => Promise<void>;
  updateTask: (id: string, updates: UpdateTaskRequest) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

interface TaskProviderProps {
  children: ReactNode;
  boardId?: string;
}

/**
 * Task state provider
 * Manages task state globally
 */
export function TaskProvider({ children, boardId }: TaskProviderProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedTasks = boardId
        ? await taskService.getTasksByBoardId(boardId)
        : await taskService.getAllTasks();
      setTasks(loadedTasks);
    } catch (err) {
      logger.error(err as Error, { context: 'loadTasks' });
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(async (data: CreateTaskRequest) => {
    const task = await taskService.createTask(data);
    setTasks(prev => [...prev, task]);
  }, []);

  const updateTask = useCallback(async (id: string, updates: UpdateTaskRequest) => {
    const updated = await taskService.updateTask(id, updates);
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await taskService.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const value: TaskContextValue = {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    reload: loadTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

/**
 * Hook to access task context
 */
export function useTasks(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within TaskProvider');
  }
  return context;
}
