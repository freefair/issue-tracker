'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Board } from '@/types';
import { ConfirmDialog } from './ConfirmDialog';

interface SidebarProps {
  boards: Board[];
  currentBoardId?: string;
  isOpen: boolean;
  onToggle: () => void;
  onCreateBoard: () => void;
  onEditBoard: (board: Board) => void;
  onDeleteBoard: (boardId: string) => void;
}

export function Sidebar({ boards, currentBoardId, isOpen, onToggle, onCreateBoard, onEditBoard, onDeleteBoard }: SidebarProps) {
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const [boardFilter, setBoardFilter] = useState('');

  // Filter boards by search text
  const filteredBoards = boards.filter(board =>
    board.name.toLowerCase().includes(boardFilter.toLowerCase())
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-white dark:bg-gray-800
        border-r border-gray-200 dark:border-gray-700 z-50
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Issue Tracker</h2>
        </div>

        {/* Board Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={boardFilter}
              onChange={(e) => setBoardFilter(e.target.value)}
              placeholder="Filter boards..."
              className="w-full px-3 py-2 pr-8 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {boardFilter && (
              <button
                onClick={() => setBoardFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Clear filter"
              >
                <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Board List */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {filteredBoards.map(board => (
            <div key={board.id} className="group relative">
              <Link
                href={`/?board=${board.id}`}
                className={`
                  block px-4 py-2 pr-20 rounded-lg transition-colors text-sm font-medium
                  ${currentBoardId === board.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                onClick={() => {
                  // Close sidebar on mobile after clicking
                  if (window.innerWidth < 768) {
                    onToggle();
                  }
                }}
              >
                {board.name}
              </Link>
              {/* Action buttons */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100">
                {/* Edit button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditBoard(board);
                  }}
                  className={`
                    p-1 rounded transition-colors
                    ${currentBoardId === board.id
                      ? 'text-white hover:bg-blue-700'
                      : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                    }
                  `}
                  title="Edit board"
                >
                  <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setBoardToDelete(board);
                  }}
                  className={`
                    p-1 rounded transition-colors
                    ${currentBoardId === board.id
                      ? 'text-white hover:bg-blue-700'
                      : 'text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                    }
                  `}
                  title="Delete board"
                >
                  <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {filteredBoards.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {boardFilter ? 'No boards found' : 'No boards yet'}
              </p>
            </div>
          )}
        </nav>

        {/* Create Board Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={onCreateBoard}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            + New Board
          </button>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 md:hidden bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={!!boardToDelete}
        title="Delete Board"
        message={`Are you sure you want to delete "${boardToDelete?.name}"? All tasks in this board will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDangerous={true}
        onConfirm={() => {
          if (boardToDelete) {
            onDeleteBoard(boardToDelete.id);
          }
        }}
        onCancel={() => setBoardToDelete(null)}
      />
    </>
  );
}
