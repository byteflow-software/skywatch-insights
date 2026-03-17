package com.skywatch.highlight;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Optional;

@Component
@Slf4j
public class ApodClient {

    private final RestClient restClient;
    private final String apiKey;

    public ApodClient(
            @Value("${app.nasa.base-url}") String baseUrl,
            @Value("${app.nasa.api-key}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public Optional<ApodData> fetchToday() {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("NASA API key not configured — skipping APOD fetch");
            return Optional.empty();
        }

        try {
            JsonNode response = restClient.get()
                    .uri("/planetary/apod?api_key={key}", apiKey)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null) return Optional.empty();

            String date = response.path("date").asText("");
            String title = response.path("title").asText("");
            String explanation = response.path("explanation").asText("");
            String imageUrl = response.path("url").asText("");
            String mediaType = response.path("media_type").asText("image");

            if (date.isBlank() || title.isBlank() || explanation.isBlank() || imageUrl.isBlank()) {
                log.warn("Skipping malformed APOD payload: missing required fields");
                return Optional.empty();
            }

            try {
                LocalDate.parse(date);
            } catch (DateTimeParseException e) {
                log.warn("Skipping malformed APOD payload: invalid date {}", date);
                return Optional.empty();
            }

            return Optional.of(ApodData.builder()
                    .date(date)
                    .title(title)
                    .explanation(explanation)
                    .imageUrl(imageUrl)
                    .hdImageUrl(response.path("hdurl").asText(null))
                    .mediaType(mediaType)
                    .copyright(response.path("copyright").asText(null))
                    .build());

        } catch (Exception e) {
            log.error("Failed to fetch APOD: {}", e.getMessage());
            return Optional.empty();
        }
    }

    @Builder
    public record ApodData(
            String date,
            String title,
            String explanation,
            String imageUrl,
            String hdImageUrl,
            String mediaType,
            String copyright
    ) {}
}
