package com.skywatch.admin;

import com.skywatch.astrosync.DataSyncLog;
import com.skywatch.astrosync.SyncLogService;
import com.skywatch.shared.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/sync-logs")
@RequiredArgsConstructor
public class AdminSyncLogController {

    private final SyncLogService syncLogService;

    @GetMapping
    public ResponseEntity<PageResponse<DataSyncLog>> getSyncLogs(
            @RequestParam(required = false) String source,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var logs = syncLogService.getLogs(source, page, Math.min(size, 100));
        return ResponseEntity.ok(PageResponse.from(logs, logs.getContent()));
    }
}
