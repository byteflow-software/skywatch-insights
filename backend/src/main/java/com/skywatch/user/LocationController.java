package com.skywatch.user;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationRepository locationRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "10") int limit) {
        List<Location> locations = locationRepository.searchByName(q, PageRequest.of(0, limit));
        var data = locations.stream().map(loc -> Map.of(
            "id", loc.getId(),
            "name", loc.getName(),
            "countryCode", loc.getCountryCode(),
            "timezone", loc.getTimezone()
        )).toList();
        return ResponseEntity.ok(Map.of("data", data));
    }
}
