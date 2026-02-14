package com.issuetracker.web

import com.issuetracker.domain.Task
import com.issuetracker.repository.TaskRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import java.util.UUID

@RestController
@RequestMapping("/api/boards/{boardId}/tasks")
class TaskController(
    private val taskRepository: TaskRepository
) {

    @GetMapping
    fun getTasksByBoard(@PathVariable boardId: UUID): Flux<Task> {
        return taskRepository.findByBoardIdOrderByPositionAsc(boardId)
    }
}
