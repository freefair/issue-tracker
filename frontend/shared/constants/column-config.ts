import { TASK_STATUS } from './app-constants';

/**
 * Kanban board column configuration
 */
export const COLUMNS = [
  { id: TASK_STATUS.TODO, title: 'To Do', color: 'blue' },
  { id: TASK_STATUS.IN_PROGRESS, title: 'In Progress', color: 'yellow' },
  { id: TASK_STATUS.READY_FOR_DEPLOYMENT, title: 'Ready for Deployment', color: 'purple' },
  { id: TASK_STATUS.DONE, title: 'Done', color: 'green' },
] as const;
