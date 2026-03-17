package com.skywatch.highlight;

import com.skywatch.event.AstronomicalEvent;
import com.skywatch.event.EventMapper;
import com.skywatch.highlight.dto.DailyHighlightDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/highlights")
@RequiredArgsConstructor
public class HighlightController {

    private final HighlightService highlightService;
    private final EventMapper eventMapper;

    @GetMapping("/week")
    public ResponseEntity<?> getWeeklyHighlight() {
        AstronomicalEvent event = highlightService.getWeeklyEventOrAutoSelect();
        if (event == null) {
            return ResponseEntity.noContent().build();
        }
        var highlight = highlightService.getWeeklyHighlight().orElse(null);
        var eventResponse = eventMapper.toDetailResponse(event, false);
        if (highlight != null) {
            return ResponseEntity.ok(Map.of(
                "highlight", Map.of(
                    "id", highlight.getId(),
                    "type", highlight.getType().name(),
                    "editorialNote", highlight.getEditorialNote() != null ? highlight.getEditorialNote() : "",
                    "startDate", highlight.getStartDate().toString(),
                    "endDate", highlight.getEndDate().toString()
                ),
                "event", eventResponse
            ));
        }
        return ResponseEntity.ok(Map.of("highlight", Map.of(), "event", eventResponse));
    }

    @GetMapping("/today")
    public ResponseEntity<DailyHighlightDTO> getTodayHighlight() {
        var highlight = highlightService.getTodayHighlight();
        if (highlight.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        var h = highlight.get();
        return ResponseEntity.ok(DailyHighlightDTO.builder()
                .date(h.getDate().toString())
                .title(h.getTitle())
                .explanation(h.getExplanation())
                .imageUrl(h.getImageUrl())
                .hdImageUrl(h.getHdImageUrl())
                .mediaType(h.getMediaType())
                .copyright(h.getCopyright())
                .build());
    }
}
