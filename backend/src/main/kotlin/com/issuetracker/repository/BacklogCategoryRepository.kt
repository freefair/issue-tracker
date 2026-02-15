package com.issuetracker.repository

import com.issuetracker.domain.BacklogCategory
import kotlinx.coroutines.flow.Flow
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface BacklogCategoryRepository : CoroutineCrudRepository<BacklogCategory, UUID> {
    fun findByBoardIdOrderByPositionAsc(boardId: UUID): Flow<BacklogCategory>
}
