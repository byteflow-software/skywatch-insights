package com.skywatch.astrosync;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "data_sync_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DataSyncLog {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String source;

    @Column(name = "sync_type", nullable = false, length = 50)
    private String syncType;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "items_fetched", nullable = false)
    @Builder.Default
    private int itemsFetched = 0;

    @Column(name = "items_created", nullable = false)
    @Builder.Default
    private int itemsCreated = 0;

    @Column(name = "items_updated", nullable = false)
    @Builder.Default
    private int itemsUpdated = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
