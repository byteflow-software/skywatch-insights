package com.skywatch.favorite;

import com.skywatch.event.EventMapper;
import com.skywatch.event.dto.EventListResponse;
import com.skywatch.shared.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final EventMapper eventMapper;

    @PostMapping("/events/{eventId}/favorite")
    public ResponseEntity<Map<String, Object>> addFavorite(@PathVariable UUID eventId, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        Favorite fav = favoriteService.add(userId, eventId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "id", fav.getId(),
            "eventId", eventId,
            "createdAt", fav.getCreatedAt()
        ));
    }

    @DeleteMapping("/events/{eventId}/favorite")
    public ResponseEntity<Void> removeFavorite(@PathVariable UUID eventId, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        favoriteService.remove(userId, eventId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/favorites")
    public ResponseEntity<PageResponse<EventListResponse>> listFavorites(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        var favPage = favoriteService.listByUser(userId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        var content = favPage.getContent().stream()
            .map(f -> eventMapper.toListResponseTruncated(f.getEvent(), true))
            .toList();
        return ResponseEntity.ok(PageResponse.from(favPage, content));
    }
}
