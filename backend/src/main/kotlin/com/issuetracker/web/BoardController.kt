package com.issuetracker.web

import com.issuetracker.dto.BoardResponse
import com.issuetracker.dto.CreateBoardRequest
import com.issuetracker.dto.UpdateBoardRequest
import com.issuetracker.service.BoardService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.util.UUID

@RestController
@RequestMapping("/api/boards")
class BoardController(
    private val boardService: BoardService
) {

    @GetMapping
    fun getAllBoards(): Flux<BoardResponse> {
        return boardService.getAllBoards()
    }

    @GetMapping("/{id}")
    fun getBoardById(@PathVariable id: UUID): Mono<BoardResponse> {
        return boardService.getBoardById(id)
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createBoard(@Valid @RequestBody request: CreateBoardRequest): Mono<BoardResponse> {
        return boardService.createBoard(request)
    }

    @PutMapping("/{id}")
    fun updateBoard(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateBoardRequest
    ): Mono<BoardResponse> {
        return boardService.updateBoard(id, request)
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteBoard(@PathVariable id: UUID): Mono<Void> {
        return boardService.deleteBoard(id)
    }
}
