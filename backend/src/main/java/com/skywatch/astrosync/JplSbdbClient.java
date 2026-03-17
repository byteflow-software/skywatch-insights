package com.skywatch.astrosync;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class JplSbdbClient {

    private final RestClient restClient;

    public JplSbdbClient(@Value("${app.sbdb.base-url:https://ssd-api.jpl.nasa.gov}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public List<CometData> fetchComets(int limit) {
        try {
            JsonNode response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/sbdb_query.api")
                            .queryParam("fields", "spkid,full_name,e,q,i,om,w,tp,tp_cal,moid")
                            .queryParam("sb-class", "COM")
                            .queryParam("limit", limit)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !response.has("fields") || !response.has("data")) {
                return List.of();
            }

            JsonNode fieldsNode = response.path("fields");
            JsonNode dataNode = response.path("data");
            if (!fieldsNode.isArray() || !dataNode.isArray()) {
                return List.of();
            }

            Map<String, Integer> indexByField = new HashMap<>();
            for (int i = 0; i < fieldsNode.size(); i++) {
                indexByField.put(fieldsNode.get(i).asText(""), i);
            }

            List<CometData> comets = new ArrayList<>();
            for (JsonNode row : dataNode) {
                if (!row.isArray()) {
                    continue;
                }
                comets.add(new CometData(
                        getString(row, indexByField, "spkid"),
                        getString(row, indexByField, "full_name"),
                        getString(row, indexByField, "tp_cal"),
                        getString(row, indexByField, "tp"),
                        getString(row, indexByField, "e"),
                        getString(row, indexByField, "q"),
                        getString(row, indexByField, "i"),
                        getString(row, indexByField, "om"),
                        getString(row, indexByField, "w"),
                        getString(row, indexByField, "moid")
                ));
            }

            log.info("Fetched {} comets from JPL SBDB", comets.size());
            return comets;
        } catch (Exception e) {
            log.error("Failed to fetch JPL SBDB comets: {}", e.getMessage());
            return List.of();
        }
    }

    private String getString(JsonNode row, Map<String, Integer> indexByField, String field) {
        Integer index = indexByField.get(field);
        if (index == null || index < 0 || index >= row.size()) {
            return null;
        }
        JsonNode value = row.get(index);
        if (value == null || value.isNull()) {
            return null;
        }
        String text = value.asText("").trim();
        return text.isEmpty() ? null : text;
    }

    public record CometData(
            String spkid,
            String fullName,
            String tpCal,
            String tp,
            String eccentricity,
            String perihelionDistanceAu,
            String inclinationDeg,
            String ascendingNodeDeg,
            String periapsisArgDeg,
            String moidAu
    ) {}
}