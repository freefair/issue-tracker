/**
 * Task status constants
 */
export const TASK_STATUS = {
  BACKLOG: 'BACKLOG',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  READY_FOR_DEPLOYMENT: 'READY_FOR_DEPLOYMENT',
  DONE: 'DONE',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

/**
 * View type constants
 */
export const VIEW_TYPE = {
  BOARD: 'board',
  BACKLOG: 'backlog',
  ARCHIVE: 'archive',
} as const;

export type ViewType = (typeof VIEW_TYPE)[keyof typeof VIEW_TYPE];

/**
 * Application constants
 */
export const ARCHIVE_THRESHOLD_DAYS = 7;
export const SEARCH_DEBOUNCE_MS = 300;
export const MAX_TASK_TITLE_LENGTH = 500;
export const MIN_SEARCH_QUERY_LENGTH = 2;
export const MIN_TOUCH_TARGET_SIZE = 44; // px, accessibility requirement
export const MAX_RETRIES = 3;
export const RETRY_DELAY_MS = 1000;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * API configuration
 * Frontend is served from Spring Boot container, so we use relative paths
 */
export const API_BASE_URL = '/api';
