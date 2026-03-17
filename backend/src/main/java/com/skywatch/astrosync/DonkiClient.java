package com.skywatch.astrosync;

import com.fasterxml.jackson.databind.JsonNode;
import com.skywatch.event.EventType;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class DonkiClient {

    private final RestClient restClient;
    private final String apiKey;

    public DonkiClient(
            @Value("${app.nasa.base-url}") String baseUrl,
            @Value("${app.nasa.api-key}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl + "/DONKI")
                .build();
    }

    public List<DonkiEventData> fetchSolarFlares(LocalDate from, LocalDate to) {
        if (!hasApiKey()) return List.of();
        try {
            JsonNode response = fetch("/FLR", from, to);
            if (response == null || !response.isArray()) return List.of();

            List<DonkiEventData> events = new ArrayList<>();
            for (JsonNode node : response) {
                String externalId = node.path("flrID").asText("");
                String startTime = node.path("beginTime").asText("");
                if (externalId.isBlank() || startTime.isBlank()) {
                    log.warn("Skipping malformed DONKI FLR payload: missing flrID/beginTime");
                    continue;
                }

                String classType = node.path("classType").asText("");
                events.add(DonkiEventData.builder()
                        .externalId(externalId)
                        .eventType(EventType.SOLAR_FLARE)
                        .startTime(startTime)
                        .peakTime(node.path("peakTime").asText(""))
                        .endTime(node.path("endTime").asText(""))
                        .classType(classType)
                        .note(node.path("note").asText(""))
                        .link(node.path("link").asText(""))
                        .build());
            }
            log.info("Fetched {} solar flares from {} to {}", events.size(), from, to);
            return events;
        } catch (Exception e) {
            log.error("Failed to fetch solar flares: {}", e.getMessage());
            return List.of();
        }
    }

    public List<DonkiEventData> fetchCMEs(LocalDate from, LocalDate to) {
        if (!hasApiKey()) return List.of();
        try {
            JsonNode response = fetch("/CME", from, to);
            if (response == null || !response.isArray()) return List.of();

            List<DonkiEventData> events = new ArrayList<>();
            for (JsonNode node : response) {
                String externalId = node.path("activityID").asText("");
                String startTime = node.path("startTime").asText("");
                if (externalId.isBlank() || startTime.isBlank()) {
                    log.warn("Skipping malformed DONKI CME payload: missing activityID/startTime");
                    continue;
                }

                Double speed = extractCmeSpeed(node);
                events.add(DonkiEventData.builder()
                        .externalId(externalId)
                        .eventType(EventType.CME)
                        .startTime(startTime)
                        .endTime(startTime)
                        .cmeSpeed(speed)
                        .note(node.path("note").asText(""))
                        .link(node.path("link").asText(""))
                        .build());
            }
            log.info("Fetched {} CMEs from {} to {}", events.size(), from, to);
            return events;
        } catch (Exception e) {
            log.error("Failed to fetch CMEs: {}", e.getMessage());
            return List.of();
        }
    }

    public List<DonkiEventData> fetchGeomagneticStorms(LocalDate from, LocalDate to) {
        if (!hasApiKey()) return List.of();
        try {
            JsonNode response = fetch("/GST", from, to);
            if (response == null || !response.isArray()) return List.of();

            List<DonkiEventData> events = new ArrayList<>();
            for (JsonNode node : response) {
                String externalId = node.path("gstID").asText("");
                String startTime = node.path("startTime").asText("");
                if (externalId.isBlank() || startTime.isBlank()) {
                    log.warn("Skipping malformed DONKI GST payload: missing gstID/startTime");
                    continue;
                }

                Double kpIndex = extractMaxKpIndex(node);
                events.add(DonkiEventData.builder()
                        .externalId(externalId)
                        .eventType(EventType.GEOMAGNETIC_STORM)
                        .startTime(startTime)
                        .endTime(startTime)
                        .kpIndex(kpIndex)
                        .note(node.path("note").asText(""))
                        .link(node.path("link").asText(""))
                        .build());
            }
            log.info("Fetched {} geomagnetic storms from {} to {}", events.size(), from, to);
            return events;
        } catch (Exception e) {
            log.error("Failed to fetch geomagnetic storms: {}", e.getMessage());
            return List.of();
        }
    }

    private JsonNode fetch(String endpoint, LocalDate from, LocalDate to) {
        String start = from.format(DateTimeFormatter.ISO_DATE);
        String end = to.format(DateTimeFormatter.ISO_DATE);
        return restClient.get()
                .uri("{endpoint}?startDate={start}&endDate={end}&api_key={key}",
                        endpoint, start, end, apiKey)
                .retrieve()
                .body(JsonNode.class);
    }

    private boolean hasApiKey() {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("NASA API key not configured — skipping DONKI fetch");
            return false;
        }
        return true;
    }

    private Double extractCmeSpeed(JsonNode node) {
        JsonNode analyses = node.path("cmeAnalyses");
        if (analyses.isArray() && !analyses.isEmpty()) {
            return analyses.get(0).path("speed").asDouble(0);
        }
        return null;
    }

    private Double extractMaxKpIndex(JsonNode node) {
        JsonNode kpArray = node.path("allKpIndex");
        if (!kpArray.isArray() || kpArray.isEmpty()) return null;
        double max = 0;
        for (JsonNode kp : kpArray) {
            double val = kp.path("kpIndex").asDouble(0);
            if (val > max) max = val;
        }
        return max > 0 ? max : null;
    }

    @Builder
    public record DonkiEventData(
            String externalId,
            EventType eventType,
            String startTime,
            String peakTime,
            String endTime,
            String classType,
            Double kpIndex,
            Double cmeSpeed,
            String note,
            String link
    ) {}
}
