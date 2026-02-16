'use client';

import { useState } from 'react';
import { Task, TaskStatus } from '@/types';
import { TaskCardView } from './TaskCardView';
import { TaskModal } from './TaskModal';

interface ArchiveViewProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function ArchiveView({ tasks, onUpdateTask, onDeleteTask }: ArchiveViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Note: selectedTask syncing removed - parent re-renders with updated task

  // Helper function to format date correctly
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Only show tasks that have been in DONE status for more than ARCHIVE_THRESHOLD_DAYS
  const ARCHIVE_THRESHOLD_DAYS = 7;
  const archiveThresholdDate = new Date();
  archiveThresholdDate.setDate(archiveThresholdDate.getDate() - ARCHIVE_THRESHOLD_DAYS);

  const completedTasks = tasks
    .filter(task => {
      if (task.status !== TaskStatus.DONE) return false;
      const taskDate = new Date(task.updatedAt);
      return taskDate < archiveThresholdDate; // Only show if older than threshold
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const filteredTasks = searchQuery
    ? completedTasks.filter(
        task =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : completedTasks;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Archive</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredTasks.length} completed {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search completed tasks..."
            className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <div key={task.id} className="flex items-start gap-3">
              <div className="flex-1">
                <TaskCardView
                  task={task}
                  isDragging={false}
                  onClick={() => setSelectedTask(task)}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {formatDate(task.updatedAt)}
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-sm">
                {searchQuery ? 'No tasks found matching your search' : 'No completed tasks yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
        />
      )}
    </div>
  );
}
