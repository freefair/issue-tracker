package com.issuetracker.service

import com.issuetracker.domain.BacklogCategory
import com.issuetracker.dto.BacklogCategoryResponse
import com.issuetracker.dto.CreateBacklogCategoryRequest
import com.issuetracker.dto.UpdateBacklogCategoryRequest
import com.issuetracker.exception.BoardNotFoundException
import com.issuetracker.repository.BacklogCategoryRepository
import com.issuetracker.repository.BoardRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class BacklogCategoryService(
    private val categoryRepository: BacklogCategoryRepository,
    private val boardRepository: BoardRepository
) {
    private val logger = LoggerFactory.getLogger(BacklogCategoryService::class.java)

    fun getCategoriesByBoard(boardId: UUID): Flow<BacklogCategoryResponse> {
        logger.debug("Fetching backlog categories for board: {}", boardId)
        return categoryRepository.findByBoardIdOrderByPositionAsc(boardId)
            .map { it.withPersistedFlag() }
            .map { BacklogCategoryResponse.from(it) }
    }

    suspend fun getCategoryById(id: UUID): BacklogCategoryResponse? {
        logger.debug("Fetching backlog category with id: {}", id)
        val category = categoryRepository.findById(id)?.withPersistedFlag() ?: return null
        return BacklogCategoryResponse.from(category)
    }

    suspend fun createCategory(boardId: UUID, request: CreateBacklogCategoryRequest): BacklogCategoryResponse {
        logger.info("Creating new backlog category for board: {}", boardId)

        // Verify board exists
        boardRepository.findById(boardId)
            ?: throw BoardNotFoundException(boardId)

        val category = BacklogCategory(
            id = UUID.randomUUID(),
            boardId = boardId,
            name = request.name,
            position = request.position,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        val savedCategory = categoryRepository.save(category)
        logger.info("Backlog category created with id: {}", savedCategory.id)
        return BacklogCategoryResponse.from(savedCategory)
    }

    suspend fun updateCategory(id: UUID, request: UpdateBacklogCategoryRequest): BacklogCategoryResponse? {
        logger.info("Updating backlog category with id: {}", id)

        val existingCategory = categoryRepository.findById(id)?.withPersistedFlag() ?: return null

        val updatedCategory = existingCategory.copy(
            name = request.name ?: existingCategory.name,
            position = request.position ?: existingCategory.position,
            updatedAt = Instant.now()
        ).withPersistedFlag()

        val savedCategory = categoryRepository.save(updatedCategory)
        logger.info("Backlog category updated: {}", savedCategory.id)
        return BacklogCategoryResponse.from(savedCategory)
    }

    suspend fun deleteCategory(id: UUID): Boolean {
        logger.info("Deleting backlog category with id: {}", id)

        val category = categoryRepository.findById(id) ?: return false

        categoryRepository.delete(category)
        logger.info("Backlog category deleted: {}", id)
        return true
    }
}
