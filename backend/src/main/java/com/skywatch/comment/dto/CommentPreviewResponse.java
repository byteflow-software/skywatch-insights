package com.skywatch.comment.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record CommentPreviewResponse(
    List<CommentResponse> comments,
    long totalCount
) {}
