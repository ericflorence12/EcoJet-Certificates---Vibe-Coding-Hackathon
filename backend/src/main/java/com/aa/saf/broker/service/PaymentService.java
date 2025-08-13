package com.aa.saf.broker.service;

import com.aa.saf.broker.model.Order;
import com.aa.saf.broker.model.Payment;
import com.aa.saf.broker.model.User;
import com.aa.saf.broker.model.Certificate;
import com.aa.saf.broker.repository.PaymentRepository;
import com.aa.saf.broker.repository.OrderRepository;
import com.aa.saf.broker.repository.CertificateRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    @Value("${stripe.secret.key:sk_test_default}")
    private String stripeSecretKey;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private RegistryService registryService;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
        log.info("💳 Stripe payment service initialized");
    }

    /**
     * Create a Stripe Checkout Session for an order
     */
    @Transactional
    public String createCheckoutSession(Long orderId, String userEmail) throws StripeException {
        log.info("💳 Creating checkout session for order: {} by user: {}", orderId, userEmail);

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        // Calculate total amount (order price + platform fee)
        BigDecimal totalAmount = order.getPriceUsd().add(order.getPlatformFeeUsd());
        long amountInCents = totalAmount.multiply(BigDecimal.valueOf(100)).longValue();

        // Create payment record
        Payment payment = new Payment(order, order.getUser(), totalAmount);
        payment = paymentRepository.save(payment);

        // Create Stripe session
        SessionCreateParams params = SessionCreateParams.builder()
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setSuccessUrl(frontendUrl + "/orders/success?session_id={CHECKOUT_SESSION_ID}")
            .setCancelUrl(frontendUrl + "/orders/cancel?order_id=" + orderId)
            .setCustomerEmail(userEmail)
            .addLineItem(
                SessionCreateParams.LineItem.builder()
                    .setQuantity(1L)
                    .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("usd")
                            .setUnitAmount(amountInCents)
                            .setProductData(
                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName("SAF Certificate - Flight " + order.getFlightNumber())
                                    .setDescription(String.format("%.1fL SAF for %s → %s", 
                                        order.getSafVolume(),
                                        order.getDepartureAirport(),
                                        order.getArrivalAirport()))
                                    .build()
                            )
                            .build()
                    )
                    .build()
            )
            .putMetadata("order_id", orderId.toString())
            .putMetadata("payment_id", payment.getId().toString())
            .build();

        Session session = Session.create(params);

        // Update payment with session ID
        payment.setStripeSessionId(session.getId());
        payment.setStatus(Payment.PaymentStatus.PROCESSING);
        paymentRepository.save(payment);

        log.info("✅ Checkout session created: {} for order: {}", session.getId(), orderId);
        return session.getUrl();
    }

    /**
     * Handle successful payment completion
     */
    @Transactional
    public void handleSuccessfulPayment(String sessionId) {
        log.info("💰 Processing successful payment for session: {}", sessionId);

        try {
            Session session = Session.retrieve(sessionId);
            
            Optional<Payment> paymentOpt = paymentRepository.findByStripeSessionId(sessionId);
            if (paymentOpt.isEmpty()) {
                log.error("❌ Payment not found for session: {}", sessionId);
                return;
            }

            Payment payment = paymentOpt.get();
            Order order = payment.getOrder();

            // Update payment status
            payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
            payment.setStripePaymentIntentId(session.getPaymentIntent());
            
            // Calculate fees (Stripe typically charges 2.9% + 30¢)
            BigDecimal stripeRate = new BigDecimal("0.029");
            BigDecimal stripeFee = payment.getAmount().multiply(stripeRate)
                .add(new BigDecimal("0.30"))
                .setScale(2, RoundingMode.HALF_UP);
            payment.setStripeFee(stripeFee);
            payment.setNetAmount(payment.getAmount().subtract(stripeFee));

            paymentRepository.save(payment);

            // Update order status to PAID first
            order.setStatus(Order.OrderStatus.PAID);
            order.setCompletedAt(LocalDateTime.now());
            orderRepository.save(order);

            // Send payment confirmation email
            emailService.sendPaymentConfirmationEmail(order, payment);

            // Now generate the certificate after successful payment
            try {
                log.info("📄 Generating PDF certificate after successful payment for order: {}", order.getId());
                String pdfUrl = pdfService.generateCertificatePdf(
                    order.getId(), 
                    order.getUserEmail(), 
                    order.getSafVolume(), 
                    order.getPriceUsd().doubleValue()
                );
                log.info("✅ PDF generated successfully: {}", pdfUrl);

                log.info("📋 Creating certificate record...");
                Certificate cert = new Certificate();
                cert.setOrder(order);
                cert.setPdfUri(pdfUrl);
                cert.setIssueDate(LocalDateTime.now());
                
                // Generate certificate number - format: CERT-{ORDER_ID}-{SHORT_UUID}
                String certNumber = String.format("CERT-%d-%s", order.getId(), 
                        UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                cert.setCertNumber(certNumber);
                log.info("📄 Generated certificate number: {}", certNumber);
                
                log.info("🌐 Registering certificate with external registry...");
                String registryId = registryService.registerCertificate(order.getId(), pdfUrl);
                log.info("✅ Certificate registered with ID: {}", registryId);
                
                cert.setRegistryId(registryId);
                Certificate savedCert = certificateRepository.save(cert);
                log.info("✅ Certificate saved with ID: {}", savedCert.getId());

                // Update order to COMPLETED only after certificate is successfully generated
                order.setStatus(Order.OrderStatus.COMPLETED);
                orderRepository.save(order);

                // Send certificate ready email
                emailService.sendCertificateReadyEmail(order, pdfUrl);
                
                log.info("🎉 Order {} fully completed with certificate generated!", order.getId());

            } catch (Exception certError) {
                log.error("❌ Error generating certificate for order {}: {}", order.getId(), certError.getMessage(), certError);
                // Order remains in PAID status if certificate generation fails
                // This allows for retry later
            }

            log.info("✅ Payment processed successfully for order: {}", order.getId());

        } catch (StripeException e) {
            log.error("❌ Error processing successful payment: {}", e.getMessage(), e);
        }
    }

    /**
     * Handle failed payment
     */
    @Transactional
    public void handleFailedPayment(String sessionId, String reason) {
        log.warn("💸 Processing failed payment for session: {} - Reason: {}", sessionId, reason);

        Optional<Payment> paymentOpt = paymentRepository.findByStripeSessionId(sessionId);
        if (paymentOpt.isEmpty()) {
            log.error("❌ Payment not found for session: {}", sessionId);
            return;
        }

        Payment payment = paymentOpt.get();
        payment.setStatus(Payment.PaymentStatus.FAILED);
        payment.setFailureReason(reason);
        paymentRepository.save(payment);

        // Keep order in PENDING status for retry
        Order order = payment.getOrder();
        log.info("⏳ Order {} remains pending for payment retry", order.getId());
    }

    /**
     * Get payment by order ID
     */
    public Optional<Payment> getPaymentByOrderId(Long orderId) {
        List<Payment> payments = paymentRepository.findByOrderId(orderId);
        return payments.stream()
            .filter(p -> p.getStatus() == Payment.PaymentStatus.SUCCEEDED)
            .findFirst()
            .or(() -> payments.stream().findFirst());
    }

    /**
     * Get user's payment history
     */
    public Page<Payment> getUserPayments(Long userId, Pageable pageable) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    /**
     * Get payment analytics
     */
    public Map<String, Object> getPaymentAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        LocalDateTime lastMonth = LocalDateTime.now().minusMonths(1);
        
        analytics.put("totalRevenue", paymentRepository.getTotalAmountByStatus(Payment.PaymentStatus.SUCCEEDED));
        analytics.put("monthlyRevenue", paymentRepository.getTotalAmountByStatusAndDateAfter(Payment.PaymentStatus.SUCCEEDED, lastMonth));
        analytics.put("netRevenue", paymentRepository.getTotalNetRevenue(Payment.PaymentStatus.SUCCEEDED));
        analytics.put("totalFees", paymentRepository.getTotalStripeFees(Payment.PaymentStatus.SUCCEEDED));
        analytics.put("paymentMethodStats", paymentRepository.getPaymentMethodStats(Payment.PaymentStatus.SUCCEEDED));
        analytics.put("monthlyRevenueChart", paymentRepository.getMonthlyRevenue(Payment.PaymentStatus.SUCCEEDED, LocalDateTime.now().minusYears(1)));
        
        return analytics;
    }

    /**
     * Refund a payment
     */
    @Transactional
    public void refundPayment(Long paymentId, BigDecimal amount, String reason) throws StripeException {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        if (payment.getStatus() != Payment.PaymentStatus.SUCCEEDED) {
            throw new RuntimeException("Can only refund successful payments");
        }

        // Create Stripe refund
        Map<String, Object> refundParams = new HashMap<>();
        refundParams.put("payment_intent", payment.getStripePaymentIntentId());
        refundParams.put("amount", amount.multiply(BigDecimal.valueOf(100)).longValue());
        refundParams.put("reason", "requested_by_customer");

        com.stripe.model.Refund refund = com.stripe.model.Refund.create(refundParams);

        // Update payment status
        if (amount.compareTo(payment.getAmount()) == 0) {
            payment.setStatus(Payment.PaymentStatus.REFUNDED);
        } else {
            payment.setStatus(Payment.PaymentStatus.PARTIALLY_REFUNDED);
        }
        paymentRepository.save(payment);

        log.info("💸 Refund processed: {} for payment: {}", refund.getId(), paymentId);
    }
    
    /**
     * Handle manual payment completion for testing purposes
     */
    @Transactional
    public void handleManualPaymentCompletion(Long orderId) {
        log.info("🧪 Handling manual payment completion for order: {}", orderId);
        
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            log.error("❌ Order not found: {}", orderId);
            throw new RuntimeException("Order not found: " + orderId);
        }
        
        Order order = orderOpt.get();
        
        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            log.info("✅ Order {} is already completed", orderId);
            return;
        }
        
        if (order.getStatus() == Order.OrderStatus.PAID) {
            log.info("🔄 Order {} is already paid, checking certificate", orderId);
            Optional<Certificate> existingCert = certificateRepository.findByOrderId(orderId);
            if (existingCert.isPresent()) {
                order.setStatus(Order.OrderStatus.COMPLETED);
                orderRepository.save(order);
                log.info("✅ Order {} marked as completed with existing certificate", orderId);
                return;
            }
        }
        
        try {
            // Update order status to PAID first
            order.setStatus(Order.OrderStatus.PAID);
            order.setCompletedAt(LocalDateTime.now());
            orderRepository.save(order);
            log.info("✅ Order {} marked as PAID for manual completion", orderId);

            // Generate the certificate after payment
            log.info("📄 Generating PDF certificate for manual payment completion, order: {}", order.getId());
            String pdfUrl = pdfService.generateCertificatePdf(
                order.getId(), 
                order.getUserEmail(), 
                order.getSafVolume(), 
                order.getPriceUsd().doubleValue()
            );
            log.info("✅ PDF generated successfully: {}", pdfUrl);

            log.info("📋 Creating certificate record...");
            Certificate cert = new Certificate();
            cert.setOrder(order);
            cert.setPdfUri(pdfUrl);
            cert.setIssueDate(LocalDateTime.now());
            
            // Generate certificate number - format: CERT-{ORDER_ID}-{SHORT_UUID}
            String certNumber = String.format("CERT-%d-%s", order.getId(), 
                    UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            cert.setCertNumber(certNumber);
            log.info("📄 Generated certificate number: {}", certNumber);
            
            log.info("🌐 Registering certificate with external registry...");
            String registryId = registryService.registerCertificate(order.getId(), pdfUrl);
            log.info("✅ Certificate registered with ID: {}", registryId);
            
            cert.setRegistryId(registryId);
            Certificate savedCert = certificateRepository.save(cert);
            log.info("✅ Certificate saved with ID: {}", savedCert.getId());

            // Update order to COMPLETED only after certificate is successfully generated
            order.setStatus(Order.OrderStatus.COMPLETED);
            orderRepository.save(order);

            // Send certificate ready email
            emailService.sendCertificateReadyEmail(order, pdfUrl);
            
            log.info("🎉 Manual payment completion successful for order: {}", order.getId());

        } catch (Exception certError) {
            log.error("❌ Error during manual certificate generation for order {}: {}", order.getId(), certError.getMessage(), certError);
            // Order remains in PAID status if certificate generation fails
            throw new RuntimeException("Certificate generation failed: " + certError.getMessage(), certError);
        }
    }
}
