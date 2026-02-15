package com.issuetracker.repository

import com.issuetracker.domain.Task
import com.issuetracker.domain.TaskStatus
import kotlinx.coroutines.flow.Flow
import org.springframework.data.r2dbc.repository.Query
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface TaskRepository : CoroutineCrudRepository<Task, UUID> {

    fun findByBoardIdOrderByPositionAsc(boardId: UUID): Flow<Task>

    fun findByBoardIdAndStatus(boardId: UUID, status: TaskStatus): Flow<Task>

    @Query("""
        SELECT * FROM tasks
        WHERE board_id = :boardId
        AND (LOWER(title) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(description) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(tags) LIKE LOWER(CONCAT('%', :query, '%')))
        ORDER BY position ASC
    """)
    fun searchByBoardId(boardId: UUID, query: String): Flow<Task>
}
