package com.issuetracker.repository

import com.issuetracker.domain.Board
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.data.r2dbc.DataR2dbcTest
import org.springframework.test.context.ActiveProfiles
import reactor.test.StepVerifier
import java.time.Instant

@DataR2dbcTest
@ActiveProfiles("test")
class BoardRepositoryTest {

    @Autowired
    private lateinit var boardRepository: BoardRepository

    @BeforeEach
    fun setUp() {
        // Clean up before each test
        boardRepository.deleteAll().block()
    }

    @Test
    fun `should save and retrieve board`() {
        // Given
        val board = Board(
            name = "Test Board",
            description = "A test board for unit testing",
            createdAt = Instant.now()
        )

        // When
        val savedBoard = boardRepository.save(board)

        // Then
        StepVerifier.create(savedBoard)
            .expectNextMatches { saved ->
                saved.id != null &&
                saved.name == "Test Board" &&
                saved.description == "A test board for unit testing"
            }
            .verifyComplete()
    }

    @Test
    fun `should find all boards`() {
        // Given
        val board1 = Board(name = "Board 1", description = "First board")
        val board2 = Board(name = "Board 2", description = "Second board")

        boardRepository.save(board1).block()
        boardRepository.save(board2).block()

        // When
        val allBoards = boardRepository.findAll()

        // Then
        StepVerifier.create(allBoards)
            .expectNextCount(2)
            .verifyComplete()
    }

    @Test
    fun `should delete board by id`() {
        // Given
        val board = Board(name = "Board to Delete", description = "Will be deleted")
        val savedBoard = boardRepository.save(board).block()!!

        // When
        val deleted = boardRepository.deleteById(savedBoard.id!!)

        // Then
        StepVerifier.create(deleted)
            .verifyComplete()

        // Verify it's actually deleted
        StepVerifier.create(boardRepository.findById(savedBoard.id!!))
            .expectNextCount(0)
            .verifyComplete()
    }

    @Test
    fun `should update board`() {
        // Given
        val board = Board(name = "Original Name", description = "Original description")
        val savedBoard = boardRepository.save(board).block()!!

        // When
        val updatedBoard = savedBoard.copy(
            name = "Updated Name",
            description = "Updated description"
        )
        val result = boardRepository.save(updatedBoard)

        // Then
        StepVerifier.create(result)
            .expectNextMatches { updated ->
                updated.id == savedBoard.id &&
                updated.name == "Updated Name" &&
                updated.description == "Updated description"
            }
            .verifyComplete()
    }

    @Test
    fun `should count boards`() {
        // Given
        boardRepository.save(Board(name = "Board 1")).block()
        boardRepository.save(Board(name = "Board 2")).block()
        boardRepository.save(Board(name = "Board 3")).block()

        // When
        val count = boardRepository.count()

        // Then
        StepVerifier.create(count)
            .expectNext(3L)
            .verifyComplete()
    }
}
