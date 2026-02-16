package com.issuetracker.service

import com.issuetracker.domain.Task
import com.issuetracker.domain.TaskStatus
import com.issuetracker.dto.CreateTaskRequest
import com.issuetracker.dto.MoveTaskRequest
import com.issuetracker.dto.TaskResponse
import com.issuetracker.dto.UpdateTaskRequest
import com.issuetracker.exception.BoardNotFoundException
import com.issuetracker.exception.TaskNotFoundException
import com.issuetracker.repository.BoardRepository
import com.issuetracker.repository.TaskRepository
import kotlinx.coroutines.flow.*
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class TaskService(
    private val taskRepository: TaskRepository,
    private val boardRepository: BoardRepository
) {
    private val logger = LoggerFactory.getLogger(TaskService::class.java)

    fun getTasksByBoard(boardId: UUID): Flow<TaskResponse> {
        logger.debug("Fetching tasks for board: {}", boardId)
        return taskRepository.findByBoardIdOrderByPositionAsc(boardId)
            .map { TaskResponse.from(it) }
    }

    fun getTasksByBoardAndStatus(boardId: UUID, status: TaskStatus): Flow<TaskResponse> {
        logger.debug("Fetching tasks for board: {} with status: {}", boardId, status)
        return taskRepository.findByBoardIdAndStatus(boardId, status)
            .map { TaskResponse.from(it) }
    }

    suspend fun getTaskById(id: UUID): TaskResponse {
        logger.debug("Fetching task with id: {}", id)
        val task = taskRepository.findById(id)
            ?: throw TaskNotFoundException(id)
        return TaskResponse.from(task)
    }

    suspend fun createTask(boardId: UUID, request: CreateTaskRequest): TaskResponse {
        logger.info("Creating new task for board: {}", boardId)

        // Verify board exists
        boardRepository.findById(boardId)
            ?: throw BoardNotFoundException(boardId)

        val task = Task(
            boardId = boardId,
            title = request.title,
            description = request.description,
            status = request.status,
            position = request.position,
            tags = request.tags.joinToString(","),
            backlogCategoryId = request.backlogCategoryId
        )

        val savedTask = taskRepository.save(task)
        logger.info("Task created with id: {}", savedTask.id)
        return TaskResponse.from(savedTask)
    }

    suspend fun updateTask(id: UUID, request: UpdateTaskRequest): TaskResponse {
        logger.info("Updating task with id: {}", id)

        val existingTask = taskRepository.findById(id)
            ?: throw TaskNotFoundException(id)

        val updatedTask = existingTask.copy(
            title = request.title ?: existingTask.title,
            description = request.description ?: existingTask.description,
            status = request.status ?: existingTask.status,
            position = request.position ?: existingTask.position,
            tags = request.tags?.joinToString(",") ?: existingTask.tags,
            // Allow backlogCategoryId to be set to null when position is being updated (drag & drop)
            backlogCategoryId = if (request.position != null) request.backlogCategoryId else (request.backlogCategoryId ?: existingTask.backlogCategoryId),
            updatedAt = Instant.now()
        )

        val savedTask = taskRepository.save(updatedTask)
        logger.info("Task updated: {}", savedTask.id)
        return TaskResponse.from(savedTask)
    }

    suspend fun moveTask(id: UUID, request: MoveTaskRequest): TaskResponse {
        logger.info("Moving task {} to status: {}, position: {}", id, request.status, request.position)

        val existingTask = taskRepository.findById(id)
            ?: throw TaskNotFoundException(id)

        val movedTask = existingTask.copy(
            status = request.status,
            position = request.position,
            updatedAt = Instant.now()
        )

        val savedTask = taskRepository.save(movedTask)
        logger.info("Task moved: {}", savedTask.id)
        return TaskResponse.from(savedTask)
    }

    suspend fun deleteTask(id: UUID) {
        logger.info("Deleting task with id: {}", id)

        val task = taskRepository.findById(id)
            ?: throw TaskNotFoundException(id)

        taskRepository.delete(task)
        logger.info("Task deleted: {}", id)
    }

    fun searchTasks(boardId: UUID, query: String): Flow<TaskResponse> {
        logger.debug("Searching tasks in board: {} with query: {}", boardId, query)

        // Combine results from title, description, and tags searches
        // Use a Set to track unique task IDs and filter duplicates
        val seenIds = mutableSetOf<UUID>()

        return flowOf(
            taskRepository.findByBoardIdAndTitleContainingIgnoreCase(boardId, query),
            taskRepository.findByBoardIdAndDescriptionContainingIgnoreCase(boardId, query),
            taskRepository.findByBoardIdAndTagsContainingIgnoreCase(boardId, query)
        )
            .flattenConcat()
            .filter { task ->
                // Only emit if we haven't seen this ID before
                task.id?.let { seenIds.add(it) } ?: false
            }
            .map { TaskResponse.from(it) }
    }

    fun searchTasksGlobally(query: String): Flow<TaskResponse> {
        logger.debug("Searching tasks globally with query: {}", query)

        // Combine results from title, description, and tags searches across all boards
        // Use a Set to track unique task IDs and filter duplicates
        val seenIds = mutableSetOf<UUID>()

        return flowOf(
            taskRepository.findByTitleContainingIgnoreCase(query),
            taskRepository.findByDescriptionContainingIgnoreCase(query),
            taskRepository.findByTagsContainingIgnoreCase(query)
        )
            .flattenConcat()
            .filter { task ->
                // Only emit if we haven't seen this ID before
                task.id?.let { seenIds.add(it) } ?: false
            }
            .map { TaskResponse.from(it) }
    }

    suspend fun getAllTags(boardId: UUID, query: String? = null): List<String> {
        logger.debug("Fetching all tags for board: {} with query: {}", boardId, query)

        // Get all tasks for the board
        val allTags = taskRepository.findByBoardIdOrderByPositionAsc(boardId)
            .map { task ->
                // Split tags by comma and trim
                task.tags.split(",")
                    .map { it.trim() }
                    .filter { it.isNotEmpty() }
            }
            .flatMapConcat { flowOf(*it.toTypedArray()) }
            .toSet()
            .toList()

        // Filter by query if provided
        return if (query.isNullOrBlank()) {
            allTags.sorted()
        } else {
            allTags
                .filter { it.contains(query, ignoreCase = true) }
                .sorted()
        }
    }
}
