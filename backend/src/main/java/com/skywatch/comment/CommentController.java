package com.skywatch.comment;

import com.skywatch.comment.dto.CommentPreviewResponse;
import com.skywatch.comment.dto.CommentResponse;
import com.skywatch.comment.dto.CreateCommentRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // ---- Event Comments ----

    @PostMapping("/events/{eventId}/comments")
    public ResponseEntity<CommentResponse> createEventComment(
            @PathVariable UUID eventId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        CommentResponse response = commentService.create(CommentTargetType.EVENT, eventId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/events/{eventId}/comments")
    public ResponseEntity<Page<CommentResponse>> listEventComments(
            @PathVariable UUID eventId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        UUID currentUserId = auth != null ? (UUID) auth.getPrincipal() : null;
        return ResponseEntity.ok(commentService.listByTarget(CommentTargetType.EVENT, eventId, page, size, currentUserId));
    }

    @GetMapping("/events/{eventId}/comments/preview")
    public ResponseEntity<CommentPreviewResponse> previewEventComments(
            @PathVariable UUID eventId,
            Authentication auth) {
        UUID currentUserId = auth != null ? (UUID) auth.getPrincipal() : null;
        return ResponseEntity.ok(commentService.getPreview(CommentTargetType.EVENT, eventId, currentUserId));
    }

    @DeleteMapping("/events/{eventId}/comments/{commentId}")
    public ResponseEntity<Void> deleteEventComment(
            @PathVariable UUID eventId,
            @PathVariable UUID commentId,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        commentService.delete(commentId, userId);
        return ResponseEntity.noContent().build();
    }

    // ---- Observation Comments ----

    @PostMapping("/observations/{observationId}/comments")
    public ResponseEntity<CommentResponse> createObservationComment(
            @PathVariable UUID observationId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        CommentResponse response = commentService.create(CommentTargetType.OBSERVATION, observationId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/observations/{observationId}/comments")
    public ResponseEntity<Page<CommentResponse>> listObservationComments(
            @PathVariable UUID observationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        UUID currentUserId = auth != null ? (UUID) auth.getPrincipal() : null;
        return ResponseEntity.ok(commentService.listByTarget(CommentTargetType.OBSERVATION, observationId, page, size, currentUserId));
    }

    @GetMapping("/observations/{observationId}/comments/preview")
    public ResponseEntity<CommentPreviewResponse> previewObservationComments(
            @PathVariable UUID observationId,
            Authentication auth) {
        UUID currentUserId = auth != null ? (UUID) auth.getPrincipal() : null;
        return ResponseEntity.ok(commentService.getPreview(CommentTargetType.OBSERVATION, observationId, currentUserId));
    }

    @DeleteMapping("/observations/{observationId}/comments/{commentId}")
    public ResponseEntity<Void> deleteObservationComment(
            @PathVariable UUID observationId,
            @PathVariable UUID commentId,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        commentService.delete(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}
