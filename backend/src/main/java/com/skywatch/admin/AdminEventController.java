package com.skywatch.admin;

import com.skywatch.admin.dto.AdminEventUpdateRequest;
import com.skywatch.event.dto.EventDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/events")
@RequiredArgsConstructor
public class AdminEventController {

    private final AdminEventService adminEventService;

    @PatchMapping("/{id}")
    public ResponseEntity<EventDetailResponse> updateEvent(
            @PathVariable UUID id,
            @RequestBody AdminEventUpdateRequest request,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(adminEventService.updateEvent(userId, id, request));
    }
}
