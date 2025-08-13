package com.aa.saf.broker.controller;

import com.aa.saf.broker.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatistics> getAdminStatistics() {
        log.info("👨‍💼 Admin statistics requested");
        
        try {
            long totalOrders = orderRepository.count(); // Get all orders
            long completedOrders = orderRepository.countByStatus(com.aa.saf.broker.model.Order.OrderStatus.COMPLETED);
            long pendingOrders = orderRepository.countByStatus(com.aa.saf.broker.model.Order.OrderStatus.PENDING);
            
            Double totalSafVolume = orderRepository.getTotalSafVolumeCompleted();
            Double totalRevenue = orderRepository.getTotalRevenueCompleted(); // This is platform fees
            
            AdminStatistics stats = new AdminStatistics(
                (int) totalOrders,
                (int) completedOrders,
                (int) pendingOrders,
                totalSafVolume != null ? totalSafVolume : 0.0,
                totalRevenue != null ? totalRevenue : 0.0
            );
            
            log.info("✅ Admin statistics: {} orders, ${} platform revenue", 
                    stats.totalOrders, String.format("%.2f", stats.totalRevenue));
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("❌ Error fetching admin statistics: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    public static class AdminStatistics {
        private int totalOrders;
        private int completedOrders;
        private int pendingOrders;
        private double totalSafVolume;
        private double totalRevenue; // Platform fees

        public AdminStatistics(int totalOrders, int completedOrders, int pendingOrders,
                             double totalSafVolume, double totalRevenue) {
            this.totalOrders = totalOrders;
            this.completedOrders = completedOrders;
            this.pendingOrders = pendingOrders;
            this.totalSafVolume = totalSafVolume;
            this.totalRevenue = totalRevenue;
        }

        // Getters
        public int getTotalOrders() { return totalOrders; }
        public int getCompletedOrders() { return completedOrders; }
        public int getPendingOrders() { return pendingOrders; }
        public double getTotalSafVolume() { return totalSafVolume; }
        public double getTotalRevenue() { return totalRevenue; }
    }
}
