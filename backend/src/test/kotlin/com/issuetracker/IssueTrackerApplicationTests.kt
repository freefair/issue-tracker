package com.issuetracker

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@SpringBootTest
@ActiveProfiles("test")
class IssueTrackerApplicationTests {

    @Test
    fun contextLoads() {
        // Test that the Spring application context loads successfully
        // If this test passes, all beans are properly configured and wired
    }
}
