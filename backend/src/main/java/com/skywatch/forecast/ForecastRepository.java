package com.skywatch.forecast;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ForecastRepository extends JpaRepository<VisibilityForecast, UUID> {
    Optional<VisibilityForecast> findByEventIdAndLocationId(UUID eventId, UUID locationId);
}
