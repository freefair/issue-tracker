package com.issuetracker.web

import com.issuetracker.domain.Board
import com.issuetracker.repository.BoardRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux

@RestController
@RequestMapping("/api/boards")
class BoardController(
    private val boardRepository: BoardRepository
) {

    @GetMapping
    fun getAllBoards(): Flux<Board> {
        return boardRepository.findAll()
    }
}
