package com.aa.saf.broker.repository;

import com.aa.saf.broker.model.Payment;
import com.aa.saf.broker.model.Payment.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Find by Stripe identifiers
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
    Optional<Payment> findByStripeSessionId(String stripeSessionId);

    // Find by order
    List<Payment> findByOrderId(Long orderId);
    Optional<Payment> findByOrderIdAndStatus(Long orderId, PaymentStatus status);

    // Find by user
    Page<Payment> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Payment> findByUserIdAndStatus(Long userId, PaymentStatus status);

    // Find by status
    List<Payment> findByStatus(PaymentStatus status);
    List<Payment> findByStatusIn(List<PaymentStatus> statuses);

    // Analytics queries
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status")
    BigDecimal getTotalAmountByStatus(@Param("status") PaymentStatus status);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status AND p.createdAt >= :startDate")
    BigDecimal getTotalAmountByStatusAndDateAfter(@Param("status") PaymentStatus status, 
                                                 @Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(p.netAmount) FROM Payment p WHERE p.status = :status")
    BigDecimal getTotalNetRevenue(@Param("status") PaymentStatus status);

    @Query("SELECT SUM(p.stripeFee) FROM Payment p WHERE p.status = :status")
    BigDecimal getTotalStripeFees(@Param("status") PaymentStatus status);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = :status AND p.createdAt >= :startDate AND p.createdAt <= :endDate")
    Long countByStatusAndDateRange(@Param("status") PaymentStatus status,
                                  @Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate);

    @Query("SELECT p.paymentMethod, COUNT(p) FROM Payment p WHERE p.status = :status GROUP BY p.paymentMethod")
    List<Object[]> getPaymentMethodStats(@Param("status") PaymentStatus status);

    // Recent payments for admin dashboard
    List<Payment> findTop10ByOrderByCreatedAtDesc();

    // Failed payments for monitoring
    List<Payment> findByStatusAndCreatedAtAfter(PaymentStatus status, LocalDateTime after);
    Long countByStatusAndCreatedAtAfter(PaymentStatus status, LocalDateTime after);

    // Monthly revenue
    @Query("SELECT EXTRACT(YEAR FROM p.completedAt) as year, EXTRACT(MONTH FROM p.completedAt) as month, SUM(p.netAmount) as revenue " +
           "FROM Payment p WHERE p.status = :status AND p.completedAt >= :startDate " +
           "GROUP BY EXTRACT(YEAR FROM p.completedAt), EXTRACT(MONTH FROM p.completedAt) ORDER BY year, month")
    List<Object[]> getMonthlyRevenue(@Param("status") PaymentStatus status, @Param("startDate") LocalDateTime startDate);
}
