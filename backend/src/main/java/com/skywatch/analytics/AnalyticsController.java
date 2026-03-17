package com.skywatch.analytics;

import com.skywatch.analytics.dto.TrackRequest;
import com.skywatch.user.User;
import com.skywatch.user.UserRole;
import com.skywatch.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserService userService;

    @PostMapping("/track")
    public ResponseEntity<Void> track(
            @RequestBody TrackRequest request,
            Authentication auth) {
        UUID userId = auth != null ? (UUID) auth.getPrincipal() : null;

        AnalyticsAction action = AnalyticsAction.valueOf(request.action());

        analyticsService.track(userId, action, request.targetType(), request.targetId(), request.metadata());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();

        User user = userService.getById(userId);
        if (user.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can view analytics stats");
        }

        return ResponseEntity.ok(analyticsService.getStats());
    }
}
