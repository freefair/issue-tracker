'use client';

import { useState, useEffect } from 'react';
import { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { CreateTaskModal } from './CreateTaskModal';

interface BacklogViewProps {
  tasks: Task[];
  onCreateTask: (title: string, status: TaskStatus, description?: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function BacklogView({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}: BacklogViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Update selectedTask when tasks change
  useEffect(() => {
    if (selectedTask) {
      const updatedTask = tasks.find(t => t.id === selectedTask.id);
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    }
  }, [tasks, selectedTask?.id]);

  const backlogTasks = tasks
    .filter(task => task.status === TaskStatus.BACKLOG)
    .sort((a, b) => a.position - b.position);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Backlog
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {backlogTasks.length} {backlogTasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>

        <div className="space-y-3">
          {backlogTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
              onClick={() => setSelectedTask(task)}
              actionButton={{
                label: 'To Todo',
                onClick: () => onUpdateTask(task.id, { status: TaskStatus.TODO }),
                icon: (
                  <svg className="w-3 h-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                ),
              }}
            />
          ))}

          {backlogTasks.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No tasks in backlog</p>
              <p className="text-xs mt-1">Add a task to get started</p>
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

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={onCreateTask}
        defaultStatus={TaskStatus.BACKLOG}
      />
    </div>
  );
}
