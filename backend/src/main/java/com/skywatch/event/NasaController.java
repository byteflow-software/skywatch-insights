package com.skywatch.event;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/nasa")
@RequiredArgsConstructor
public class NasaController {

    private final NasaApiClient nasaApiClient;

    /**
     * Get NASA Astronomy Picture of the Day.
     */
    @GetMapping("/apod")
    public ResponseEntity<NasaApiClient.ApodData> getApod(
            @RequestParam(required = false) LocalDate date) {
        return nasaApiClient.getApod(date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    /**
     * Get Near Earth Objects for the next 7 days.
     */
    @GetMapping("/neo")
    public ResponseEntity<List<NasaApiClient.NeoData>> getNearEarthObjects(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now();
        LocalDate end = endDate != null ? endDate : start.plusDays(7);
        return ResponseEntity.ok(nasaApiClient.getNearEarthObjects(start, end));
    }

    /**
     * Get space weather events (solar flares, geomagnetic storms, CMEs).
     */
    @GetMapping("/space-weather")
    public ResponseEntity<Map<String, Object>> getSpaceWeather(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        return ResponseEntity.ok(Map.of(
                "solarFlares", nasaApiClient.getSolarFlares(start, end),
                "geomagneticStorms", nasaApiClient.getGeomagneticStorms(start, end),
                "coronalMassEjections", nasaApiClient.getCoronalMassEjections(start, end)
        ));
    }
}
