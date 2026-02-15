export interface Board {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  boardId: string;
  title: string;
  description: string;
  status: TaskStatus;
  position: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  READY_FOR_DEPLOYMENT = 'READY_FOR_DEPLOYMENT',
  DONE = 'DONE',
}

export interface CreateTaskRequest {
  boardId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  position?: number;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  position?: number;
  tags?: string[];
}
