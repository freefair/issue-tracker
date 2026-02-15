package com.issuetracker.service

import com.issuetracker.domain.Board
import com.issuetracker.domain.Task
import com.issuetracker.domain.TaskStatus
import com.issuetracker.dto.CreateTaskRequest
import com.issuetracker.dto.MoveTaskRequest
import com.issuetracker.dto.UpdateTaskRequest
import com.issuetracker.exception.BoardNotFoundException
import com.issuetracker.exception.TaskNotFoundException
import com.issuetracker.repository.BoardRepository
import com.issuetracker.repository.TaskRepository
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.Instant
import java.util.UUID

class TaskServiceTest {

    private val taskRepository: TaskRepository = mock()
    private val boardRepository: BoardRepository = mock()
    private val taskService = TaskService(taskRepository, boardRepository)

    private val testBoardId = UUID.randomUUID()
    private val testBoard = Board(id = testBoardId, name = "Test Board", createdAt = Instant.now())

    @Test
    fun `should get tasks by board`() = runTest {
        // Given
        val task1 = Task(
            id = UUID.randomUUID(),
            boardId = testBoardId,
            title = "Task 1",
            status = TaskStatus.TODO,
            position = 1
        )
        val task2 = Task(
            id = UUID.randomUUID(),
            boardId = testBoardId,
            title = "Task 2",
            status = TaskStatus.TODO,
            position = 2
        )
        whenever(taskRepository.findByBoardIdOrderByPositionAsc(testBoardId))
            .thenReturn(flowOf(task1, task2))

        // When
        val result = taskService.getTasksByBoard(testBoardId).toList()

        // Then
        assert(result.size == 2)
        assert(result[0].title == "Task 1")
        assert(result[1].title == "Task 2")
    }

    @Test
    fun `should get tasks by board and status`() = runTest {
        // Given
        val task = Task(
            id = UUID.randomUUID(),
            boardId = testBoardId,
            title = "In Progress Task",
            status = TaskStatus.IN_PROGRESS,
            position = 1
        )
        whenever(taskRepository.findByBoardIdAndStatus(testBoardId, TaskStatus.IN_PROGRESS))
            .thenReturn(flowOf(task))

        // When
        val result = taskService.getTasksByBoardAndStatus(testBoardId, TaskStatus.IN_PROGRESS).toList()

        // Then
        assert(result.size == 1)
        assert(result[0].status == TaskStatus.IN_PROGRESS)
    }

    @Test
    fun `should get task by id`() = runTest {
        // Given
        val taskId = UUID.randomUUID()
        val task = Task(
            id = taskId,
            boardId = testBoardId,
            title = "Test Task",
            status = TaskStatus.TODO,
            position = 1
        )
        whenever(taskRepository.findById(taskId)).thenReturn(task)

        // When
        val result = taskService.getTaskById(taskId)

        // Then
        assert(result.id == taskId)
        assert(result.title == "Test Task")
    }

    @Test
    fun `should throw exception when task not found`() = runTest {
        // Given
        val taskId = UUID.randomUUID()
        whenever(taskRepository.findById(taskId)).thenReturn(null)

        // When & Then
        assertThrows<TaskNotFoundException> {
            taskService.getTaskById(taskId)
        }
    }

    @Test
    fun `should create task`() = runTest {
        // Given
        val request = CreateTaskRequest(
            title = "New Task",
            description = "Description",
            status = TaskStatus.TODO,
            position = 1,
            tags = listOf("tag1", "tag2")
        )
        val savedTask = Task(
            id = UUID.randomUUID(),
            boardId = testBoardId,
            title = "New Task",
            description = "Description",
            status = TaskStatus.TODO,
            position = 1,
            tags = "tag1,tag2"
        )

        whenever(boardRepository.findById(testBoardId)).thenReturn(testBoard)
        whenever(taskRepository.save(any())).thenReturn(savedTask)

        // When
        val result = taskService.createTask(testBoardId, request)

        // Then
        assert(result.title == "New Task")
        assert(result.tags == listOf("tag1", "tag2"))
        verify(taskRepository).save(any())
    }

    @Test
    fun `should throw exception when creating task for non-existent board`() = runTest {
        // Given
        val request = CreateTaskRequest(
            title = "Task",
            status = TaskStatus.TODO,
            position = 1
        )
        whenever(boardRepository.findById(testBoardId)).thenReturn(null)

        // When & Then
        assertThrows<BoardNotFoundException> {
            taskService.createTask(testBoardId, request)
        }
    }

