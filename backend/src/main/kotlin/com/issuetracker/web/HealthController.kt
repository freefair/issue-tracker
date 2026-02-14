package com.issuetracker.web

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api")
class HealthController {

    @GetMapping("/hello")
    fun hello(): Mono<Map<String, String>> {
        return Mono.just(
            mapOf(
                "message" to "Issue Tracker API - Reactive",
                "status" to "running",
                "stack" to "WebFlux + R2DBC"
            )
        )
    }
}
