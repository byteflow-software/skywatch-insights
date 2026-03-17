package com.skywatch.observation;

import com.skywatch.event.AstronomicalEvent;
import com.skywatch.event.EventRepository;
import com.skywatch.observation.dto.CreateObservationRequest;
import com.skywatch.observation.dto.ObservationResponse;
import com.skywatch.shared.PageResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ObservationService {

    private final ObservationRepository observationRepository;
    private final EventRepository eventRepository;
    private final ObservationMapper observationMapper;

    @Transactional
    public ObservationResponse create(UUID userId, CreateObservationRequest req) {
        AstronomicalEvent event = null;
        if (req.eventId() != null) {
            event = eventRepository.findById(req.eventId())
                .orElseThrow(() -> new EntityNotFoundException("Event not found: " + req.eventId()));
        }

        ObservationOutcome outcome = null;
        if (req.outcome() != null) {
            outcome = ObservationOutcome.valueOf(req.outcome());
        }

        ObservationLog log = ObservationLog.builder()
            .userId(userId)
            .event(event)
            .observedAt(req.observedAt())
            .locationName(req.locationName())
            .latitude(req.latitude())
            .longitude(req.longitude())
            .notes(req.notes())
            .outcome(outcome)
            .build();

        log = observationRepository.save(log);
        return observationMapper.toResponse(log);
    }

    public PageResponse<ObservationResponse> list(UUID userId, int page, int size) {
        Page<ObservationLog> logs = observationRepository.findByUserId(
            userId,
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "observedAt"))
        );

        var content = logs.getContent().stream()
            .map(observationMapper::toResponse)
            .toList();

        return PageResponse.from(logs, content);
    }

    public long countByUser(UUID userId) {
        return observationRepository.countByUserId(userId);
    }
}
