package com.aa.saf.broker.controller;

import com.aa.saf.broker.service.AnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * Get comprehensive dashboard analytics
     * Admin only endpoint for complete analytics overview
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardAnalytics() {
        try {
            log.info("📊 Fetching dashboard analytics");
            Map<String, Object> analytics = analyticsService.getDashboardAnalytics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", analytics);
            response.put("message", "Dashboard analytics retrieved successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error fetching dashboard analytics: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve dashboard analytics");
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get real-time metrics for live dashboard updates
     */
    @GetMapping("/realtime")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getRealtimeMetrics() {
        try {
            log.info("⚡ Fetching real-time analytics");
            Map<String, Object> metrics = analyticsService.getRealtimeMetrics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", metrics);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error fetching real-time metrics: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve real-time metrics");
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get order analytics
     * Available to authenticated users for their own data
     */
    @GetMapping("/orders")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getOrderAnalytics(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String status) {
        try {
            log.info("📦 Fetching order analytics - period: {}, status: {}", period, status);
            
            Map<String, Object> analytics = new HashMap<>();
            
            // Basic order metrics
            analytics.put("orderMetrics", analyticsService.getDashboardAnalytics());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", analytics);
            response.put("message", "Order analytics retrieved successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error fetching order analytics: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve order analytics");
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get payment analytics
     * Admin only for financial data
     */
    @GetMapping("/payments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPaymentAnalytics(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String method) {
        try {
            log.info("💳 Fetching payment analytics - period: {}, method: {}", period, method);
            
            Map<String, Object> analytics = analyticsService.getDashboardAnalytics();
            
            // Extract payment-specific metrics
            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("paymentMethodStats", analytics.get("paymentMethodStats"));
            paymentData.put("paymentSuccessRate", analytics.get("paymentSuccessRate"));
            paymentData.put("refundRate", analytics.get("refundRate"));
            paymentData.put("totalRevenue", analytics.get("totalRevenue"));
            paymentData.put("revenueGrowth", analytics.get("revenueGrowth"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", paymentData);
            response.put("message", "Payment analytics retrieved successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error fetching payment analytics: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve payment analytics");
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get environmental impact analytics
     * Public endpoint for sustainability metrics
     */
    @GetMapping("/environmental")
    public ResponseEntity<Map<String, Object>> getEnvironmentalAnalytics() {
        try {
            log.info("🌱 Fetching environmental analytics");
            
            Map<String, Object> analytics = analyticsService.getDashboardAnalytics();
            
            // Extract environmental metrics
            Map<String, Object> environmentalData = new HashMap<>();
            environmentalData.put("environmentalImpact", analytics.get("environmentalImpact"));
            environmentalData.put("sustainabilityMetrics", analytics.get("sustainabilityMetrics"));
            environmentalData.put("totalEmissionsReduced", analytics.get("totalEmissionsReduced"));
            environmentalData.put("totalSafVolume", analytics.get("totalSafVolume"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", environmentalData);
            response.put("message", "Environmental analytics retrieved successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error fetching environmental analytics: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve environmental analytics");
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get user engagement analytics
     * Admin only for user behavior insights
     */
    @GetMapping("/engagement")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserEngagementAnalytics() {
        try {
            log.info("👥 Fetching user engagement analytics");
            
            Map<String, Object> analytics = analyticsService.getDashboardAnalytics();
            
            // Extract user engagement metrics
            Map<String, Object> engagementData = new HashMap<>();
            engagementData.put("userEngagement", analytics.get("userEngagement"));
            engagementData.put("customerRetention", analytics.get("customerRetention"));
            engagementData.put("totalUsers", analytics.get("totalUsers"));
            engagementData.put("userGrowth", analytics.get("userGrowth"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", engagementData);
            response.put("message", "User engagement analytics retrieved successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error fetching user engagement analytics: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve user engagement analytics");
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get export data for analytics reports
     * Admin only for data export functionality
     */
    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> exportAnalyticsData(
            @RequestParam String format,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String[] metrics) {
        try {
            log.info("📊 Exporting analytics data - format: {}, period: {}", format, period);
            
            Map<String, Object> analytics = analyticsService.getDashboardAnalytics();
            
            // Filter requested metrics if specified
            Map<String, Object> exportData = analytics;
            if (metrics != null && metrics.length > 0) {
                exportData = new HashMap<>();
                for (String metric : metrics) {
                    if (analytics.containsKey(metric)) {
                        exportData.put(metric, analytics.get(metric));
                    }
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", exportData);
            response.put("format", format);
            response.put("exportedAt", System.currentTimeMillis());
            response.put("message", "Analytics data exported successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error exporting analytics data: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to export analytics data");
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Health check for analytics service
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getAnalyticsHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "healthy");
        health.put("service", "analytics");
        health.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(health);
    }
}
