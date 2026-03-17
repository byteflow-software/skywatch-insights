package com.skywatch.forecast;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

@Component
@Slf4j
public class WeatherApiClient {

    private final RestClient restClient;
    private final String apiKey;

    public WeatherApiClient(
            @Value("${app.weather.base-url}") String baseUrl,
            @Value("${app.weather.api-key}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    /**
     * Get weather forecast for a location at a specific time.
     * Uses the 5-day/3-hour forecast endpoint and finds the closest time slot.
     */
    public Optional<WeatherData> getForecast(BigDecimal latitude, BigDecimal longitude, Instant targetTime) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Weather API key not configured, skipping weather data fetch");
            return Optional.empty();
        }

        try {
            JsonNode response = restClient.get()
                    .uri("/forecast?lat={lat}&lon={lon}&appid={key}&units=metric&lang=pt_br",
                            latitude, longitude, apiKey)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !response.has("list")) {
                log.warn("Empty response from OpenWeatherMap API");
                return Optional.empty();
            }

            // Find the forecast entry closest to the target time
            JsonNode bestEntry = null;
            long bestDiff = Long.MAX_VALUE;

            for (JsonNode entry : response.get("list")) {
                long entryTime = entry.get("dt").asLong();
                long diff = Math.abs(entryTime - targetTime.getEpochSecond());
                if (diff < bestDiff) {
                    bestDiff = diff;
                    bestEntry = entry;
                }
            }

            if (bestEntry == null) {
                return Optional.empty();
            }

            return Optional.of(parseWeatherEntry(bestEntry));

        } catch (Exception e) {
            log.error("Failed to fetch weather data for ({}, {}): {}", latitude, longitude, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Get current weather for a location.
     */
    public Optional<WeatherData> getCurrentWeather(BigDecimal latitude, BigDecimal longitude) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Weather API key not configured, skipping weather data fetch");
            return Optional.empty();
        }

        try {
            JsonNode response = restClient.get()
                    .uri("/weather?lat={lat}&lon={lon}&appid={key}&units=metric&lang=pt_br",
                            latitude, longitude, apiKey)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null) {
                return Optional.empty();
            }

            return Optional.of(parseCurrentWeather(response));

        } catch (Exception e) {
            log.error("Failed to fetch current weather for ({}, {}): {}", latitude, longitude, e.getMessage());
            return Optional.empty();
        }
    }

    private WeatherData parseWeatherEntry(JsonNode entry) {
        JsonNode main = entry.get("main");
        JsonNode clouds = entry.get("clouds");
        JsonNode weather = entry.has("weather") && entry.get("weather").isArray()
                ? entry.get("weather").get(0) : null;

        return WeatherData.builder()
                .cloudCoverage(clouds != null ? clouds.get("all").asInt(0) : 0)
                .humidity(main != null ? main.get("humidity").asInt(0) : 0)
                .visibility(entry.has("visibility") ? entry.get("visibility").asInt(10000) : 10000)
                .temperature(main != null ? main.get("temp").asDouble(0) : 0)
                .description(weather != null ? weather.get("description").asText("") : "")
                .icon(weather != null ? weather.get("icon").asText("") : "")
                .build();
    }

    private WeatherData parseCurrentWeather(JsonNode response) {
        JsonNode main = response.get("main");
        JsonNode clouds = response.get("clouds");
        JsonNode weather = response.has("weather") && response.get("weather").isArray()
                ? response.get("weather").get(0) : null;

        return WeatherData.builder()
                .cloudCoverage(clouds != null ? clouds.get("all").asInt(0) : 0)
                .humidity(main != null ? main.get("humidity").asInt(0) : 0)
                .visibility(response.has("visibility") ? response.get("visibility").asInt(10000) : 10000)
                .temperature(main != null ? main.get("temp").asDouble(0) : 0)
                .description(weather != null ? weather.get("description").asText("") : "")
                .icon(weather != null ? weather.get("icon").asText("") : "")
                .build();
    }
}
