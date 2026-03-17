package com.skywatch.forecast;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class ForecastScheduler {

    private final ForecastRepository forecastRepository;
    private final ForecastService forecastService;

    @Scheduled(fixedRate = 3 * 60 * 60 * 1000) // Every 3 hours
    public void recalculateForecasts() {
        log.info("Starting scheduled forecast recalculation");
        var forecasts = forecastRepository.findAll();
        for (var forecast : forecasts) {
            try {
                forecastService.calculateAndSave(
                    forecast.getEvent().getId(),
                    forecast.getLocation().getId()
                );
            } catch (Exception e) {
                log.error("Failed to recalculate forecast {}: {}", forecast.getId(), e.getMessage());
            }
        }
        log.info("Completed forecast recalculation for {} entries", forecasts.size());
    }
}
