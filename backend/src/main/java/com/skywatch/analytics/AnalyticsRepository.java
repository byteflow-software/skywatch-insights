package com.skywatch.analytics;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AnalyticsRepository extends JpaRepository<AnalyticsEvent, UUID> {

    long countByAction(AnalyticsAction action);

    long countByUserIdAndAction(UUID userId, AnalyticsAction action);
}
