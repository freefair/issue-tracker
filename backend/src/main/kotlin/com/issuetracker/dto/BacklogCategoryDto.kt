package com.issuetracker.dto

import com.issuetracker.domain.BacklogCategory
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class CreateBacklogCategoryRequest(
    @field:NotBlank(message = "Category name is required")
    @field:Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    val name: String,

    @field:Min(value = 0, message = "Position must be non-negative")
    val position: Int = 0
)

data class UpdateBacklogCategoryRequest(
    @field:Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    val name: String? = null,

    @field:Min(value = 0, message = "Position must be non-negative")
    val position: Int? = null
)

data class BacklogCategoryResponse(
    val id: UUID,
    val boardId: UUID,
    val name: String,
    val position: Int,
    val createdAt: Instant,
    val updatedAt: Instant
) {
    companion object {
        fun from(category: BacklogCategory): BacklogCategoryResponse {
            return BacklogCategoryResponse(
                id = category.id!!,
                boardId = category.boardId,
                name = category.name,
                position = category.position,
                createdAt = category.createdAt,
                updatedAt = category.updatedAt
            )
        }
    }
}
