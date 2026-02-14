package com.issuetracker.exception

import java.util.UUID

sealed class ApplicationException(message: String) : RuntimeException(message)

class BoardNotFoundException(boardId: UUID) :
    ApplicationException("Board not found with id: $boardId")

class TaskNotFoundException(taskId: UUID) :
    ApplicationException("Task not found with id: $taskId")

class InvalidOperationException(message: String) :
    ApplicationException(message)
