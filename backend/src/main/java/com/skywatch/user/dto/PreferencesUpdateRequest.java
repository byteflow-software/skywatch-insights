package com.skywatch.user.dto;

import java.util.UUID;

public record PreferencesUpdateRequest(
    UUID preferredCityId,
    String timezone,
    String[] astronomicalInterests,
    String language,
    String theme,
    String name
) {}
