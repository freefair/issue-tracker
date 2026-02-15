import { describe, it, expect, vi, beforeEach } from 'vitest';
import { boardService } from '../services/board-service';
import { boardRepository } from '../services/board-repository';
import { ValidationError } from '../../../core/errors/app-error';
import type { Board } from '../types/board.types';

vi.mock('../services/board-repository');

describe('BoardService', () => {
  const mockBoard: Board = {
    id: '1',
    name: 'Test Board',
    description: 'Test Description',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllBoards', () => {
    it('should fetch all boards from repository', async () => {
      const mockBoards = [mockBoard];
      vi.spyOn(boardRepository, 'getAll').mockResolvedValue(mockBoards);

      const result = await boardService.getAllBoards();

      expect(result).toEqual(mockBoards);
      expect(boardRepository.getAll).toHaveBeenCalledOnce();
    });
  });

  describe('getBoardById', () => {
    it('should fetch a single board by ID', async () => {
      vi.spyOn(boardRepository, 'getById').mockResolvedValue(mockBoard);

      const result = await boardService.getBoardById('1');

      expect(result).toEqual(mockBoard);
      expect(boardRepository.getById).toHaveBeenCalledWith('1');
    });
  });

  describe('createBoard', () => {
    it('should create a board with valid data', async () => {
      const createRequest = { name: 'New Board', description: 'New Description' };
      vi.spyOn(boardRepository, 'create').mockResolvedValue(mockBoard);

      const result = await boardService.createBoard(createRequest);

      expect(result).toEqual(mockBoard);
      expect(boardRepository.create).toHaveBeenCalledWith(createRequest);
    });

    it('should throw ValidationError for empty name', async () => {
      const createRequest = { name: '' };

      await expect(boardService.createBoard(createRequest)).rejects.toThrow(ValidationError);
      await expect(boardService.createBoard(createRequest)).rejects.toThrow(
        'Board name is required'
      );
    });

    it('should throw ValidationError for whitespace-only name', async () => {
      const createRequest = { name: '   ' };

      await expect(boardService.createBoard(createRequest)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for name exceeding max length', async () => {
      const createRequest = { name: 'a'.repeat(101) };

      await expect(boardService.createBoard(createRequest)).rejects.toThrow(ValidationError);
      await expect(boardService.createBoard(createRequest)).rejects.toThrow(
        'Board name must be less than 100 characters'
      );
    });

    it('should accept name at exactly max length', async () => {
      const createRequest = { name: 'a'.repeat(100) };
      vi.spyOn(boardRepository, 'create').mockResolvedValue(mockBoard);

      await expect(boardService.createBoard(createRequest)).resolves.toBeDefined();
    });
  });

  describe('updateBoard', () => {
    it('should update a board with valid data', async () => {
      const updates = { name: 'Updated Board' };
      vi.spyOn(boardRepository, 'update').mockResolvedValue({ ...mockBoard, ...updates });

      const result = await boardService.updateBoard('1', updates);

      expect(result.name).toBe('Updated Board');
      expect(boardRepository.update).toHaveBeenCalledWith('1', updates);
    });

    it('should validate name if provided in updates', async () => {
      const updates = { name: '' };

      await expect(boardService.updateBoard('1', updates)).rejects.toThrow(ValidationError);
    });

    it('should allow updates without name validation if name not provided', async () => {
      const updates = { description: 'New description' };
      vi.spyOn(boardRepository, 'update').mockResolvedValue({
        ...mockBoard,
        ...updates,
      });

      await expect(boardService.updateBoard('1', updates)).resolves.toBeDefined();
    });
  });

  describe('deleteBoard', () => {
    it('should delete a board', async () => {
      vi.spyOn(boardRepository, 'delete').mockResolvedValue(undefined);

      await boardService.deleteBoard('1');

      expect(boardRepository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('filterBoards', () => {
    const boards: Board[] = [
      { ...mockBoard, id: '1', name: 'Project Alpha', description: 'First project' },
      { ...mockBoard, id: '2', name: 'Project Beta', description: 'Second project' },
      { ...mockBoard, id: '3', name: 'Testing Board', description: 'For testing' },
    ];

    it('should return all boards for empty query', () => {
      const result = boardService.filterBoards(boards, '');
      expect(result).toEqual(boards);
    });

    it('should return all boards for whitespace query', () => {
      const result = boardService.filterBoards(boards, '   ');
      expect(result).toEqual(boards);
    });

    it('should filter by board name (case insensitive)', () => {
      const result = boardService.filterBoards(boards, 'alpha');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Project Alpha');
    });

    it('should filter by description (case insensitive)', () => {
      const result = boardService.filterBoards(boards, 'testing');
      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('For testing');
    });

    it('should return multiple matches', () => {
      const result = boardService.filterBoards(boards, 'project');
      expect(result).toHaveLength(2);
    });

    it('should return empty array for no matches', () => {
      const result = boardService.filterBoards(boards, 'nonexistent');
      expect(result).toHaveLength(0);
    });
  });
});
