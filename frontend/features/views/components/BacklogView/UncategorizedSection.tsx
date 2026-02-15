import type { Task } from '../../../task-management/types/task.types';

interface UncategorizedSectionProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
  renderTask: (task: Task) => React.ReactNode;
}

/**
 * Section for uncategorized backlog tasks
 */
export function UncategorizedSection({
  tasks,
  onTaskClick,
  onAddTask,
  renderTask,
}: UncategorizedSectionProps) {
  return (
    <div className="bg-white rounded-lg border p-4" data-testid="uncategorized-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Uncategorized</h3>
        <span className="text-sm text-gray-500">{tasks.length}</span>
      </div>

      <div className="space-y-2">
        {tasks.map(task => (
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

        {tasks.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No uncategorized tasks</p>
        )}
      </div>

      <button
        onClick={onAddTask}
        className="w-full mt-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded border border-dashed"
        data-testid="add-task-to-uncategorized"
        aria-label="Add task to uncategorized"
      >
        + Add Task
      </button>
    </div>
  );
}
