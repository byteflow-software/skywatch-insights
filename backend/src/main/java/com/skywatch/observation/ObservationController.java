package com.skywatch.observation;

import com.skywatch.observation.dto.CreateObservationRequest;
import com.skywatch.observation.dto.ObservationResponse;
import com.skywatch.shared.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/observations")
@RequiredArgsConstructor
public class ObservationController {

    private final ObservationService observationService;

    @PostMapping
    public ResponseEntity<ObservationResponse> create(
            @Valid @RequestBody CreateObservationRequest request,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(observationService.create(userId, request));
    }

    @GetMapping
    public ResponseEntity<PageResponse<ObservationResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(observationService.list(userId, page, Math.min(size, 100)));
    }
}
