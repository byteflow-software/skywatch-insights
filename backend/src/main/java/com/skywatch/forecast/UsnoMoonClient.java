package com.skywatch.forecast;

import com.fasterxml.jackson.databind.JsonNode;
import com.skywatch.forecast.dto.MoonPhaseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Component
@Slf4j
public class UsnoMoonClient {

    private final RestClient restClient;
    private final RedisTemplate<String, Object> redisTemplate;
    private static final Duration CACHE_TTL = Duration.ofMinutes(30);

    public UsnoMoonClient(
            @Value("${app.usno.base-url}") String baseUrl,
            RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public Optional<MoonPhaseDTO> getMoonData(BigDecimal lat, BigDecimal lon, String timezone) {
        String cacheKey = "moon:" + lat + ":" + lon + ":" + LocalDate.now(ZoneOffset.UTC);

        // Check Redis cache
        try {
            Object cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached instanceof MoonPhaseDTO dto) {
                return Optional.of(dto);
            }
        } catch (Exception e) {
            log.debug("Redis cache miss for moon data: {}", e.getMessage());
        }

        try {
            String date = LocalDate.now(ZoneOffset.UTC).format(DateTimeFormatter.ISO_DATE);
            String coords = lat.toPlainString() + "," + lon.toPlainString();

            // Determine timezone offset
            int tzOffset = parseTimezoneOffset(timezone);

            JsonNode response = restClient.get()
                    .uri("/rstt/oneday?date={date}&coords={coords}&tz={tz}",
                            date, coords, tzOffset)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null) return Optional.empty();

            JsonNode properties = response.path("properties").path("data");
            if (properties.isMissingNode()) {
                properties = response;
            }

            if (properties == null || properties.isMissingNode()) {
                log.warn("Skipping malformed USNO payload: missing properties/data node");
                return Optional.empty();
            }

            // Extract current phase
            String phase = properties.path("curphase").asText(
                    properties.path("closestphase").path("phase").asText("Unknown"));
            if (phase == null || phase.isBlank() || "Unknown".equalsIgnoreCase(phase)) {
                log.warn("Skipping malformed USNO payload: missing moon phase");
                return Optional.empty();
            }

            // Extract illumination
            String fracillum = properties.path("fracillum").asText("0%");
            int illumination = parseIllumination(fracillum);

            // Extract moonrise/moonset
            String rise = extractMoonTime(properties, "Rise");
            String set = extractMoonTime(properties, "Set");

            // Extract closest phase
            JsonNode closestPhase = properties.path("closestphase");
            String closestPhaseName = closestPhase.path("phase").asText(null);
            String closestPhaseDate = buildPhaseDate(closestPhase);

            MoonPhaseDTO dto = MoonPhaseDTO.builder()
                    .phase(phase)
                    .illumination(illumination)
                    .rise(rise)
                    .set(set)
                    .closestPhaseName(closestPhaseName)
                    .closestPhaseDate(closestPhaseDate)
                    .build();

            // Cache result
            try {
                redisTemplate.opsForValue().set(cacheKey, dto, CACHE_TTL);
            } catch (Exception e) {
                log.debug("Failed to cache moon data: {}", e.getMessage());
            }

            return Optional.of(dto);

        } catch (Exception e) {
            log.error("Failed to fetch USNO moon data: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private String extractMoonTime(JsonNode properties, String phenomenon) {
        JsonNode moonData = properties.path("moondata");
        if (moonData.isArray()) {
            for (JsonNode entry : moonData) {
                if (phenomenon.equalsIgnoreCase(entry.path("phen").asText(""))) {
                    return entry.path("time").asText(null);
                }
            }
        }
        return null;
    }

    private int parseIllumination(String fracillum) {
        if (fracillum == null) return 0;
        String clean = fracillum.replace("%", "").trim();
        try {
            int value = (int) Double.parseDouble(clean);
            return Math.max(0, Math.min(100, value));
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private String buildPhaseDate(JsonNode closestPhase) {
        int day = closestPhase.path("day").asInt(0);
        int month = closestPhase.path("month").asInt(0);
        int year = closestPhase.path("year").asInt(0);
        if (day == 0 || month == 0 || year == 0) {
            return closestPhase.path("date").asText(null);
        }
        return String.format("%04d-%02d-%02d", year, month, day);
    }

    private int parseTimezoneOffset(String timezone) {
        if (timezone == null || timezone.isBlank()) return -3; // default Brasilia
        try {
            // Handle formats like "America/Fortaleza", "UTC-3", "-3"
            if (timezone.startsWith("UTC") || timezone.startsWith("GMT")) {
                return Integer.parseInt(timezone.replaceAll("[^-+\\d]", ""));
            }
            if (timezone.matches("^[+-]?\\d+$")) {
                return Integer.parseInt(timezone);
            }
            // For IANA timezone names, calculate offset
            var zoneId = java.time.ZoneId.of(timezone);
            return zoneId.getRules().getOffset(java.time.Instant.now()).getTotalSeconds() / 3600;
        } catch (Exception e) {
            return -3;
        }
    }
}
