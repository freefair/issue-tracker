import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { boardService } from '../services/board-service';
import { logger } from '../../../shared/utils/logger';
import type { Board, CreateBoardRequest, UpdateBoardRequest } from '../types/board.types';

interface BoardContextValue {
  boards: Board[];
  currentBoard: Board | null;
  isLoading: boolean;
  error: Error | null;
  createBoard: (board: CreateBoardRequest) => Promise<void>;
  updateBoard: (id: string, updates: UpdateBoardRequest) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  selectBoard: (id: string) => void;
  reload: () => Promise<void>;
}

const BoardContext = createContext<BoardContextValue | undefined>(undefined);

interface BoardProviderProps {
  children: ReactNode;
  initialBoardId?: string;
}

/**
 * Board state provider
 * Manages board state globally
 */
export function BoardProvider({ children, initialBoardId }: BoardProviderProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBoards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedBoards = await boardService.getAllBoards();
      setBoards(loadedBoards);

      // Select board
      if (initialBoardId) {
        const board = loadedBoards.find(b => b.id === initialBoardId);
        setCurrentBoard(board || null);
      } else if (loadedBoards.length > 0) {
        setCurrentBoard(loadedBoards[0]);
      }
    } catch (err) {
      logger.error(err as Error, { context: 'loadBoards' });
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [initialBoardId]);

  useEffect(() => {
    void loadBoards();
  }, [loadBoards]);

  const createBoard = useCallback(async (data: CreateBoardRequest) => {
    const board = await boardService.createBoard(data);
    setBoards(prev => [...prev, board]);
    setCurrentBoard(board);
  }, []);

  const updateBoard = useCallback(
    async (id: string, updates: UpdateBoardRequest) => {
      const updated = await boardService.updateBoard(id, updates);
      setBoards(prev => prev.map(b => (b.id === id ? updated : b)));
      if (currentBoard?.id === id) {
        setCurrentBoard(updated);
      }
    },
    [currentBoard]
  );

  const deleteBoard = useCallback(
    async (id: string) => {
      await boardService.deleteBoard(id);
      const updatedBoards = boards.filter(b => b.id !== id);
      setBoards(updatedBoards);
      if (currentBoard?.id === id) {
        setCurrentBoard(updatedBoards[0] || null);
      }
    },
    [currentBoard, boards]
  );

  const selectBoard = useCallback(
    (id: string) => {
      const board = boards.find(b => b.id === id);
      if (board) {
        setCurrentBoard(board);
      }
    },
    [boards]
  );

  const value: BoardContextValue = {
    boards,
    currentBoard,
    isLoading,
    error,
    createBoard,
    updateBoard,
    deleteBoard,
    selectBoard,
    reload: loadBoards,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

/**
 * Hook to access board context
 */
export function useBoards(): BoardContextValue {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoards must be used within BoardProvider');
  }
  return context;
}
