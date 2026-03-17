package com.skywatch.export;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skywatch.config.VercelBlobConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class VercelBlobStorageService {

    private final VercelBlobConfig blobConfig;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public Optional<String> upload(String pathname, byte[] content, String contentType) {
        if (blobConfig.getToken() == null || blobConfig.getToken().isBlank()) {
            return Optional.empty();
        }

        try {
            String baseUrl = blobConfig.getApiUrl() != null && !blobConfig.getApiUrl().isBlank()
                    ? blobConfig.getApiUrl()
                    : "https://blob.vercel-storage.com";

            URI uri = URI.create(baseUrl + "/" + pathname);
            HttpRequest request = HttpRequest.newBuilder(uri)
                    .header("Authorization", "Bearer " + blobConfig.getToken())
                    .header("Content-Type", contentType)
                    .header("x-content-type", contentType)
                    .header("x-add-random-suffix", "1")
                    .PUT(HttpRequest.BodyPublishers.ofByteArray(content))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("Blob upload failed with status {} for path {}", response.statusCode(), pathname);
                return Optional.empty();
            }

            JsonNode payload = objectMapper.readTree(response.body());
            JsonNode urlNode = payload.get("url");
            if (urlNode != null && !urlNode.asText().isBlank()) {
                return Optional.of(urlNode.asText());
            }

            JsonNode pathNode = payload.get("pathname");
            if (pathNode != null && blobConfig.getPublicBaseUrl() != null && !blobConfig.getPublicBaseUrl().isBlank()) {
                return Optional.of(blobConfig.getPublicBaseUrl().replaceAll("/+$", "") + "/" + pathNode.asText());
            }
        } catch (Exception ex) {
            log.warn("Blob upload error for {}: {}", pathname, ex.getMessage());
        }

        return Optional.empty();
    }
}
