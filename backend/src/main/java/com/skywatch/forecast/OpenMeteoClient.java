package com.skywatch.forecast;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Open-Meteo API client for detailed astronomical weather data.
 * Free, no API key required, provides cloud layers, dew point, and more.
 */
@Component
@Slf4j
public class OpenMeteoClient {

    private final RestClient restClient;

    public OpenMeteoClient() {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.open-meteo.com/v1")
                .build();
    }

    @Getter
    @Builder
    public static class AstroWeather {
        private int cloudLow;        // Low cloud cover (%)
        private int cloudMid;        // Mid cloud cover (%)
        private int cloudHigh;       // High cloud cover (%)
        private int cloudTotal;      // Total cloud cover (%)
        private double dewPoint;     // Dew point (°C)
        private double temperature;  // Temperature (°C)
        private int humidity;        // Relative humidity (%)
        private double windSpeed;    // Wind speed (km/h)
        private int visibility;      // Visibility (m)
        private boolean isDay;       // Is it daytime?
        private double precipitation;// Precipitation probability (%)
    }

    /**
     * Get detailed astronomical weather for a location.
     * Includes cloud cover by layer, dew point, and visibility.
     */
    public Optional<AstroWeather> getAstroWeather(BigDecimal latitude, BigDecimal longitude) {
        try {
            JsonNode response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/forecast")
                            .queryParam("latitude", latitude)
                            .queryParam("longitude", longitude)
                            .queryParam("current", "temperature_2m,relative_humidity_2m,dew_point_2m," +
                                    "cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high," +
                                    "wind_speed_10m,visibility,is_day,precipitation")
                            .queryParam("timezone", "auto")
                            .build())
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !response.has("current")) {
                return Optional.empty();
            }

            JsonNode current = response.get("current");

            return Optional.of(AstroWeather.builder()
                    .cloudTotal(current.path("cloud_cover").asInt(0))
                    .cloudLow(current.path("cloud_cover_low").asInt(0))
                    .cloudMid(current.path("cloud_cover_mid").asInt(0))
                    .cloudHigh(current.path("cloud_cover_high").asInt(0))
                    .temperature(current.path("temperature_2m").asDouble(0))
                    .humidity(current.path("relative_humidity_2m").asInt(0))
                    .dewPoint(current.path("dew_point_2m").asDouble(0))
                    .windSpeed(current.path("wind_speed_10m").asDouble(0))
                    .visibility(current.path("visibility").asInt(10000))
                    .isDay(current.path("is_day").asInt(0) == 1)
                    .precipitation(current.path("precipitation").asDouble(0))
                    .build());
        } catch (Exception e) {
            log.error("Failed to fetch Open-Meteo data for ({}, {}): {}", latitude, longitude, e.getMessage());
            return Optional.empty();
        }
    }
}
