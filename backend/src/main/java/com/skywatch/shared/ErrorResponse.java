package com.skywatch.shared;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import java.time.Instant;
import java.util.List;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    String error,
    String message,
    List<String> details,
    Instant timestamp
) {
    public static ErrorResponse of(String error, String message) {
        return ErrorResponse.builder()
            .error(error)
            .message(message)
            .timestamp(Instant.now())
            .build();
    }

    public static ErrorResponse of(String error, String message, List<String> details) {
        return ErrorResponse.builder()
            .error(error)
            .message(message)
            .details(details)
            .timestamp(Instant.now())
            .build();
    }
}
