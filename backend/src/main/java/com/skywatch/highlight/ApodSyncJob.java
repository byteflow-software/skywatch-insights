package com.skywatch.highlight;

import com.skywatch.astrosync.DataSyncLog;
import com.skywatch.astrosync.SyncLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApodSyncJob {

    private final ApodClient apodClient;
    private final DailyHighlightRepository highlightRepository;
    private final SyncLogService syncLogService;

    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void syncApod() {
        log.info("Starting APOD sync");
        DataSyncLog syncLog = syncLogService.startSync("nasa_apod", "APOD");

        try {
            var apodOpt = apodClient.fetchToday();
            if (apodOpt.isEmpty()) {
                syncLogService.completeSync(syncLog, 0, 0, 0);
                return;
            }

            var apod = apodOpt.get();
            LocalDate date = LocalDate.parse(apod.date());

            var existing = highlightRepository.findByDate(date);
            if (existing.isPresent()) {
                // Update existing
                var highlight = existing.get();
                highlight.setTitle(apod.title());
                highlight.setExplanation(apod.explanation());
                highlight.setImageUrl(apod.imageUrl());
                highlight.setHdImageUrl(apod.hdImageUrl());
                highlight.setMediaType(apod.mediaType());
                highlight.setCopyright(apod.copyright());
                highlightRepository.save(highlight);
                syncLogService.completeSync(syncLog, 1, 0, 1);
                log.info("Updated APOD for date {}", date);
            } else {
                // Create new
                var highlight = DailyHighlight.builder()
                        .date(date)
                        .title(apod.title())
                        .explanation(apod.explanation())
                        .imageUrl(apod.imageUrl())
                        .hdImageUrl(apod.hdImageUrl())
                        .mediaType(apod.mediaType())
                        .copyright(apod.copyright())
                        .build();
                highlightRepository.save(highlight);
                syncLogService.completeSync(syncLog, 1, 1, 0);
                log.info("Created APOD for date {}", date);
            }

        } catch (Exception e) {
            log.error("APOD sync failed: {}", e.getMessage(), e);
            syncLogService.failSync(syncLog, e.getMessage());
        }
    }
}
