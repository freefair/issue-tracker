rootProject.name = "issue-tracker"

include("backend")

dependencyResolutionManagement {
    @Suppress("UnstableApiUsage")
    repositories {
        mavenCentral()
    }

    versionCatalogs {
        create("libs") {
            // Versions
            version("kotlin", "2.1.0")
            version("spring-boot", "3.4.1")
            version("spring-dependency-management", "1.1.7")
            version("jib", "3.4.4")
            version("flyway", "11.1.0")

            // Plugins
            plugin("kotlin-jvm", "org.jetbrains.kotlin.jvm").versionRef("kotlin")
            plugin("kotlin-spring", "org.jetbrains.kotlin.plugin.spring").versionRef("kotlin")
            plugin("spring-boot", "org.springframework.boot").versionRef("spring-boot")
            plugin("spring-dependency-management", "io.spring.dependency-management").versionRef("spring-dependency-management")
            plugin("jib", "com.google.cloud.tools.jib").versionRef("jib")

            // Libraries - Spring Boot
            library("spring-boot-starter-webflux", "org.springframework.boot", "spring-boot-starter-webflux").withoutVersion()
            library("spring-boot-starter-data-r2dbc", "org.springframework.boot", "spring-boot-starter-data-r2dbc").withoutVersion()
            library("spring-boot-starter-validation", "org.springframework.boot", "spring-boot-starter-validation").withoutVersion()
            library("spring-boot-starter-actuator", "org.springframework.boot", "spring-boot-starter-actuator").withoutVersion()
            library("spring-boot-starter-test", "org.springframework.boot", "spring-boot-starter-test").withoutVersion()
            library("spring-boot-devtools", "org.springframework.boot", "spring-boot-devtools").withoutVersion()

            // Libraries - Kotlin
            library("kotlin-reflect", "org.jetbrains.kotlin", "kotlin-reflect").withoutVersion()
            library("kotlin-test-junit5", "org.jetbrains.kotlin", "kotlin-test-junit5").withoutVersion()
            library("kotlinx-coroutines-core", "org.jetbrains.kotlinx", "kotlinx-coroutines-core").withoutVersion()
            library("kotlinx-coroutines-reactor", "org.jetbrains.kotlinx", "kotlinx-coroutines-reactor").withoutVersion()
            library("kotlinx-coroutines-test", "org.jetbrains.kotlinx", "kotlinx-coroutines-test").withoutVersion()

            // Libraries - Jackson
            library("jackson-module-kotlin", "com.fasterxml.jackson.module", "jackson-module-kotlin").withoutVersion()

            // Libraries - Database (R2DBC)
            library("r2dbc-postgresql", "org.postgresql", "r2dbc-postgresql").withoutVersion()
            library("r2dbc-h2", "io.r2dbc", "r2dbc-h2").withoutVersion()
            library("r2dbc-pool", "io.r2dbc", "r2dbc-pool").withoutVersion()

            // Libraries - Database (JDBC for Flyway)
            library("postgresql-jdbc", "org.postgresql", "postgresql").withoutVersion()
            library("h2-jdbc", "com.h2database", "h2").withoutVersion()
            library("flyway-core", "org.flywaydb", "flyway-core").versionRef("flyway")
            library("flyway-database-postgresql", "org.flywaydb", "flyway-database-postgresql").versionRef("flyway")

            // Libraries - Embedded PostgreSQL (no Docker required)
            library("embedded-postgres", "io.zonky.test", "embedded-postgres").version("2.1.0")

            // Bundles
            bundle("spring-boot-starters", listOf(
                "spring-boot-starter-webflux",
                "spring-boot-starter-data-r2dbc",
                "spring-boot-starter-validation",
                "spring-boot-starter-actuator"
            ))

            bundle("r2dbc-drivers", listOf(
                "r2dbc-postgresql",
                "r2dbc-h2",
                "r2dbc-pool"
            ))

            bundle("kotlin-core", listOf(
                "kotlin-reflect",
                "jackson-module-kotlin",
                "kotlinx-coroutines-core",
                "kotlinx-coroutines-reactor"
            ))
        }
    }
}
