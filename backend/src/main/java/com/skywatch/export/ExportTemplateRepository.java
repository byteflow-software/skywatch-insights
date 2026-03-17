package com.skywatch.export;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExportTemplateRepository extends JpaRepository<SocialExportTemplate, UUID> {

    List<SocialExportTemplate> findByNetworkAndIsActiveTrue(SocialNetwork network);

    List<SocialExportTemplate> findByIsActiveTrue();

    Optional<SocialExportTemplate> findByNetworkAndFormatAndObjective(
            SocialNetwork network, String format, ExportObjective objective);
}
