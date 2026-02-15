import { useMemo } from 'react';
import { formatTaskDate } from '../../../../shared/utils/date-utils';
import type { Task } from '../../../task-management/types/task.types';
import { filterArchivableTasks } from '../../../task-management/services/task-filters';

interface ArchiveViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onRestoreTask: (task: Task) => void;
  renderTask: (task: Task) => React.ReactNode;
}

/**
 * Archive View
 * Displays archived tasks (DONE tasks older than 7 days)
 */
export function ArchiveView({ tasks, onTaskClick, onRestoreTask, renderTask }: ArchiveViewProps) {
  const archivedTasks = useMemo(() => filterArchivableTasks(tasks), [tasks]);

  // Group by month
  const tasksByMonth = useMemo(() => {
    const groups = new Map<string, Task[]>();

    archivedTasks.forEach(task => {
      if (!task.updatedAt) return;

      const date = new Date(task.updatedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }
      groups.get(monthKey)!.push(task);
    });

    return groups;
  }, [archivedTasks]);

  const sortedMonths = useMemo(
    () => Array.from(tasksByMonth.keys()).sort().reverse(),
    [tasksByMonth]
  );

  const formatMonthHeader = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    const date = new Date(parseInt(year, 10), monthIndex);
    return date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long' });
  };

  return (
    <div
      className="h-full overflow-y-auto p-4"
      role="region"
      aria-label="Archive"
      data-testid="archive-view"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Archive</h2>
        <p className="text-sm text-gray-500 mt-1">
          Completed tasks older than 7 days ({archivedTasks.length} tasks)
        </p>
      </div>

      {archivedTasks.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No archived tasks yet.</p>
          <p className="text-sm mt-2">Tasks are automatically archived 7 days after completion.</p>
        </div>
      )}

      <div className="space-y-6" data-testid="archived-tasks">
        {sortedMonths.map(monthKey => {
          const monthTasks = tasksByMonth.get(monthKey) || [];

          return (
            <div key={monthKey} className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-4">{formatMonthHeader(monthKey)}</h3>

              <div className="space-y-2">
                {monthTasks.map(task => (
                  <div
                    key={task.id}
                    className="relative group"
                    data-archived="true"
                    data-testid="task-card"
                  >
                    <div
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

                    <button
                      onClick={() => onRestoreTask(task)}
                      className="absolute top-2 right-2 px-3 py-1 text-xs bg-blue-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Restore task: ${task.title}`}
                    >
                      Restore
                    </button>

                    {task.updatedAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Completed {formatTaskDate(task.updatedAt)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
