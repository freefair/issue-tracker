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
import { TaskCard } from './TaskCard';
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

  // Update selectedTask when tasks change
  useEffect(() => {
    if (selectedTask) {
      const updatedTask = tasks.find(t => t.id === selectedTask.id);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    }
  }, [tasks, selectedTask?.id]);

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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return tasks
      .filter(task => {
        if (task.status !== status) return false;

        // Hide Done tasks older than 7 days
        if (status === TaskStatus.DONE) {
          const taskDate = new Date(task.updatedAt);
          return taskDate >= sevenDaysAgo;
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
      const targetTask = tasks.find(t => t.id === over.id);
      if (!targetTask) {
        console.log('Target task not found');
        return;
      }
      newStatus = targetTask.status;
      console.log('Dropped on task, using task status:', newStatus);
    }

    // If status hasn't changed, no update needed
    if (activeTask.status === newStatus) {
      console.log('Status unchanged, skipping update');
      return;
    }

    // Calculate new position (add to end of column)
    const tasksInNewColumn = tasks.filter(t => t.status === newStatus && t.id !== active.id);
    const newPosition =
      tasksInNewColumn.length > 0 ? Math.max(...tasksInNewColumn.map(t => t.position)) + 1 : 1;

    console.log('Updating task:', {
      taskId: activeTask.id,
      oldStatus: activeTask.status,
      newStatus,
      newPosition,
    });

    // Optimistic update - include all required fields
    onUpdateTask(activeTask.id, {
      title: activeTask.title,
      description: activeTask.description,
      status: newStatus,
      position: newPosition,
      tags: activeTask.tags,
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
            <TaskCard task={activeTask} onUpdate={() => {}} onDelete={() => {}} isDragging={true} />
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
