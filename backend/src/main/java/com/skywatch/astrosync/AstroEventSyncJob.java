package com.skywatch.astrosync;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AstroEventSyncJob {

    private final AstroEventSyncService syncService;

    @Scheduled(fixedRate = 6 * 60 * 60 * 1000, initialDelay = 30_000)
    public void syncSpaceWeather() {
        log.info("Starting scheduled astro event sync");
        try {
            syncService.syncSpaceWeather();
            syncService.syncOrbitalEvents();
            syncService.syncSupermoonEvents();
            syncService.syncCometEvents();
            syncService.syncEclipseEvents();
            syncService.syncMeteorShowerEvents();
            syncService.syncTransitOccultationEvents();
        } catch (Exception e) {
            log.error("Scheduled astro event sync failed: {}", e.getMessage(), e);
        }
    }

    @Scheduled(fixedRate = 3 * 60 * 60 * 1000, initialDelay = 60_000)
    public void syncAuroraForecast() {
        log.info("Starting scheduled aurora forecast sync");
        try {
            syncService.syncAuroraEvents();
        } catch (Exception e) {
            log.error("Scheduled aurora forecast sync failed: {}", e.getMessage(), e);
        }
    }
}
