package com.skywatch.event;

import com.skywatch.event.dto.EventDetailResponse;
import com.skywatch.event.dto.EventListResponse;
import com.skywatch.favorite.FavoriteRepository;
import com.skywatch.shared.PageResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    private final FavoriteRepository favoriteRepository;

    public PageResponse<EventListResponse> listEvents(
            EventType type, EventStatus status, Instant from, Instant to,
            String sort, int page, int size, UUID userId) {

        Sort sorting = "relevanceScore".equals(sort)
            ? Sort.by(Sort.Direction.DESC, "relevanceScore")
            : Sort.by(Sort.Direction.ASC, "startAt");

        EventStatus filterStatus = status != null ? status : EventStatus.PUBLISHED;

        Specification<AstronomicalEvent> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), filterStatus));
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("endAt"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("startAt"), to));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AstronomicalEvent> events = eventRepository.findAll(spec, PageRequest.of(page, size, sorting));

        Set<UUID> favoritedIds = userId != null
            ? favoriteRepository.findEventIdsByUserId(userId)
            : Collections.emptySet();

        var content = events.getContent().stream()
            .map(e -> eventMapper.toListResponseTruncated(e, favoritedIds.contains(e.getId())))
            .toList();

        return PageResponse.from(events, content);
    }

    public PageResponse<EventListResponse> listArchivedEvents(EventType type, int page, int size) {
        Page<AstronomicalEvent> events;
        var pageable = PageRequest.of(page, size);
        if (type != null) {
            events = eventRepository.findByStatusAndTypeOrderByStartAtDesc(EventStatus.ARCHIVED, type, pageable);
        } else {
            events = eventRepository.findByStatusOrderByStartAtDesc(EventStatus.ARCHIVED, pageable);
        }

        var content = events.getContent().stream()
            .map(e -> eventMapper.toListResponseTruncated(e, false))
            .toList();

        return PageResponse.from(events, content);
    }

    public EventDetailResponse getBySlug(String slug, UUID userId) {
        AstronomicalEvent event = eventRepository.findBySlug(slug)
            .orElseThrow(() -> new EntityNotFoundException("Event not found: " + slug));
        boolean isFavorited = userId != null && favoriteRepository.existsByUserIdAndEventId(userId, event.getId());
        return eventMapper.toDetailResponse(event, isFavorited);
    }

    public AstronomicalEvent getById(UUID id) {
        return eventRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Event not found"));
    }
}
