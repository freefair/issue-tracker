'use client';

import { useState, useEffect, useRef } from 'react';
import { Task, Board, TaskStatus } from '@/types';
import { taskApi } from '@/lib/api';

type QueryChip = {
  type: 'board' | 'tag' | 'status';
  value: string;
  displayValue?: string;
};

interface TaskSearchProps {
  currentBoardId: string;
  boards: Board[];
  allTags: string[];
  onTaskSelect: (task: Task) => void;
}

const FIELD_SUGGESTIONS = ['Board:', 'Tag:', 'Status:'];
const STATUS_OPTIONS = [
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'READY_FOR_DEPLOYMENT', label: 'Ready' },
  { value: 'DONE', label: 'Done' },
];

export function TaskSearch({ currentBoardId, boards, allTags, onTaskSelect }: TaskSearchProps) {
  const [chips, setChips] = useState<QueryChip[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<Task[]>([]);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize with current board chip
  useEffect(() => {
    const currentBoard = boards.find(b => b.id === currentBoardId);
    if (currentBoard && chips.length === 0) {
      setChips([{ type: 'board', value: currentBoardId, displayValue: currentBoard.name }]);
    }
  }, [currentBoardId, boards]);

  // Keyboard shortcuts (Cmd+K / Ctrl+K to focus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
        setIsResultsOpen(false);
        setIsSuggestionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input changes and show suggestions
  useEffect(() => {
    const value = inputValue.trim();

    if (!value) {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      return;
    }

    // Check if typing a field name
    const colonIndex = value.indexOf(':');

    if (colonIndex === -1) {
      // Suggest field names
      const matchingFields = FIELD_SUGGESTIONS.filter(field =>
        field.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(matchingFields);
      setIsSuggestionsOpen(matchingFields.length > 0);
    } else {
      // Suggest field values
      const fieldName = value.substring(0, colonIndex).toLowerCase();
      const searchTerm = value.substring(colonIndex + 1).trim().toLowerCase();

      let valueSuggestions: string[] = [];

      if (fieldName === 'board') {
        valueSuggestions = boards
          .filter(b => b.name.toLowerCase().includes(searchTerm))
          .map(b => `Board:${b.name}`);
      } else if (fieldName === 'tag') {
        valueSuggestions = allTags
          .filter(tag => tag.toLowerCase().includes(searchTerm))
          .map(tag => `Tag:${tag}`);
      } else if (fieldName === 'status') {
        valueSuggestions = STATUS_OPTIONS
          .filter(s => s.label.toLowerCase().includes(searchTerm))
          .map(s => `Status:${s.label}`);
      }

      setSuggestions(valueSuggestions);
      setIsSuggestionsOpen(valueSuggestions.length > 0);
    }

    setSelectedSuggestionIndex(0);
  }, [inputValue, boards, allTags]);

  // Debounced search
  useEffect(() => {
    const freeTextQuery = inputValue.trim();
    const hasUserAddedFilters = chips.some(c => c.type === 'tag' || c.type === 'status');
    const hasTextQuery = freeTextQuery.length >= 2;

    // Only search if user has typed something OR added filter chips (tag/status)
    const shouldSearch = hasTextQuery || hasUserAddedFilters;

    if (shouldSearch) {
      const timer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsResultsOpen(false);
    }
  }, [chips, inputValue]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      // Determine search scope from chips
      const boardChip = chips.find(c => c.type === 'board');
      const tagChips = chips.filter(c => c.type === 'tag');
      const statusChips = chips.filter(c => c.type === 'status');

      // Build search query (free text from input)
      const freeTextQuery = inputValue.trim();

      // For now, search in the specified board or globally
      let searchResults: Task[] = [];

      if (boardChip) {
        // Search in specific board
        if (freeTextQuery.length >= 2) {
          searchResults = await taskApi.searchByBoard(boardChip.value, freeTextQuery);
        } else {
          // Get all tasks from board if only filters, no search text
          searchResults = await taskApi.getAll(boardChip.value);
        }
      } else {
        // Global search
        if (freeTextQuery.length >= 2) {
          searchResults = await taskApi.searchGlobal(freeTextQuery);
        }
      }

      // Apply client-side filtering for tags and status
      let filteredResults = searchResults;

      if (tagChips.length > 0) {
        const selectedTags = tagChips.map(c => c.value.toLowerCase());
        filteredResults = filteredResults.filter(task =>
          task.tags.some(tag => selectedTags.includes(tag.toLowerCase()))
        );
      }

      if (statusChips.length > 0) {
        const selectedStatuses = statusChips.map(c => c.value);
        filteredResults = filteredResults.filter(task =>
          selectedStatuses.includes(task.status)
        );
      }

      setResults(filteredResults);
      setIsResultsOpen(true);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Navigate suggestions
    if (isSuggestionsOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => Math.max(prev - 1, 0));
        return;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestionIndex]);
        return;
      }
    }

    // Navigate results
    if (e.key === 'Escape') {
      setIsResultsOpen(false);
      setIsSuggestionsOpen(false);
      setInputValue('');
      inputRef.current?.blur();
      return;
    }

    // Backspace on empty input removes last chip
    if (e.key === 'Backspace' && inputValue === '' && chips.length > 0) {
      e.preventDefault();
      setChips(chips.slice(0, -1));
      return;
    }

    // Space or Enter to create chip from structured query
    if ((e.key === ' ' || e.key === 'Enter') && inputValue.includes(':')) {
      e.preventDefault();
      tryCreateChip(inputValue.trim());
    }
  };

  const tryCreateChip = (value: string) => {
    const colonIndex = value.indexOf(':');
    if (colonIndex === -1) return;

    const fieldName = value.substring(0, colonIndex).toLowerCase();
    const fieldValue = value.substring(colonIndex + 1).trim();

    if (!fieldValue) return;

    let chip: QueryChip | null = null;

    if (fieldName === 'board') {
      const board = boards.find(b => b.name.toLowerCase() === fieldValue.toLowerCase());
      if (board) {
        // Remove existing board chip
        setChips(chips.filter(c => c.type !== 'board'));
        chip = { type: 'board', value: board.id, displayValue: board.name };
      }
    } else if (fieldName === 'tag') {
      chip = { type: 'tag', value: fieldValue };
    } else if (fieldName === 'status') {
      const status = STATUS_OPTIONS.find(s => s.label.toLowerCase() === fieldValue.toLowerCase());
      if (status) {
        chip = { type: 'status', value: status.value, displayValue: status.label };
      }
    }

    if (chip) {
      setChips([...chips, chip]);
      setInputValue('');
      setSuggestions([]);
      setIsSuggestionsOpen(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    if (suggestion.endsWith(':')) {
      // Field suggestion - replace input
      setInputValue(suggestion);
    } else {
      // Value suggestion - create chip
      tryCreateChip(suggestion);
    }
    setIsSuggestionsOpen(false);
  };

  const removeChip = (index: number) => {
    setChips(chips.filter((_, i) => i !== index));
  };

  const handleSelectTask = (task: Task) => {
    onTaskSelect(task);
    setIsResultsOpen(false);
    inputRef.current?.blur();
  };

  const getBoardName = (boardId: string) => {
    return boards.find(b => b.id === boardId)?.name || 'Unknown';
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

  const getChipColor = (type: QueryChip['type']) => {
    const colors = {
      board: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      tag: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      status: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return colors[type];
  };

  const getChipLabel = (chip: QueryChip) => {
    const labels = {
      board: 'Board',
      tag: 'Tag',
      status: 'Status',
    };
    return `${labels[chip.type]}: ${chip.displayValue || chip.value}`;
  };

  return (
    <div className="relative w-full max-w-2xl" ref={containerRef}>
      {/* Search Input with Chips */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {/* Search Icon */}
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {/* Chips */}
        <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
          {chips.map((chip, index) => (
            <div
              key={index}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getChipColor(chip.type)}`}
            >
              <span>{getChipLabel(chip)}</span>
              {chip.type !== 'board' || chips.filter(c => c.type === 'board').length > 1 && (
                <button
                  onClick={() => removeChip(index)}
                  className="hover:opacity-70"
                  type="button"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={() => {
              setIsFocused(true);
              // Re-open results if we have search content
              const freeTextQuery = inputValue.trim();
              const hasUserAddedFilters = chips.some(c => c.type === 'tag' || c.type === 'status');
              const hasTextQuery = freeTextQuery.length >= 2;
              const shouldShowResults = hasTextQuery || hasUserAddedFilters;

              if (shouldShowResults) {
                // If we have results, show them; otherwise trigger search
                if (results.length > 0) {
                  setIsResultsOpen(true);
                } else {
                  performSearch();
                }
              }
            }}
            onBlur={(e) => {
              // Don't blur if clicking within the container (results/suggestions)
              if (!containerRef.current?.contains(e.relatedTarget as Node)) {
                setIsFocused(false);
              }
            }}
            placeholder={chips.length === 0 ? "Search tasks... (⌘K)" : ""}
            className="flex-1 min-w-[120px] bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex-shrink-0">
            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isFocused && isSuggestionsOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => applySuggestion(suggestion)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                index === selectedSuggestionIndex
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Results Dropdown */}
      {isFocused && isResultsOpen && !isSuggestionsOpen && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          {results.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>No tasks found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleSelectTask(task)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
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
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getBoardName(task.boardId)}
                        </span>
                        {task.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
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
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(task.status)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
