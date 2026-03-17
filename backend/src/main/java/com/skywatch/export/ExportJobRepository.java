package com.skywatch.export;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ExportJobRepository extends JpaRepository<SocialExportJob, UUID> {

    Page<SocialExportJob> findByUserId(UUID userId, Pageable pageable);

    Page<SocialExportJob> findByUserIdAndEventId(UUID userId, UUID eventId, Pageable pageable);

    Page<SocialExportJob> findByUserIdAndNetwork(UUID userId, SocialNetwork network, Pageable pageable);

    long countByUserId(UUID userId);
}
