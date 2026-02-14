package com.issuetracker.dto

import com.issuetracker.domain.Board
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

data class CreateBoardRequest(
    @field:NotBlank(message = "Board name is required")
    @field:Size(min = 1, max = 255, message = "Board name must be between 1 and 255 characters")
    val name: String,

    @field:Size(max = 2000, message = "Description must not exceed 2000 characters")
    val description: String? = null
)

data class UpdateBoardRequest(
    @field:NotBlank(message = "Board name is required")
    @field:Size(min = 1, max = 255, message = "Board name must be between 1 and 255 characters")
    val name: String,

    @field:Size(max = 2000, message = "Description must not exceed 2000 characters")
    val description: String? = null
)

data class BoardResponse(
    val id: UUID,
    val name: String,
    val description: String?,
    val createdAt: Instant
) {
    companion object {
        fun from(board: Board): BoardResponse {
            return BoardResponse(
                id = board.id!!,
                name = board.name,
                description = board.description,
                createdAt = board.createdAt
            )
        }
    }
}
