'use client';

import { useState, useEffect, useRef } from 'react';
import { Task, Board, TaskStatus } from '@/types';
import { taskApi } from '@/lib/api';

type SearchScope = 'board' | 'global';

interface TaskSearchProps {
  currentBoardId: string;
  boards: Board[];
  onTaskSelect: (task: Task) => void;
}

export function TaskSearch({ currentBoardId, boards, onTaskSelect }: TaskSearchProps) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('board');
  const [results, setResults] = useState<Task[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, scope, currentBoardId]);

  // Keyboard shortcuts (Cmd+K / Ctrl+K to focus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        inputRef.current?.blur();
      }

      // Navigate results with arrow keys
      if (isOpen && results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex((prev) => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (results[highlightedIndex]) {
            handleSelectTask(results[highlightedIndex]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, highlightedIndex]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const searchResults = scope === 'board'
        ? await taskApi.searchByBoard(currentBoardId, query)
        : await taskApi.searchGlobal(query);
      setResults(searchResults);
      setIsOpen(true);
      setHighlightedIndex(0);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTask = (task: Task) => {
    onTaskSelect(task);
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const getBoardName = (boardId: string) => {
    return boards.find(b => b.id === boardId)?.name || 'Unknown Board';
  };

  const getStatusBadge = (status: TaskStatus) => {
    const colors = {
      BACKLOG: 'bg-gray-500',
      TODO: 'bg-blue-500',
      IN_PROGRESS: 'bg-yellow-500',
      READY_FOR_DEPLOYMENT: 'bg-purple-500',
      DONE: 'bg-green-500',
    };

    const labels = {
      BACKLOG: 'Backlog',
      TODO: 'To Do',
      IN_PROGRESS: 'In Progress',
      READY_FOR_DEPLOYMENT: 'Ready',
      DONE: 'Done',
    };

    return (
      <span className={`px-2 py-0.5 text-xs font-medium text-white rounded ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Group results by board for global search
  const groupedResults = scope === 'global'
    ? results.reduce((acc, task) => {
        const boardId = task.boardId;
        if (!acc[boardId]) {
          acc[boardId] = [];
        }
        acc[boardId].push(task);
        return acc;
      }, {} as Record<string, Task[]>)
    : { [currentBoardId]: results };

  return (
    <div className="relative" ref={modalRef}>
      {/* Search Input */}
      <div className="flex items-center gap-2">
        {/* Scope Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setScope('board')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              scope === 'board'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            📍 Board
          </button>
          <button
            onClick={() => setScope('global')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              scope === 'global'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            🌐 Global
          </button>
        </div>

        {/* Search Input Field */}
        <div className="relative flex-1 max-w-md">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search tasks ${scope === 'board' ? 'in this board' : 'globally'}... (⌘K)`}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Results Modal */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          {results.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>No tasks found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedResults).map(([boardId, tasks]) => (
                <div key={boardId}>
                  {/* Board Header (for global search) */}
                  {scope === 'global' && (
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {getBoardName(boardId)}
                    </div>
                  )}

                  {/* Tasks */}
                  {tasks.map((task, taskIndex) => {
                    const globalIndex = results.findIndex(r => r.id === task.id);
                    const isHighlighted = globalIndex === highlightedIndex;

                    return (
                      <button
                        key={task.id}
                        onClick={() => handleSelectTask(task)}
                        onMouseEnter={() => setHighlightedIndex(globalIndex)}
                        className={`w-full text-left px-3 py-2 rounded transition-colors ${
                          isHighlighted
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {task.description}
                              </p>
                            )}
                            {task.tags.length > 0 && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {task.tags.map((tag, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(task.status)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
