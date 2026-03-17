package com.skywatch.export;

import com.skywatch.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "social_export_templates", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"network", "format", "objective", "layout_version"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SocialExportTemplate extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SocialNetwork network;

    @Column(nullable = false, length = 50)
    private String format;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExportObjective objective;

    @Column(name = "layout_version", nullable = false, length = 20)
    private String layoutVersion;

    @Column(name = "text_template", nullable = false, columnDefinition = "TEXT")
    private String textTemplate;

    @Column(name = "character_limit")
    private Integer characterLimit;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
