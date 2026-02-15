import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { BoardProvider, useBoards } from '../hooks/use-boards';
import { boardService } from '../services/board-service';
import type { Board } from '../types/board.types';
import type { ReactNode } from 'react';

vi.mock('../services/board-service');

describe('useBoards', () => {
  const mockBoards: Board[] = [
    {
      id: '1',
      name: 'Board 1',
      description: 'First board',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Board 2',
      description: 'Second board',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <BoardProvider>{children}</BoardProvider>
  );

  describe('initial load', () => {
    it('should load boards on mount', async () => {
      vi.spyOn(boardService, 'getAllBoards').mockResolvedValue(mockBoards);

      const { result } = renderHook(() => useBoards(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.boards).toEqual(mockBoards);
      expect(result.current.currentBoard).toEqual(mockBoards[0]);
      expect(result.current.error).toBeNull();
    });

    it('should select initial board by ID if provided', async () => {
      vi.spyOn(boardService, 'getAllBoards').mockResolvedValue(mockBoards);

      const wrapperWithInitialBoard = ({ children }: { children: ReactNode }) => (
        <BoardProvider initialBoardId="2">{children}</BoardProvider>
      );

      const { result } = renderHook(() => useBoards(), {
        wrapper: wrapperWithInitialBoard,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentBoard?.id).toBe('2');
    });

    it('should handle load error', async () => {
      const error = new Error('Failed to load boards');
      vi.spyOn(boardService, 'getAllBoards').mockRejectedValue(error);

      const { result } = renderHook(() => useBoards(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.boards).toEqual([]);
    });

    it('should handle empty board list', async () => {
      vi.spyOn(boardService, 'getAllBoards').mockResolvedValue([]);

      const { result } = renderHook(() => useBoards(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.boards).toEqual([]);
      expect(result.current.currentBoard).toBeNull();
    });
  });

  describe('createBoard', () => {
    it('should create a board and set it as current', async () => {
      const newBoard: Board = {
        id: '3',
        name: 'New Board',
        description: 'New board description',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      };

      vi.spyOn(boardService, 'getAllBoards').mockResolvedValue(mockBoards);
      vi.spyOn(boardService, 'createBoard').mockResolvedValue(newBoard);

      const { result } = renderHook(() => useBoards(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createBoard({
          name: 'New Board',
          description: 'New board description',
        });
      });

      expect(result.current.boards).toHaveLength(3);
      expect(result.current.boards[2]).toEqual(newBoard);
      expect(result.current.currentBoard).toEqual(newBoard);
    });
  });

  describe('updateBoard', () => {
    it('should update a board', async () => {
      const updatedBoard = { ...mockBoards[0], name: 'Updated Board' };

      vi.spyOn(boardService, 'getAllBoards').mockResolvedValue(mockBoards);
      vi.spyOn(boardService, 'updateBoard').mockResolvedValue(updatedBoard);

      const { result } = renderHook(() => useBoards(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateBoard('1', { name: 'Updated Board' });
      });

      expect(result.current.boards[0].name).toBe('Updated Board');
    });

    it('should update current board if it is the one being updated', async () => {
      const updatedBoard = { ...mockBoards[0], name: 'Updated Board' };

      vi.spyOn(boardService, 'getAllBoards').mockResolvedValue(mockBoards);
      vi.spyOn(boardService, 'updateBoard').mockResolvedValue(updatedBoard);

      const { result } = renderHook(() => useBoards(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateBoard('1', { name: 'Updated Board' });
      });

      expect(result.current.currentBoard?.name).toBe('Updated Board');
    });
  });

  describe('deleteBoard', () => {
    it('should delete a board', async () => {
      vi.spyOn(boardService, 'getAllBoards').mockResolvedValue(mockBoards);
      vi.spyOn(boardService, 'deleteBoard').mockResolvedValue(undefined);

      const { result } = renderHook(() => useBoards(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteBoard('2');
      });

      expect(result.current.boards).toHaveLength(1);
      expect(result.current.boards.find(b => b.id === '2')).toBeUndefined();
    });

    it('should select first board if current board is deleted', async () => {
      vi.spyOn(boardService, 'getAllBoards').mockResolvedValue(mockBoards);
      vi.spyOn(boardService, 'deleteBoard').mockResolvedValue(undefined);

      const { result } = renderHook(() => useBoards(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Current board is mockBoards[0] with id '1'
      await act(async () => {
        await result.current.deleteBoard('1');
      });

      expect(result.current.currentBoard?.id).toBe('2');
    });
  });

  describe('selectBoard', () => {
    it('should select a board by ID', async () => {
      vi.spyOn(boardService, 'getAllBoards').mockResolvedValue(mockBoards);

      const { result } = renderHook(() => useBoards(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.selectBoard('2');
      });

      expect(result.current.currentBoard?.id).toBe('2');
    });

    it('should do nothing for non-existent board ID', async () => {
      vi.spyOn(boardService, 'getAllBoards').mockResolvedValue(mockBoards);

      const { result } = renderHook(() => useBoards(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const currentBefore = result.current.currentBoard;
      act(() => {
        result.current.selectBoard('999');
      });

      expect(result.current.currentBoard).toEqual(currentBefore);
    });
  });

  describe('reload', () => {
    it('should reload boards', async () => {
      const updatedBoards = [
        ...mockBoards,
        {
          id: '3',
          name: 'Board 3',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
        },
      ];

      vi.spyOn(boardService, 'getAllBoards')
        .mockResolvedValueOnce(mockBoards)
        .mockResolvedValueOnce(updatedBoards);

      const { result } = renderHook(() => useBoards(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.boards).toHaveLength(2);

      await act(async () => {
        await result.current.reload();
      });

      expect(result.current.boards).toHaveLength(3);
    });
  });

  describe('error handling', () => {
    it('should throw error if used outside BoardProvider', () => {
      expect(() => {
        renderHook(() => useBoards());
      }).toThrow('useBoards must be used within BoardProvider');
    });
  });
});
