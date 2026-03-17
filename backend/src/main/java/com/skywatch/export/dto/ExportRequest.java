package com.skywatch.export.dto;

import com.skywatch.export.ExportObjective;
import com.skywatch.export.SocialNetwork;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ExportRequest(
    @NotNull UUID eventId,
    @NotNull SocialNetwork network,
    @NotBlank String format,
    ExportObjective objective
) {}
