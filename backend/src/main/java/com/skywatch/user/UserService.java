package com.skywatch.user;

import com.skywatch.user.dto.PreferencesUpdateRequest;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final LocationRepository locationRepository;

    public User getById(UUID userId) {
        return userRepository.findWithPreferredCityById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    @Transactional
    public User updatePreferences(UUID userId, PreferencesUpdateRequest request) {
        User user = getById(userId);

        if (request.preferredCityId() != null) {
            Location city = locationRepository.findById(request.preferredCityId())
                .orElseThrow(() -> new EntityNotFoundException("City not found"));
            user.setPreferredCity(city);
        }

        if (request.timezone() != null) {
            user.setTimezone(request.timezone());
        }

        if (request.astronomicalInterests() != null) {
            user.setAstronomicalInterests(request.astronomicalInterests());
        }

        if (request.language() != null) {
            user.setLanguage(request.language());
        }

        if (request.theme() != null) {
            user.setTheme(ThemePreference.valueOf(request.theme()));
        }

        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name().trim());
        }

        return userRepository.save(user);
    }

    @Transactional
    public User updateAvatarUrl(UUID userId, String avatarUrl) {
        User user = getById(userId);
        user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }
}
