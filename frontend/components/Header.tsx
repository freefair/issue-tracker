import { Board, Task } from '@/types';
import { TaskSearch } from './TaskSearch';

interface HeaderProps {
  board: Board | null;
  boards: Board[];
  allTags: string[];
  view: 'board' | 'backlog' | 'archive';
  onViewChange: (view: 'board' | 'backlog' | 'archive') => void;
  onTaskSelect: (task: Task) => void;
}

export function Header({ board, boards, allTags, view, onViewChange, onTaskSelect }: HeaderProps) {
  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {board?.name || 'Issue Tracker'}
            </h1>
            {board?.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {board.description}
              </p>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => onViewChange('board')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'board'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => onViewChange('backlog')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'backlog'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Backlog
            </button>
            <button
              onClick={() => onViewChange('archive')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'archive'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Archive
            </button>
          </div>
        </div>

        {/* Task Search */}
        {board && (
          <div className="mt-4">
            <TaskSearch
              currentBoardId={board.id}
              boards={boards}
              allTags={allTags}
              onTaskSelect={onTaskSelect}
            />
          </div>
        )}
      </div>
    </header>
  );
}
