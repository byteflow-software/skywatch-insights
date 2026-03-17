package com.skywatch.user;

import com.skywatch.export.VercelBlobStorageService;
import com.skywatch.user.dto.PreferencesUpdateRequest;
import com.skywatch.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/me")
@RequiredArgsConstructor
public class UserController {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5MB

    private final UserService userService;
    private final UserMapper userMapper;
    private final VercelBlobStorageService blobStorageService;

    @GetMapping
    public ResponseEntity<UserResponse> getProfile(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        User user = userService.getById(userId);
        return ResponseEntity.ok(userMapper.toResponse(user));
    }

    @PatchMapping("/preferences")
    public ResponseEntity<UserResponse> updatePreferences(
            Authentication auth,
            @RequestBody PreferencesUpdateRequest request) {
        UUID userId = (UUID) auth.getPrincipal();
        User user = userService.updatePreferences(userId, request);
        return ResponseEntity.ok(userMapper.toResponse(user));
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> uploadAvatar(
            Authentication auth,
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().build();
        }

        if (file.getSize() > MAX_SIZE) {
            return ResponseEntity.badRequest().build();
        }

        UUID userId = (UUID) auth.getPrincipal();
        String pathname = "avatars/" + userId + "/" + file.getOriginalFilename();
        var url = blobStorageService.upload(pathname, file.getBytes(), contentType);

        if (url.isEmpty()) {
            return ResponseEntity.internalServerError().build();
        }

        User user = userService.updateAvatarUrl(userId, url.get());
        return ResponseEntity.ok(userMapper.toResponse(user));
    }

    @DeleteMapping("/avatar")
    public ResponseEntity<UserResponse> deleteAvatar(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        User user = userService.updateAvatarUrl(userId, null);
        return ResponseEntity.ok(userMapper.toResponse(user));
    }
}
