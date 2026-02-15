import { taskRepository } from './task-repository';
import { ValidationError } from '../../../core/errors/app-error';
import { validateTaskTitle } from '../../../shared/utils/validation-utils';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task.types';

/**
 * Service for task business logic
 * Handles validation and business rules
 */
export class TaskService {
  /**
   * Gets all tasks
   */
  async getAllTasks(): Promise<Task[]> {
    return taskRepository.getAll();
  }

  /**
   * Gets tasks by board ID
   */
  async getTasksByBoardId(boardId: string): Promise<Task[]> {
    return taskRepository.getByBoardId(boardId);
  }

  /**
   * Gets a task by ID
   */
  async getTaskById(id: string): Promise<Task> {
    return taskRepository.getById(id);
  }

  /**
   * Creates a new task with validation
   */
  async createTask(data: CreateTaskRequest): Promise<Task> {
    this.validateTaskData(data);
    return taskRepository.create(data);
  }

  /**
   * Updates a task with validation
   */
  async updateTask(id: string, updates: UpdateTaskRequest): Promise<Task> {
    if (updates.title !== undefined) {
      this.validateTitle(updates.title);
    }
    if (updates.position !== undefined) {
      this.validatePosition(updates.position);
    }
    return taskRepository.update(id, updates);
  }

  /**
   * Deletes a task
   */
  async deleteTask(id: string): Promise<void> {
    return taskRepository.delete(id);
  }

  /**
   * Searches tasks
   */
  async searchTasks(query: string, boardId?: string): Promise<Task[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return taskRepository.search(query, boardId);
  }

  /**
   * Validates task creation data
   */
  private validateTaskData(data: CreateTaskRequest): void {
    this.validateTitle(data.title);
    this.validatePosition(data.position);
  }

  /**
   * Validates task title
   */
  private validateTitle(title: string): void {
    const error = validateTaskTitle(title);
    if (error) {
      throw new ValidationError(error, 'title');
    }
  }

  /**
   * Validates task position
   */
  private validatePosition(position: number): void {
    if (position < 0) {
      throw new ValidationError('Position must be non-negative', 'position');
    }
  }
}

export const taskService = new TaskService();
