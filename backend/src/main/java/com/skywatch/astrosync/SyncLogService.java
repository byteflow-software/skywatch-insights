package com.skywatch.astrosync;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class SyncLogService {

    private final DataSyncLogRepository repository;

    public DataSyncLog startSync(String source, String syncType) {
        DataSyncLog log = DataSyncLog.builder()
                .source(source)
                .syncType(syncType)
                .startedAt(Instant.now())
                .status("RUNNING")
                .build();
        return repository.save(log);
    }

    public void completeSync(DataSyncLog log, int fetched, int created, int updated) {
        log.setCompletedAt(Instant.now());
        log.setItemsFetched(fetched);
        log.setItemsCreated(created);
        log.setItemsUpdated(updated);
        log.setStatus("SUCCESS");
        repository.save(log);
    }

    public void failSync(DataSyncLog log, String errorMessage) {
        log.setCompletedAt(Instant.now());
        log.setErrorMessage(errorMessage);
        log.setStatus("FAILED");
        repository.save(log);
    }

    public void partialSync(DataSyncLog log, int fetched, int created, int updated, String errorMessage) {
        log.setCompletedAt(Instant.now());
        log.setItemsFetched(fetched);
        log.setItemsCreated(created);
        log.setItemsUpdated(updated);
        log.setErrorMessage(errorMessage);
        log.setStatus("PARTIAL");
        repository.save(log);
    }

    public Page<DataSyncLog> getLogs(String source, int page, int size) {
        var pageable = PageRequest.of(page, size);
        if (source != null && !source.isBlank()) {
            return repository.findBySourceOrderByStartedAtDesc(source, pageable);
        }
        return repository.findAllByOrderByStartedAtDesc(pageable);
    }
}
