import { Board, Task, TaskStatus } from '@/types';
import { Column } from './Column';

interface BoardViewProps {
  board: Board;
  tasks: Task[];
  onCreateTask: (title: string, status: TaskStatus) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

const COLUMNS = [
  { status: TaskStatus.BACKLOG, title: 'Backlog', color: 'gray' },
  { status: TaskStatus.TODO, title: 'To Do', color: 'blue' },
  { status: TaskStatus.IN_PROGRESS, title: 'In Progress', color: 'yellow' },
  { status: TaskStatus.DONE, title: 'Done', color: 'green' },
];

export function BoardView({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}: BoardViewProps) {
  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status).sort((a, b) => a.position - b.position);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COLUMNS.map((column) => (
          <Column
            key={column.status}
            title={column.title}
            status={column.status}
            color={column.color}
            tasks={getTasksByStatus(column.status)}
            onCreateTask={onCreateTask}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
}
