import { useMemo } from 'react';
import { TASK_STATUS } from '../../../../shared/constants/app-constants';
import type { Task } from '../../../task-management/types/task.types';
import { UncategorizedSection } from './UncategorizedSection';

interface BacklogCategory {
  id: string;
  name: string;
  position: number;
}

interface BacklogViewProps {
  tasks: Task[];
  categories: BacklogCategory[];
  onTaskClick: (task: Task) => void;
  onAddTask: (categoryId?: string) => void;
  onAddCategory: () => void;
  onCategoryClick: (category: BacklogCategory) => void;
  renderTask: (task: Task) => React.ReactNode;
}

/**
 * Backlog View with Categories
 * Displays backlog tasks organized by categories
 */
export function BacklogView({
  tasks,
  categories,
  onTaskClick,
  onAddTask,
  onAddCategory,
  onCategoryClick,
  renderTask,
}: BacklogViewProps) {
  // Filter only backlog tasks
  const backlogTasks = useMemo(() => tasks.filter(t => t.status === TASK_STATUS.BACKLOG), [tasks]);

  // Group tasks by category
  const tasksByCategory = useMemo(() => {
    const groups = new Map<string | null, Task[]>();

    backlogTasks.forEach(task => {
      const categoryId = task.backlogCategoryId || null;
      if (!groups.has(categoryId)) {
        groups.set(categoryId, []);
      }
      groups.get(categoryId)!.push(task);
    });

    return groups;
  }, [backlogTasks]);

  const uncategorizedTasks = tasksByCategory.get(null) || [];

  return (
    <div
      className="space-y-4 h-full overflow-y-auto p-4"
      role="region"
      aria-label="Backlog"
      data-testid="backlog-view"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Backlog</h2>
        <button
          onClick={onAddCategory}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          data-testid="create-category-button"
          aria-label="Create new category"
        >
          + New Category
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map(category => {
          const categoryTasks = tasksByCategory.get(category.id) || [];

          return (
            <div
              key={category.id}
              className="bg-white rounded-lg border p-4"
              data-testid="category-section"
            >
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => onCategoryClick(category)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCategoryClick(category);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View category: ${category.name}`}
              >
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <span className="text-sm text-gray-500">{categoryTasks.length}</span>
              </div>

              <div className="space-y-2">
                {categoryTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onTaskClick(task);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View task: ${task.title}`}
                  >
                    {renderTask(task)}
                  </div>
                ))}

                {categoryTasks.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No tasks in this category
                  </p>
                )}
              </div>

              <button
                onClick={() => onAddTask(category.id)}
                className="w-full mt-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded border border-dashed"
                data-testid="add-task-to-category"
                aria-label={`Add task to ${category.name}`}
              >
                + Add Task
              </button>
            </div>
          );
        })}
      </div>

      {/* Uncategorized Tasks */}
      <UncategorizedSection
        tasks={uncategorizedTasks}
        onTaskClick={onTaskClick}
        onAddTask={() => onAddTask()}
        renderTask={renderTask}
      />

      {categories.length === 0 && uncategorizedTasks.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No backlog items yet.</p>
          <p className="text-sm mt-2">Create a category or add a task to get started.</p>
        </div>
      )}
    </div>
  );
}
