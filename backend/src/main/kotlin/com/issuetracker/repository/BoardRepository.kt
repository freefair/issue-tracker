package com.issuetracker.repository

import com.issuetracker.domain.Board
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface BoardRepository : ReactiveCrudRepository<Board, UUID>
