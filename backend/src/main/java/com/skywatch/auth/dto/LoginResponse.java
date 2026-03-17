package com.skywatch.auth.dto;

import lombok.Builder;

@Builder
public record LoginResponse(
    String accessToken,
    String refreshToken,
    long expiresIn
) {}
