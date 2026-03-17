package com.skywatch.highlight;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface DailyHighlightRepository extends JpaRepository<DailyHighlight, UUID> {

    Optional<DailyHighlight> findByDate(LocalDate date);

    Optional<DailyHighlight> findTopByOrderByDateDesc();
}
