package com.issuetracker.exception

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.bind.support.WebExchangeBindException
import java.time.Instant

data class ErrorResponse(
    val timestamp: Instant = Instant.now(),
    val status: Int,
    val error: String,
    val message: String,
    val errors: List<FieldError>? = null
)

data class FieldError(
    val field: String,
    val message: String
)

@RestControllerAdvice
class GlobalExceptionHandler {

    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(BoardNotFoundException::class)
    fun handleBoardNotFound(ex: BoardNotFoundException): ResponseEntity<ErrorResponse> {
        logger.warn("Board not found: {}", ex.message)
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(
                ErrorResponse(
                    status = HttpStatus.NOT_FOUND.value(),
                    error = "Not Found",
                    message = ex.message ?: "Board not found"
                )
            )
    }

    @ExceptionHandler(TaskNotFoundException::class)
    fun handleTaskNotFound(ex: TaskNotFoundException): ResponseEntity<ErrorResponse> {
        logger.warn("Task not found: {}", ex.message)
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(
                ErrorResponse(
                    status = HttpStatus.NOT_FOUND.value(),
                    error = "Not Found",
                    message = ex.message ?: "Task not found"
                )
            )
    }

    @ExceptionHandler(InvalidOperationException::class)
    fun handleInvalidOperation(ex: InvalidOperationException): ResponseEntity<ErrorResponse> {
        logger.warn("Invalid operation: {}", ex.message)
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(
                ErrorResponse(
                    status = HttpStatus.BAD_REQUEST.value(),
                    error = "Bad Request",
                    message = ex.message ?: "Invalid operation"
                )
            )
    }

    @ExceptionHandler(WebExchangeBindException::class)
    fun handleValidationException(ex: WebExchangeBindException): ResponseEntity<ErrorResponse> {
        logger.warn("Validation failed: {}", ex.message)

        val fieldErrors = ex.fieldErrors.map { error ->
            FieldError(
                field = error.field,
                message = error.defaultMessage ?: "Invalid value"
            )
        }

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(
                ErrorResponse(
                    status = HttpStatus.BAD_REQUEST.value(),
                    error = "Validation Failed",
                    message = "Input validation failed",
                    errors = fieldErrors
                )
            )
    }

    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception): ResponseEntity<ErrorResponse> {
        logger.error("Unexpected error occurred", ex)
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(
                ErrorResponse(
                    status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    error = "Internal Server Error",
                    message = "An unexpected error occurred"
                )
            )
    }
}
