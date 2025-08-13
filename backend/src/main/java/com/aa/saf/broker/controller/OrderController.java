package com.aa.saf.broker.controller;

import com.aa.saf.broker.model.Order;
import com.aa.saf.broker.model.Certificate;
import com.aa.saf.broker.dto.QuoteRequest;
import com.aa.saf.broker.dto.QuoteResponse;
import com.aa.saf.broker.dto.OrderRequest;
import com.aa.saf.broker.dto.PageResponse;
import com.aa.saf.broker.repository.OrderRepository;
import com.aa.saf.broker.repository.CertificateRepository;
import com.aa.saf.broker.service.PdfService;
import com.aa.saf.broker.service.RegistryService;
import com.aa.saf.broker.service.EmailService;
import com.aa.saf.broker.service.FlightEmissionsService;
import com.aa.saf.broker.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private RegistryService registryService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private FlightEmissionsService flightEmissionsService;
    
    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest orderRequest) {
        log.info("📦 Creating new order for user: {}, emissions: {}, SAF volume: {}, price: ${}", 
                orderRequest.getUserEmail(), orderRequest.getFlightEmissions(), orderRequest.getSafVolume(), orderRequest.getPriceUsd());

        try {
            Order order = new Order();
            
            // Set user email - use provided email or default for demo
            String userEmail = orderRequest.getUserEmail();
            if (userEmail == null || userEmail.trim().isEmpty()) {
                userEmail = "demo@ecojetcertificates.com"; // Default demo email
                log.info("🔄 Using default demo email for order");
            }
            order.setUserEmail(userEmail);
            
            order.setFlightEmissions(orderRequest.getFlightEmissions());
            order.setSafVolume(orderRequest.getSafVolume());
            order.setPriceUsd(orderRequest.getPriceUsd());
            
            // Calculate platform fee (3.5% of total price)
            BigDecimal platformFee = orderRequest.getPriceUsd().multiply(new BigDecimal("0.035"));
            order.setPlatformFeeUsd(platformFee);
            
            order.setFlightNumber(orderRequest.getFlightNumber());
            order.setDepartureAirport(orderRequest.getDepartureAirport());
            order.setArrivalAirport(orderRequest.getArrivalAirport());
            
            // Parse the flight date string to LocalDateTime
            if (orderRequest.getFlightDate() != null && !orderRequest.getFlightDate().isEmpty()) {
                try {
                    LocalDateTime flightDateTime;
                    String dateStr = orderRequest.getFlightDate();
                    
                    // Handle different date formats from frontend
                    if (dateStr.contains("T")) {
                        // ISO format: 2025-08-09T14:30:00
                        flightDateTime = LocalDateTime.parse(dateStr);
                    } else {
                        // Date only format: 2025-08-09 (add default time)
                        flightDateTime = LocalDateTime.parse(dateStr + "T00:00:00");
                    }
                    
                    order.setFlightDate(flightDateTime);
                    log.info("✅ Parsed flight date: {}", flightDateTime);
                } catch (DateTimeParseException e) {
                    log.warn("⚠️ Could not parse flight date '{}', using current time: {}", orderRequest.getFlightDate(), e.getMessage());
                    order.setFlightDate(LocalDateTime.now());
                }
            } else {
                order.setFlightDate(LocalDateTime.now());
            }
            
            order.setStatus(Order.OrderStatus.PENDING);
            order.setCreatedAt(LocalDateTime.now());
            
            log.info("💾 Saving order to database...");
            Order saved = orderRepository.save(order);
            log.info("✅ Order saved with ID: {}", saved.getId());

            // Send order confirmation email
            emailService.sendOrderConfirmationEmail(saved);

            log.info(" Order {} created and ready for payment", saved.getId());
            log.info("⏳ Certificate will be generated after payment is completed");
            
            return ResponseEntity.ok(saved);
            
        } catch (Exception e) {
            log.error("❌ Error processing order: {}", e.getMessage(), e);
            
            Order order = new Order();
            order.setUserEmail(orderRequest.getUserEmail());
            order.setFlightEmissions(orderRequest.getFlightEmissions());
            order.setSafVolume(orderRequest.getSafVolume());
            order.setPriceUsd(orderRequest.getPriceUsd());
            
            // Calculate platform fee (3.5% of total price)
            BigDecimal platformFee = orderRequest.getPriceUsd().multiply(new BigDecimal("0.035"));
            order.setPlatformFeeUsd(platformFee);
            
            order.setFlightNumber(orderRequest.getFlightNumber());
            order.setDepartureAirport(orderRequest.getDepartureAirport());
            order.setArrivalAirport(orderRequest.getArrivalAirport());
            order.setStatus(Order.OrderStatus.ERROR);
            order.setCreatedAt(LocalDateTime.now());
            Order errorOrder = orderRepository.save(order);
            
            // Send error notification email (don't let this fail the response)
            try {
                emailService.sendOrderStatusUpdateEmail(errorOrder);
            } catch (Exception emailEx) {
                log.warn("⚠️ Failed to send error notification email for order {}: {}", errorOrder.getId(), emailEx.getMessage());
            }
            
            return ResponseEntity.status(500).body(errorOrder);
        }
    }

    @PostMapping("/{id}/complete-payment")
    public ResponseEntity<Order> completePayment(@PathVariable Long id) {
        log.info("💳 Processing payment completion for order: {}", id);
        
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            log.warn("⚠️ Order not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        if (order.getStatus() == Order.OrderStatus.COMPLETED) {
            log.info("✅ Order {} is already completed", id);
            return ResponseEntity.ok(order);
        }
        
        if (order.getStatus() != Order.OrderStatus.PENDING && 
            order.getStatus() != Order.OrderStatus.PROCESSING) {
            log.warn("⚠️ Order {} is not in a completable state: {}", id, order.getStatus());
            return ResponseEntity.badRequest().build();
        }

        try {
            // Trigger certificate generation through PaymentService
            paymentService.handleManualPaymentCompletion(id);
            
            // Fetch the updated order
            order = orderRepository.findById(id).orElse(order);
            log.info("🎉 Order {} payment completed with status: {}", id, order.getStatus());
            
            return ResponseEntity.ok(order);
            
        } catch (Exception e) {
            log.error("❌ Error completing payment for order {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    public ResponseEntity<PageResponse<Order>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String userEmail) {
        
        log.info("📋 Fetching orders - page: {}, size: {}, sortBy: {}, sortDir: {}", page, size, sortBy, sortDir);
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<Order> ordersPage;
        
        if (status != null && userEmail != null) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            List<Order> userStatusOrders = orderRepository.findByUserEmail(userEmail).stream()
                    .filter(order -> order.getStatus() == orderStatus)
                    .toList();
            ordersPage = new org.springframework.data.domain.PageImpl<>(userStatusOrders, pageRequest, userStatusOrders.size());
        } else if (status != null) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            ordersPage = orderRepository.findByStatus(orderStatus, pageRequest);
        } else if (userEmail != null) {
            List<Order> userOrders = orderRepository.findByUserEmail(userEmail);
            ordersPage = new org.springframework.data.domain.PageImpl<>(userOrders, pageRequest, userOrders.size());
        } else {
            ordersPage = orderRepository.findAll(pageRequest);
        }
        
        // Convert to custom PageResponse to avoid serialization warnings
        PageResponse<Order> response = new PageResponse<>(
            ordersPage.getContent(),
            ordersPage.getNumber(),
            ordersPage.getSize(),
            ordersPage.getTotalElements(),
            ordersPage.getSort().isSorted()
        );
        
        log.info("✅ Found {} orders (page {} of {})", ordersPage.getNumberOfElements(), page + 1, ordersPage.getTotalPages());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/by-user/{userEmail}")
    public ResponseEntity<List<Order>> getOrdersByUser(@PathVariable String userEmail) {
        log.info("🔍 Fetching orders for user: {}", userEmail);
        List<Order> orders = orderRepository.findByUserEmail(userEmail);
        log.info("✅ Found {} orders for user: {}", orders.size(), userEmail);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/by-status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable String status) {
        log.info("� Fetching orders with status: {}", status);
        Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        List<Order> orders = orderRepository.findByStatus(orderStatus);
        log.info("✅ Found {} orders with status: {}", orders.size(), status);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/by-flight/{flightNumber}")
    public ResponseEntity<List<Order>> getOrdersByFlight(@PathVariable String flightNumber) {
        log.info("🔍 Fetching orders for flight: {}", flightNumber);
        List<Order> orders = orderRepository.findByFlightNumber(flightNumber);
        log.info("✅ Found {} orders for flight: {}", orders.size(), flightNumber);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/emissions/{flightNumber}")
    public ResponseEntity<FlightEmissionsService.EmissionData> getFlightEmissions(
            @PathVariable String flightNumber,
            @RequestParam String departureAirport,
            @RequestParam String arrivalAirport) {
        log.info("✈️ Getting emissions for flight: {} from {} to {}", flightNumber, departureAirport, arrivalAirport);
        
        FlightEmissionsService.EmissionData emissions = flightEmissionsService.getFlightEmissions(
                flightNumber, departureAirport, arrivalAirport);
        
        return ResponseEntity.ok(emissions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        log.info("🔍 Fetching order with ID: {}", id);
        return orderRepository.findById(id)
                .map(order -> {
                    log.info("✅ Found order: {}", order.getId());
                    return ResponseEntity.ok(order);
                })
                .orElseGet(() -> {
                    log.warn("⚠️ Order not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/cert/{id}")
    public ResponseEntity<Certificate> getCertificate(@PathVariable Long id) {
        log.info("📄 Fetching certificate with ID: {}", id);
        return certificateRepository.findById(id)
                .map(cert -> {
                    log.info("✅ Found certificate: {}", cert.getId());
                    return ResponseEntity.ok(cert);
                })
                .orElseGet(() -> {
                    log.warn("⚠️ Certificate not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }
    
    @GetMapping("/cert/{id}/download")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable Long id) {
        log.info("📥 Download request for certificate: {}", id);
        
        try {
            Certificate cert = certificateRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Certificate not found"));
            
            // For now, generate a simple PDF response
            // In a real implementation, you'd fetch the actual PDF from storage
            String content = String.format("SAF Certificate #%s\nOrder ID: %d\nIssued: %s", 
                    cert.getCertNumber(), cert.getOrder().getId(), cert.getIssueDate());
            
            byte[] pdfBytes = content.getBytes();
            
            log.info("✅ Certificate download prepared for ID: {}", id);
            
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", String.format("attachment; filename=\"certificate_%d.pdf\"", id))
                    .body(pdfBytes);
                    
        } catch (Exception e) {
            log.error("❌ Error downloading certificate {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/stats")
    public ResponseEntity<OrderStats> getOrderStats() {
        log.info("📊 Fetching order statistics");
        
        long totalOrders = orderRepository.count();
        long completedOrders = orderRepository.countByStatus(Order.OrderStatus.COMPLETED);
        long pendingOrders = orderRepository.countByStatus(Order.OrderStatus.PENDING);
        Double totalSafVolume = orderRepository.getTotalSafVolumeCompleted();
        Double totalRevenue = orderRepository.getTotalRevenueCompleted();
        
        OrderStats stats = new OrderStats(totalOrders, completedOrders, pendingOrders, 
                totalSafVolume != null ? totalSafVolume : 0.0, 
                totalRevenue != null ? totalRevenue : 0.0);
        
        log.info("✅ Order stats calculated: {} total, {} completed, {} pending", 
                totalOrders, completedOrders, pendingOrders);
        
        return ResponseEntity.ok(stats);
    }
    
    // DTO for order statistics
    public static class OrderStats {
        private long totalOrders;
        private long completedOrders;
        private long pendingOrders;
        private double totalSafVolume;
        private double totalRevenue;
        
        public OrderStats(long totalOrders, long completedOrders, long pendingOrders, 
                         double totalSafVolume, double totalRevenue) {
            this.totalOrders = totalOrders;
            this.completedOrders = completedOrders;
            this.pendingOrders = pendingOrders;
            this.totalSafVolume = totalSafVolume;
            this.totalRevenue = totalRevenue;
        }
        
        // Getters
        public long getTotalOrders() { return totalOrders; }
        public long getCompletedOrders() { return completedOrders; }
        public long getPendingOrders() { return pendingOrders; }
        public double getTotalSafVolume() { return totalSafVolume; }
        public double getTotalRevenue() { return totalRevenue; }
    }
}
