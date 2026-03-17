package com.skywatch.export.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record TemplateListResponse(
    UUID id,
    String network,
    String format,
    String objective,
    Integer characterLimit
) {}
