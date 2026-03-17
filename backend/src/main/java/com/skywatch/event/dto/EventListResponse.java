package com.skywatch.event.dto;

import lombok.Builder;
import java.time.Instant;
import java.util.UUID;

@Builder
public record EventListResponse(
    UUID id,
    String slug,
    String title,
    String type,
    String description,
    Instant startAt,
    Instant endAt,
    int relevanceScore,
    String status,
    String imageUrl,
    boolean isFavorited
) {}
