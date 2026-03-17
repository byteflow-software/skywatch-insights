package com.skywatch.observation.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CreateObservationRequest(
    UUID eventId,
    @NotNull Instant observedAt,
    String locationName,
    BigDecimal latitude,
    BigDecimal longitude,
    String notes,
    String outcome
) {}
