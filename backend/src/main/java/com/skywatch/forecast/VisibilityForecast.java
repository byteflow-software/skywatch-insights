package com.skywatch.forecast;

import com.skywatch.event.AstronomicalEvent;
import com.skywatch.shared.BaseEntity;
import com.skywatch.user.Location;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "visibility_forecasts", uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "location_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VisibilityForecast extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private AstronomicalEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "best_window_start", nullable = false)
    private Instant bestWindowStart;

    @Column(name = "best_window_end", nullable = false)
    private Instant bestWindowEnd;

    @Column(name = "observability_score", nullable = false)
    private int observabilityScore;

    @Column(name = "cloud_coverage")
    private Integer cloudCoverage;

    @Column
    private Integer humidity;

    @Column
    private Integer visibility;

    @Column(name = "weather_summary", length = 500)
    private String weatherSummary;

    @Column(name = "calculated_at", nullable = false)
    private Instant calculatedAt;
}
