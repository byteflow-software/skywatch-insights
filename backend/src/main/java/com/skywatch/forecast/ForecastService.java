package com.skywatch.forecast;

import com.skywatch.event.AstronomicalEvent;
import com.skywatch.event.EventRepository;
import com.skywatch.forecast.dto.ForecastResponse;
import com.skywatch.user.Location;
import com.skywatch.user.LocationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ForecastService {

    private final ForecastRepository forecastRepository;
    private final EventRepository eventRepository;
    private final LocationRepository locationRepository;
    private final ForecastMapper forecastMapper;
    private final WeatherApiClient weatherApiClient;

    public ForecastResponse getForecast(UUID eventId, UUID locationId) {
        VisibilityForecast forecast = forecastRepository.findByEventIdAndLocationId(eventId, locationId)
            .orElseGet(() -> calculateAndSave(eventId, locationId));
        return forecastMapper.toResponse(forecast);
    }

    @Transactional
    public VisibilityForecast calculateAndSave(UUID eventId, UUID locationId) {
        AstronomicalEvent event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EntityNotFoundException("Event not found"));
        Location location = locationRepository.findById(locationId)
            .orElseThrow(() -> new EntityNotFoundException("Location not found"));

        // Fetch real weather data from OpenWeatherMap
        Instant targetTime = event.getStartAt();
        Optional<WeatherData> weatherOpt = weatherApiClient.getForecast(
                location.getLatitude(), location.getLongitude(), targetTime);

        Integer cloudCoverage = null;
        Integer humidity = null;
        Integer visibilityMeters = null;
        String weatherSummary;
        int score;

        if (weatherOpt.isPresent()) {
            WeatherData weather = weatherOpt.get();
            cloudCoverage = weather.getCloudCoverage();
            humidity = weather.getHumidity();
            visibilityMeters = weather.getVisibility();
            score = calculateScoreFromWeather(event, weather);
            weatherSummary = buildWeatherSummary(location.getName(), weather);
            log.info("Forecast calculated with real weather data for event={} location={} score={}",
                    event.getSlug(), location.getName(), score);
        } else {
            // Fallback: estimate based on event relevance and latitude
            score = calculateFallbackScore(event, location);
            weatherSummary = "Previsão estimada para " + location.getName()
                    + " (dados meteorológicos indisponíveis)";
            log.info("Forecast calculated with fallback for event={} location={} score={}",
                    event.getSlug(), location.getName(), score);
        }

        Instant bestStart = event.getStartAt().plus(1, ChronoUnit.HOURS);
        Instant bestEnd = event.getEndAt().minus(1, ChronoUnit.HOURS);
        if (bestEnd.isBefore(bestStart)) {
            bestStart = event.getStartAt();
            bestEnd = event.getEndAt();
        }

        // Upsert: update existing or create new
        VisibilityForecast forecast = forecastRepository
                .findByEventIdAndLocationId(eventId, locationId)
                .orElse(new VisibilityForecast());

        forecast.setEvent(event);
        forecast.setLocation(location);
        forecast.setBestWindowStart(bestStart);
        forecast.setBestWindowEnd(bestEnd);
        forecast.setObservabilityScore(score);
        forecast.setCloudCoverage(cloudCoverage);
        forecast.setHumidity(humidity);
        forecast.setVisibility(visibilityMeters);
        forecast.setWeatherSummary(weatherSummary);
        forecast.setCalculatedAt(Instant.now());

        return forecastRepository.save(forecast);
    }

    /**
     * Calculate observability score using real weather data.
     * Score = weighted combination of cloud coverage, humidity, visibility, and event relevance.
     */
    private int calculateScoreFromWeather(AstronomicalEvent event, WeatherData weather) {
        // Cloud coverage is the biggest factor for astronomical observation
        // 0% clouds = 100 points, 100% clouds = 0 points
        double cloudScore = (100.0 - weather.getCloudCoverage()) * 0.45;

        // Humidity affects atmospheric clarity
        // 0% humidity = 100 points, 100% humidity = 0 points
        double humidityScore = (100.0 - weather.getHumidity()) * 0.15;

        // Visibility in meters (max 10000)
        // 10000m = 100 points, 0m = 0 points
        double visScore = (weather.getVisibility() / 100.0) * 0.20;

        // Event relevance contributes to overall score
        double eventScore = event.getRelevanceScore() * 0.20;

        int totalScore = (int) Math.round(cloudScore + humidityScore + visScore + eventScore);
        return Math.max(0, Math.min(100, totalScore));
    }

    /**
     * Fallback score when weather data is unavailable.
     */
    private int calculateFallbackScore(AstronomicalEvent event, Location location) {
        int baseScore = event.getRelevanceScore();
        double latFactor = 1.0 - (Math.abs(location.getLatitude().doubleValue()) / 90.0) * 0.2;
        return Math.max(10, Math.min(100, (int) (baseScore * latFactor)));
    }

    private String buildWeatherSummary(String locationName, WeatherData weather) {
        StringBuilder sb = new StringBuilder();
        sb.append(locationName).append(": ");
        sb.append(weather.getDescription());
        sb.append(String.format(". Nuvens: %d%%, Umidade: %d%%, Visibilidade: %dm",
                weather.getCloudCoverage(), weather.getHumidity(), weather.getVisibility()));
        if (weather.getTemperature() != 0) {
            sb.append(String.format(", Temp: %.0f°C", weather.getTemperature()));
        }
        return sb.toString();
    }
}
