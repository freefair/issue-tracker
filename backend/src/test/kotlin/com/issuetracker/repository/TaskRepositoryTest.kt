package com.issuetracker.repository

import com.issuetracker.config.AbstractIntegrationTest
import com.issuetracker.domain.Board
import com.issuetracker.domain.Task
import com.issuetracker.domain.TaskStatus
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import java.time.Instant

@SpringBootTest
@ActiveProfiles("test")
class TaskRepositoryTest : AbstractIntegrationTest() {

    companion object {
        @JvmStatic
        @DynamicPropertySource
        fun properties(registry: DynamicPropertyRegistry) {
            registry.add("spring.r2dbc.url") { getR2dbcUrl() }
            registry.add("spring.r2dbc.username") { getUsername() }
            registry.add("spring.r2dbc.password") { getPassword() }
            registry.add("spring.flyway.url") { getJdbcUrl() }
            registry.add("spring.flyway.user") { getUsername() }
            registry.add("spring.flyway.password") { getPassword() }
        }
    }

    @Autowired
    private lateinit var taskRepository: TaskRepository

    @Autowired
    private lateinit var boardRepository: BoardRepository

    private lateinit var testBoard: Board

    @BeforeEach
    fun setUp() = runTest {
        // Clean up
        taskRepository.deleteAll()
        boardRepository.deleteAll()

        // Create a test board
        testBoard = boardRepository.save(
            Board(name = "Test Board", description = "For testing tasks")
        )
    }

    @Test
    fun `should save and retrieve task`() = runTest {
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
        assert(savedTask.id != null)
        assert(savedTask.title == "Test Task")
        assert(savedTask.status == TaskStatus.TODO)
        assert(savedTask.boardId == testBoard.id)
    }

    @Test
    fun `should find tasks by board id ordered by position`() = runTest {
        // Given
        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Task 3",
            status = TaskStatus.TODO,
            position = 3
        ))

        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Task 1",
            status = TaskStatus.TODO,
            position = 1
        ))

        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Task 2",
            status = TaskStatus.TODO,
            position = 2
        ))

        // When
        val tasks = taskRepository.findByBoardIdOrderByPositionAsc(testBoard.id!!).toList()

        // Then
        assert(tasks.size == 3)
        assert(tasks[0].title == "Task 1")
        assert(tasks[1].title == "Task 2")
        assert(tasks[2].title == "Task 3")
    }

    @Test
    fun `should find tasks by board id and status`() = runTest {
        // Given
        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Todo Task",
            status = TaskStatus.TODO,
            position = 1
        ))

        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "In Progress Task",
            status = TaskStatus.IN_PROGRESS,
            position = 2
        ))

        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Another Todo",
            status = TaskStatus.TODO,
            position = 3
        ))

        // When
        val todoTasks = taskRepository.findByBoardIdAndStatus(testBoard.id!!, TaskStatus.TODO).toList()

        // Then
        assert(todoTasks.size == 2)
    }

    @Test
    fun `should search tasks by title`() = runTest {
        // Given
        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Implement authentication",
            description = "Add user login feature",
            status = TaskStatus.TODO,
            position = 1,
            tags = "security,backend"
        ))

        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Fix bug in frontend",
            description = "Button not working",
            status = TaskStatus.TODO,
            position = 2,
            tags = "frontend,bug"
        ))

        // When
        val searchResults = taskRepository
            .findByBoardIdAndTitleContainingIgnoreCase(testBoard.id!!, "authentication")
            .toList()

        // Then
        assert(searchResults.size == 1)
        assert(searchResults[0].title == "Implement authentication")
    }

    @Test
    fun `should search tasks by description`() = runTest {
        // Given
        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Task 1",
            description = "Contains special keyword reactor",
            status = TaskStatus.TODO,
            position = 1
        ))

        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Task 2",
            description = "Something else",
            status = TaskStatus.TODO,
            position = 2
        ))

        // When
        val searchResults = taskRepository
            .findByBoardIdAndDescriptionContainingIgnoreCase(testBoard.id!!, "reactor")
            .toList()

        // Then
        assert(searchResults.size == 1)
        assert(searchResults[0].title == "Task 1")
    }

    @Test
    fun `should search tasks by tags`() = runTest {
        // Given
        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Backend Task",
            status = TaskStatus.TODO,
            position = 1,
            tags = "kotlin,spring,backend"
        ))

        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "Frontend Task",
            status = TaskStatus.TODO,
            position = 2,
            tags = "react,typescript"
        ))

        // When
        val searchResults = taskRepository
            .findByBoardIdAndTagsContainingIgnoreCase(testBoard.id!!, "kotlin")
            .toList()

        // Then
        assert(searchResults.size == 1)
        assert(searchResults[0].title == "Backend Task")
    }

    @Test
    fun `should handle case insensitive search`() = runTest {
        // Given
        taskRepository.save(Task(
            boardId = testBoard.id!!,
            title = "UPPERCASE TASK",
            description = "lowercase description",
            status = TaskStatus.TODO,
            position = 1
        ))

        // When - search with different case
        val titleResults = taskRepository
            .findByBoardIdAndTitleContainingIgnoreCase(testBoard.id!!, "uppercase")
            .toList()

        val descResults = taskRepository
            .findByBoardIdAndDescriptionContainingIgnoreCase(testBoard.id!!, "LOWERCASE")
            .toList()

        // Then
        assert(titleResults.size == 1)
        assert(descResults.size == 1)
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
