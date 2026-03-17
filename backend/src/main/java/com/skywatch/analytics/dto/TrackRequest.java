package com.skywatch.analytics.dto;

import java.util.UUID;

public record TrackRequest(
    String action,
    String targetType,
    UUID targetId,
    String metadata
) {}
