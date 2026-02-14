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
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.Instant
import java.util.UUID

@Service
class TaskService(
    private val taskRepository: TaskRepository,
    private val boardRepository: BoardRepository
) {
    private val logger = LoggerFactory.getLogger(TaskService::class.java)

    fun getTasksByBoard(boardId: UUID): Flux<TaskResponse> {
        logger.debug("Fetching tasks for board: {}", boardId)
        return taskRepository.findByBoardIdOrderByPositionAsc(boardId)
            .map { TaskResponse.from(it) }
    }

    fun getTasksByBoardAndStatus(boardId: UUID, status: TaskStatus): Flux<TaskResponse> {
        logger.debug("Fetching tasks for board: {} with status: {}", boardId, status)
        return taskRepository.findByBoardIdAndStatus(boardId, status)
            .map { TaskResponse.from(it) }
    }

    fun getTaskById(id: UUID): Mono<TaskResponse> {
        logger.debug("Fetching task with id: {}", id)
        return taskRepository.findById(id)
            .map { TaskResponse.from(it) }
            .switchIfEmpty(Mono.error(TaskNotFoundException(id)))
    }

    fun createTask(boardId: UUID, request: CreateTaskRequest): Mono<TaskResponse> {
        logger.info("Creating new task for board: {}", boardId)

        // Verify board exists
        return boardRepository.findById(boardId)
            .switchIfEmpty(Mono.error(BoardNotFoundException(boardId)))
            .flatMap {
                val task = Task(
                    boardId = boardId,
                    title = request.title,
                    description = request.description,
                    status = request.status,
                    position = request.position,
                    tags = request.tags.joinToString(","),
                    createdAt = Instant.now(),
                    updatedAt = Instant.now()
                )
                taskRepository.save(task)
            }
            .map { TaskResponse.from(it) }
            .doOnSuccess { logger.info("Task created with id: {}", it.id) }
    }

    fun updateTask(id: UUID, request: UpdateTaskRequest): Mono<TaskResponse> {
        logger.info("Updating task with id: {}", id)

        return taskRepository.findById(id)
            .switchIfEmpty(Mono.error(TaskNotFoundException(id)))
            .flatMap { existingTask ->
                val updatedTask = existingTask.copy(
                    title = request.title,
                    description = request.description,
                    status = request.status,
                    position = request.position,
                    tags = request.tags.joinToString(","),
                    updatedAt = Instant.now()
                )
                taskRepository.save(updatedTask)
            }
            .map { TaskResponse.from(it) }
            .doOnSuccess { logger.info("Task updated: {}", it.id) }
    }

    fun moveTask(id: UUID, request: MoveTaskRequest): Mono<TaskResponse> {
        logger.info("Moving task {} to status: {}, position: {}", id, request.status, request.position)

        return taskRepository.findById(id)
            .switchIfEmpty(Mono.error(TaskNotFoundException(id)))
            .flatMap { existingTask ->
                val movedTask = existingTask.copy(
                    status = request.status,
                    position = request.position,
                    updatedAt = Instant.now()
                )
                taskRepository.save(movedTask)
            }
            .map { TaskResponse.from(it) }
            .doOnSuccess { logger.info("Task moved: {}", it.id) }
    }

    fun deleteTask(id: UUID): Mono<Void> {
        logger.info("Deleting task with id: {}", id)

        return taskRepository.findById(id)
            .switchIfEmpty(Mono.error(TaskNotFoundException(id)))
            .flatMap { taskRepository.delete(it) }
            .doOnSuccess { logger.info("Task deleted: {}", id) }
    }

    fun searchTasks(boardId: UUID, query: String): Flux<TaskResponse> {
        logger.debug("Searching tasks in board: {} with query: {}", boardId, query)
        return taskRepository.searchByBoardId(boardId, query)
            .map { TaskResponse.from(it) }
    }
}
