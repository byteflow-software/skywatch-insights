package com.skywatch.forecast;

import com.skywatch.forecast.dto.ForecastResponse;
import com.skywatch.user.User;
import com.skywatch.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class ForecastController {

    private final ForecastService forecastService;
    private final UserRepository userRepository;

    @GetMapping("/{id}/forecast")
    @Transactional(readOnly = true)
    public ResponseEntity<ForecastResponse> getForecast(@PathVariable UUID id, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (user.getPreferredCity() == null) {
            throw new IllegalArgumentException("Please set your preferred city first");
        }

        UUID locationId = user.getPreferredCity().getId();
        return ResponseEntity.ok(forecastService.getForecast(id, locationId));
    }
}
