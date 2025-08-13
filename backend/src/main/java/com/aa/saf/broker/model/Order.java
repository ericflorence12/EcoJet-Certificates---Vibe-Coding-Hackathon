package com.aa.saf.broker.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relationship with User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;
    
    // Keep userEmail for backward compatibility and quick access
    @Column(name = "user_email", nullable = false)
    private String userEmail;

    // Flight information for better tracking
    @Column(name = "flight_number")
    private String flightNumber;
    
    @Column(name = "departure_airport")
    private String departureAirport;
    
    @Column(name = "arrival_airport")
    private String arrivalAirport;
    
    @Column(name = "flight_date")
    private LocalDateTime flightDate;

    @Column(name = "flight_emissions", nullable = false)
    private double flightEmissions;

    @Column(name = "saf_volume", nullable = false)
    private double safVolume;

    @Column(name = "price_usd", nullable = false)
    private BigDecimal priceUsd;

    @Column(name = "platform_fee_usd", nullable = false)
    private BigDecimal platformFeeUsd = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "notes")
    private String notes;

    public enum OrderStatus {
        PENDING, PROCESSING, COMPLETED, CANCELLED, ERROR, PAID
    }

    public Order() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    
    public String getFlightNumber() { return flightNumber; }
    public void setFlightNumber(String flightNumber) { this.flightNumber = flightNumber; }
    
    public String getDepartureAirport() { return departureAirport; }
    public void setDepartureAirport(String departureAirport) { this.departureAirport = departureAirport; }
    
    public String getArrivalAirport() { return arrivalAirport; }
    public void setArrivalAirport(String arrivalAirport) { this.arrivalAirport = arrivalAirport; }
    
    public LocalDateTime getFlightDate() { return flightDate; }
    public void setFlightDate(LocalDateTime flightDate) { this.flightDate = flightDate; }

    public double getFlightEmissions() { return flightEmissions; }
    public void setFlightEmissions(double flightEmissions) { this.flightEmissions = flightEmissions; }

    public double getSafVolume() { return safVolume; }
    public void setSafVolume(double safVolume) { this.safVolume = safVolume; }

    public BigDecimal getPriceUsd() { return priceUsd; }
    public void setPriceUsd(BigDecimal priceUsd) { this.priceUsd = priceUsd; }

    public BigDecimal getPlatformFeeUsd() { return platformFeeUsd; }
    public void setPlatformFeeUsd(BigDecimal platformFeeUsd) { this.platformFeeUsd = platformFeeUsd; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
