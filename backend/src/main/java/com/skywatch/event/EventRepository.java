package com.skywatch.event;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<AstronomicalEvent, UUID>, JpaSpecificationExecutor<AstronomicalEvent> {

    Optional<AstronomicalEvent> findBySlug(String slug);

    Optional<AstronomicalEvent> findByExternalIdAndSource(String externalId, String source);

    Page<AstronomicalEvent> findByStatus(EventStatus status, Pageable pageable);

    Page<AstronomicalEvent> findByStatusAndType(EventStatus status, EventType type, Pageable pageable);

    Page<AstronomicalEvent> findByStatusOrderByStartAtDesc(EventStatus status, Pageable pageable);

    Page<AstronomicalEvent> findByStatusAndTypeOrderByStartAtDesc(EventStatus status, EventType type, Pageable pageable);

    @Query("SELECT e FROM AstronomicalEvent e WHERE e.status = 'PUBLISHED' AND e.endAt >= :now ORDER BY e.startAt ASC")
    Page<AstronomicalEvent> findUpcoming(@Param("now") Instant now, Pageable pageable);

    @Query("SELECT e FROM AstronomicalEvent e WHERE e.status IN ('PUBLISHED', 'EXPIRED') AND e.endAt < :cutoff")
    List<AstronomicalEvent> findExpiredForArchival(@Param("cutoff") Instant cutoff);
}
