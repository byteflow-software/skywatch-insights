package com.skywatch.comment;

import com.skywatch.comment.dto.CommentPreviewResponse;
import com.skywatch.comment.dto.CommentResponse;
import com.skywatch.comment.dto.CreateCommentRequest;
import com.skywatch.user.User;
import com.skywatch.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    @Transactional
    public CommentResponse create(CommentTargetType targetType, UUID targetId, UUID userId, CreateCommentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        Comment comment = Comment.builder()
                .targetType(targetType)
                .targetId(targetId)
                .user(user)
                .content(request.content())
                .build();

        comment = commentRepository.save(comment);
        return commentMapper.toResponse(comment, userId);
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> listByTarget(CommentTargetType targetType, UUID targetId, int page, int size, UUID currentUserId) {
        Page<Comment> comments = commentRepository.findByTargetTypeAndTargetIdOrderByCreatedAtDesc(
                targetType, targetId, PageRequest.of(page, Math.min(size, 50)));
        return comments.map(c -> commentMapper.toResponse(c, currentUserId));
    }

    @Transactional(readOnly = true)
    public CommentPreviewResponse getPreview(CommentTargetType targetType, UUID targetId, UUID currentUserId) {
        List<Comment> top3 = commentRepository.findTop3ByTargetTypeAndTargetIdOrderByCreatedAtDesc(targetType, targetId);
        long totalCount = commentRepository.countByTargetTypeAndTargetId(targetType, targetId);

        List<CommentResponse> responses = top3.stream()
                .map(c -> commentMapper.toResponse(c, currentUserId))
                .toList();

        return CommentPreviewResponse.builder()
                .comments(responses)
                .totalCount(totalCount)
                .build();
    }

    @Transactional
    public void delete(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comentário não encontrado"));

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Você só pode excluir seus próprios comentários");
        }

        commentRepository.delete(comment);
    }
}
