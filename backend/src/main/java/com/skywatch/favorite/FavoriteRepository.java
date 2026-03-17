package com.skywatch.favorite;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface FavoriteRepository extends JpaRepository<Favorite, UUID> {
    Optional<Favorite> findByUserIdAndEventId(UUID userId, UUID eventId);
    boolean existsByUserIdAndEventId(UUID userId, UUID eventId);
    @Query(value = "SELECT f FROM Favorite f JOIN FETCH f.event WHERE f.user.id = :userId",
           countQuery = "SELECT count(f) FROM Favorite f WHERE f.user.id = :userId")
    Page<Favorite> findByUserId(@Param("userId") UUID userId, Pageable pageable);
    void deleteByUserIdAndEventId(UUID userId, UUID eventId);

    @Query("SELECT f.event.id FROM Favorite f WHERE f.user.id = :userId")
    Set<UUID> findEventIdsByUserId(@Param("userId") UUID userId);
}
