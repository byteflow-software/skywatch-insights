package com.skywatch.comment.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record CommentResponse(
    UUID id,
    String content,
    String authorName,
    String authorAvatarUrl,
    Instant createdAt,
    boolean isOwn
) {}
