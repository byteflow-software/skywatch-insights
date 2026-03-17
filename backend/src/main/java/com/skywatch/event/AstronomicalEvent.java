package com.skywatch.event;

import com.skywatch.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "astronomical_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AstronomicalEvent extends BaseEntity {

    @Column(nullable = false, unique = true, length = 200)
    private String slug;

    @Column(nullable = false, length = 300)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EventType type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @Column(name = "end_at", nullable = false)
    private Instant endAt;

    @Column(name = "relevance_score", nullable = false)
    private int relevanceScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EventStatus status = EventStatus.DRAFT;

    @Column(name = "external_id", length = 200)
    private String externalId;

    @Column(length = 100)
    private String source;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "updated_by")
    private UUID updatedBy;
}
