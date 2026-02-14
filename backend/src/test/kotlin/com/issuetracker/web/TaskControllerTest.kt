package com.issuetracker.web

import com.issuetracker.domain.TaskStatus
import com.issuetracker.dto.CreateTaskRequest
import com.issuetracker.dto.MoveTaskRequest
import com.issuetracker.dto.TaskResponse
import com.issuetracker.dto.UpdateTaskRequest
import com.issuetracker.exception.TaskNotFoundException
import com.issuetracker.service.TaskService
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
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

@WebFluxTest(TaskController::class)
@ActiveProfiles("test")
class TaskControllerTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @MockBean
    private lateinit var taskService: TaskService

    @Test
    fun `should return tasks for a board`() {
        // Given
        val boardId = UUID.randomUUID()
        val task1 = TaskResponse(
            id = UUID.randomUUID(),
            boardId = boardId,
            title = "Task 1",
            description = "First task",
            status = TaskStatus.TODO,
            position = 1,
            tags = listOf("backend"),
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        given(taskService.getTasksByBoard(boardId)).willReturn(Flux.just(task1))

        // When & Then
        webTestClient.get()
            .uri("/api/boards/$boardId/tasks")
            .exchange()
            .expectStatus().isOk
            .expectBodyList(TaskResponse::class.java)
            .hasSize(1)
    }

    @Test
    fun `should return tasks filtered by status`() {
        // Given
        val boardId = UUID.randomUUID()
        val task = TaskResponse(
            id = UUID.randomUUID(),
            boardId = boardId,
            title = "Todo Task",
            description = "Task",
            status = TaskStatus.TODO,
            position = 1,
            tags = emptyList(),
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        given(taskService.getTasksByBoardAndStatus(boardId, TaskStatus.TODO))
            .willReturn(Flux.just(task))

        // When & Then
        webTestClient.get()
            .uri("/api/boards/$boardId/tasks?status=TODO")
            .exchange()
            .expectStatus().isOk
            .expectBodyList(TaskResponse::class.java)
            .hasSize(1)
    }

    @Test
    fun `should get task by id`() {
        // Given
        val taskId = UUID.randomUUID()
        val task = TaskResponse(
            id = taskId,
            boardId = UUID.randomUUID(),
            title = "Test Task",
            description = "Description",
            status = TaskStatus.TODO,
            position = 1,
            tags = emptyList(),
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        given(taskService.getTaskById(taskId)).willReturn(Mono.just(task))

        // When & Then
        webTestClient.get()
            .uri("/api/tasks/$taskId")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(taskId.toString())
            .jsonPath("$.title").isEqualTo("Test Task")
    }

    @Test
    fun `should return 404 when task not found`() {
        // Given
        val taskId = UUID.randomUUID()
        given(taskService.getTaskById(taskId))
            .willReturn(Mono.error(TaskNotFoundException(taskId)))

        // When & Then
        webTestClient.get()
            .uri("/api/tasks/$taskId")
            .exchange()
            .expectStatus().isNotFound
    }

    @Test
    fun `should create task`() {
        // Given
        val boardId = UUID.randomUUID()
        val request = CreateTaskRequest(
            title = "New Task",
            description = "Description",
            status = TaskStatus.TODO,
            position = 1,
            tags = listOf("test")
        )
        val createdTask = TaskResponse(
            id = UUID.randomUUID(),
            boardId = boardId,
            title = "New Task",
            description = "Description",
            status = TaskStatus.TODO,
            position = 1,
            tags = listOf("test"),
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        given(taskService.createTask(boardId, request)).willReturn(Mono.just(createdTask))

        // When & Then
        webTestClient.post()
            .uri("/api/boards/$boardId/tasks")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isCreated
            .expectBody()
            .jsonPath("$.title").isEqualTo("New Task")
    }

    @Test
    fun `should update task`() {
        // Given
        val taskId = UUID.randomUUID()
        val request = UpdateTaskRequest(
            title = "Updated Task",
            description = "Updated",
            status = TaskStatus.IN_PROGRESS,
            position = 2,
            tags = listOf("updated")
        )
        val updatedTask = TaskResponse(
            id = taskId,
            boardId = UUID.randomUUID(),
            title = "Updated Task",
            description = "Updated",
            status = TaskStatus.IN_PROGRESS,
            position = 2,
            tags = listOf("updated"),
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        given(taskService.updateTask(taskId, request)).willReturn(Mono.just(updatedTask))

        // When & Then
        webTestClient.put()
            .uri("/api/tasks/$taskId")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.title").isEqualTo("Updated Task")
    }

    @Test
    fun `should move task`() {
        // Given
        val taskId = UUID.randomUUID()
        val request = MoveTaskRequest(status = TaskStatus.DONE, position = 5)
        val movedTask = TaskResponse(
            id = taskId,
            boardId = UUID.randomUUID(),
            title = "Task",
            description = "",
            status = TaskStatus.DONE,
            position = 5,
            tags = emptyList(),
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        given(taskService.moveTask(taskId, request)).willReturn(Mono.just(movedTask))

        // When & Then
        webTestClient.patch()
            .uri("/api/tasks/$taskId/move")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.status").isEqualTo("DONE")
            .jsonPath("$.position").isEqualTo(5)
    }

    @Test
    fun `should delete task`() {
        // Given
        val taskId = UUID.randomUUID()
        given(taskService.deleteTask(taskId)).willReturn(Mono.empty())

        // When & Then
        webTestClient.delete()
            .uri("/api/tasks/$taskId")
            .exchange()
            .expectStatus().isNoContent
    }

    @Test
    fun `should search tasks`() {
        // Given
        val boardId = UUID.randomUUID()
        val task = TaskResponse(
            id = UUID.randomUUID(),
            boardId = boardId,
            title = "Authentication Task",
            description = "Implement auth",
            status = TaskStatus.TODO,
            position = 1,
            tags = listOf("backend", "security"),
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        given(taskService.searchTasks(boardId, "auth")).willReturn(Flux.just(task))

        // When & Then
        webTestClient.get()
            .uri("/api/tasks/search?boardId=$boardId&q=auth")
            .exchange()
            .expectStatus().isOk
            .expectBodyList(TaskResponse::class.java)
            .hasSize(1)
    }
}
