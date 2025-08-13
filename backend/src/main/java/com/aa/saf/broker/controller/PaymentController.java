package com.aa.saf.broker.controller;

import com.aa.saf.broker.model.Payment;
import com.aa.saf.broker.service.PaymentService;
import com.stripe.exception.StripeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentService paymentService;

    /**
     * Create checkout session for an order
     */
    @PostMapping("/checkout")
    public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, Object> request) {
        try {
            Long orderId = Long.valueOf(request.get("orderId").toString());
            String userEmail = request.get("userEmail").toString();

            log.info("💳 Creating checkout session for order: {} by user: {}", orderId, userEmail);

            String checkoutUrl = paymentService.createCheckoutSession(orderId, userEmail);

            Map<String, String> response = new HashMap<>();
            response.put("checkoutUrl", checkoutUrl);
            response.put("message", "Checkout session created successfully");

            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            log.error("❌ Stripe error creating checkout session: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Payment processing error: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            log.error("❌ Error creating checkout session: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Handle successful payment (webhook or redirect)
     */
    @PostMapping("/success")
    public ResponseEntity<?> handleSuccessfulPayment(@RequestBody Map<String, String> request) {
        try {
            String sessionId = request.get("sessionId");
            log.info("💰 Handling successful payment for session: {}", sessionId);

            paymentService.handleSuccessfulPayment(sessionId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Payment processed successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error handling successful payment: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error processing payment success");
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Handle failed payment
     */
    @PostMapping("/failed")
    public ResponseEntity<?> handleFailedPayment(@RequestBody Map<String, String> request) {
        try {
            String sessionId = request.get("sessionId");
            String reason = request.getOrDefault("reason", "Payment failed");

            log.warn("💸 Handling failed payment for session: {}", sessionId);

            paymentService.handleFailedPayment(sessionId, reason);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed payment processed");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error handling failed payment: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error processing payment failure");
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get payment by order ID
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrder(@PathVariable Long orderId) {
        try {
            return paymentService.getPaymentByOrderId(orderId)
                .map(payment -> ResponseEntity.ok(payment))
                .orElse(ResponseEntity.notFound().build());

        } catch (Exception e) {
            log.error("❌ Error getting payment for order {}: {}", orderId, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving payment");
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get user's payment history
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserPayments(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<Payment> payments = paymentService.getUserPayments(userId, pageRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("payments", payments.getContent());
            response.put("totalPages", payments.getTotalPages());
            response.put("totalElements", payments.getTotalElements());
            response.put("currentPage", payments.getNumber());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error getting user payments for user {}: {}", userId, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving payment history");
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get payment analytics (admin only)
     */
    @GetMapping("/analytics")
    public ResponseEntity<?> getPaymentAnalytics() {
        try {
            log.info("📊 Retrieving payment analytics");
            Map<String, Object> analytics = paymentService.getPaymentAnalytics();
            return ResponseEntity.ok(analytics);

        } catch (Exception e) {
            log.error("❌ Error getting payment analytics: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error retrieving analytics");
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Refund a payment (admin only)
     */
    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<?> refundPayment(
            @PathVariable Long paymentId,
            @RequestBody Map<String, Object> request) {
        try {
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String reason = request.getOrDefault("reason", "Refund requested").toString();

            log.info("💸 Processing refund for payment: {} amount: {}", paymentId, amount);

            paymentService.refundPayment(paymentId, amount, reason);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Refund processed successfully");
            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            log.error("❌ Stripe error processing refund: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Refund processing error: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            log.error("❌ Error processing refund for payment {}: {}", paymentId, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error processing refund");
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Check payment status
     */
    @GetMapping("/{paymentId}/status")
    public ResponseEntity<?> getPaymentStatus(@PathVariable Long paymentId) {
        try {
            // This would typically check with Stripe for real-time status
            Map<String, String> response = new HashMap<>();
            response.put("message", "Payment status check endpoint");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error checking payment status: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error checking payment status");
            return ResponseEntity.badRequest().body(error);
        }
    }
}
