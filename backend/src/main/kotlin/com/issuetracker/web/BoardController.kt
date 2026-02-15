package com.issuetracker.web

import com.issuetracker.dto.BoardResponse
import com.issuetracker.dto.CreateBoardRequest
import com.issuetracker.dto.UpdateBoardRequest
import com.issuetracker.service.BoardService
import jakarta.validation.Valid
import kotlinx.coroutines.flow.Flow
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/boards")
class BoardController(
    private val boardService: BoardService
) {

    @GetMapping
    fun getAllBoards(): Flow<BoardResponse> {
        return boardService.getAllBoards()
    }

    @GetMapping("/{id}")
    suspend fun getBoardById(@PathVariable id: UUID): BoardResponse {
        return boardService.getBoardById(id)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    suspend fun createBoard(@Valid @RequestBody request: CreateBoardRequest): BoardResponse {
        return boardService.createBoard(request)
    }

    @PutMapping("/{id}")
    suspend fun updateBoard(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateBoardRequest
    ): BoardResponse {
        return boardService.updateBoard(id, request)
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    suspend fun deleteBoard(@PathVariable id: UUID) {
        boardService.deleteBoard(id)
    }
}