    @Test
    fun `should update task`() = runTest {
        // Given
        val taskId = UUID.randomUUID()
        val existingTask = Task(
            id = taskId,
            boardId = testBoardId,
            title = "Old Title",
            status = TaskStatus.TODO,
            position = 1
        )
        val request = UpdateTaskRequest(
            title = "New Title",
            description = "Updated",
            status = TaskStatus.IN_PROGRESS,
            position = 2,
            tags = listOf("updated")
        )
        val updatedTask = existingTask.copy(
            title = "New Title",
            description = "Updated",
            status = TaskStatus.IN_PROGRESS,
            position = 2,
            tags = "updated"
        )

        whenever(taskRepository.findById(taskId)).thenReturn(existingTask)
        whenever(taskRepository.save(any())).thenReturn(updatedTask)

        // When
        val result = taskService.updateTask(taskId, request)

        // Then
        assert(result.id == taskId)
        assert(result.title == "New Title")
        assert(result.status == TaskStatus.IN_PROGRESS)
        assert(result.position == 2)
    }

    @Test
    fun `should move task`() = runTest {
        // Given
        val taskId = UUID.randomUUID()
        val existingTask = Task(
            id = taskId,
            boardId = testBoardId,
            title = "Task",
            status = TaskStatus.TODO,
            position = 1
        )
        val request = MoveTaskRequest(status = TaskStatus.DONE, position = 5)
        val movedTask = existingTask.copy(status = TaskStatus.DONE, position = 5)

        whenever(taskRepository.findById(taskId)).thenReturn(existingTask)
        whenever(taskRepository.save(any())).thenReturn(movedTask)

        // When
        val result = taskService.moveTask(taskId, request)

        // Then
        assert(result.id == taskId)
        assert(result.status == TaskStatus.DONE)
        assert(result.position == 5)
    }

    @Test
    fun `should delete task`() = runTest {
        // Given
        val taskId = UUID.randomUUID()
        val task = Task(
            id = taskId,
            boardId = testBoardId,
            title = "Task to Delete",
            status = TaskStatus.TODO,
            position = 1
        )
        whenever(taskRepository.findById(taskId)).thenReturn(task)
        whenever(taskRepository.delete(task)).thenReturn(Unit)

        // When
        taskService.deleteTask(taskId)

        // Then
        verify(taskRepository).findById(taskId)
        verify(taskRepository).delete(task)
    }

    @Test
    fun `should search tasks combining multiple queries`() = runTest {
        // Given
        val task1 = Task(
            id = UUID.randomUUID(),
            boardId = testBoardId,
            title = "Authentication Task",
            status = TaskStatus.TODO,
            position = 1
        )
        val task2 = Task(
            id = UUID.randomUUID(),
            boardId = testBoardId,
            title = "Other Task",
            description = "About authentication",
            status = TaskStatus.TODO,
            position = 2
        )

        whenever(taskRepository.findByBoardIdAndTitleContainingIgnoreCase(testBoardId, "auth"))
            .thenReturn(flowOf(task1))
        whenever(taskRepository.findByBoardIdAndDescriptionContainingIgnoreCase(testBoardId, "auth"))
            .thenReturn(flowOf(task2))
        whenever(taskRepository.findByBoardIdAndTagsContainingIgnoreCase(testBoardId, "auth"))
            .thenReturn(flowOf())

        // When
        val result = taskService.searchTasks(testBoardId, "auth").toList()

        // Then
        assert(result.size == 2)
    }

    @Test
    fun `should remove duplicate tasks in search results`() = runTest {
        // Given - same task matches multiple criteria
        val task = Task(
            id = UUID.randomUUID(),
            boardId = testBoardId,
            title = "Authentication",
            description = "Auth feature",
            status = TaskStatus.TODO,
            position = 1,
            tags = "auth,security"
        )

        whenever(taskRepository.findByBoardIdAndTitleContainingIgnoreCase(testBoardId, "auth"))
            .thenReturn(flowOf(task))
        whenever(taskRepository.findByBoardIdAndDescriptionContainingIgnoreCase(testBoardId, "auth"))
            .thenReturn(flowOf(task))
        whenever(taskRepository.findByBoardIdAndTagsContainingIgnoreCase(testBoardId, "auth"))
            .thenReturn(flowOf(task))

        // When
        val result = taskService.searchTasks(testBoardId, "auth").toList()

        // Then - should only return once
        assert(result.size == 1)
        assert(result[0].title == "Authentication")
    }
}
