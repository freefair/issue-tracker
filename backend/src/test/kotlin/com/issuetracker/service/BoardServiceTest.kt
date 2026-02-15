package com.issuetracker.service

import com.issuetracker.domain.Board
import com.issuetracker.dto.CreateBoardRequest
import com.issuetracker.dto.UpdateBoardRequest
import com.issuetracker.exception.BoardNotFoundException
import com.issuetracker.repository.BoardRepository
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.Instant
import java.util.UUID

class BoardServiceTest {

    private val boardRepository: BoardRepository = mock()
    private val boardService = BoardService(boardRepository)

    @Test
    fun `should get all boards`() = runTest {
        // Given
        val board1 = Board(id = UUID.randomUUID(), name = "Board 1", createdAt = Instant.now())
        val board2 = Board(id = UUID.randomUUID(), name = "Board 2", createdAt = Instant.now())
        whenever(boardRepository.findAll()).thenReturn(flowOf(board1, board2))

        // When
        val result = boardService.getAllBoards().toList()

        // Then
        assert(result.size == 2)
        assert(result[0].name == "Board 1")
        assert(result[1].name == "Board 2")
    }

    @Test
    fun `should get board by id`() = runTest {
        // Given
        val boardId = UUID.randomUUID()
        val board = Board(id = boardId, name = "Test Board", createdAt = Instant.now())
        whenever(boardRepository.findById(boardId)).thenReturn(board)

        // When
        val result = boardService.getBoardById(boardId)

        // Then
        assert(result.id == boardId)
        assert(result.name == "Test Board")
    }

    @Test
    fun `should throw exception when board not found`() = runTest {
        // Given
        val boardId = UUID.randomUUID()
        whenever(boardRepository.findById(boardId)).thenReturn(null)

        // When & Then
        assertThrows<BoardNotFoundException> {
            boardService.getBoardById(boardId)
        }
    }

    @Test
    fun `should create board`() = runTest {
        // Given
        val request = CreateBoardRequest(name = "New Board", description = "Description")
        val savedBoard = Board(
            id = UUID.randomUUID(),
            name = "New Board",
            description = "Description",
            createdAt = Instant.now()
        )
        whenever(boardRepository.save(any())).thenReturn(savedBoard)

        // When
        val result = boardService.createBoard(request)

        // Then
        assert(result.name == "New Board")
        assert(result.description == "Description")
        verify(boardRepository).save(any())
    }

    @Test
    fun `should update board`() = runTest {
        // Given
        val boardId = UUID.randomUUID()
        val existingBoard = Board(id = boardId, name = "Old Name", createdAt = Instant.now())
        val request = UpdateBoardRequest(name = "New Name", description = "Updated")
        val updatedBoard = existingBoard.copy(name = "New Name", description = "Updated")

        whenever(boardRepository.findById(boardId)).thenReturn(existingBoard)
        whenever(boardRepository.save(any())).thenReturn(updatedBoard)

        // When
        val result = boardService.updateBoard(boardId, request)

        // Then
        assert(result.id == boardId)
        assert(result.name == "New Name")
        assert(result.description == "Updated")
    }

    @Test
    fun `should throw exception when updating non-existent board`() = runTest {
        // Given
        val boardId = UUID.randomUUID()
        val request = UpdateBoardRequest(name = "New Name")
        whenever(boardRepository.findById(boardId)).thenReturn(null)

        // When & Then
        assertThrows<BoardNotFoundException> {
            boardService.updateBoard(boardId, request)
        }
    }

    @Test
    fun `should delete board`() = runTest {
        // Given
        val boardId = UUID.randomUUID()
        val board = Board(id = boardId, name = "Board to Delete", createdAt = Instant.now())
        whenever(boardRepository.findById(boardId)).thenReturn(board)
        whenever(boardRepository.delete(board)).thenReturn(Unit)

        // When
        boardService.deleteBoard(boardId)

        // Then
        verify(boardRepository).findById(boardId)
        verify(boardRepository).delete(board)
    }

    @Test
    fun `should throw exception when deleting non-existent board`() = runTest {
        // Given
        val boardId = UUID.randomUUID()
        whenever(boardRepository.findById(boardId)).thenReturn(null)

        // When & Then
        assertThrows<BoardNotFoundException> {
            boardService.deleteBoard(boardId)
        }
    }
}
