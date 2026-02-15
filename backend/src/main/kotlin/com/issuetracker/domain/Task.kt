package com.issuetracker.domain

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant
import java.util.UUID

@Table("tasks")
data class Task(
    @Id
    val id: UUID? = null,
    val boardId: UUID,
    val title: String,
    val description: String = "",
    val status: TaskStatus,
    val position: Int,
    val tags: String = "", // Comma-separated tags for simplicity with R2DBC
    val backlogCategoryId: UUID? = null,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
) {
    fun getTagList(): List<String> =
        if (tags.isBlank()) emptyList()
        else tags.split(",").map { it.trim() }

    fun withTags(tagList: List<String>): Task =
        copy(tags = tagList.joinToString(","))
}
