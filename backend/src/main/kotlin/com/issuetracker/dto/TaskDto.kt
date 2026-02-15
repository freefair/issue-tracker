package com.issuetracker.dto

import com.issuetracker.domain.Task
import com.issuetracker.domain.TaskStatus
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class CreateTaskRequest(
    @field:NotBlank(message = "Task title is required")
    @field:Size(min = 1, max = 500, message = "Title must be between 1 and 500 characters")
    val title: String,

    @field:Size(max = 10000, message = "Description must not exceed 10000 characters")
    val description: String = "",

    @field:NotNull(message = "Status is required")
    val status: TaskStatus,

    @field:NotNull(message = "Position is required")
    @field:Min(value = 0, message = "Position must be non-negative")
    val position: Int,

    val tags: List<String> = emptyList(),

    val backlogCategoryId: UUID? = null
)

data class UpdateTaskRequest(
    @field:Size(min = 1, max = 500, message = "Title must be between 1 and 500 characters")
    val title: String? = null,

    @field:Size(max = 10000, message = "Description must not exceed 10000 characters")
    val description: String? = null,

    val status: TaskStatus? = null,

    @field:Min(value = 0, message = "Position must be non-negative")
    val position: Int? = null,

    val tags: List<String>? = null,

    val backlogCategoryId: UUID? = null
)

data class MoveTaskRequest(
    @field:NotNull(message = "Status is required")
    val status: TaskStatus,

    @field:NotNull(message = "Position is required")
    @field:Min(value = 0, message = "Position must be non-negative")
    val position: Int
)

data class TaskResponse(
    val id: UUID,
    val boardId: UUID,
    val title: String,
    val description: String,
    val status: TaskStatus,
    val position: Int,
    val tags: List<String>,
    val backlogCategoryId: UUID?,
    val createdAt: Instant,
    val updatedAt: Instant
) {
    companion object {
        fun from(task: Task): TaskResponse {
            return TaskResponse(
                id = task.id!!,
                boardId = task.boardId,
                title = task.title,
                description = task.description,
                status = task.status,
                position = task.position,
                tags = task.getTagList(),
                backlogCategoryId = task.backlogCategoryId,
                createdAt = task.createdAt,
                updatedAt = task.updatedAt
            )
        }
    }
}
