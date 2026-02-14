package com.issuetracker.domain

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant
import java.util.UUID

@Table("boards")
data class Board(
    @Id
    val id: UUID? = null,
    val name: String,
    val description: String? = null,
    val createdAt: Instant = Instant.now()
)
