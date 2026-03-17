package com.skywatch.auth;

import com.skywatch.auth.dto.LoginRequest;
import com.skywatch.auth.dto.LoginResponse;
import com.skywatch.auth.dto.RegisterRequest;
import com.skywatch.config.JwtUtil;
import com.skywatch.shared.ConflictException;
import com.skywatch.user.User;
import com.skywatch.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${app.jwt.expiration}")
    private long accessTokenExpiration;

    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered");
        }

        User user = User.builder()
            .name(request.name())
            .email(request.email().toLowerCase())
            .passwordHash(passwordEncoder.encode(request.password()))
            .build();

        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase())
            .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return generateTokens(user);
    }

    public LoginResponse refresh(String refreshToken) {
        if (!jwtUtil.isValid(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        String type = jwtUtil.getType(refreshToken);
        if (!"refresh".equals(type)) {
            throw new IllegalArgumentException("Invalid token type");
        }

        var userId = jwtUtil.getUserId(refreshToken);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return generateTokens(user);
    }

    private LoginResponse generateTokens(User user) {
        String accessToken = jwtUtil.generateAccessToken(
            user.getId(), user.getEmail(), user.getRole().name()
        );
        String refreshTokenStr = jwtUtil.generateRefreshToken(
            user.getId(), user.getEmail(), user.getRole().name()
        );

        return LoginResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshTokenStr)
            .expiresIn(accessTokenExpiration)
            .build();
    }
}
