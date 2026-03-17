package com.skywatch.astrosync;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
@Slf4j
public class TransitOccultationCatalog {

    private final ObjectMapper objectMapper;
    private List<TransitData> transits = List.of();
    private List<OccultationData> occultations = List.of();

    public TransitOccultationCatalog(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void init() {
        try (InputStream is = getClass().getResourceAsStream("/catalogs/transits.json")) {
            if (is != null) {
                transits = objectMapper.readValue(is, new TypeReference<>() {});
                log.info("Loaded {} transits from catalog", transits.size());
            }
        } catch (Exception e) {
            log.error("Failed to load transit catalog: {}", e.getMessage());
        }

        try (InputStream is = getClass().getResourceAsStream("/catalogs/occultations.json")) {
            if (is != null) {
                occultations = objectMapper.readValue(is, new TypeReference<>() {});
                log.info("Loaded {} occultations from catalog", occultations.size());
            }
        } catch (Exception e) {
            log.error("Failed to load occultation catalog: {}", e.getMessage());
        }
    }

    public List<TransitData> getTransits() {
        return transits;
    }

    public List<OccultationData> getOccultations() {
        return occultations;
    }

    public record TransitData(
            String planet,
            String date,
            int durationMinutes,
            String type
    ) {}

    public record OccultationData(
            String target,
            String occultedBy,
            String date,
            String visibilityRegion,
            String notes
    ) {}
}
