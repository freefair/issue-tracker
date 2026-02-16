'use client';

import { useState, memo } from 'react';
import type { PropsWithChildren } from 'react';
import { Task, TaskStatus } from '@/types';
import { TaskCardView } from './TaskCardView';
import { useSortable } from '@dnd-kit/react/sortable';
import { CollisionPriority } from '@dnd-kit/abstract';

interface SortableTaskProps {
  task: Task;
  status: TaskStatus;
  index: number;
  onTaskClick?: (task: Task) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

const SortableTask = memo(function SortableTask({
  task,
  status,
  index,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete: _onTaskDelete,
}: PropsWithChildren<SortableTaskProps>) {
  const DRAGGING_OPACITY = 0.5;
  const { ref, isDragging } = useSortable({
    id: task.id,
    group: status,
    accept: 'task',
    type: 'task',
    feedback: 'clone',
    index,
    data: { group: status, type: 'task' },
  });

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <div ref={ref as any} style={{ opacity: isDragging ? DRAGGING_OPACITY : 1 }}>
      <TaskCardView
        task={task}
        isDragging={isDragging}
        onClick={onTaskClick ? () => onTaskClick(task) : undefined}
        actionButton={
          status === TaskStatus.TODO
            ? {
                label: 'To Backlog',
                onClick: () => onTaskUpdate(task.id, { status: TaskStatus.BACKLOG }),
                icon: (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                ),
              }
            : undefined
        }
      />
    </div>
  );
});

interface ColumnProps {
  title: string;
  status: TaskStatus;
  color: string;
  tasks: Task[];
  onCreateTask: (title: string, status: TaskStatus, description?: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskClick?: (task: Task) => void;
}

export function Column({
  title,
  status,
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onTaskClick,
}: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // Make column a droppable container
  const { ref, isDropTarget } = useSortable({
    id: status,
    accept: ['column', 'task'], // Accept both columns and tasks
    collisionPriority: CollisionPriority.Low, // Lower priority than tasks
    type: 'column',
    index: 0, // Columns don't reorder
    data: { type: 'column', status },
  });

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      onCreateTask(newTaskTitle.trim(), status, newTaskDescription.trim() || undefined);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsAdding(false);
    }
  };

  return (
    <div
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm border transition-all flex flex-col ${
        isDropTarget
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          {title}
        </h2>
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
          {tasks.length}
        </span>
      </div>

      <div id={status} className="space-y-3 min-h-[200px] flex-1">
        {tasks.map((task, index) => (
          <SortableTask
            key={task.id}
            task={task}
            status={status}
            index={index}
            onTaskClick={onTaskClick}
            onTaskUpdate={onUpdateTask}
            onTaskDelete={onDeleteTask}
          />
        ))}
      </div>

      {isAdding ? (
        <div className="bg-white dark:bg-gray-700 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-600 mt-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewTaskTitle('');
                setNewTaskDescription('');
              }
            }}
            placeholder="Task title..."
            className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none mb-2"
          />
          <textarea
            value={newTaskDescription}
            onChange={e => setNewTaskDescription(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewTaskTitle('');
                setNewTaskDescription('');
              }
            }}
            placeholder="Description (Markdown supported)..."
            className="w-full bg-transparent text-xs text-gray-600 dark:text-gray-400 placeholder-gray-400 focus:outline-none resize-none"
            rows={3}
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleCreateTask}
              className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewTaskTitle('');
                setNewTaskDescription('');
              }}
              className="px-3 py-1 text-gray-600 dark:text-gray-400 text-xs font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-all flex items-center justify-center gap-2 mt-3"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 4v16m8-8H4" />
          </svg>
          Add task
        </button>
      )}
    </div>
  );
}
