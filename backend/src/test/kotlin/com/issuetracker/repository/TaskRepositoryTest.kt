package com.issuetracker.repository

import com.issuetracker.domain.Board
import com.issuetracker.domain.Task
import com.issuetracker.domain.TaskStatus
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.data.r2dbc.DataR2dbcTest
import org.springframework.test.context.ActiveProfiles
import reactor.test.StepVerifier
import java.time.Instant

@DataR2dbcTest
@ActiveProfiles("test")
class TaskRepositoryTest {

    @Autowired
    private lateinit var taskRepository: TaskRepository

    @Autowired
    private lateinit var boardRepository: BoardRepository

    private lateinit var testBoard: Board

    @BeforeEach
    fun setUp() {
        // Clean up
        taskRepository.deleteAll().block()
        boardRepository.deleteAll().block()

        // Create a test board
        testBoard = boardRepository.save(
            Board(name = "Test Board", description = "For testing tasks")
        ).block()!!
    }

    @Test
    fun `should save and retrieve task`() {
        // Given
        val task = Task(
            boardId = testBoard.id!!,
            title = "Test Task",
            description = "A test task",
            status = TaskStatus.TODO,
            position = 1,
            tags = "test,unit",
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )

        // When
        val savedTask = taskRepository.save(task)

        // Then
        StepVerifier.create(savedTask)
            .expectNextMatches { saved ->
                saved.id != null &&
                saved.title == "Test Task" &&
                saved.status == TaskStatus.TODO &&
                saved.boardId == testBoard.id
            }
            .verifyComplete()
    }

    @Test
    fun `should find tasks by board id ordered by position`() {
        // Given
        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Task 3",
            status = TaskStatus.TODO,
            position = 3
        )).block()

        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Task 1",
            status = TaskStatus.TODO,
            position = 1
        )).block()

        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Task 2",
            status = TaskStatus.TODO,
            position = 2
        )).block()

        // When
        val tasks = taskRepository.findByBoardIdOrderByPositionAsc(testBoard.id!!)

        // Then
        StepVerifier.create(tasks)
            .expectNextMatches { it.title == "Task 1" }
            .expectNextMatches { it.title == "Task 2" }
            .expectNextMatches { it.title == "Task 3" }
            .verifyComplete()
    }

    @Test
    fun `should find tasks by board id and status`() {
        // Given
        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Todo Task",
            status = TaskStatus.TODO,
            position = 1
        )).block()

        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "In Progress Task",
            status = TaskStatus.IN_PROGRESS,
            position = 2
        )).block()

        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Another Todo",
            status = TaskStatus.TODO,
            position = 3
        )).block()

        // When
        val todoTasks = taskRepository.findByBoardIdAndStatus(testBoard.id!!, TaskStatus.TODO)

        // Then
        StepVerifier.create(todoTasks)
            .expectNextCount(2)
            .verifyComplete()
    }

    @Test
    fun `should search tasks by query`() {
        // Given
        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Implement authentication",
            description = "Add user login feature",
            status = TaskStatus.TODO,
            position = 1,
            tags = "security,backend"
        )).block()

        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Fix bug in frontend",
            description = "Button not working",
            status = TaskStatus.TODO,
            position = 2,
            tags = "frontend,bug"
        )).block()

        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Update documentation",
            description = "Add API docs",
            status = TaskStatus.TODO,
            position = 3,
            tags = "docs"
        )).block()

        // When - search by title
        val searchResults = taskRepository.searchByBoardId(testBoard.id!!, "authentication")

        // Then
        StepVerifier.create(searchResults)
            .expectNextMatches { it.title == "Implement authentication" }
            .verifyComplete()
    }

    @Test
    fun `should search tasks by description`() {
        // Given
        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Task 1",
            description = "Contains special keyword reactor",
            status = TaskStatus.TODO,
            position = 1
        )).block()

        // When
        val searchResults = taskRepository.searchByBoardId(testBoard.id!!, "reactor")

        // Then
        StepVerifier.create(searchResults)
            .expectNextCount(1)
            .verifyComplete()
    }

    @Test
    fun `should search tasks by tags`() {
        // Given
        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Backend Task",
            status = TaskStatus.TODO,
            position = 1,
            tags = "kotlin,spring,backend"
        )).block()

        // When
        val searchResults = taskRepository.searchByBoardId(testBoard.id!!, "kotlin")

        // Then
        StepVerifier.create(searchResults)
            .expectNextCount(1)
            .verifyComplete()
    }

    @Test
    fun `task helper methods should work correctly`() {
        // Given
        val task = Task(
            boardId = testBoard.id!!,
            title = "Test",
            status = TaskStatus.TODO,
            position = 1,
            tags = "tag1,tag2,tag3"
        )

        // When
        val tagList = task.getTagList()
        val updatedTask = task.withTags(listOf("new1", "new2"))

        // Then
        assert(tagList == listOf("tag1", "tag2", "tag3"))
        assert(updatedTask.tags == "new1,new2")
    }

    @Test
    fun `task helper methods should handle empty tags`() {
        // Given
        val task = Task(
            boardId = testBoard.id!!,
            title = "Test",
            status = TaskStatus.TODO,
            position = 1,
            tags = ""
        )

        // When
        val tagList = task.getTagList()

        // Then
        assert(tagList.isEmpty())
    }
}
