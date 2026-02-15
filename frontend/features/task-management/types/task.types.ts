import { TASK_STATUS, type TaskStatus } from '../../../shared/constants/app-constants';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  position: number;
  tags: string[];
  boardId: string;
  backlogCategoryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  position: number;
  tags?: string[];
  boardId: string;
  backlogCategoryId?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  position?: number;
  tags?: string[];
  backlogCategoryId?: string;
}

export { TASK_STATUS, type TaskStatus };
