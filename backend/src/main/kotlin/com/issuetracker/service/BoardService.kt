package com.issuetracker.service

import com.issuetracker.domain.Board
import com.issuetracker.dto.BoardResponse
import com.issuetracker.dto.CreateBoardRequest
import com.issuetracker.dto.UpdateBoardRequest
import com.issuetracker.exception.BoardNotFoundException
import com.issuetracker.repository.BoardRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class BoardService(
    private val boardRepository: BoardRepository
) {
    private val logger = LoggerFactory.getLogger(BoardService::class.java)

    fun getAllBoards(): Flow<BoardResponse> {
        logger.debug("Fetching all boards")
        return boardRepository.findAll()
            .map { BoardResponse.from(it) }
    }

    suspend fun getBoardById(id: UUID): BoardResponse {
        logger.debug("Fetching board with id: {}", id)
        val board = boardRepository.findById(id)
            ?: throw BoardNotFoundException(id)
        return BoardResponse.from(board)
    }

    suspend fun createBoard(request: CreateBoardRequest): BoardResponse {
        logger.info("Creating new board: {}", request.name)

        val board = Board(
            id = UUID.randomUUID(),
            name = request.name,
            description = request.description,
            createdAt = Instant.now()
        )

        val savedBoard = boardRepository.save(board)
        logger.info("Board created with id: {}", savedBoard.id)
        return BoardResponse.from(savedBoard)
    }

    suspend fun updateBoard(id: UUID, request: UpdateBoardRequest): BoardResponse {
        logger.info("Updating board with id: {}", id)

        val existingBoard = boardRepository.findById(id)
            ?: throw BoardNotFoundException(id)

        val updatedBoard = existingBoard.copy(
            name = request.name,
            description = request.description
        )

        val savedBoard = boardRepository.save(updatedBoard)
        logger.info("Board updated: {}", savedBoard.id)
        return BoardResponse.from(savedBoard)
    }

    suspend fun deleteBoard(id: UUID) {
        logger.info("Deleting board with id: {}", id)

        val board = boardRepository.findById(id)
            ?: throw BoardNotFoundException(id)

        boardRepository.delete(board)
        logger.info("Board deleted: {}", id)
    }
}
