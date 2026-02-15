package com.issuetracker.web

import com.issuetracker.domain.TaskStatus
import com.issuetracker.dto.CreateTaskRequest
import com.issuetracker.dto.MoveTaskRequest
import com.issuetracker.dto.TaskResponse
import com.issuetracker.dto.UpdateTaskRequest
import com.issuetracker.service.TaskService
import jakarta.validation.Valid
import kotlinx.coroutines.flow.Flow
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
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
    ): Flow<TaskResponse> {
        return if (status != null) {
            taskService.getTasksByBoardAndStatus(boardId, status)
        } else {
            taskService.getTasksByBoard(boardId)
        }
    }

    @GetMapping("/tasks/{id}")
    suspend fun getTaskById(@PathVariable id: UUID): TaskResponse {
        return taskService.getTaskById(id)
    }

    @PostMapping("/boards/{boardId}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    suspend fun createTask(
        @PathVariable boardId: UUID,
        @Valid @RequestBody request: CreateTaskRequest
    ): TaskResponse {
        return taskService.createTask(boardId, request)
    }

    @PutMapping("/tasks/{id}")
    suspend fun updateTask(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateTaskRequest
    ): TaskResponse {
        return taskService.updateTask(id, request)
    }

    @PatchMapping("/tasks/{id}/move")
    suspend fun moveTask(
        @PathVariable id: UUID,
        @Valid @RequestBody request: MoveTaskRequest
    ): TaskResponse {
        return taskService.moveTask(id, request)
    }

    @DeleteMapping("/tasks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    suspend fun deleteTask(@PathVariable id: UUID) {
        taskService.deleteTask(id)
    }

    @GetMapping("/tasks/search")
    fun searchTasks(
        @RequestParam boardId: UUID,
        @RequestParam q: String
    ): Flow<TaskResponse> {
        return taskService.searchTasks(boardId, q)
    }
}
