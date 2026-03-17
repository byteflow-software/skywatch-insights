package com.skywatch.admin;

import com.skywatch.admin.dto.AdminEventUpdateRequest;
import com.skywatch.event.*;
import com.skywatch.event.dto.EventDetailResponse;
import com.skywatch.user.User;
import com.skywatch.user.UserRole;
import com.skywatch.user.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminEventService {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    private final UserService userService;

    @Transactional
    public EventDetailResponse updateEvent(UUID adminUserId, UUID eventId, AdminEventUpdateRequest req) {
        User admin = userService.getById(adminUserId);
        if (admin.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can update events");
        }

        AstronomicalEvent event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EntityNotFoundException("Event not found: " + eventId));

        if (req.title() != null) {
            event.setTitle(req.title());
        }
        if (req.description() != null) {
            event.setDescription(req.description());
        }
        if (req.type() != null) {
            event.setType(EventType.valueOf(req.type()));
        }
        if (req.startAt() != null) {
            event.setStartAt(req.startAt());
        }
        if (req.endAt() != null) {
            event.setEndAt(req.endAt());
        }
        if (req.relevanceScore() != null) {
            event.setRelevanceScore(req.relevanceScore());
        }
        if (req.status() != null) {
            event.setStatus(EventStatus.valueOf(req.status()));
        }
        if (req.imageUrl() != null) {
            event.setImageUrl(req.imageUrl());
        }

        event.setUpdatedBy(adminUserId);
        event = eventRepository.save(event);

        return eventMapper.toDetailResponse(event, false);
    }
}
