'use client';

import { Task } from '@/types';
import { TaskCardView } from './TaskCardView';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onClick?: () => void;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

/**
 * TaskCard with OLD @dnd-kit/sortable API
 * Used in BoardView and Column components
 */
export function TaskCard({
  task,
  onUpdate: _onUpdate,
  onDelete: _onDelete,
  onClick,
  actionButton,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCardView
        task={task}
        onClick={onClick}
        isDragging={isDragging}
        actionButton={actionButton}
      />
    </div>
  );
}
