package com.issuetracker.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.http.codec.ServerCodecConfigurer
import org.springframework.http.codec.json.Jackson2JsonDecoder
import org.springframework.http.codec.json.Jackson2JsonEncoder
import org.springframework.web.reactive.config.WebFluxConfigurer

@Configuration
class JacksonConfig : WebFluxConfigurer {

    @Bean
    @Primary
    fun objectMapper(): ObjectMapper {
        return ObjectMapper().apply {
            // Register Kotlin module for proper Kotlin data class support
            registerKotlinModule()
            // Register JavaTimeModule for proper Instant/LocalDateTime serialization
            registerModule(JavaTimeModule())
            // Serialize dates as ISO-8601 strings, not timestamps
            disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        }
    }

    override fun configureHttpMessageCodecs(configurer: ServerCodecConfigurer) {
        val mapper = objectMapper()
        configurer.defaultCodecs().jackson2JsonEncoder(Jackson2JsonEncoder(mapper))
        configurer.defaultCodecs().jackson2JsonDecoder(Jackson2JsonDecoder(mapper))
    }
}
