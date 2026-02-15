package com.issuetracker.repository

import com.issuetracker.domain.Board
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import java.time.Instant

@SpringBootTest
@ActiveProfiles("test")
class BoardRepositoryTest {

    @Autowired
    private lateinit var boardRepository: BoardRepository

    @BeforeEach
    fun setUp() = runTest {
        // Clean up before each test
        boardRepository.deleteAll()
    }

    @Test
    fun `should save and retrieve board`() = runTest {
        // Given
        val board = Board(
            name = "Test Board",
            description = "A test board for unit testing",
            createdAt = Instant.now()
        )

        // When
        val savedBoard = boardRepository.save(board)

        // Then
        assert(savedBoard.id != null)
        assert(savedBoard.name == "Test Board")
        assert(savedBoard.description == "A test board for unit testing")
    }

    @Test
    fun `should find all boards`() = runTest {
        // Given
        val board1 = Board(name = "Board 1", description = "First board")
        val board2 = Board(name = "Board 2", description = "Second board")

        boardRepository.save(board1)
        boardRepository.save(board2)

        // When
        val allBoards = boardRepository.findAll().toList()

        // Then
        assert(allBoards.size == 2)
    }

    @Test
    fun `should delete board by id`() = runTest {
        // Given
        val board = Board(name = "Board to Delete", description = "Will be deleted")
        val savedBoard = boardRepository.save(board)

        // When
        boardRepository.deleteById(savedBoard.id!!)

        // Then
        val foundBoard = boardRepository.findById(savedBoard.id!!)
        assert(foundBoard == null)
    }

    @Test
    fun `should update board`() = runTest {
        // Given
        val board = Board(name = "Original Name", description = "Original description")
        val savedBoard = boardRepository.save(board)

        // When
        val updatedBoard = savedBoard.copy(
            name = "Updated Name",
            description = "Updated description"
        )
        val result = boardRepository.save(updatedBoard)

        // Then
        assert(result.id == savedBoard.id)
        assert(result.name == "Updated Name")
        assert(result.description == "Updated description")
    }

    @Test
    fun `should count boards`() = runTest {
        // Given
        boardRepository.save(Board(name = "Board 1"))
        boardRepository.save(Board(name = "Board 2"))
        boardRepository.save(Board(name = "Board 3"))

        // When
        val count = boardRepository.count()

        // Then
        assert(count == 3L)
    }
}
