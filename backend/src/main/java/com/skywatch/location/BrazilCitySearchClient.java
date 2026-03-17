package com.skywatch.location;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Combines ViaCEP (for CEP lookup) and Nominatim/OpenStreetMap (for city name search with geocoding).
 * Both APIs are free and require no API keys.
 */
@Component
@Slf4j
public class BrazilCitySearchClient {

    private final RestClient viaCepClient;
    private final RestClient nominatimClient;

    public BrazilCitySearchClient() {
        this.viaCepClient = RestClient.builder()
                .baseUrl("https://viacep.com.br/ws")
                .build();
        this.nominatimClient = RestClient.builder()
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader("User-Agent", "SkyWatch-Insights/1.0")
                .build();
    }

    public record CityResult(
            String name,
            String state,
            BigDecimal latitude,
            BigDecimal longitude,
            String displayName
    ) {}

    /**
     * Search by CEP. Returns the city name and coordinates.
     */
    public Optional<CityResult> searchByCep(String cep) {
        try {
            String cleanCep = cep.replaceAll("[^0-9]", "");
            if (cleanCep.length() != 8) {
                return Optional.empty();
            }

            JsonNode response = viaCepClient.get()
                    .uri("/{cep}/json", cleanCep)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || response.has("erro")) {
                return Optional.empty();
            }

            String cityName = response.get("localidade").asText();
            String uf = response.get("uf").asText();

            // Geocode the city using Nominatim to get lat/lon
            return geocodeCity(cityName, uf);
        } catch (Exception e) {
            log.error("Failed to fetch CEP {}: {}", cep, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Search Brazilian cities by name using Nominatim (OpenStreetMap).
     * Free, no API key required, returns coordinates.
     */
    public List<CityResult> searchByName(String query) {
        List<CityResult> results = new ArrayList<>();
        try {
            JsonNode response = nominatimClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", query)
                            .queryParam("countrycodes", "br")
                            .queryParam("format", "json")
                            .queryParam("limit", "10")
                            .queryParam("featuretype", "city")
                            .queryParam("addressdetails", "1")
                            .build())
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !response.isArray()) {
                return results;
            }

            for (JsonNode item : response) {
                String type = item.path("type").asText("");
                String classType = item.path("class").asText("");

                // Only include place/boundary results (cities, towns)
                if (!"place".equals(classType) && !"boundary".equals(classType)) {
                    continue;
                }

                BigDecimal lat = new BigDecimal(item.get("lat").asText());
                BigDecimal lon = new BigDecimal(item.get("lon").asText());
                String displayName = item.get("display_name").asText();

                JsonNode address = item.path("address");
                String cityName = address.has("city") ? address.get("city").asText()
                        : address.has("town") ? address.get("town").asText()
                        : address.has("municipality") ? address.get("municipality").asText()
                        : item.has("name") ? item.get("name").asText() : "";
                String state = address.has("state") ? address.get("state").asText() : "";

                if (!cityName.isEmpty()) {
                    results.add(new CityResult(cityName, state, lat, lon, displayName));
                }
            }
        } catch (Exception e) {
            log.error("Failed to search cities by name '{}': {}", query, e.getMessage());
        }
        return results;
    }

    private Optional<CityResult> geocodeCity(String cityName, String state) {
        try {
            JsonNode response = nominatimClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", cityName + ", " + state + ", Brazil")
                            .queryParam("countrycodes", "br")
                            .queryParam("format", "json")
                            .queryParam("limit", "1")
                            .queryParam("addressdetails", "1")
                            .build())
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !response.isArray() || response.isEmpty()) {
                return Optional.empty();
            }

            JsonNode item = response.get(0);
            BigDecimal lat = new BigDecimal(item.get("lat").asText());
            BigDecimal lon = new BigDecimal(item.get("lon").asText());
            String displayName = item.get("display_name").asText();

            return Optional.of(new CityResult(cityName, state, lat, lon, displayName));
        } catch (Exception e) {
            log.error("Failed to geocode city {} {}: {}", cityName, state, e.getMessage());
            return Optional.empty();
        }
    }
}
