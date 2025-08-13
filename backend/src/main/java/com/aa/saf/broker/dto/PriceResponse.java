package com.aa.saf.broker.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PriceResponse {
    private BigDecimal pricePerGallon;
    
    // Enhanced fields for detailed quotes
    private double flightEmissions;
    private double recommendedSafVolume;
    private BigDecimal pricePerLiter;
    private BigDecimal totalPrice;
    private double carbonReduction;
    private LocalDateTime validUntil;
    
    // Price breakdown fields
    private BigDecimal baseCost;
    private BigDecimal carbonCredit;
    private BigDecimal processingFee;
    private BigDecimal regulatoryFee;
    private BigDecimal volumeDiscount;
    
    // Nested price breakdown for frontend compatibility
    private PriceBreakdown priceBreakdown;

    public static class PriceBreakdown {
        private BigDecimal baseCost;
        private BigDecimal carbonCredit;
        private BigDecimal processingFee;
        private BigDecimal regulatoryFee;
        private BigDecimal volumeDiscount;

        public PriceBreakdown() {}

        public PriceBreakdown(BigDecimal baseCost, BigDecimal carbonCredit, BigDecimal processingFee, BigDecimal regulatoryFee, BigDecimal volumeDiscount) {
            this.baseCost = baseCost;
            this.carbonCredit = carbonCredit;
            this.processingFee = processingFee;
            this.regulatoryFee = regulatoryFee;
            this.volumeDiscount = volumeDiscount;
        }

        // Getters and setters
        public BigDecimal getBaseCost() { return baseCost; }
        public void setBaseCost(BigDecimal baseCost) { this.baseCost = baseCost; }

        public BigDecimal getCarbonCredit() { return carbonCredit; }
        public void setCarbonCredit(BigDecimal carbonCredit) { this.carbonCredit = carbonCredit; }

        public BigDecimal getProcessingFee() { return processingFee; }
        public void setProcessingFee(BigDecimal processingFee) { this.processingFee = processingFee; }

        public BigDecimal getRegulatoryFee() { return regulatoryFee; }
        public void setRegulatoryFee(BigDecimal regulatoryFee) { this.regulatoryFee = regulatoryFee; }

        public BigDecimal getVolumeDiscount() { return volumeDiscount; }
        public void setVolumeDiscount(BigDecimal volumeDiscount) { this.volumeDiscount = volumeDiscount; }
    }

    public PriceResponse() {}

    // Legacy getter/setter
    public BigDecimal getPricePerGallon() { return pricePerGallon; }
    public void setPricePerGallon(BigDecimal pricePerGallon) { this.pricePerGallon = pricePerGallon; }

    // Enhanced getters/setters
    public double getFlightEmissions() { return flightEmissions; }
    public void setFlightEmissions(double flightEmissions) { this.flightEmissions = flightEmissions; }

    public double getRecommendedSafVolume() { return recommendedSafVolume; }
    public void setRecommendedSafVolume(double recommendedSafVolume) { this.recommendedSafVolume = recommendedSafVolume; }

    public BigDecimal getPricePerLiter() { return pricePerLiter; }
    public void setPricePerLiter(BigDecimal pricePerLiter) { this.pricePerLiter = pricePerLiter; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public double getCarbonReduction() { return carbonReduction; }
    public void setCarbonReduction(double carbonReduction) { this.carbonReduction = carbonReduction; }

    public LocalDateTime getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDateTime validUntil) { this.validUntil = validUntil; }

    public BigDecimal getBaseCost() { return baseCost; }
    public void setBaseCost(BigDecimal baseCost) { this.baseCost = baseCost; }

    public BigDecimal getCarbonCredit() { return carbonCredit; }
    public void setCarbonCredit(BigDecimal carbonCredit) { this.carbonCredit = carbonCredit; }

    public BigDecimal getProcessingFee() { return processingFee; }
    public void setProcessingFee(BigDecimal processingFee) { this.processingFee = processingFee; }

    public BigDecimal getRegulatoryFee() { return regulatoryFee; }
    public void setRegulatoryFee(BigDecimal regulatoryFee) { this.regulatoryFee = regulatoryFee; }

    public BigDecimal getVolumeDiscount() { return volumeDiscount; }
    public void setVolumeDiscount(BigDecimal volumeDiscount) { this.volumeDiscount = volumeDiscount; }

    public PriceBreakdown getPriceBreakdown() { return priceBreakdown; }
    public void setPriceBreakdown(PriceBreakdown priceBreakdown) { this.priceBreakdown = priceBreakdown; }
}
