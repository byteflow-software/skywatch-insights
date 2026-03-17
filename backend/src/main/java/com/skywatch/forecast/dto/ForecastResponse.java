package com.skywatch.forecast.dto;

import lombok.Builder;
import java.time.Instant;
import java.util.UUID;

@Builder
public record ForecastResponse(
    UUID eventId,
    LocationInfo location,
    int observabilityScore,
    Instant bestWindowStart,
    Instant bestWindowEnd,
    Integer cloudCoverage,
    Integer humidity,
    Integer visibility,
    String weatherSummary,
    Instant calculatedAt
) {
    @Builder
    public record LocationInfo(UUID id, String name) {}
}
