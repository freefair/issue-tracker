import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import { COLUMNS } from '../../../../shared/constants/column-config';
import { TASK_STATUS } from '../../../../shared/constants/app-constants';
import { useTaskFilters } from '../../../task-management/hooks/use-task-filters';
import { useDragAndDrop } from '../../../task-management/hooks/use-drag-and-drop';
import type { Task } from '../../../task-management/types/task.types';
import { Column } from './Column';

interface BoardViewProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onTaskClick: (task: Task) => void;
  onAddTask: (status: string) => void;
  renderTask: (task: Task) => React.ReactNode;
}

/**
 * Kanban Board View
 * Displays tasks in columns by status with drag & drop support
 */
export function BoardView({
  tasks,
  onUpdateTask,
  onTaskClick,
  onAddTask,
  renderTask,
}: BoardViewProps) {
  const { byStatus } = useTaskFilters(tasks);

  // Handle drag and drop between columns
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    // Check if it's a valid status
    if (
      !Object.values(TASK_STATUS).includes(
        newStatus as (typeof TASK_STATUS)[keyof typeof TASK_STATUS]
      )
    ) {
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Update task status
    await onUpdateTask(taskId, {
      status: newStatus as (typeof TASK_STATUS)[keyof typeof TASK_STATUS],
    });
  };

  const { sensors } = useDragAndDrop({
    items: tasks,
    onReorder: async () => {
      // Reordering within columns handled separately
    },
    getId: task => task.id,
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={event => void handleDragEnd(event)}
    >
      <div className="grid grid-cols-4 gap-4 h-full" role="region" aria-label="Kanban board">
        {COLUMNS.map(column => {
          const columnTasks = byStatus(column.id);

          return (
            <Column
              key={column.id}
              title={column.title}
              color={column.color}
              status={column.id}
              tasks={columnTasks}
              onAddTask={() => onAddTask(column.id)}
              onTaskClick={onTaskClick}
              renderTask={renderTask}
            />
          );
        })}
      </div>
    </DndContext>
  );
}
