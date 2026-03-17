package com.skywatch.astrosync;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class NoaaKpClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public NoaaKpClient(
            @Value("${app.noaa.base-url:https://services.swpc.noaa.gov}") String baseUrl,
            ObjectMapper objectMapper) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.objectMapper = objectMapper;
    }

    /**
     * Fetches NOAA SWPC Kp index forecast (3-day forecast in 3-hour windows).
     * Response is a JSON array of arrays: [["time_tag", "Kp", "observed", "noaa_scale"], ...]
     * First row is header.
     */
    public List<KpForecastEntry> fetchKpForecast() {
        try {
            String body = restClient.get()
                    .uri("/products/noaa-planetary-k-index-forecast.json")
                    .retrieve()
                    .body(String.class);

            if (body == null || body.isBlank()) {
                return List.of();
            }

            JsonNode root = objectMapper.readTree(body);
            if (!root.isArray() || root.size() < 2) {
                return List.of();
            }

            List<KpForecastEntry> entries = new ArrayList<>();
            // Skip header row (index 0)
            for (int i = 1; i < root.size(); i++) {
                JsonNode row = root.get(i);
                if (!row.isArray() || row.size() < 2) {
                    continue;
                }

                String timeTag = row.get(0).asText("");
                String kpStr = row.get(1).asText("");
                String observed = row.size() > 2 ? row.get(2).asText("") : "";
                String noaaScale = row.size() > 3 ? row.get(3).asText("") : "";

                if (timeTag.isBlank() || kpStr.isBlank()) {
                    continue;
                }

                Instant timestamp = parseTimestamp(timeTag);
                if (timestamp == null) {
                    continue;
                }

                double kpValue;
                try {
                    kpValue = Double.parseDouble(kpStr);
                } catch (NumberFormatException e) {
                    continue;
                }

                // Only include forecast entries (not observed ones)
                boolean isObserved = "observed".equalsIgnoreCase(observed);

                entries.add(new KpForecastEntry(timestamp, kpValue, isObserved, noaaScale));
            }

            log.info("Fetched {} Kp forecast entries from NOAA SWPC", entries.size());
            return entries;

        } catch (Exception e) {
            log.error("Failed to fetch NOAA Kp forecast: {}", e.getMessage());
            return List.of();
        }
    }

    private Instant parseTimestamp(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Instant.parse(value);
        } catch (DateTimeParseException ignored) {
        }
        try {
            return LocalDateTime.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"))
                    .toInstant(ZoneOffset.UTC);
        } catch (DateTimeParseException ignored) {
        }
        try {
            return LocalDateTime.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                    .toInstant(ZoneOffset.UTC);
        } catch (DateTimeParseException ignored) {
        }
        log.warn("Cannot parse NOAA timestamp: {}", value);
        return null;
    }

    public record KpForecastEntry(
            Instant timestamp,
            double kpValue,
            boolean observed,
            String noaaScale
    ) {}
}
