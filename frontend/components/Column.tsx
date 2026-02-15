import { useState } from 'react';
import { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';

interface ColumnProps {
  title: string;
  status: TaskStatus;
  color: string;
  tasks: Task[];
  onCreateTask: (title: string, status: TaskStatus) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function Column({
  title,
  status,
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      onCreateTask(newTaskTitle.trim(), status);
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          {title}
        </h2>
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
          />
        ))}

        {isAdding ? (
          <div className="bg-white dark:bg-gray-700 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-600">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateTask();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewTaskTitle('');
                }
              }}
              placeholder="Task title..."
              className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
              autoFocus
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
            className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-all flex items-center justify-center gap-2"
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
    </div>
  );
}
