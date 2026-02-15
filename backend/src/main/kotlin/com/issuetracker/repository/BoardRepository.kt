package com.issuetracker.repository

import com.issuetracker.domain.Board
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface BoardRepository : CoroutineCrudRepository<Board, UUID>
