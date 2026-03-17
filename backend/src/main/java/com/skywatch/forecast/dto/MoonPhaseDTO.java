package com.skywatch.forecast.dto;

import lombok.Builder;

@Builder
public record MoonPhaseDTO(
    String phase,
    int illumination,
    String rise,
    String set,
    String closestPhaseName,
    String closestPhaseDate
) {}
