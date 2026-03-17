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
public class MeteorShowerCatalog {

    private final ObjectMapper objectMapper;
    private List<MeteorShowerData> showers = List.of();

    public MeteorShowerCatalog(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void init() {
        try (InputStream is = getClass().getResourceAsStream("/catalogs/meteor-showers.json")) {
            if (is == null) {
                log.warn("meteor-showers.json not found on classpath");
                return;
            }
            showers = objectMapper.readValue(is, new TypeReference<>() {});
            log.info("Loaded {} meteor showers from catalog", showers.size());
        } catch (Exception e) {
            log.error("Failed to load meteor shower catalog: {}", e.getMessage());
        }
    }

    public List<MeteorShowerData> getShowers() {
        return showers;
    }

    public record MeteorShowerData(
            String iauCode,
            String name,
            int peakMonth,
            int peakDay,
            int zhr,
            double radiantRa,
            double radiantDec,
            int velocity,
            String parentBody,
            String activeStart,
            String activeEnd
    ) {}
}
