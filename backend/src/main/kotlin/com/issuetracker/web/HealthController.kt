package com.issuetracker.web

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class HealthController {

    @GetMapping("/hello")
    suspend fun hello(): Map<String, String> {
        return mapOf(
            "message" to "Issue Tracker API - Reactive with Kotlin Coroutines",
            "status" to "running",
            "stack" to "WebFlux + R2DBC + Coroutines"
        )
    }
}
