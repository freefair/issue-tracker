plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.spring)
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
    alias(libs.plugins.jib)
}

dependencies {
    // Spring Boot Reactive (using bundle)
    implementation(libs.bundles.spring.boot.starters)

    // Kotlin (using bundle)
    implementation(libs.bundles.kotlin.core)

    // R2DBC Database Drivers (using bundle)
    runtimeOnly(libs.bundles.r2dbc.drivers)

    // Development
    developmentOnly(libs.spring.boot.devtools)

    // Testing
    testImplementation(libs.spring.boot.starter.test)
    testImplementation(libs.kotlin.test.junit5)
    testImplementation("io.projectreactor:reactor-test")
}

jib {
    from {
        image = "eclipse-temurin:21-jre-alpine"
    }
    to {
        image = "issue-tracker"
        tags = setOf("latest", project.version.toString())
    }
    container {
        jvmFlags = listOf(
            "-Xms512m",
            "-Xmx512m",
            "-Dspring.profiles.active=prod"
        )
        ports = listOf("8080")
        environment = mapOf(
            "SPRING_PROFILES_ACTIVE" to "prod"
        )
        creationTime.set("USE_CURRENT_TIMESTAMP")
    }
}
