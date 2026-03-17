package com.skywatch.export.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record ExportResponse(
    UUID id,
    UUID eventId,
    String network,
    String format,
    String objective,
    String status,
    String outputImageUrl,
    String outputTextContent,
    String outputBundlePath,
    String errorMessage,
    Instant createdAt,
    Instant completedAt
) {}
