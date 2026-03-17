package com.skywatch.event;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@Slf4j
public class NasaApiClient {

    private final RestClient restClient;
    private final String apiKey;

    public NasaApiClient(
            @Value("${app.nasa.base-url}") String baseUrl,
            @Value("${app.nasa.api-key}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    /**
     * Get Astronomy Picture of the Day.
     * Useful for event imagery and educational content.
     */
    public Optional<ApodData> getApod() {
        return getApod(null);
    }

    public Optional<ApodData> getApod(LocalDate date) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("NASA API key not configured");
            return Optional.empty();
        }

        try {
            String uri = date != null
                    ? "/planetary/apod?api_key={key}&date={date}"
                    : "/planetary/apod?api_key={key}";

            JsonNode response = date != null
                    ? restClient.get().uri(uri, apiKey, date.format(DateTimeFormatter.ISO_DATE))
                        .retrieve().body(JsonNode.class)
                    : restClient.get().uri(uri, apiKey)
                        .retrieve().body(JsonNode.class);

            if (response == null) return Optional.empty();

            return Optional.of(ApodData.builder()
                    .title(response.path("title").asText(""))
                    .explanation(response.path("explanation").asText(""))
                    .url(response.path("url").asText(""))
                    .hdUrl(response.path("hdurl").asText(null))
                    .mediaType(response.path("media_type").asText("image"))
                    .date(response.path("date").asText(""))
                    .build());

        } catch (Exception e) {
            log.error("Failed to fetch APOD: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Get solar flare events from DONKI (Space Weather Database).
     */
    public List<DonkiEvent> getSolarFlares(LocalDate startDate, LocalDate endDate) {
        return getDonkiEvents("FLR", startDate, endDate);
    }

    /**
     * Get geomagnetic storm events from DONKI.
     */
    public List<DonkiEvent> getGeomagneticStorms(LocalDate startDate, LocalDate endDate) {
        return getDonkiEvents("GST", startDate, endDate);
    }

    /**
     * Get coronal mass ejection events from DONKI.
     */
    public List<DonkiEvent> getCoronalMassEjections(LocalDate startDate, LocalDate endDate) {
        return getDonkiEvents("CME", startDate, endDate);
    }

    private List<DonkiEvent> getDonkiEvents(String type, LocalDate startDate, LocalDate endDate) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("NASA API key not configured");
            return List.of();
        }

        try {
            String start = startDate.format(DateTimeFormatter.ISO_DATE);
            String end = endDate.format(DateTimeFormatter.ISO_DATE);

            JsonNode response = restClient.get()
                    .uri("/DONKI/{type}?startDate={start}&endDate={end}&api_key={key}",
                            type, start, end, apiKey)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !response.isArray()) return List.of();

            List<DonkiEvent> events = new ArrayList<>();
            for (JsonNode node : response) {
                events.add(DonkiEvent.builder()
                        .id(node.path(type.equals("FLR") ? "flrID" :
                                type.equals("GST") ? "gstID" : "activityID").asText(""))
                        .type(type)
                        .startTime(node.path(type.equals("FLR") ? "beginTime" :
                                type.equals("GST") ? "startTime" : "startTime").asText(""))
                        .endTime(node.path(type.equals("FLR") ? "endTime" :
                                type.equals("GST") ? "startTime" : "startTime").asText(""))
                        .note(node.path(type.equals("FLR") ? "note" :
                                type.equals("GST") ? "link" : "note").asText(""))
                        .link(node.path("link").asText(""))
                        .build());
            }

            log.info("Fetched {} DONKI {} events from {} to {}", events.size(), type, start, end);
            return events;

        } catch (Exception e) {
            log.error("Failed to fetch DONKI {} events: {}", type, e.getMessage());
            return List.of();
        }
    }

    /**
     * Get Near Earth Objects for a date range.
     */
    public List<NeoData> getNearEarthObjects(LocalDate startDate, LocalDate endDate) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("NASA API key not configured");
            return List.of();
        }

        try {
            String start = startDate.format(DateTimeFormatter.ISO_DATE);
            String end = endDate.format(DateTimeFormatter.ISO_DATE);

            JsonNode response = restClient.get()
                    .uri("/neo/rest/v1/feed?start_date={start}&end_date={end}&api_key={key}",
                            start, end, apiKey)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !response.has("near_earth_objects")) return List.of();

            List<NeoData> neos = new ArrayList<>();
            JsonNode neosByDate = response.get("near_earth_objects");
            neosByDate.fields().forEachRemaining(entry -> {
                for (JsonNode neo : entry.getValue()) {
                    boolean hazardous = neo.path("is_potentially_hazardous_asteroid").asBoolean(false);
                    double minDiameter = neo.path("estimated_diameter").path("meters")
                            .path("estimated_diameter_min").asDouble(0);
                    double maxDiameter = neo.path("estimated_diameter").path("meters")
                            .path("estimated_diameter_max").asDouble(0);

                    JsonNode closeApproach = neo.path("close_approach_data").get(0);
                    String approachDate = closeApproach != null
                            ? closeApproach.path("close_approach_date_full").asText("") : "";
                    String missDistance = closeApproach != null
                            ? closeApproach.path("miss_distance").path("kilometers").asText("") : "";
                    String velocity = closeApproach != null
                            ? closeApproach.path("relative_velocity").path("kilometers_per_hour").asText("") : "";

                    neos.add(NeoData.builder()
                            .name(neo.path("name").asText(""))
                            .nasaId(neo.path("id").asText(""))
                            .isPotentiallyHazardous(hazardous)
                            .estimatedDiameterMin(minDiameter)
                            .estimatedDiameterMax(maxDiameter)
                            .closeApproachDate(approachDate)
                            .missDistanceKm(missDistance)
                            .relativeVelocityKmH(velocity)
                            .build());
                }
            });

            log.info("Fetched {} Near Earth Objects from {} to {}", neos.size(), start, end);
            return neos;

        } catch (Exception e) {
            log.error("Failed to fetch NEO data: {}", e.getMessage());
            return List.of();
        }
    }

    // ---- DTOs ----

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ApodData {
        private String title;
        private String explanation;
        private String url;
        private String hdUrl;
        private String mediaType;
        private String date;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class DonkiEvent {
        private String id;
        private String type;
        private String startTime;
        private String endTime;
        private String note;
        private String link;
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class NeoData {
        private String name;
        private String nasaId;
        private boolean isPotentiallyHazardous;
        private double estimatedDiameterMin;
        private double estimatedDiameterMax;
        private String closeApproachDate;
        private String missDistanceKm;
        private String relativeVelocityKmH;
    }
}
