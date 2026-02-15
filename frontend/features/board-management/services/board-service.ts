import { boardRepository } from './board-repository';
import { ValidationError } from '../../../core/errors/app-error';
import type { Board, CreateBoardRequest, UpdateBoardRequest } from '../types/board.types';

const MAX_BOARD_NAME_LENGTH = 100;

/**
 * Service for board business logic
 * Handles validation and business rules
 */
export class BoardService {
  /**
   * Gets all boards
   */
  async getAllBoards(): Promise<Board[]> {
    return boardRepository.getAll();
  }

  /**
   * Gets a board by ID
   */
  async getBoardById(id: string): Promise<Board> {
    return boardRepository.getById(id);
  }

  /**
   * Creates a new board with validation
   */
  async createBoard(data: CreateBoardRequest): Promise<Board> {
    this.validateBoardData(data);
    return boardRepository.create(data);
  }

  /**
   * Updates a board with validation
   */
  async updateBoard(id: string, updates: UpdateBoardRequest): Promise<Board> {
    if (updates.name !== undefined) {
      this.validateBoardName(updates.name);
    }
    return boardRepository.update(id, updates);
  }

  /**
   * Deletes a board
   */
  async deleteBoard(id: string): Promise<void> {
    return boardRepository.delete(id);
  }

  /**
   * Filters boards by search query (client-side)
   */
  filterBoards(boards: Board[], query: string): Board[] {
    if (!query.trim()) return boards;
    const lowerQuery = query.toLowerCase();
    return boards.filter(
      board =>
        board.name.toLowerCase().includes(lowerQuery) ||
        board.description?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Validates board creation/update data
   */
  private validateBoardData(data: CreateBoardRequest): void {
    this.validateBoardName(data.name);
  }

  /**
   * Validates board name
   */
  private validateBoardName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Board name is required', 'name');
    }
    if (name.length > MAX_BOARD_NAME_LENGTH) {
      throw new ValidationError(
        `Board name must be less than ${MAX_BOARD_NAME_LENGTH} characters`,
        'name'
      );
    }
  }
}

export const boardService = new BoardService();
