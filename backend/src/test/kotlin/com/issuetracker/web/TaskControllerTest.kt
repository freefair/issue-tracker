package com.issuetracker.web

import com.issuetracker.domain.Task
import com.issuetracker.domain.TaskStatus
import com.issuetracker.repository.TaskRepository
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

@WebFluxTest(TaskController::class)
@ActiveProfiles("test")
class TaskControllerTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @MockBean
    private lateinit var taskRepository: TaskRepository

    @Test
    fun `should return tasks for a board`() {
        // Given
        val boardId = UUID.randomUUID()
        val task1 = Task(
            id = UUID.randomUUID(),
            boardId = boardId,
            title = "Task 1",
            description = "First task",
            status = TaskStatus.TODO,
            position = 1,
            tags = "backend",
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        val task2 = Task(
            id = UUID.randomUUID(),
            boardId = boardId,
            title = "Task 2",
            description = "Second task",
            status = TaskStatus.IN_PROGRESS,
            position = 2,
            tags = "frontend",
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        given(taskRepository.findByBoardIdOrderByPositionAsc(boardId))
            .willReturn(Flux.just(task1, task2))

        // When & Then
        webTestClient.get()
            .uri("/api/boards/$boardId/tasks")
            .exchange()
            .expectStatus().isOk
            .expectBodyList(Task::class.java)
            .hasSize(2)
            .contains(task1, task2)
    }

    @Test
    fun `should return empty list when board has no tasks`() {
        // Given
        val boardId = UUID.randomUUID()
        given(taskRepository.findByBoardIdOrderByPositionAsc(boardId))
            .willReturn(Flux.empty())

        // When & Then
        webTestClient.get()
            .uri("/api/boards/$boardId/tasks")
            .exchange()
            .expectStatus().isOk
            .expectBodyList(Task::class.java)
            .hasSize(0)
    }
}
