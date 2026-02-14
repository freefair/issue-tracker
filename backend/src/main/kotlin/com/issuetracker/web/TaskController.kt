package com.issuetracker.web

import com.issuetracker.domain.TaskStatus
import com.issuetracker.dto.CreateTaskRequest
import com.issuetracker.dto.MoveTaskRequest
import com.issuetracker.dto.TaskResponse
import com.issuetracker.dto.UpdateTaskRequest
import com.issuetracker.service.TaskService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.util.UUID

@RestController
@RequestMapping("/api")
class TaskController(
    private val taskService: TaskService
) {

    @GetMapping("/boards/{boardId}/tasks")
    fun getTasksByBoard(
        @PathVariable boardId: UUID,
        @RequestParam(required = false) status: TaskStatus?
    ): Flux<TaskResponse> {
        return if (status != null) {
            taskService.getTasksByBoardAndStatus(boardId, status)
        } else {
            taskService.getTasksByBoard(boardId)
        }
    }

    @GetMapping("/tasks/{id}")
    fun getTaskById(@PathVariable id: UUID): Mono<TaskResponse> {
        return taskService.getTaskById(id)
    }

    @PostMapping("/boards/{boardId}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    fun createTask(
        @PathVariable boardId: UUID,
        @Valid @RequestBody request: CreateTaskRequest
    ): Mono<TaskResponse> {
        return taskService.createTask(boardId, request)
    }

    @PutMapping("/tasks/{id}")
    fun updateTask(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateTaskRequest
    ): Mono<TaskResponse> {
        return taskService.updateTask(id, request)
    }

    @PatchMapping("/tasks/{id}/move")
    fun moveTask(
        @PathVariable id: UUID,
        @Valid @RequestBody request: MoveTaskRequest
    ): Mono<TaskResponse> {
        return taskService.moveTask(id, request)
    }

    @DeleteMapping("/tasks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteTask(@PathVariable id: UUID): Mono<Void> {
        return taskService.deleteTask(id)
    }

    @GetMapping("/tasks/search")
    fun searchTasks(
        @RequestParam boardId: UUID,
        @RequestParam q: String
    ): Flux<TaskResponse> {
        return taskService.searchTasks(boardId, q)
    }
}
