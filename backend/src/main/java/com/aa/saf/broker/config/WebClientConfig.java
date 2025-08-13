package com.aa.saf.broker.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient(WebClient.Builder builder) {
        HttpClient httpClient = HttpClient.create()
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 2000) // 2 second connect timeout
            .responseTimeout(Duration.ofSeconds(3)) // 3 second response timeout
            .doOnConnected(conn -> 
                conn.addHandlerLast(new ReadTimeoutHandler(3, TimeUnit.SECONDS))
                    .addHandlerLast(new WriteTimeoutHandler(3, TimeUnit.SECONDS)));

        return builder
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .build();
    }
}
