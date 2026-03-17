package com.skywatch.astrosync;

import com.skywatch.event.AstronomicalEvent;
import com.skywatch.event.EventRepository;
import com.skywatch.event.EventStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventArchivalJob {

    private final EventRepository eventRepository;

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void archiveExpiredEvents() {
        log.info("Starting event archival job");
        Instant cutoff = Instant.now().minus(7, ChronoUnit.DAYS);
        List<AstronomicalEvent> expired = eventRepository.findExpiredForArchival(cutoff);

        int count = 0;
        for (AstronomicalEvent event : expired) {
            event.setStatus(EventStatus.ARCHIVED);
            eventRepository.save(event);
            count++;
        }

        log.info("Archived {} expired events", count);
    }
}
