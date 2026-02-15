package com.issuetracker.web

import org.springframework.core.io.ClassPathResource
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.core.io.buffer.DataBuffer
import org.springframework.core.io.buffer.DataBufferUtils
import org.springframework.core.io.buffer.DefaultDataBufferFactory
import reactor.core.publisher.Flux

@RestController
class IndexController {

    @GetMapping("/", produces = [MediaType.TEXT_HTML_VALUE])
    fun index(): Flux<DataBuffer> {
        val resource = ClassPathResource("static/index.html")
        val bufferFactory = DefaultDataBufferFactory()
        return DataBufferUtils.read(resource, bufferFactory, 4096)
    }
}
