package com.issuetracker.web

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.reactive.server.WebTestClient

@WebFluxTest(HealthController::class)
@ActiveProfiles("test")
class HealthControllerTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @Test
    fun `should return health status`() {
        webTestClient.get()
            .uri("/api/hello")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.message").isEqualTo("Issue Tracker API - Reactive")
            .jsonPath("$.status").isEqualTo("running")
            .jsonPath("$.stack").isEqualTo("WebFlux + R2DBC")
    }
}
