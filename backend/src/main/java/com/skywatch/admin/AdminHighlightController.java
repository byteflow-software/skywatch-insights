package com.skywatch.admin;

import com.skywatch.event.AstronomicalEvent;
import com.skywatch.event.EventRepository;
import com.skywatch.highlight.EventHighlight;
import com.skywatch.highlight.HighlightRepository;
import com.skywatch.highlight.HighlightType;
import com.skywatch.user.User;
import com.skywatch.user.UserRole;
import com.skywatch.user.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/highlights")
@RequiredArgsConstructor
public class AdminHighlightController {

    private final HighlightRepository highlightRepository;
    private final EventRepository eventRepository;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createHighlight(
            @RequestBody CreateHighlightRequest request,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();

        User admin = userService.getById(userId);
        if (admin.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can create highlights");
        }

        AstronomicalEvent event = eventRepository.findById(request.eventId())
            .orElseThrow(() -> new EntityNotFoundException("Event not found: " + request.eventId()));

        EventHighlight highlight = EventHighlight.builder()
            .event(event)
            .type(HighlightType.valueOf(request.type()))
            .startDate(request.startDate())
            .endDate(request.endDate())
            .editorialNote(request.editorialNote())
            .createdBy(admin)
            .build();

        highlight = highlightRepository.save(highlight);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "id", highlight.getId(),
            "eventId", event.getId(),
            "type", highlight.getType().name(),
            "startDate", highlight.getStartDate().toString(),
            "endDate", highlight.getEndDate().toString(),
            "createdAt", highlight.getCreatedAt()
        ));
    }

    public record CreateHighlightRequest(
        UUID eventId,
        String type,
        LocalDate startDate,
        LocalDate endDate,
        String editorialNote
    ) {}
}
