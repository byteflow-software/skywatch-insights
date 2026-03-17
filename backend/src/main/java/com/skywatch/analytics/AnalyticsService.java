package com.skywatch.analytics;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;

    @Transactional
    public void track(UUID userId, AnalyticsAction action, String targetType, UUID targetId, String metadata) {
        AnalyticsEvent event = AnalyticsEvent.builder()
            .userId(userId)
            .action(action)
            .targetType(targetType)
            .targetId(targetId)
            .metadata(metadata)
            .build();

        analyticsRepository.save(event);
    }

    public Map<String, Long> getStats() {
        Map<String, Long> stats = new LinkedHashMap<>();
        for (AnalyticsAction action : AnalyticsAction.values()) {
            stats.put(action.name(), analyticsRepository.countByAction(action));
        }
        return stats;
    }
}
