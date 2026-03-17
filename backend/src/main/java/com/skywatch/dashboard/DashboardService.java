package com.skywatch.dashboard;

import com.skywatch.event.EventMapper;
import com.skywatch.event.EventRepository;
import com.skywatch.event.dto.EventDetailResponse;
import com.skywatch.event.dto.EventListResponse;
import com.skywatch.favorite.FavoriteRepository;
import com.skywatch.highlight.HighlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EventRepository eventRepository;
    private final FavoriteRepository favoriteRepository;
    private final HighlightService highlightService;
    private final EventMapper eventMapper;

    public Map<String, Object> getDashboard(UUID userId) {
        var upcoming = eventRepository.findUpcoming(Instant.now(), PageRequest.of(0, 5));
        List<EventListResponse> upcomingEvents = upcoming.getContent().stream()
            .map(e -> eventMapper.toListResponseTruncated(e, false))
            .toList();

        var weeklyEvent = highlightService.getWeeklyEventOrAutoSelect();
        Object weeklyHighlight = weeklyEvent != null
            ? eventMapper.toDetailResponse(weeklyEvent, false)
            : Collections.emptyMap();

        var favPage = favoriteRepository.findByUserId(userId, PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<EventListResponse> favorites = favPage.getContent().stream()
            .map(f -> eventMapper.toListResponseTruncated(f.getEvent(), true))
            .toList();

        long totalFavorites = favPage.getTotalElements();

        return Map.of(
            "upcomingEvents", upcomingEvents,
            "weeklyHighlight", weeklyHighlight,
            "favorites", favorites,
            "stats", Map.of("totalFavorites", totalFavorites, "totalObservations", 0, "totalExports", 0)
        );
    }
}
