'use client';

import { useState, useEffect } from 'react';
import { Board, Task, TaskStatus } from '@/types';
import { Column } from './Column';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { TaskCardView } from './TaskCardView';
import { TaskModal } from './TaskModal';

interface BoardViewProps {
  board: Board;
  tasks: Task[];
  onCreateTask: (title: string, status: TaskStatus, description?: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

const COLUMNS = [
  { status: TaskStatus.TODO, title: 'To Do', color: 'blue' },
  { status: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'yellow' },
  { status: TaskStatus.READY_FOR_DEPLOYMENT, title: 'Ready for Deployment', color: 'purple' },
  { status: TaskStatus.DONE, title: 'Done', color: 'green' },
];

export function BoardView({ tasks, onCreateTask, onUpdateTask, onDeleteTask }: BoardViewProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Version check - remove this after confirming it works
  useEffect(() => {
    console.log('BoardView loaded - version 2.0 with READY_FOR_DEPLOYMENT fix');
  }, []);

  // Note: selectedTask syncing removed - parent re-renders with updated task

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Long-press on mobile
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const getTasksByStatus = (status: TaskStatus) => {
    const ARCHIVE_THRESHOLD_DAYS = 7;
    const archiveThresholdDate = new Date();
    archiveThresholdDate.setDate(archiveThresholdDate.getDate() - ARCHIVE_THRESHOLD_DAYS);

    return tasks
      .filter(task => {
        if (task.status !== status) return false;

        // Hide Done tasks older than 7 days
        if (status === TaskStatus.DONE) {
          const taskDate = new Date(task.updatedAt);
          return taskDate >= archiveThresholdDate;
        }

        return true;
      })
      .sort((a, b) => a.position - b.position);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    console.log('Drag ended:', { activeId: active.id, overId: over?.id });

    if (!over) {
      console.log('No drop target');
      return;
    }

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) {
      console.log('Active task not found');
      return;
    }

    // Determine the new status
    let newStatus: TaskStatus;
    let targetTask: Task | undefined;

    // Check if over.id is a TaskStatus enum value
    const validStatuses = [
      TaskStatus.BACKLOG,
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      TaskStatus.READY_FOR_DEPLOYMENT,
      TaskStatus.DONE,
    ];
    console.log('Checking if over.id is valid status:', { overId: over.id, validStatuses });

    if (validStatuses.includes(over.id as TaskStatus)) {
      // Dropped on column
      newStatus = over.id as TaskStatus;
      console.log('Dropped on column:', newStatus);
    } else {
      // Dropped on another task - get that task's status
      targetTask = tasks.find(t => t.id === over.id);
      if (!targetTask) {
        console.log('Target task not found');
        return;
      }
      newStatus = targetTask.status;
      console.log('Dropped on task, using task status:', newStatus);
    }

    // Get all tasks in the target column (excluding the dragged task)
    const tasksInColumn = tasks
      .filter(t => t.status === newStatus && t.id !== active.id)
      .sort((a, b) => a.position - b.position);

    // Calculate new position
    let newPosition: number;

    if (targetTask && targetTask.status === newStatus) {
      // Dropped on another task in the same or different column
      // Insert before the target task
      newPosition = targetTask.position;
    } else {
      // Dropped on empty column or at the end
      newPosition =
        tasksInColumn.length > 0 ? Math.max(...tasksInColumn.map(t => t.position)) + 1 : 0;
    }

    // Check if anything changed
    const statusChanged = activeTask.status !== newStatus;
    const positionChanged = activeTask.position !== newPosition;

    if (!statusChanged && !positionChanged) {
      console.log('Nothing changed, skipping update');
      return;
    }

    console.log('Updating task:', {
      taskId: activeTask.id,
      oldStatus: activeTask.status,
      newStatus,
      oldPosition: activeTask.position,
      newPosition,
      statusChanged,
      positionChanged,
    });

    // Update with new status and/or position
    onUpdateTask(activeTask.id, {
      status: newStatus,
      position: newPosition,
    });
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {COLUMNS.map(column => (
            <Column
              key={column.status}
              title={column.title}
              status={column.status}
              color={column.color}
              tasks={getTasksByStatus(column.status)}
              onCreateTask={onCreateTask}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3">
            <TaskCardView task={activeTask} isDragging={true} />
          </div>
        ) : null}
      </DragOverlay>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
        />
      )}
    </DndContext>
  );
}
