package com.skywatch.admin.dto;

import java.time.Instant;

public record AdminEventUpdateRequest(
    String title,
    String description,
    String type,
    Instant startAt,
    Instant endAt,
    Integer relevanceScore,
    String status,
    String imageUrl
) {}
