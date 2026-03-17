package com.skywatch.export;

import com.skywatch.event.AstronomicalEvent;
import com.skywatch.shared.BaseEntity;
import com.skywatch.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "social_export_jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SocialExportJob extends BaseEntity {

    @Column(name = "user_id", nullable = false, insertable = false, updatable = false)
    private UUID userId;

    @Column(name = "event_id", nullable = false, insertable = false, updatable = false)
    private UUID eventId;

    @Column(name = "template_id", nullable = false, insertable = false, updatable = false)
    private UUID templateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private AstronomicalEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private SocialExportTemplate template;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SocialNetwork network;

    @Column(nullable = false, length = 50)
    private String format;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ExportObjective objective = ExportObjective.ENGAGEMENT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ExportStatus status = ExportStatus.PENDING;

    @Column(name = "output_image_url", length = 2000)
    private String outputImageUrl;

    @Column(name = "output_text_content", columnDefinition = "TEXT")
    private String outputTextContent;

    @Column(name = "output_bundle_path", length = 2000)
    private String outputBundlePath;

    @Column(name = "error_message", length = 2000)
    private String errorMessage;

    @Column(name = "completed_at")
    private Instant completedAt;
}
