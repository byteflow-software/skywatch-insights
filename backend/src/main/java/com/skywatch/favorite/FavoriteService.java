package com.skywatch.favorite;

import com.skywatch.event.AstronomicalEvent;
import com.skywatch.event.EventRepository;
import com.skywatch.shared.ConflictException;
import com.skywatch.user.User;
import com.skywatch.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Transactional
    public Favorite add(UUID userId, UUID eventId) {
        if (favoriteRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new ConflictException("Event already favorited");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
        AstronomicalEvent event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        return favoriteRepository.save(Favorite.builder().user(user).event(event).build());
    }

    @Transactional
    public void remove(UUID userId, UUID eventId) {
        if (!favoriteRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new EntityNotFoundException("Favorite not found");
        }
        favoriteRepository.deleteByUserIdAndEventId(userId, eventId);
    }

    public boolean isFavorited(UUID userId, UUID eventId) {
        return favoriteRepository.existsByUserIdAndEventId(userId, eventId);
    }

    public Page<Favorite> listByUser(UUID userId, Pageable pageable) {
        return favoriteRepository.findByUserId(userId, pageable);
    }
}
