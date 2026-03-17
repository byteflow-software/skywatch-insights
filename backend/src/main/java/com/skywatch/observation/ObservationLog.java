package com.skywatch.observation;

import com.skywatch.event.AstronomicalEvent;
import com.skywatch.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "observation_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ObservationLog extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private AstronomicalEvent event;

    @Column(name = "observed_at", nullable = false)
    private Instant observedAt;

    @Column(name = "location_name", length = 200)
    private String locationName;

    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ObservationOutcome outcome;

    @Column(name = "media_url", length = 500)
    private String mediaUrl;
}
