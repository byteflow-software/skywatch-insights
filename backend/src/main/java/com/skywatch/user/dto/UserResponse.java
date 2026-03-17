package com.skywatch.user.dto;

import lombok.Builder;
import java.time.Instant;
import java.util.UUID;

@Builder
public record UserResponse(
    UUID id,
    String name,
    String email,
    String role,
    String timezone,
    LocationSummary preferredCity,
    String[] astronomicalInterests,
    String language,
    String theme,
    String avatarUrl,
    Instant createdAt
) {
    @Builder
    public record LocationSummary(
        UUID id,
        String name,
        String countryCode
    ) {}
}
