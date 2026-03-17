package com.skywatch.highlight;

import com.skywatch.event.AstronomicalEvent;
import com.skywatch.event.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HighlightService {

    private final HighlightRepository highlightRepository;
    private final DailyHighlightRepository dailyHighlightRepository;
    private final EventRepository eventRepository;

    public Optional<EventHighlight> getWeeklyHighlight() {
        return highlightRepository.findActiveWeekly(LocalDate.now());
    }

    public AstronomicalEvent getWeeklyEventOrAutoSelect() {
        return getWeeklyHighlight()
            .map(EventHighlight::getEvent)
            .orElseGet(() -> {
                var upcoming = eventRepository.findUpcoming(Instant.now(), PageRequest.of(0, 1, Sort.by("relevanceScore").descending()));
                return upcoming.hasContent() ? upcoming.getContent().get(0) : null;
            });
    }

    public Optional<DailyHighlight> getTodayHighlight() {
        // Try today's highlight first
        var today = dailyHighlightRepository.findByDate(LocalDate.now());
        if (today.isPresent()) return today;

        // Fall back to most recent cached highlight
        return dailyHighlightRepository.findTopByOrderByDateDesc();
    }
}
