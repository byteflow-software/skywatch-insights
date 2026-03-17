package com.skywatch.astrosync;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Component
@Slf4j
public class AstronomyApiClient {

    private final RestClient restClient;
    private final String appId;
    private final String appSecret;
    private final double observerLatitude;
    private final double observerLongitude;
    private final int observerElevation;
    private final String observerTime;

    public AstronomyApiClient(
            @Value("${app.astronomyapi.base-url}") String baseUrl,
            @Value("${app.astronomyapi.app-id:}") String appId,
            @Value("${app.astronomyapi.app-secret:}") String appSecret,
            @Value("${app.astronomyapi.observer.latitude:0.0}") double observerLatitude,
            @Value("${app.astronomyapi.observer.longitude:0.0}") double observerLongitude,
            @Value("${app.astronomyapi.observer.elevation:0}") int observerElevation,
            @Value("${app.astronomyapi.observer.time:12:00:00}") String observerTime) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.appId = appId;
        this.appSecret = appSecret;
        this.observerLatitude = observerLatitude;
        this.observerLongitude = observerLongitude;
        this.observerElevation = observerElevation;
        this.observerTime = observerTime;
    }

    public List<BodyPosition> fetchAllBodyPositions(LocalDate from, LocalDate to) {
        if (!isConfigured()) {
            log.warn("AstronomyAPI credentials not configured - skipping orbital sync");
            return List.of();
        }

        try {
            JsonNode response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v2/bodies/positions")
                            .queryParam("latitude", observerLatitude)
                            .queryParam("longitude", observerLongitude)
                            .queryParam("elevation", observerElevation)
                            .queryParam("from_date", from.format(DateTimeFormatter.ISO_DATE))
                            .queryParam("to_date", to.format(DateTimeFormatter.ISO_DATE))
                            .queryParam("time", observerTime)
                            .build())
                    .header(HttpHeaders.AUTHORIZATION, basicAuthHeader())
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null) {
                return List.of();
            }

            JsonNode rows = response.path("data").path("table").path("rows");
            if (!rows.isArray()) {
                return List.of();
            }

            List<BodyPosition> positions = new ArrayList<>();
            for (JsonNode row : rows) {
                String bodyId = row.path("entry").path("id").asText("");
                if (bodyId.isBlank()) {
                    continue;
                }

                JsonNode cells = row.path("cells");
                if (!cells.isArray()) {
                    continue;
                }

                for (JsonNode cell : cells) {
                    String dateRaw = cell.path("date").asText("");
                    Instant instant = parseDate(dateRaw);
                    if (instant == null) {
                        continue;
                    }

                    Double elongation = asDouble(cell.path("extraInfo").path("elongation"));
                    Double distanceKm = asDouble(cell.path("distance").path("fromEarth").path("km"));
                    Double phaseFraction = asDouble(cell.path("extraInfo").path("phase").path("fraction"));
                    String phaseName = cell.path("extraInfo").path("phase").path("string").asText("");
                    String constellation = cell.path("position").path("constellation").path("name").asText("");

                    positions.add(new BodyPosition(
                            bodyId,
                            instant,
                            elongation,
                            distanceKm,
                            phaseFraction,
                            phaseName,
                            constellation));
                }
            }

            log.info("Fetched {} body positions from AstronomyAPI for {} to {}", positions.size(), from, to);
            return positions;
        } catch (Exception e) {
            log.error("Failed to fetch AstronomyAPI body positions: {}", e.getMessage());
            return List.of();
        }
    }

    private boolean isConfigured() {
        return appId != null && !appId.isBlank() && appSecret != null && !appSecret.isBlank();
    }

    private String basicAuthHeader() {
        String token = appId + ":" + appSecret;
        String encoded = Base64.getEncoder().encodeToString(token.getBytes(StandardCharsets.UTF_8));
        return "Basic " + encoded;
    }

    private Instant parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return Instant.parse(value);
        } catch (DateTimeParseException ignored) {
        }

        try {
            return OffsetDateTime.parse(value).toInstant();
        } catch (DateTimeParseException ignored) {
        }

        try {
            return LocalDateTime.parse(value, DateTimeFormatter.ISO_DATE_TIME).toInstant(ZoneOffset.UTC);
        } catch (DateTimeParseException ignored) {
        }

        return null;
    }

    private Double asDouble(JsonNode node) {
        if (node == null || node.isNull() || node.isMissingNode()) {
            return null;
        }
        if (node.isNumber()) {
            return node.asDouble();
        }
        String raw = node.asText("").trim();
        if (raw.isEmpty()) {
            return null;
        }
        try {
            return Double.parseDouble(raw);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public record BodyPosition(
            String bodyId,
            Instant instant,
            Double elongation,
            Double distanceKm,
            Double phaseFraction,
            String phaseName,
            String constellation
    ) {}
}