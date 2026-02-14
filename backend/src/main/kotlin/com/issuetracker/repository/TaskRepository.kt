package com.issuetracker.repository

import com.issuetracker.domain.Task
import com.issuetracker.domain.TaskStatus
import org.springframework.data.r2dbc.repository.Query
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import java.util.UUID

@Repository
interface TaskRepository : ReactiveCrudRepository<Task, UUID> {

    fun findByBoardIdOrderByPositionAsc(boardId: UUID): Flux<Task>

    fun findByBoardIdAndStatus(boardId: UUID, status: TaskStatus): Flux<Task>

    @Query("""
        SELECT * FROM tasks
        WHERE board_id = :boardId
        AND (LOWER(title) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(description) LIKE LOWER(CONCAT('%', :query, '%'))
             OR LOWER(tags) LIKE LOWER(CONCAT('%', :query, '%')))
        ORDER BY position ASC
    """)
    fun searchByBoardId(boardId: UUID, query: String): Flux<Task>
}
