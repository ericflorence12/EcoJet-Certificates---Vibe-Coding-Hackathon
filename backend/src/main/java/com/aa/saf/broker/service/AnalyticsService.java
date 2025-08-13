package com.aa.saf.broker.service;

import com.aa.saf.broker.model.Order;
import com.aa.saf.broker.model.Payment;
import com.aa.saf.broker.repository.OrderRepository;
import com.aa.saf.broker.repository.PaymentRepository;
import com.aa.saf.broker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsService.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get comprehensive dashboard analytics
     */
    public Map<String, Object> getDashboardAnalytics() {
        log.info("📊 Generating dashboard analytics");
        
        Map<String, Object> analytics = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastMonth = now.minusMonths(1);
        LocalDateTime lastWeek = now.minusWeeks(1);
        LocalDateTime lastYear = now.minusYears(1);

        // Basic metrics
        analytics.put("totalOrders", orderRepository.count());
        analytics.put("totalUsers", userRepository.count());
        analytics.put("totalRevenue", getTotalRevenue());
        analytics.put("totalSafVolume", getTotalSafVolume());
        analytics.put("totalEmissionsReduced", getTotalEmissionsReduced());

        // Growth metrics
        analytics.put("ordersGrowth", getOrdersGrowth(lastMonth));
        analytics.put("revenueGrowth", getRevenueGrowth(lastMonth));
        analytics.put("userGrowth", getUserGrowth(lastMonth));

        // Time-based metrics
        analytics.put("weeklyMetrics", getWeeklyMetrics());
        analytics.put("monthlyMetrics", getMonthlyMetrics());
        analytics.put("yearlyTrends", getYearlyTrends());

        // Order analytics
        analytics.put("orderStatusDistribution", getOrderStatusDistribution());
        analytics.put("averageOrderValue", getAverageOrderValue());
        analytics.put("topAirports", getTopAirports());
        analytics.put("flightRouteAnalytics", getFlightRouteAnalytics());

        // Payment analytics
        analytics.put("paymentMethodStats", getPaymentMethodStats());
        analytics.put("paymentSuccessRate", getPaymentSuccessRate());
        analytics.put("refundRate", getRefundRate());

        // Environmental impact
        analytics.put("environmentalImpact", getEnvironmentalImpact());
        analytics.put("sustainabilityMetrics", getSustainabilityMetrics());

        // User behavior
        analytics.put("userEngagement", getUserEngagement());
        analytics.put("customerRetention", getCustomerRetention());

        log.info("✅ Dashboard analytics generated successfully");
        return analytics;
    }

    /**
     * Get real-time metrics for live dashboard
     */
    public Map<String, Object> getRealtimeMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);

        metrics.put("ordersLast24h", orderRepository.countByCreatedAtAfter(last24Hours));
        metrics.put("revenueLast24h", getRevenueSince(last24Hours));
        metrics.put("activeSessions", getActiveUserSessions());
        metrics.put("pendingOrders", orderRepository.countByStatus(Order.OrderStatus.PENDING));
        metrics.put("processingOrders", orderRepository.countByStatus(Order.OrderStatus.PROCESSING));

        return metrics;
    }

    private BigDecimal getTotalRevenue() {
        return paymentRepository.getTotalAmountByStatus(Payment.PaymentStatus.SUCCEEDED) 
            != null ? paymentRepository.getTotalAmountByStatus(Payment.PaymentStatus.SUCCEEDED) : BigDecimal.ZERO;
    }

    private Double getTotalSafVolume() {
        return orderRepository.getTotalSafVolume() != null ? orderRepository.getTotalSafVolume() : 0.0;
    }

    private Double getTotalEmissionsReduced() {
        return orderRepository.getTotalEmissionsReduced() != null ? orderRepository.getTotalEmissionsReduced() : 0.0;
    }

    private Map<String, Object> getOrdersGrowth(LocalDateTime since) {
        Map<String, Object> growth = new HashMap<>();
        long currentPeriod = orderRepository.countByCreatedAtAfter(since);
        
        // Calculate previous period
        long daysBetween = ChronoUnit.DAYS.between(since, LocalDateTime.now());
        LocalDateTime previousStart = since.minusDays(daysBetween);
        long previousPeriod = orderRepository.countByCreatedAtBetween(previousStart, since);
        
        double growthRate = previousPeriod > 0 ? 
            ((double)(currentPeriod - previousPeriod) / previousPeriod) * 100 : 0;
        
        growth.put("current", currentPeriod);
        growth.put("previous", previousPeriod);
        growth.put("rate", Math.round(growthRate * 100.0) / 100.0);
        
        return growth;
    }

    private Map<String, Object> getRevenueGrowth(LocalDateTime since) {
        Map<String, Object> growth = new HashMap<>();
        BigDecimal currentPeriod = getRevenueSince(since);
        
        // Calculate previous period
        long daysBetween = ChronoUnit.DAYS.between(since, LocalDateTime.now());
        LocalDateTime previousStart = since.minusDays(daysBetween);
        BigDecimal previousPeriod = getRevenueBetween(previousStart, since);
        
        double growthRate = previousPeriod.compareTo(BigDecimal.ZERO) > 0 ? 
            currentPeriod.subtract(previousPeriod).divide(previousPeriod, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue() : 0;
        
        growth.put("current", currentPeriod);
        growth.put("previous", previousPeriod);
        growth.put("rate", Math.round(growthRate * 100.0) / 100.0);
        
        return growth;
    }

    private Map<String, Object> getUserGrowth(LocalDateTime since) {
        Map<String, Object> growth = new HashMap<>();
        long currentPeriod = userRepository.countByCreatedAtAfter(since);
        
        // Calculate previous period
        long daysBetween = ChronoUnit.DAYS.between(since, LocalDateTime.now());
        LocalDateTime previousStart = since.minusDays(daysBetween);
        long previousPeriod = userRepository.countByCreatedAtBetween(previousStart, since);
        
        double growthRate = previousPeriod > 0 ? 
            ((double)(currentPeriod - previousPeriod) / previousPeriod) * 100 : 0;
        
        growth.put("current", currentPeriod);
        growth.put("previous", previousPeriod);
        growth.put("rate", Math.round(growthRate * 100.0) / 100.0);
        
        return growth;
    }

    private List<Map<String, Object>> getWeeklyMetrics() {
        List<Map<String, Object>> weeklyData = new ArrayList<>();
        LocalDateTime startDate = LocalDateTime.now().minusWeeks(12);
        
        for (int i = 0; i < 12; i++) {
            LocalDateTime weekStart = startDate.plusWeeks(i);
            LocalDateTime weekEnd = weekStart.plusWeeks(1);
            
            Map<String, Object> weekData = new HashMap<>();
            weekData.put("week", weekStart.toString().substring(0, 10));
            weekData.put("orders", orderRepository.countByCreatedAtBetween(weekStart, weekEnd));
            weekData.put("revenue", getRevenueBetween(weekStart, weekEnd));
            weekData.put("safVolume", getSafVolumeBetween(weekStart, weekEnd));
            weekData.put("emissions", getEmissionsBetween(weekStart, weekEnd));
            
            weeklyData.add(weekData);
        }
        
        return weeklyData;
    }

    private List<Map<String, Object>> getMonthlyMetrics() {
        List<Map<String, Object>> monthlyData = new ArrayList<>();
        LocalDateTime startDate = LocalDateTime.now().minusMonths(12);
        
        for (int i = 0; i < 12; i++) {
            LocalDateTime monthStart = startDate.plusMonths(i);
            LocalDateTime monthEnd = monthStart.plusMonths(1);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthStart.getMonth().toString());
            monthData.put("year", monthStart.getYear());
            monthData.put("orders", orderRepository.countByCreatedAtBetween(monthStart, monthEnd));
            monthData.put("revenue", getRevenueBetween(monthStart, monthEnd));
            monthData.put("newUsers", userRepository.countByCreatedAtBetween(monthStart, monthEnd));
            
            monthlyData.add(monthData);
        }
        
        return monthlyData;
    }

    private Map<String, Object> getYearlyTrends() {
        Map<String, Object> trends = new HashMap<>();
        LocalDateTime lastYear = LocalDateTime.now().minusYears(1);
        
        trends.put("yearOverYearGrowth", getOrdersGrowth(lastYear));
        trends.put("seasonalTrends", getSeasonalTrends());
        trends.put("projectedGrowth", calculateProjectedGrowth());
        
        return trends;
    }

    private List<Map<String, Object>> getOrderStatusDistribution() {
        return Arrays.stream(Order.OrderStatus.values())
            .map(status -> {
                Map<String, Object> statusData = new HashMap<>();
                statusData.put("status", status.toString());
                statusData.put("count", orderRepository.countByStatus(status));
                statusData.put("percentage", calculateStatusPercentage(status));
                return statusData;
            })
            .collect(Collectors.toList());
    }

    private BigDecimal getAverageOrderValue() {
        List<Order> orders = orderRepository.findAll();
        if (orders.isEmpty()) return BigDecimal.ZERO;
        
        BigDecimal total = orders.stream()
            .map(Order::getPriceUsd)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return total.divide(BigDecimal.valueOf(orders.size()), 2, RoundingMode.HALF_UP);
    }

    private List<Map<String, Object>> getTopAirports() {
        // This would require custom repository queries for aggregation
        List<Map<String, Object>> topAirports = new ArrayList<>();
        
        // Placeholder implementation - would need proper aggregation
        Map<String, Object> airport1 = new HashMap<>();
        airport1.put("code", "JFK");
        airport1.put("orders", 45);
        airport1.put("revenue", new BigDecimal("12500.00"));
        topAirports.add(airport1);
        
        return topAirports;
    }

    private Map<String, Object> getFlightRouteAnalytics() {
        Map<String, Object> routeAnalytics = new HashMap<>();
        
        // Most popular routes
        routeAnalytics.put("popularRoutes", getPopularRoutes());
        routeAnalytics.put("routeRevenue", getRouteRevenue());
        routeAnalytics.put("averageDistance", getAverageFlightDistance());
        
        return routeAnalytics;
    }

    private Map<String, Object> getPaymentMethodStats() {
        List<Object[]> stats = paymentRepository.getPaymentMethodStats(Payment.PaymentStatus.SUCCEEDED);
        Map<String, Object> methodStats = new HashMap<>();
        
        stats.forEach(stat -> {
            String method = stat[0] != null ? stat[0].toString() : "Unknown";
            Long count = (Long) stat[1];
            methodStats.put(method, count);
        });
        
        return methodStats;
    }

    private double getPaymentSuccessRate() {
        long totalPayments = paymentRepository.count();
        long successfulPayments = paymentRepository.countByStatusAndCreatedAtAfter(
            Payment.PaymentStatus.SUCCEEDED, LocalDateTime.now().minusMonths(1));
        
        return totalPayments > 0 ? (double) successfulPayments / totalPayments * 100 : 0;
    }

    private double getRefundRate() {
        long totalSuccessful = paymentRepository.findByStatus(Payment.PaymentStatus.SUCCEEDED).size();
        long refunded = paymentRepository.findByStatus(Payment.PaymentStatus.REFUNDED).size() +
                       paymentRepository.findByStatus(Payment.PaymentStatus.PARTIALLY_REFUNDED).size();
        
        return totalSuccessful > 0 ? (double) refunded / totalSuccessful * 100 : 0;
    }

    private Map<String, Object> getEnvironmentalImpact() {
        Map<String, Object> impact = new HashMap<>();
        
        Double totalEmissions = getTotalEmissionsReduced();
        Double totalSaf = getTotalSafVolume();
        
        impact.put("co2Reduced", totalEmissions);
        impact.put("safUsed", totalSaf);
        impact.put("equivalentTrees", totalEmissions * 0.06); // Rough conversion
        impact.put("equivalentCars", totalEmissions / 4600); // Average car emissions per year
        impact.put("impactScore", calculateImpactScore(totalEmissions, totalSaf));
        
        return impact;
    }

    private Map<String, Object> getSustainabilityMetrics() {
        Map<String, Object> sustainability = new HashMap<>();
        
        sustainability.put("safAdoptionRate", calculateSafAdoptionRate());
        sustainability.put("carbonIntensity", calculateCarbonIntensity());
        sustainability.put("sustainabilityTrend", getSustainabilityTrend());
        
        return sustainability;
    }

    private Map<String, Object> getUserEngagement() {
        Map<String, Object> engagement = new HashMap<>();
        
        engagement.put("averageOrdersPerUser", calculateAverageOrdersPerUser());
        engagement.put("userRetentionRate", calculateUserRetentionRate());
        engagement.put("repeatCustomerRate", calculateRepeatCustomerRate());
        
        return engagement;
    }

    private Map<String, Object> getCustomerRetention() {
        Map<String, Object> retention = new HashMap<>();
        
        retention.put("monthlyRetention", calculateMonthlyRetention());
        retention.put("customerLifetimeValue", calculateCustomerLifetimeValue());
        retention.put("churnRate", calculateChurnRate());
        
        return retention;
    }

    // Helper methods
    private BigDecimal getRevenueSince(LocalDateTime since) {
        return paymentRepository.getTotalAmountByStatusAndDateAfter(Payment.PaymentStatus.SUCCEEDED, since)
            != null ? paymentRepository.getTotalAmountByStatusAndDateAfter(Payment.PaymentStatus.SUCCEEDED, since) : BigDecimal.ZERO;
    }

    private BigDecimal getRevenueBetween(LocalDateTime start, LocalDateTime end) {
        // Would need custom repository method
        return BigDecimal.ZERO;
    }

    private Double getSafVolumeBetween(LocalDateTime start, LocalDateTime end) {
        // Would need custom repository method
        return 0.0;
    }

    private Double getEmissionsBetween(LocalDateTime start, LocalDateTime end) {
        // Would need custom repository method
        return 0.0;
    }

    private int getActiveUserSessions() {
        // This would integrate with session management
        return 0;
    }

    private List<Map<String, Object>> getSeasonalTrends() {
        return new ArrayList<>();
    }

    private Map<String, Object> calculateProjectedGrowth() {
        return new HashMap<>();
    }

    private double calculateStatusPercentage(Order.OrderStatus status) {
        long totalOrders = orderRepository.count();
        long statusOrders = orderRepository.countByStatus(status);
        return totalOrders > 0 ? (double) statusOrders / totalOrders * 100 : 0;
    }

    private List<Map<String, Object>> getPopularRoutes() {
        return new ArrayList<>();
    }

    private Map<String, Object> getRouteRevenue() {
        return new HashMap<>();
    }

    private double getAverageFlightDistance() {
        return 0.0;
    }

    private double calculateImpactScore(Double emissions, Double saf) {
        // Proprietary impact calculation
        return (emissions * 0.7) + (saf * 0.3);
    }

    private double calculateSafAdoptionRate() {
        return 0.0;
    }

    private double calculateCarbonIntensity() {
        return 0.0;
    }

    private List<Map<String, Object>> getSustainabilityTrend() {
        return new ArrayList<>();
    }

    private double calculateAverageOrdersPerUser() {
        long totalUsers = userRepository.count();
        long totalOrders = orderRepository.count();
        return totalUsers > 0 ? (double) totalOrders / totalUsers : 0;
    }

    private double calculateUserRetentionRate() {
        return 0.0;
    }

    private double calculateRepeatCustomerRate() {
        return 0.0;
    }

    private List<Map<String, Object>> calculateMonthlyRetention() {
        return new ArrayList<>();
    }

    private BigDecimal calculateCustomerLifetimeValue() {
        return BigDecimal.ZERO;
    }

    private double calculateChurnRate() {
        return 0.0;
    }
}
