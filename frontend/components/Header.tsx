import { Board } from '@/types';

interface HeaderProps {
  boards: Board[];
  selectedBoard: Board | null;
  onSelectBoard: (board: Board) => void;
  onCreateBoard: (name: string, description?: string) => void;
}

export function Header({
  boards,
  selectedBoard,
  onSelectBoard,
}: HeaderProps) {
  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Issue Tracker
            </h1>
            {boards.length > 0 && (
              <select
                value={selectedBoard?.id || ''}
                onChange={(e) => {
                  const board = boards.find((b) => b.id === e.target.value);
                  if (board) onSelectBoard(board);
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {boards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
