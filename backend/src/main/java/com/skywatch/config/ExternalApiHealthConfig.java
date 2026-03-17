package com.skywatch.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;

@Configuration
@Slf4j
public class ExternalApiHealthConfig {

    @Bean("nasaDonki")
    HealthIndicator nasaDonkiHealthIndicator(
            @Value("${app.nasa.base-url}") String nasaBaseUrl,
            @Value("${app.nasa.api-key:}") String apiKey
    ) {
        return () -> {
            if (apiKey == null || apiKey.isBlank()) {
                return Health.unknown()
                        .withDetail("reason", "NASA_API_KEY not configured")
                        .build();
            }

            try {
                String today = LocalDate.now().toString();
                RestClient restClient = RestClient.builder().baseUrl(nasaBaseUrl).build();
                restClient.get()
                        .uri("/DONKI/FLR?startDate={start}&endDate={end}&api_key={key}", today, today, apiKey)
                        .retrieve()
                        .toBodilessEntity();

                return Health.up().withDetail("provider", "NASA DONKI").build();
            } catch (Exception e) {
                log.warn("DONKI health check failed: {}", e.getMessage());
                return Health.down(e).withDetail("provider", "NASA DONKI").build();
            }
        };
    }

    @Bean("nasaApod")
    HealthIndicator nasaApodHealthIndicator(
            @Value("${app.nasa.base-url}") String nasaBaseUrl,
            @Value("${app.nasa.api-key:}") String apiKey
    ) {
        return () -> {
            if (apiKey == null || apiKey.isBlank()) {
                return Health.unknown()
                        .withDetail("reason", "NASA_API_KEY not configured")
                        .build();
            }

            try {
                RestClient restClient = RestClient.builder().baseUrl(nasaBaseUrl).build();
                restClient.get()
                        .uri("/planetary/apod?api_key={key}", apiKey)
                        .retrieve()
                        .toBodilessEntity();

                return Health.up().withDetail("provider", "NASA APOD").build();
            } catch (Exception e) {
                log.warn("APOD health check failed: {}", e.getMessage());
                return Health.down(e).withDetail("provider", "NASA APOD").build();
            }
        };
    }

    @Bean("usnoApi")
    HealthIndicator usnoApiHealthIndicator(@Value("${app.usno.base-url}") String usnoBaseUrl) {
        return () -> {
            try {
                String today = LocalDate.now().toString();
                RestClient restClient = RestClient.builder().baseUrl(usnoBaseUrl).build();
                restClient.get()
                        .uri("/rstt/oneday?date={date}&coords={coords}&tz={tz}", today, "-23.5505,-46.6333", -3)
                        .retrieve()
                        .toBodilessEntity();

                return Health.up().withDetail("provider", "USNO").build();
            } catch (Exception e) {
                log.warn("USNO health check failed: {}", e.getMessage());
                return Health.down(e).withDetail("provider", "USNO").build();
            }
        };
    }
}
