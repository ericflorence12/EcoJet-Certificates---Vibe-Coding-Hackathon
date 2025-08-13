package com.aa.saf.broker.repository;

import com.aa.saf.broker.model.Order;
import com.aa.saf.broker.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Find orders by user
    List<Order> findByUser(User user);
    List<Order> findByUserEmail(String userEmail);
    Page<Order> findByUser(User user, Pageable pageable);
    
    // Find orders by status
    List<Order> findByStatus(Order.OrderStatus status);
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);
    
    // Find orders by date range
    @Query("SELECT o FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate")
    List<Order> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT o FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt <= :endDate")
    Page<Order> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
    
    // Find orders by user and status
    List<Order> findByUserAndStatus(User user, Order.OrderStatus status);
    Page<Order> findByUserAndStatus(User user, Order.OrderStatus status, Pageable pageable);
    
    // Find orders by flight information
    List<Order> findByFlightNumber(String flightNumber);
    List<Order> findByDepartureAirportAndArrivalAirport(String departureAirport, String arrivalAirport);
    
    // Complex queries
    @Query("SELECT o FROM Order o WHERE o.user = :user AND o.status = :status AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
    Page<Order> findByUserAndStatusAndDateRange(
            @Param("user") User user, 
            @Param("status") Order.OrderStatus status,
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate, 
            Pageable pageable);
    
    // Statistics queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") Order.OrderStatus status);
    
    @Query("SELECT SUM(o.safVolume) FROM Order o WHERE o.status = :status")
    Double getTotalSafVolumeByStatus(@Param("status") Order.OrderStatus status);
    
    @Query("SELECT SUM(o.platformFeeUsd) FROM Order o WHERE o.status = :status")
    Double getTotalRevenueByStatus(@Param("status") Order.OrderStatus status);

    // Total metrics (all completed orders)
    @Query("SELECT SUM(o.safVolume) FROM Order o WHERE o.status = 'COMPLETED'")
    Double getTotalSafVolume();

    @Query("SELECT SUM(o.flightEmissions * 0.8) FROM Order o WHERE o.status = 'COMPLETED'")
    Double getTotalEmissionsReduced();

    // Date-based counting methods
    Long countByCreatedAtAfter(LocalDateTime after);
    Long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // Convenience methods for completed orders
    default Double getTotalSafVolumeCompleted() {
        return getTotalSafVolumeByStatus(Order.OrderStatus.COMPLETED);
    }
    
    default Double getTotalRevenueCompleted() {
        return getTotalRevenueByStatus(Order.OrderStatus.COMPLETED);
    }
    
    @Query("SELECT o FROM Order o WHERE o.user.company = :company ORDER BY o.createdAt DESC")
    List<Order> findByUserCompany(@Param("company") String company);
}
