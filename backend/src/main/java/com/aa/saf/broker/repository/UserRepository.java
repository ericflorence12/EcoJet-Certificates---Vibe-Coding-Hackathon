package com.aa.saf.broker.repository;

import com.aa.saf.broker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByActiveTrue();
    
    List<User> findByRole(User.UserRole role);
    
    @Query("SELECT u FROM User u WHERE u.company = :company AND u.active = true")
    List<User> findActiveUsersByCompany(@Param("company") String company);
    
    @Query("SELECT u FROM User u WHERE u.createdAt >= :since")
    List<User> findUsersCreatedSince(@Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.active = true")
    long countActiveUsers();

    // Date-based counting methods for analytics
    Long countByCreatedAtAfter(LocalDateTime after);
    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
