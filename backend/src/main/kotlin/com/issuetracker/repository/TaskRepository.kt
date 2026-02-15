package com.issuetracker.repository

import com.issuetracker.domain.Task
import com.issuetracker.domain.TaskStatus
import kotlinx.coroutines.flow.Flow
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface TaskRepository : CoroutineCrudRepository<Task, UUID> {

    fun findByBoardIdOrderByPositionAsc(boardId: UUID): Flow<Task>

    fun findByBoardIdAndStatus(boardId: UUID, status: TaskStatus): Flow<Task>

    // Search queries - derived methods (board-scoped)
    fun findByBoardIdAndTitleContainingIgnoreCase(boardId: UUID, query: String): Flow<Task>

    fun findByBoardIdAndDescriptionContainingIgnoreCase(boardId: UUID, query: String): Flow<Task>

    fun findByBoardIdAndTagsContainingIgnoreCase(boardId: UUID, query: String): Flow<Task>

    // Global search queries (across all boards)
    fun findByTitleContainingIgnoreCase(query: String): Flow<Task>

    fun findByDescriptionContainingIgnoreCase(query: String): Flow<Task>

    fun findByTagsContainingIgnoreCase(query: String): Flow<Task>
}
