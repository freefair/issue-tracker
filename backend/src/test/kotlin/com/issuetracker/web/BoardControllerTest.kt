package com.issuetracker.web

import com.issuetracker.dto.BoardResponse
import com.issuetracker.dto.CreateBoardRequest
import com.issuetracker.dto.UpdateBoardRequest
import com.issuetracker.exception.BoardNotFoundException
import com.issuetracker.service.BoardService
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.Mockito.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.reactive.server.WebTestClient
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.Instant
import java.util.UUID

@WebFluxTest(BoardController::class)
@ActiveProfiles("test")
class BoardControllerTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @MockBean
    private lateinit var boardService: BoardService

    @Test
    fun `should return all boards`() {
        // Given
        val board1 = BoardResponse(
            id = UUID.randomUUID(),
            name = "Board 1",
            description = "First board",
            createdAt = Instant.now()
        )
        val board2 = BoardResponse(
            id = UUID.randomUUID(),
            name = "Board 2",
            description = "Second board",
            createdAt = Instant.now()
        )

        given(boardService.getAllBoards()).willReturn(Flux.just(board1, board2))

        // When & Then
        webTestClient.get()
            .uri("/api/boards")
            .exchange()
            .expectStatus().isOk
            .expectBodyList(BoardResponse::class.java)
            .hasSize(2)
    }

    @Test
    fun `should return board by id`() {
        // Given
        val boardId = UUID.randomUUID()
        val board = BoardResponse(
            id = boardId,
            name = "Test Board",
            description = "Test description",
            createdAt = Instant.now()
        )

        given(boardService.getBoardById(boardId)).willReturn(Mono.just(board))

        // When & Then
        webTestClient.get()
            .uri("/api/boards/$boardId")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(boardId.toString())
            .jsonPath("$.name").isEqualTo("Test Board")
    }

    @Test
    fun `should return 404 when board not found`() {
        // Given
        val boardId = UUID.randomUUID()
        given(boardService.getBoardById(boardId))
            .willReturn(Mono.error(BoardNotFoundException(boardId)))

        // When & Then
        webTestClient.get()
            .uri("/api/boards/$boardId")
            .exchange()
            .expectStatus().isNotFound
    }

    @Test
    fun `should create board`() {
        // Given
        val request = CreateBoardRequest(name = "New Board", description = "Description")
        val createdBoard = BoardResponse(
            id = UUID.randomUUID(),
            name = "New Board",
            description = "Description",
            createdAt = Instant.now()
        )

        given(boardService.createBoard(request)).willReturn(Mono.just(createdBoard))

        // When & Then
        webTestClient.post()
            .uri("/api/boards")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isCreated
            .expectBody()
            .jsonPath("$.name").isEqualTo("New Board")
    }

    @Test
    fun `should reject invalid board creation`() {
        // Given - empty name
        val invalidRequest = mapOf("name" to "", "description" to "Test")

        // When & Then
        webTestClient.post()
            .uri("/api/boards")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(invalidRequest)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should update board`() {
        // Given
        val boardId = UUID.randomUUID()
        val request = UpdateBoardRequest(name = "Updated Board", description = "Updated")
        val updatedBoard = BoardResponse(
            id = boardId,
            name = "Updated Board",
            description = "Updated",
            createdAt = Instant.now()
        )

        given(boardService.updateBoard(boardId, request)).willReturn(Mono.just(updatedBoard))

        // When & Then
        webTestClient.put()
            .uri("/api/boards/$boardId")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.name").isEqualTo("Updated Board")
    }

    @Test
    fun `should delete board`() {
        // Given
        val boardId = UUID.randomUUID()
        given(boardService.deleteBoard(boardId)).willReturn(Mono.empty())

        // When & Then
        webTestClient.delete()
            .uri("/api/boards/$boardId")
            .exchange()
            .expectStatus().isNoContent

        verify(boardService).deleteBoard(boardId)
    }
}
