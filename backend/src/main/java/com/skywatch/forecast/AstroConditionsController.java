package com.skywatch.forecast;

import com.skywatch.user.Location;
import com.skywatch.user.LocationRepository;
import com.skywatch.user.User;
import com.skywatch.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Returns combined astronomical observation conditions from multiple APIs:
 * - Open-Meteo (cloud layers, dew point, visibility)
 * - Sunrise-Sunset (twilight times)
 * - OpenWeatherMap (general weather)
 */
@RestController
@RequestMapping("/api/v1/astro-conditions")
@RequiredArgsConstructor
public class AstroConditionsController {

    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final OpenMeteoClient openMeteoClient;
    private final SunriseSunsetClient sunriseSunsetClient;
    private final WeatherApiClient weatherApiClient;
    private final UsnoMoonClient usnoMoonClient;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> getCurrentConditions(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (user.getPreferredCity() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "NO_CITY",
                    "message", "Selecione sua cidade preferida primeiro"
            ));
        }

        Location location = user.getPreferredCity();
        return buildConditionsResponse(location);
    }

    @GetMapping("/location/{locationId}")
    public ResponseEntity<?> getConditionsForLocation(@PathVariable UUID locationId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new EntityNotFoundException("Location not found"));
        return buildConditionsResponse(location);
    }

    private ResponseEntity<?> buildConditionsResponse(Location location) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("location", Map.of(
                "id", location.getId(),
                "name", location.getName(),
                "latitude", location.getLatitude(),
                "longitude", location.getLongitude()
        ));

        // Open-Meteo: detailed cloud layers and conditions
        var astroWeather = openMeteoClient.getAstroWeather(location.getLatitude(), location.getLongitude());
        if (astroWeather.isPresent()) {
            var aw = astroWeather.get();
            Map<String, Object> clouds = new LinkedHashMap<>();
            clouds.put("total", aw.getCloudTotal());
            clouds.put("low", aw.getCloudLow());
            clouds.put("mid", aw.getCloudMid());
            clouds.put("high", aw.getCloudHigh());

            Map<String, Object> conditions = new LinkedHashMap<>();
            conditions.put("clouds", clouds);
            conditions.put("temperature", aw.getTemperature());
            conditions.put("humidity", aw.getHumidity());
            conditions.put("dewPoint", aw.getDewPoint());
            conditions.put("windSpeed", aw.getWindSpeed());
            conditions.put("visibility", aw.getVisibility());
            conditions.put("isDay", aw.isDay());
            conditions.put("precipitation", aw.getPrecipitation());

            // Calculate seeing quality based on conditions
            String seeingQuality = calculateSeeingQuality(aw);
            conditions.put("seeingQuality", seeingQuality);

            response.put("conditions", conditions);
        }

        // Sunrise-Sunset: twilight times
        var sunData = sunriseSunsetClient.getSunData(location.getLatitude(), location.getLongitude());
        if (sunData.isPresent()) {
            var sd = sunData.get();
            Map<String, Object> sun = new LinkedHashMap<>();
            sun.put("sunrise", sd.getSunrise());
            sun.put("sunset", sd.getSunset());
            sun.put("solarNoon", sd.getSolarNoon());
            sun.put("dayLength", sd.getDayLength());

            Map<String, Object> twilight = new LinkedHashMap<>();
            twilight.put("civilBegin", sd.getCivilTwilightBegin());
            twilight.put("civilEnd", sd.getCivilTwilightEnd());
            twilight.put("nauticalBegin", sd.getNauticalTwilightBegin());
            twilight.put("nauticalEnd", sd.getNauticalTwilightEnd());
            twilight.put("astronomicalBegin", sd.getAstronomicalTwilightBegin());
            twilight.put("astronomicalEnd", sd.getAstronomicalTwilightEnd());
            sun.put("twilight", twilight);

            response.put("sun", sun);
        }

        // OpenWeatherMap: general weather description
        var currentWeather = weatherApiClient.getCurrentWeather(
                location.getLatitude(), location.getLongitude());
        if (currentWeather.isPresent()) {
            var cw = currentWeather.get();
            response.put("weather", Map.of(
                    "description", cw.getDescription(),
                    "icon", cw.getIcon(),
                    "temperature", cw.getTemperature()
            ));
        }

        // USNO: moon phase and illumination
        var moonData = usnoMoonClient.getMoonData(
                location.getLatitude(), location.getLongitude(), location.getTimezone());
        if (moonData.isPresent()) {
            var md = moonData.get();
            Map<String, Object> moon = new LinkedHashMap<>();
            moon.put("phase", md.phase());
            moon.put("illumination", md.illumination());
            moon.put("rise", md.rise());
            moon.put("set", md.set());
            if (md.closestPhaseName() != null) {
                Map<String, Object> closestPhase = new LinkedHashMap<>();
                closestPhase.put("name", md.closestPhaseName());
                closestPhase.put("date", md.closestPhaseDate());
                moon.put("closestPhase", closestPhase);
            }
            response.put("moon", moon);
        }

        return ResponseEntity.ok(response);
    }

    private String calculateSeeingQuality(OpenMeteoClient.AstroWeather weather) {
        int score = 100;

        // Cloud cover is the biggest factor
        score -= weather.getCloudTotal() * 0.5;

        // High clouds are worse for astronomy than low clouds
        score -= weather.getCloudHigh() * 0.2;

        // High humidity degrades seeing
        if (weather.getHumidity() > 80) score -= 15;
        else if (weather.getHumidity() > 60) score -= 5;

        // Wind affects seeing (telescope shake + atmospheric turbulence)
        if (weather.getWindSpeed() > 30) score -= 20;
        else if (weather.getWindSpeed() > 15) score -= 10;

        // Precipitation makes observation impossible
        if (weather.getPrecipitation() > 0) score -= 40;

        // Low dew point margin means possible condensation on optics
        double dewMargin = weather.getTemperature() - weather.getDewPoint();
        if (dewMargin < 2) score -= 15;
        else if (dewMargin < 5) score -= 5;

        if (score >= 80) return "Excelente";
        if (score >= 60) return "Boa";
        if (score >= 40) return "Moderada";
        if (score >= 20) return "Ruim";
        return "Pessima";
    }
}
