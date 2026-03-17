package com.skywatch.astrosync;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DataSyncLogRepository extends JpaRepository<DataSyncLog, UUID> {

    Page<DataSyncLog> findBySourceOrderByStartedAtDesc(String source, Pageable pageable);

    Page<DataSyncLog> findAllByOrderByStartedAtDesc(Pageable pageable);
}
