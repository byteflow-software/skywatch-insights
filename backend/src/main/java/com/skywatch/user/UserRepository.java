package com.skywatch.user;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    @EntityGraph(attributePaths = "preferredCity")
    Optional<User> findWithPreferredCityById(UUID id);

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
