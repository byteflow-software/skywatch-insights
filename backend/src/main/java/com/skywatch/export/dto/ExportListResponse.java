package com.skywatch.export.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record ExportListResponse(
    UUID id,
    UUID eventId,
    String eventTitle,
    String network,
    String format,
    String objective,
    String status,
    String outputImageUrl,
    Instant createdAt
) {}
