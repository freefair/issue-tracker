'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Board, Task, TaskStatus } from '@/types';
import { Column } from './Column';
import { DragDropProvider } from '@dnd-kit/react';
import type { DragDropEventHandlers } from '@dnd-kit/react';
import { defaultPreset, PointerSensor, KeyboardSensor } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
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

const sensors = [PointerSensor, KeyboardSensor];

export function BoardView({ tasks, onCreateTask, onUpdateTask, onDeleteTask }: BoardViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasksByStatus, setTasksByStatus] = useState<Record<TaskStatus, Task[]>>(
    {} as Record<TaskStatus, Task[]>
  );
  const snapshot = useRef<Record<TaskStatus, Task[]>>({} as Record<TaskStatus, Task[]>);
  const isDragging = useRef(false);

  // Version check - remove this after confirming it works
  useEffect(() => {
    console.log('BoardView loaded - version 3.0 with new @dnd-kit/react API');
  }, []);

  // Organize tasks by status for drag & drop
  useEffect(() => {
    // Skip if currently dragging to avoid overwriting optimistic updates
    if (isDragging.current) {
      return;
    }

    const ARCHIVE_THRESHOLD_DAYS = 7;
    const archiveThresholdDate = new Date();
    archiveThresholdDate.setDate(archiveThresholdDate.getDate() - ARCHIVE_THRESHOLD_DAYS);

    const organized: Record<TaskStatus, Task[]> = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.READY_FOR_DEPLOYMENT]: [],
      [TaskStatus.DONE]: [],
    };

    tasks.forEach(task => {
      // Hide Done tasks older than 7 days
      if (task.status === TaskStatus.DONE) {
        const taskDate = new Date(task.updatedAt);
        if (taskDate < archiveThresholdDate) {
          return;
        }
      }
      organized[task.status].push(task);
    });

    // Sort by position
    Object.values(TaskStatus).forEach(status => {
      organized[status].sort((a, b) => a.position - b.position);
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTasksByStatus(organized);
  }, [tasks]);

  const handleDragStart = useCallback<DragDropEventHandlers['onDragStart']>(
    _event => {
      isDragging.current = true;
      // Snapshot current state
      snapshot.current = JSON.parse(JSON.stringify(tasksByStatus));
    },
    [tasksByStatus]
  );

  const handleDragOver = useCallback<DragDropEventHandlers['onDragOver']>(event => {
    const { source } = event.operation;

    // Only handle task movements
    if (source && source.type === 'task') {
      setTasksByStatus(current => move(current, event));
    }
  }, []);

  const handleDragEnd = useCallback<DragDropEventHandlers['onDragEnd']>(
    event => {
      if (event.canceled) {
        setTasksByStatus(snapshot.current);
        isDragging.current = false;
        return;
      }

      const { source, target } = event.operation;
      if (!source || !target) return;

      console.log('Drag ended:', { sourceId: source.id, targetId: target.id });

      // Find the dragged task in current state
      const allTasks = Object.values(tasksByStatus).flat();
      const movedTask = allTasks.find(t => t.id === source.id);
      if (!movedTask) {
        console.log('Moved task not found');
        return;
      }

      // Determine target status
      let targetStatus: TaskStatus;
      const validStatuses = [
        TaskStatus.BACKLOG,
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.READY_FOR_DEPLOYMENT,
        TaskStatus.DONE,
      ];

      if (validStatuses.includes(target.id as TaskStatus)) {
        targetStatus = target.id as TaskStatus;
      } else {
        // Dropped on a task - find its status
        const targetTask = allTasks.find(t => t.id === target.id);
        if (!targetTask) {
          console.log('Target task not found');
          return;
        }
        targetStatus = targetTask.status;
      }

      console.log('Target status:', targetStatus);

      // Build updates list
      const updates: Array<{ id: string; updates: Partial<Task> }> = [];
      const statusChanged = movedTask.status !== targetStatus;

      if (statusChanged) {
        // Moving between columns - reindex BOTH columns
        // 1. Reindex source column (without moved task)
        const sourceColumnTasks = tasksByStatus[movedTask.status] || [];
        sourceColumnTasks
          .filter(t => t.id !== movedTask.id)
          .forEach((task, index) => {
            updates.push({
              id: task.id,
              updates: { position: index },
            });
          });

        // 2. Insert moved task into target and reindex all
        const targetColumnTasks = tasksByStatus[targetStatus] || [];
        const targetTask = allTasks.find(t => t.id === target.id);
        let insertIndex = targetColumnTasks.length;

        if (targetTask && targetTask.status === targetStatus) {
          insertIndex = targetColumnTasks.findIndex(t => t.id === targetTask.id);
        }

        const targetWithInserted = [...targetColumnTasks];
        targetWithInserted.splice(insertIndex, 0, movedTask);

        targetWithInserted.forEach((task, index) => {
          if (task.id === movedTask.id) {
            // Update BOTH position AND status
            updates.push({
              id: task.id,
              updates: { position: index, status: targetStatus },
            });
          } else {
            updates.push({
              id: task.id,
              updates: { position: index },
            });
          }
        });
      } else {
        // Moving within same column - reindex all
        const columnTasks = tasksByStatus[targetStatus] || [];
        columnTasks.forEach((task, index) => {
          updates.push({
            id: task.id,
            updates: { position: index },
          });
        });
      }

      // Execute all updates
      console.log('Board updates to send:', updates);
      updates.forEach(({ id, updates: taskUpdates }) => {
        console.log('Updating task:', id, taskUpdates);
        onUpdateTask(id, taskUpdates);
      });

      // Reset dragging flag after a short delay to allow updates to process
      const DRAG_END_DELAY_MS = 100;
      setTimeout(() => {
        isDragging.current = false;
      }, DRAG_END_DELAY_MS);
    },
    [tasksByStatus, onUpdateTask]
  );

  return (
    <>
      <DragDropProvider
        plugins={defaultPreset.plugins}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {COLUMNS.map(column => (
              <Column
                key={column.status}
                title={column.title}
                status={column.status}
                color={column.color}
                tasks={tasksByStatus[column.status] || []}
                onCreateTask={onCreateTask}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onTaskClick={setSelectedTask}
              />
            ))}
          </div>
        </div>
      </DragDropProvider>

      {selectedTask &&
        (() => {
          // Find the current version of the selected task
          const currentTask = tasks.find(t => t.id === selectedTask.id);
          if (!currentTask) {
            // Task was deleted, close modal
            setSelectedTask(null);
            return null;
          }
          return (
            <TaskModal
              task={currentTask}
              isOpen={true}
              onClose={() => setSelectedTask(null)}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          );
        })()}
    </>
  );
}
