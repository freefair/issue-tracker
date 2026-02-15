package com.issuetracker.config

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres

abstract class AbstractIntegrationTest {

    companion object {
        private val embeddedPostgres: EmbeddedPostgres by lazy {
            EmbeddedPostgres.builder()
                .setPort(0) // Use random available port
                .start()
        }

        init {
            // Start embedded PostgreSQL
            embeddedPostgres
        }

        fun getJdbcUrl(): String {
            val port = embeddedPostgres.port
            return "jdbc:postgresql://localhost:$port/postgres"
        }

        fun getR2dbcUrl(): String {
            val port = embeddedPostgres.port
            return "r2dbc:pool:postgresql://localhost:$port/postgres"
        }

        fun getUsername(): String = "postgres"

        fun getPassword(): String = "postgres"
    }
}
