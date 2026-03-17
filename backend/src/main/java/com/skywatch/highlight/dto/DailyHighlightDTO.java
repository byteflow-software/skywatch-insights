package com.skywatch.highlight.dto;

import lombok.Builder;

@Builder
public record DailyHighlightDTO(
    String date,
    String title,
    String explanation,
    String imageUrl,
    String hdImageUrl,
    String mediaType,
    String copyright
) {}
