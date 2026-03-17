package com.skywatch.export;

import com.skywatch.export.dto.ExportListResponse;
import com.skywatch.export.dto.ExportRequest;
import com.skywatch.export.dto.ExportResponse;
import com.skywatch.export.dto.TemplateListResponse;
import com.skywatch.shared.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/exports")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    @PostMapping
    public ResponseEntity<ExportResponse> createExport(
            @Valid @RequestBody ExportRequest request,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        ExportResponse response = exportService.createExport(userId, request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExportResponse> getExportById(
            @PathVariable UUID id,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(exportService.getExportById(userId, id));
    }

    @GetMapping
    public ResponseEntity<PageResponse<ExportListResponse>> listExports(
            @RequestParam(required = false) UUID eventId,
            @RequestParam(required = false) SocialNetwork network,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(exportService.listExports(userId, eventId, network, page, Math.min(size, 100)));
    }

    @GetMapping("/templates")
    public ResponseEntity<List<TemplateListResponse>> listTemplates(
            @RequestParam(required = false) SocialNetwork network) {
        return ResponseEntity.ok(exportService.listTemplates(network));
    }
}
