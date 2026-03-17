package com.skywatch.location;

import com.skywatch.user.Location;
import com.skywatch.user.LocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/cities")
@RequiredArgsConstructor
@Slf4j
public class CitySearchController {

    private final LocationRepository locationRepository;
    private final BrazilCitySearchClient citySearchClient;

    /**
     * Search cities by name or CEP.
     * First searches local DB, then falls back to external APIs (Nominatim + ViaCEP).
     * Creates location in DB on-the-fly if found externally.
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchCities(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {

        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.ok(Map.of("data", List.of()));
        }

        String query = q.trim();
        List<Map<String, Object>> results = new ArrayList<>();
        Set<String> addedNames = new HashSet<>();

        // 1. Check if it's a CEP (8 digits)
        String cleanQuery = query.replaceAll("[^0-9]", "");
        if (cleanQuery.length() == 8) {
            var cepResult = citySearchClient.searchByCep(query);
            if (cepResult.isPresent()) {
                var city = cepResult.get();
                Location location = findOrCreateLocation(city);
                results.add(locationToMap(location));
                addedNames.add(location.getName().toLowerCase());
            }
        }

        // 2. Search local DB
        List<Location> dbLocations = locationRepository.searchByName(query, PageRequest.of(0, limit));
        for (Location loc : dbLocations) {
            if (!addedNames.contains(loc.getName().toLowerCase())) {
                results.add(locationToMap(loc));
                addedNames.add(loc.getName().toLowerCase());
            }
        }

        // 3. If fewer than limit results, search externally
        if (results.size() < limit && cleanQuery.length() != 8) {
            List<BrazilCitySearchClient.CityResult> externalResults = citySearchClient.searchByName(query);
            for (var city : externalResults) {
                if (results.size() >= limit) break;
                if (addedNames.contains(city.name().toLowerCase())) continue;

                Location location = findOrCreateLocation(city);
                results.add(locationToMap(location));
                addedNames.add(city.name().toLowerCase());
            }
        }

        return ResponseEntity.ok(Map.of("data", results));
    }

    /**
     * Get city by CEP.
     */
    @GetMapping("/cep/{cep}")
    public ResponseEntity<?> searchByCep(@PathVariable String cep) {
        var result = citySearchClient.searchByCep(cep);
        if (result.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Location location = findOrCreateLocation(result.get());
        return ResponseEntity.ok(locationToMap(location));
    }

    private Location findOrCreateLocation(BrazilCitySearchClient.CityResult city) {
        // Check if location already exists by name (approximate match)
        List<Location> existing = locationRepository.searchByName(city.name(), PageRequest.of(0, 1));
        if (!existing.isEmpty()) {
            Location loc = existing.get(0);
            // Update coordinates if they were missing
            if (loc.getLatitude().doubleValue() == 0 && city.latitude() != null) {
                loc.setLatitude(city.latitude());
                loc.setLongitude(city.longitude());
                return locationRepository.save(loc);
            }
            return loc;
        }

        // Create new location
        String timezone = resolveTimezone(city.state());
        Location location = Location.builder()
                .name(city.name())
                .latitude(city.latitude())
                .longitude(city.longitude())
                .countryCode("BR")
                .timezone(timezone)
                .build();

        return locationRepository.save(location);
    }

    private String resolveTimezone(String state) {
        if (state == null || state.isEmpty()) return "America/Sao_Paulo";

        return switch (state.toUpperCase()) {
            case "AC" -> "America/Rio_Branco";
            case "AM", "RR", "RO", "MT" -> "America/Manaus";
            case "PA", "AP", "TO", "MA" -> "America/Belem";
            case "PI", "CE", "RN", "PB", "PE", "AL", "SE", "BA" -> "America/Fortaleza";
            case "FN" -> "America/Noronha"; // Fernando de Noronha
            default -> "America/Sao_Paulo";
        };
    }

    private Map<String, Object> locationToMap(Location loc) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", loc.getId());
        map.put("name", loc.getName());
        map.put("countryCode", loc.getCountryCode());
        map.put("timezone", loc.getTimezone());
        map.put("latitude", loc.getLatitude());
        map.put("longitude", loc.getLongitude());
        return map;
    }
}
