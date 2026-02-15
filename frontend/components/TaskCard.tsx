'use client';

import { Task } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onClick?: () => void;
  isDragging?: boolean;
  disableSortable?: boolean; // NEW: Disable sortable for new API usage
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export function TaskCard({
  task,
  onUpdate: _onUpdate,
  onDelete: _onDelete,
  onClick,
  isDragging = false,
  disableSortable = false,
  actionButton,
}: TaskCardProps) {
  // Only use sortable if not disabled (for old API compatibility)
  const sortable = useSortable({ id: task.id, disabled: disableSortable });

  const DRAGGING_OPACITY = 0.5;
  const MAX_VISIBLE_TAGS = 3;

  const style = disableSortable
    ? { opacity: isDragging ? DRAGGING_OPACITY : 1 }
    : {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        opacity: sortable.isDragging ? DRAGGING_OPACITY : 1,
      };

  const handleClick = (_e: React.MouseEvent) => {
    // Only open modal if not dragging
    const isCurrentlyDragging = disableSortable ? isDragging : sortable.isDragging;
    if (!isCurrentlyDragging && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isCurrentlyDragging = disableSortable ? isDragging : sortable.isDragging;
    if ((e.key === 'Enter' || e.key === ' ') && !isCurrentlyDragging && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const divProps = disableSortable
    ? {}
    : {
        ref: sortable.setNodeRef,
        ...sortable.attributes,
        ...sortable.listeners,
      };

  return (
    <div
      {...divProps}
      style={style}
      className={`bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-600 group relative ${
        isDragging ? 'shadow-xl' : ''
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {/* Action button (shown on hover) */}
      {actionButton && (
        <button
          onClick={e => {
            e.stopPropagation();
            actionButton.onClick();
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center gap-1"
          title={actionButton.label}
        >
          {actionButton.icon}
          {actionButton.label}
        </button>
      )}

      <div className="flex items-start gap-2">
        {/* Drag handle indicator (only when sortable enabled) */}
        {!disableSortable && (
          <div className="text-gray-400 mt-0.5 flex-shrink-0">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{task.title}</h3>
          {task.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, MAX_VISIBLE_TAGS).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-md text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > MAX_VISIBLE_TAGS && (
                <span className="px-2 py-0.5 text-gray-400 dark:text-gray-500 text-xs font-medium">
                  +{task.tags.length - MAX_VISIBLE_TAGS}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
