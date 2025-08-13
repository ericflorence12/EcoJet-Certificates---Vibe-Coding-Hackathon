package com.aa.saf.broker.dto;

import java.math.BigDecimal;

public class OrderRequest {
    private String userEmail;
    private double flightEmissions;
    private double safVolume;
    private BigDecimal priceUsd;
    private String flightNumber;
    private String departureAirport;
    private String arrivalAirport;
    private String flightDate; // Changed to String to handle frontend date format

    public OrderRequest() {}

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public double getFlightEmissions() {
        return flightEmissions;
    }

    public void setFlightEmissions(double flightEmissions) {
        this.flightEmissions = flightEmissions;
    }

    public double getSafVolume() {
        return safVolume;
    }

    public void setSafVolume(double safVolume) {
        this.safVolume = safVolume;
    }

    public BigDecimal getPriceUsd() {
        return priceUsd;
    }

    public void setPriceUsd(BigDecimal priceUsd) {
        this.priceUsd = priceUsd;
    }
    
    public String getFlightNumber() {
        return flightNumber;
    }

    public void setFlightNumber(String flightNumber) {
        this.flightNumber = flightNumber;
    }

    public String getDepartureAirport() {
        return departureAirport;
    }

    public void setDepartureAirport(String departureAirport) {
        this.departureAirport = departureAirport;
    }

    public String getArrivalAirport() {
        return arrivalAirport;
    }

    public void setArrivalAirport(String arrivalAirport) {
        this.arrivalAirport = arrivalAirport;
    }

    public String getFlightDate() {
        return flightDate;
    }

    public void setFlightDate(String flightDate) {
        this.flightDate = flightDate;
    }
}
