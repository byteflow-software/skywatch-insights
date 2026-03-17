package com.skywatch.event;

import com.skywatch.event.dto.EventDetailResponse;
import com.skywatch.event.dto.EventListResponse;
import com.skywatch.shared.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<PageResponse<EventListResponse>> listEvents(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(defaultValue = "startAt") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {

        EventType eventType = type != null ? EventType.valueOf(type) : null;
        EventStatus eventStatus = status != null ? EventStatus.valueOf(status) : null;
        UUID userId = auth != null ? (UUID) auth.getPrincipal() : null;

        return ResponseEntity.ok(eventService.listEvents(eventType, eventStatus, from, to, sort, page, Math.min(size, 100), userId));
    }

    @GetMapping("/archived")
    public ResponseEntity<PageResponse<EventListResponse>> listArchivedEvents(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        EventType eventType = type != null ? EventType.valueOf(type) : null;
        return ResponseEntity.ok(eventService.listArchivedEvents(eventType, page, Math.min(size, 100)));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<EventDetailResponse> getBySlug(
            @PathVariable String slug,
            Authentication auth) {
        UUID userId = auth != null ? (UUID) auth.getPrincipal() : null;
        return ResponseEntity.ok(eventService.getBySlug(slug, userId));
    }
}
