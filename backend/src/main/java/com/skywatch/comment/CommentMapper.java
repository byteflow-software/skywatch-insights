package com.skywatch.comment;

import com.skywatch.comment.dto.CommentResponse;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CommentMapper {

    public CommentResponse toResponse(Comment comment, UUID currentUserId) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorName(comment.getUser() != null ? comment.getUser().getName() : "Usuário removido")
                .authorAvatarUrl(comment.getUser() != null ? comment.getUser().getAvatarUrl() : null)
                .createdAt(comment.getCreatedAt())
                .isOwn(currentUserId != null && currentUserId.equals(
                        comment.getUser() != null ? comment.getUser().getId() : null))
                .build();
    }
}
