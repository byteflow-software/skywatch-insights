package com.skywatch.observation.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record ObservationResponse(
    UUID id,
    EventSummary event,
    Instant observedAt,
    String locationName,
    String notes,
    String outcome,
    String mediaUrl,
    Instant createdAt
) {
    @Builder
    public record EventSummary(
        UUID id,
        String title,
        String slug
    ) {}
}
