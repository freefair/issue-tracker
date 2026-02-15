package com.issuetracker.domain

import org.springframework.data.annotation.Id
import org.springframework.data.annotation.Transient
import org.springframework.data.domain.Persistable
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant
import java.util.UUID

@Table("backlog_categories")
data class BacklogCategory(
    @Id
    private val id: UUID? = null,
    val boardId: UUID,
    val name: String,
    val position: Int,
    val createdAt: Instant,
    val updatedAt: Instant
) : Persistable<UUID> {

    @Transient
    private var new: Boolean = true

    override fun getId(): UUID? = id

    override fun isNew(): Boolean = new

    fun withPersistedFlag(): BacklogCategory {
        this.new = false
        return this
    }
}
