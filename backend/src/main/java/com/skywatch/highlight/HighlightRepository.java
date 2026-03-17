package com.skywatch.highlight;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface HighlightRepository extends JpaRepository<EventHighlight, UUID> {
    @Query("SELECT h FROM EventHighlight h WHERE h.type = 'WEEKLY' AND h.startDate <= :date AND h.endDate >= :date")
    Optional<EventHighlight> findActiveWeekly(LocalDate date);

    boolean existsByTypeAndStartDateLessThanEqualAndEndDateGreaterThanEqual(HighlightType type, LocalDate endDate, LocalDate startDate);
}
