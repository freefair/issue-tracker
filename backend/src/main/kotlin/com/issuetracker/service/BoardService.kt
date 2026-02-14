package com.issuetracker.service

import com.issuetracker.domain.Board
import com.issuetracker.dto.BoardResponse
import com.issuetracker.dto.CreateBoardRequest
import com.issuetracker.dto.UpdateBoardRequest
import com.issuetracker.exception.BoardNotFoundException
import com.issuetracker.repository.BoardRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.Instant
import java.util.UUID

@Service
class BoardService(
    private val boardRepository: BoardRepository
) {
    private val logger = LoggerFactory.getLogger(BoardService::class.java)

    fun getAllBoards(): Flux<BoardResponse> {
        logger.debug("Fetching all boards")
        return boardRepository.findAll()
            .map { BoardResponse.from(it) }
    }

    fun getBoardById(id: UUID): Mono<BoardResponse> {
        logger.debug("Fetching board with id: {}", id)
        return boardRepository.findById(id)
            .map { BoardResponse.from(it) }
            .switchIfEmpty(Mono.error(BoardNotFoundException(id)))
    }

    fun createBoard(request: CreateBoardRequest): Mono<BoardResponse> {
        logger.info("Creating new board: {}", request.name)

        val board = Board(
            name = request.name,
            description = request.description,
            createdAt = Instant.now()
        )

        return boardRepository.save(board)
            .map { BoardResponse.from(it) }
            .doOnSuccess { logger.info("Board created with id: {}", it.id) }
    }

    fun updateBoard(id: UUID, request: UpdateBoardRequest): Mono<BoardResponse> {
        logger.info("Updating board with id: {}", id)

        return boardRepository.findById(id)
            .switchIfEmpty(Mono.error(BoardNotFoundException(id)))
            .flatMap { existingBoard ->
                val updatedBoard = existingBoard.copy(
                    name = request.name,
                    description = request.description
                )
                boardRepository.save(updatedBoard)
            }
            .map { BoardResponse.from(it) }
            .doOnSuccess { logger.info("Board updated: {}", it.id) }
    }

    fun deleteBoard(id: UUID): Mono<Void> {
        logger.info("Deleting board with id: {}", id)

        return boardRepository.findById(id)
            .switchIfEmpty(Mono.error(BoardNotFoundException(id)))
            .flatMap { boardRepository.delete(it) }
            .doOnSuccess { logger.info("Board deleted: {}", id) }
    }
}
