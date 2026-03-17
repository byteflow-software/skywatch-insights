package com.skywatch.comment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {

    Page<Comment> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(
            CommentTargetType targetType, UUID targetId, Pageable pageable);

    List<Comment> findTop3ByTargetTypeAndTargetIdOrderByCreatedAtDesc(
            CommentTargetType targetType, UUID targetId);

    long countByTargetTypeAndTargetId(CommentTargetType targetType, UUID targetId);
}
