package com.aa.saf.broker.dto;

public class QuoteRequest {
    private double flightEmissions;
    private double estimatedEmissions; // Alternative field name from frontend
    private String flightNumber;
    private String departureAirport;
    private String arrivalAirport;
    private String flightDate; // Changed to String to match frontend
    private String aircraftType;
    private double distance;

    public QuoteRequest() {}

    public double getFlightEmissions() { 
        // Return flightEmissions if set, otherwise return estimatedEmissions
        return flightEmissions > 0 ? flightEmissions : estimatedEmissions; 
    }
    public void setFlightEmissions(double flightEmissions) { this.flightEmissions = flightEmissions; }
    
    public double getEstimatedEmissions() { return estimatedEmissions; }
    public void setEstimatedEmissions(double estimatedEmissions) { this.estimatedEmissions = estimatedEmissions; }

    public String getFlightNumber() { return flightNumber; }
    public void setFlightNumber(String flightNumber) { this.flightNumber = flightNumber; }

    public String getDepartureAirport() { return departureAirport; }
    public void setDepartureAirport(String departureAirport) { this.departureAirport = departureAirport; }

    public String getArrivalAirport() { return arrivalAirport; }
    public void setArrivalAirport(String arrivalAirport) { this.arrivalAirport = arrivalAirport; }

    public String getFlightDate() { return flightDate; }
    public void setFlightDate(String flightDate) { this.flightDate = flightDate; }

    public String getAircraftType() { return aircraftType; }
    public void setAircraftType(String aircraftType) { this.aircraftType = aircraftType; }

    public double getDistance() { return distance; }
    public void setDistance(double distance) { this.distance = distance; }
}
