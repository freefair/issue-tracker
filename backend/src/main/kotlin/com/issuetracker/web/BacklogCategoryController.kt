package com.issuetracker.web

import com.issuetracker.dto.BacklogCategoryResponse
import com.issuetracker.dto.CreateBacklogCategoryRequest
import com.issuetracker.dto.UpdateBacklogCategoryRequest
import com.issuetracker.service.BacklogCategoryService
import jakarta.validation.Valid
import kotlinx.coroutines.flow.Flow
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController
@RequestMapping("/api")
class BacklogCategoryController(
    private val categoryService: BacklogCategoryService
) {

    @GetMapping("/boards/{boardId}/backlog-categories")
    fun getCategoriesByBoard(@PathVariable boardId: UUID): Flow<BacklogCategoryResponse> {
        return categoryService.getCategoriesByBoard(boardId)
    }

    @GetMapping("/backlog-categories/{id}")
    suspend fun getCategoryById(@PathVariable id: UUID): BacklogCategoryResponse {
        return categoryService.getCategoryById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Backlog category not found")
    }

    @PostMapping("/boards/{boardId}/backlog-categories")
    @ResponseStatus(HttpStatus.CREATED)
    suspend fun createCategory(
        @PathVariable boardId: UUID,
        @Valid @RequestBody request: CreateBacklogCategoryRequest
    ): BacklogCategoryResponse {
        return categoryService.createCategory(boardId, request)
    }

    @PatchMapping("/backlog-categories/{id}")
    suspend fun updateCategory(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateBacklogCategoryRequest
    ): BacklogCategoryResponse {
        return categoryService.updateCategory(id, request)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Backlog category not found")
    }

    @DeleteMapping("/backlog-categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    suspend fun deleteCategory(@PathVariable id: UUID) {
        if (!categoryService.deleteCategory(id)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Backlog category not found")
        }
    }
}
