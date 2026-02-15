import { useState } from 'react';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(task.id, { title: title.trim(), description: description.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-md border border-blue-500">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-2 bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none"
          placeholder="Task title"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-transparent text-xs text-gray-600 dark:text-gray-400 focus:outline-none resize-none"
          placeholder="Description (optional)"
          rows={2}
        />
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-gray-600 dark:text-gray-400 text-xs font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-600 group"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white flex-1">
          {task.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Delete this task?')) {
              onDelete(task.id);
            }
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all"
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
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-md text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
