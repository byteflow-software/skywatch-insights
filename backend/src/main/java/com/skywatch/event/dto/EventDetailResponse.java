package com.skywatch.event.dto;

import lombok.Builder;
import java.time.Instant;
import java.util.UUID;

@Builder
public record EventDetailResponse(
    UUID id,
    String slug,
    String title,
    String type,
    String description,
    Instant startAt,
    Instant endAt,
    int relevanceScore,
    String status,
    String source,
    String imageUrl,
    boolean isFavorited,
    ForecastSummary forecast
) {
    @Builder
    public record ForecastSummary(
        int observabilityScore,
        Instant bestWindowStart,
        Instant bestWindowEnd,
        String weatherSummary,
        Instant calculatedAt
    ) {}
}
