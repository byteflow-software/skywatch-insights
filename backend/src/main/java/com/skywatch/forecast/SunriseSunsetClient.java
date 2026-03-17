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
 * Sunrise-Sunset.org API client.
 * Free, no API key required. Provides sunrise, sunset, and twilight times.
 */
@Component
@Slf4j
public class SunriseSunsetClient {

    private final RestClient restClient;

    public SunriseSunsetClient() {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.sunrise-sunset.org")
                .build();
    }

    @Getter
    @Builder
    public static class SunData {
        private String sunrise;
        private String sunset;
        private String solarNoon;
        private String civilTwilightBegin;
        private String civilTwilightEnd;
        private String nauticalTwilightBegin;
        private String nauticalTwilightEnd;
        private String astronomicalTwilightBegin;
        private String astronomicalTwilightEnd;
        private String dayLength;
    }

    /**
     * Get sunrise, sunset, and all twilight times for a location.
     * Astronomical twilight is the most relevant for stargazing —
     * best observation starts after astronomical twilight ends.
     */
    public Optional<SunData> getSunData(BigDecimal latitude, BigDecimal longitude) {
        try {
            JsonNode response = restClient.get()
                    .uri("/json?lat={lat}&lng={lng}&formatted=0",
                            latitude, longitude)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !"OK".equals(response.path("status").asText(""))) {
                return Optional.empty();
            }

            JsonNode results = response.get("results");
            return Optional.of(SunData.builder()
                    .sunrise(results.path("sunrise").asText(""))
                    .sunset(results.path("sunset").asText(""))
                    .solarNoon(results.path("solar_noon").asText(""))
                    .civilTwilightBegin(results.path("civil_twilight_begin").asText(""))
                    .civilTwilightEnd(results.path("civil_twilight_end").asText(""))
                    .nauticalTwilightBegin(results.path("nautical_twilight_begin").asText(""))
                    .nauticalTwilightEnd(results.path("nautical_twilight_end").asText(""))
                    .astronomicalTwilightBegin(results.path("astronomical_twilight_begin").asText(""))
                    .astronomicalTwilightEnd(results.path("astronomical_twilight_end").asText(""))
                    .dayLength(results.path("day_length").asText(""))
                    .build());
        } catch (Exception e) {
            log.error("Failed to fetch sun data for ({}, {}): {}", latitude, longitude, e.getMessage());
            return Optional.empty();
        }
    }
}
