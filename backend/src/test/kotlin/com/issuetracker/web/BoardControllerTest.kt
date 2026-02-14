package com.issuetracker.web

import com.issuetracker.domain.Board
import com.issuetracker.repository.BoardRepository
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.reactive.server.WebTestClient
import reactor.core.publisher.Flux
import java.time.Instant
import java.util.UUID

@WebFluxTest(BoardController::class)
@ActiveProfiles("test")
class BoardControllerTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @MockBean
    private lateinit var boardRepository: BoardRepository

    @Test
    fun `should return all boards`() {
        // Given
        val board1 = Board(
            id = UUID.randomUUID(),
            name = "Board 1",
            description = "First board",
            createdAt = Instant.now()
        )
        val board2 = Board(
            id = UUID.randomUUID(),
            name = "Board 2",
            description = "Second board",
            createdAt = Instant.now()
        )

        given(boardRepository.findAll()).willReturn(Flux.just(board1, board2))

        // When & Then
        webTestClient.get()
            .uri("/api/boards")
            .exchange()
            .expectStatus().isOk
            .expectBodyList(Board::class.java)
            .hasSize(2)
            .contains(board1, board2)
    }

    @Test
    fun `should return empty list when no boards exist`() {
        // Given
        given(boardRepository.findAll()).willReturn(Flux.empty())

        // When & Then
        webTestClient.get()
            .uri("/api/boards")
            .exchange()
            .expectStatus().isOk
            .expectBodyList(Board::class.java)
            .hasSize(0)
    }
}
