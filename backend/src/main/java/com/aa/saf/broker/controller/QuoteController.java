package com.aa.saf.broker.controller;

import com.aa.saf.broker.dto.QuoteRequest;
import com.aa.saf.broker.dto.QuoteResponse;
import com.aa.saf.broker.dto.PriceResponse;
import com.aa.saf.broker.service.ConversionService;
import com.aa.saf.broker.service.PriceService;
import com.aa.saf.broker.service.FlightEmissionsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quote")
@CrossOrigin(origins = "*")
public class QuoteController {

    private static final Logger log = LoggerFactory.getLogger(QuoteController.class);
    
    private final ConversionService conversionService;
    private final PriceService priceService;
    private final FlightEmissionsService flightEmissionsService;

    @Autowired
    public QuoteController(ConversionService conversionService, PriceService priceService, FlightEmissionsService flightEmissionsService) {
        this.conversionService = conversionService;
        this.priceService = priceService;
        this.flightEmissionsService = flightEmissionsService;
    }

    @PostMapping
    public ResponseEntity<PriceResponse> getQuote(@RequestBody QuoteRequest request) {
        log.info("💰 Processing quote request for flight {} ({} kg CO2)", 
                request.getFlightNumber(), request.getFlightEmissions());
        
        try {
            // Get detailed emissions data if not provided
            double emissions = request.getFlightEmissions();
            String aircraftType = request.getAircraftType();
            double distance = request.getDistance();
            
            // If emissions or aircraft type missing, calculate from flight details
            if (emissions <= 0 || aircraftType == null || aircraftType.isEmpty()) {
                if (request.getFlightNumber() != null && 
                    request.getDepartureAirport() != null && 
                    request.getArrivalAirport() != null) {
                    
                    log.info("📊 Calculating missing flight data for {}", request.getFlightNumber());
                    FlightEmissionsService.EmissionData emissionData = flightEmissionsService.getFlightEmissions(
                        request.getFlightNumber(),
                        request.getDepartureAirport(), 
                        request.getArrivalAirport()
                    );
                    
                    emissions = emissionData.getCo2Emissions();
                    aircraftType = emissionData.getAircraftType();
                    distance = emissionData.getDistance();
                    
                    log.info("✅ Calculated: {} kg CO2, {} aircraft, {} km", 
                            emissions, aircraftType, distance);
                } else {
                    throw new IllegalArgumentException("Insufficient flight data for quote calculation");
                }
            }
            
            // Calculate detailed pricing quote
            PriceResponse quote = priceService.calculateDetailedQuote(emissions, distance, aircraftType);
            
            // Set additional metadata
            if (request.getFlightNumber() != null) {
                quote.setFlightEmissions(emissions);
            }
            
            log.info("✅ Quote generated: {} L SAF for ${} total", 
                    quote.getRecommendedSafVolume(), quote.getTotalPrice());
            
            return ResponseEntity.ok(quote);
            
        } catch (Exception e) {
            log.error("❌ Error generating quote: {}", e.getMessage());
            
            // Return fallback quote for basic emissions data
            if (request.getFlightEmissions() > 0) {
                log.info("🔄 Using fallback quote calculation");
                return getFallbackQuote(request);
            }
            
            return ResponseEntity.badRequest().build();
        }
    }

    private ResponseEntity<PriceResponse> getFallbackQuote(QuoteRequest request) {
        try {
            // Basic fallback calculation
            double safVolume = conversionService.convertEmissions(request.getFlightEmissions());
            PriceResponse basicPrice = priceService.fetchPrice();
            
            PriceResponse fallbackQuote = new PriceResponse();
            fallbackQuote.setFlightEmissions(request.getFlightEmissions());
            fallbackQuote.setRecommendedSafVolume(safVolume);
            fallbackQuote.setPricePerLiter(basicPrice.getPricePerGallon().divide(java.math.BigDecimal.valueOf(3.78541), 3, java.math.RoundingMode.HALF_UP));
            fallbackQuote.setTotalPrice(basicPrice.getPricePerGallon().multiply(java.math.BigDecimal.valueOf(safVolume)));
            fallbackQuote.setCarbonReduction(request.getFlightEmissions() * 0.80); // 80% reduction
            fallbackQuote.setValidUntil(java.time.LocalDateTime.now().plusHours(1));
            
            return ResponseEntity.ok(fallbackQuote);
        } catch (Exception e) {
            log.error("❌ Fallback quote also failed: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Quote service is running");
    }
}
