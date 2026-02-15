import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task } from '../../../task-management/types/task.types';
import type { TaskStatus } from '../../../../shared/constants/app-constants';
import { ColumnHeader } from './ColumnHeader';

interface ColumnProps {
  title: string;
  color: string;
  status: TaskStatus;
  tasks: Task[];
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
  renderTask: (task: Task) => React.ReactNode;
}

/**
 * Kanban column component with drag & drop support
 * Pure presentational component
 */
export function Column({
  title,
  color,
  status,
  tasks,
  onAddTask,
  onTaskClick,
  renderTask,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const taskIds = tasks.map(t => t.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-h-0 bg-gray-50 rounded-lg ${
        isOver ? 'ring-2 ring-blue-500' : ''
      }`}
      data-testid={`column-${status}`}
      data-column={status}
    >
      <ColumnHeader title={title} count={tasks.length} color={color} />

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <div key={task.id} onClick={() => onTaskClick(task)}>
              {renderTask(task)}
            </div>
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No tasks</p>
        )}
      </div>

      <div className="p-4 border-t">
        <button
          onClick={onAddTask}
          className="w-full py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          data-testid="add-task-button"
          aria-label={`Add task to ${title}`}
        >
          + Add Task
        </button>
      </div>
    </div>
  );
}
