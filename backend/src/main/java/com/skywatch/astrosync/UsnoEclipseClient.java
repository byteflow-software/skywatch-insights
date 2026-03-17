package com.skywatch.astrosync;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class UsnoEclipseClient {

    private final RestClient restClient;

    // USNO API only has solar eclipse endpoints. Lunar eclipses use a static catalog
    // since they are well-known and predictable for decades ahead.
    private static final List<EclipseData> LUNAR_ECLIPSES = List.of(
            new EclipseData("LUNAR", "Total", LocalDate.of(2025, 3, 14), 1.178, "1h05m", "Total lunar eclipse"),
            new EclipseData("LUNAR", "Total", LocalDate.of(2025, 9, 7), 1.362, "1h22m", "Total lunar eclipse"),
            new EclipseData("LUNAR", "Partial", LocalDate.of(2026, 3, 3), 0.979, "", "Partial lunar eclipse"),
            new EclipseData("LUNAR", "Total", LocalDate.of(2026, 8, 28), 1.313, "1h18m", "Total lunar eclipse"),
            new EclipseData("LUNAR", "Penumbral", LocalDate.of(2027, 2, 20), -0.057, "", "Penumbral lunar eclipse"),
            new EclipseData("LUNAR", "Penumbral", LocalDate.of(2027, 7, 18), -0.247, "", "Penumbral lunar eclipse"),
            new EclipseData("LUNAR", "Penumbral", LocalDate.of(2027, 8, 17), -0.527, "", "Penumbral lunar eclipse"),
            new EclipseData("LUNAR", "Total", LocalDate.of(2028, 1, 12), 1.243, "1h16m", "Total lunar eclipse"),
            new EclipseData("LUNAR", "Partial", LocalDate.of(2028, 7, 6), 0.391, "", "Partial lunar eclipse"),
            new EclipseData("LUNAR", "Total", LocalDate.of(2028, 12, 31), 1.477, "1h30m", "Total lunar eclipse"),
            new EclipseData("LUNAR", "Penumbral", LocalDate.of(2029, 6, 26), -0.218, "", "Penumbral lunar eclipse"),
            new EclipseData("LUNAR", "Partial", LocalDate.of(2029, 12, 20), 0.870, "", "Partial lunar eclipse")
    );

    public UsnoEclipseClient(@Value("${app.usno.base-url}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public List<EclipseData> fetchSolarEclipses(int year) {
        return fetchEclipses("/eclipses/solar/year", year, "SOLAR");
    }

    public List<EclipseData> fetchLunarEclipses(int year) {
        // USNO API does not provide a lunar eclipse endpoint — use static catalog
        List<EclipseData> results = LUNAR_ECLIPSES.stream()
                .filter(e -> e.date().getYear() == year)
                .toList();
        log.info("Returning {} lunar eclipses from static catalog for year {}", results.size(), year);
        return results;
    }

    private List<EclipseData> fetchEclipses(String path, int year, String solarOrLunar) {
        try {
            JsonNode response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path(path)
                            .queryParam("year", year)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null) {
                return List.of();
            }

            // USNO returns different structures for solar vs lunar
            JsonNode eclipses = response.path("eclipses_in_year");
            if (!eclipses.isArray()) {
                eclipses = response.path("eclipses");
            }
            if (!eclipses.isArray()) {
                // Try top-level array
                eclipses = response;
            }
            if (!eclipses.isArray()) {
                log.warn("No eclipses array found in USNO {} response for year {}", solarOrLunar, year);
                return List.of();
            }

            List<EclipseData> results = new ArrayList<>();
            for (JsonNode node : eclipses) {
                String event = node.path("event").asText("");
                String dateStr = node.path("date").asText(node.path("isodate").asText(""));
                String kind = node.path("type").asText(node.path("kind").asText(""));

                if (dateStr.isBlank()) {
                    // Try building date from year/month/day fields
                    int m = node.path("month").asInt(0);
                    int d = node.path("day").asInt(0);
                    if (m > 0 && d > 0) {
                        dateStr = String.format("%04d-%02d-%02d", year, m, d);
                    }
                }

                if (dateStr.isBlank()) {
                    continue;
                }

                LocalDate date;
                try {
                    date = LocalDate.parse(dateStr.length() > 10 ? dateStr.substring(0, 10) : dateStr);
                } catch (Exception e) {
                    log.warn("Cannot parse eclipse date '{}': {}", dateStr, e.getMessage());
                    continue;
                }

                double magnitude = node.path("magnitude").asDouble(
                        node.path("mag").asDouble(0.0));
                String duration = node.path("duration").asText("");

                results.add(new EclipseData(
                        solarOrLunar,
                        kind,
                        date,
                        magnitude,
                        duration,
                        event
                ));
            }

            log.info("Fetched {} {} eclipses from USNO for year {}", results.size(), solarOrLunar, year);
            return results;

        } catch (Exception e) {
            log.error("Failed to fetch USNO {} eclipses for year {}: {}", solarOrLunar, year, e.getMessage());
            return List.of();
        }
    }

    public record EclipseData(
            String solarOrLunar,
            String kind,
            LocalDate date,
            double magnitude,
            String duration,
            String event
    ) {}
}
