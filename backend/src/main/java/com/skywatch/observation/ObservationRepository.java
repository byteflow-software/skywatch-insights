package com.skywatch.observation;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ObservationRepository extends JpaRepository<ObservationLog, UUID> {

    Page<ObservationLog> findByUserId(UUID userId, Pageable pageable);

    long countByUserId(UUID userId);
}
