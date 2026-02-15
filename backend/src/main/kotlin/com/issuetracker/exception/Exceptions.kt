package com.issuetracker.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus
import java.util.UUID

@ResponseStatus(HttpStatus.NOT_FOUND)
class BoardNotFoundException(boardId: UUID) :
    RuntimeException("Board not found with id: $boardId")

@ResponseStatus(HttpStatus.NOT_FOUND)
class TaskNotFoundException(taskId: UUID) :
    RuntimeException("Task not found with id: $taskId")

@ResponseStatus(HttpStatus.BAD_REQUEST)
class InvalidOperationException(message: String) :
    RuntimeException(message)
