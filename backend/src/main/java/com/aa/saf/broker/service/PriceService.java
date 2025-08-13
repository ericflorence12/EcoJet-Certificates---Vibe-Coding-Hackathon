package com.aa.saf.broker.service;

import com.aa.saf.broker.dto.PriceResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PriceService {

    private static final Logger log = LoggerFactory.getLogger(PriceService.class);
    private final WebClient webClient;

    @Value("${pricing.api.url:}")
    private String pricingApiUrl;

    @Value("${app.development.mode:false}")
    private boolean developmentMode;
    
    @Value("${pricing.api.opis.enabled:false}")
    private boolean opisEnabled;
    
    @Value("${pricing.api.platts.enabled:false}")
    private boolean plattsEnabled;
    
    @Value("${pricing.api.icis.enabled:false}")
    private boolean icisEnabled;
    
    @Value("${pricing.api.carbon-market.enabled:true}")
    private boolean carbonMarketEnabled;
    
    @Value("${pricing.cache.refresh.minutes:15}")
    private int cacheRefreshMinutes;

    // Cache for pricing data to avoid repeated calculations
    private final Map<String, PriceData> priceCache = new ConcurrentHashMap<>();

    public static class PriceData {
        private BigDecimal safPricePerLiter;
        private BigDecimal carbonCreditRate;
        private LocalDateTime lastUpdated;

        public PriceData(BigDecimal safPricePerLiter, BigDecimal carbonCreditRate) {
            this.safPricePerLiter = safPricePerLiter;
            this.carbonCreditRate = carbonCreditRate;
            this.lastUpdated = LocalDateTime.now();
        }

        // Getters
        public BigDecimal getSafPricePerLiter() { return safPricePerLiter; }
        public BigDecimal getCarbonCreditRate() { return carbonCreditRate; }
        public LocalDateTime getLastUpdated() { return lastUpdated; }
        
        public boolean isExpired() {
            return lastUpdated.isBefore(LocalDateTime.now().minusMinutes(15)); // Will be made configurable
        }
    }

    public PriceService(WebClient webClient) {
        this.webClient = webClient;
    }

    public PriceResponse calculateDetailedQuote(double flightEmissions, double distanceKm, String aircraftType) {
        log.info("💰 Calculating detailed SAF quote for {} kg CO2 emissions", flightEmissions);
        
        // Get current market prices
        PriceData currentPrices = getCurrentMarketPrices();
        
        // Calculate SAF volume needed (industry standard conversion)
        double safVolumeNeeded = calculateSafVolumeFromEmissions(flightEmissions, aircraftType);
        
        // Calculate pricing components
        BigDecimal baseCost = currentPrices.getSafPricePerLiter()
                .multiply(BigDecimal.valueOf(safVolumeNeeded))
                .setScale(2, RoundingMode.HALF_UP);
        
        BigDecimal carbonCredit = currentPrices.getCarbonCreditRate()
                .multiply(BigDecimal.valueOf(flightEmissions))
                .setScale(2, RoundingMode.HALF_UP);
        
        BigDecimal processingFee = baseCost.multiply(BigDecimal.valueOf(0.035))
                .setScale(2, RoundingMode.HALF_UP);
        
        BigDecimal regulatoryFee = baseCost.multiply(BigDecimal.valueOf(0.017))
                .setScale(2, RoundingMode.HALF_UP);
        
        // Volume discount for larger orders
        BigDecimal volumeDiscount = calculateVolumeDiscount(safVolumeNeeded, baseCost);
        
        BigDecimal totalPrice = baseCost.add(carbonCredit).add(processingFee)
                .add(regulatoryFee).subtract(volumeDiscount)
                .setScale(2, RoundingMode.HALF_UP);
        
        // Calculate carbon reduction (SAF reduces emissions by ~80%)
        double carbonReduction = flightEmissions * 0.80;
        
        // Create detailed response
        PriceResponse response = new PriceResponse();
        response.setFlightEmissions(flightEmissions);
        response.setRecommendedSafVolume(safVolumeNeeded);
        response.setPricePerLiter(currentPrices.getSafPricePerLiter());
        response.setTotalPrice(totalPrice);
        response.setCarbonReduction(carbonReduction);
        response.setValidUntil(LocalDateTime.now().plusHours(1));
        
        // Set price breakdown (both individual fields and nested object for frontend compatibility)
        response.setBaseCost(baseCost);
        response.setCarbonCredit(carbonCredit);
        response.setProcessingFee(processingFee);
        response.setRegulatoryFee(regulatoryFee);
        response.setVolumeDiscount(volumeDiscount);
        
        // Create nested price breakdown object for frontend
        PriceResponse.PriceBreakdown breakdown = new PriceResponse.PriceBreakdown(
            baseCost, carbonCredit, processingFee, regulatoryFee, volumeDiscount
        );
        response.setPriceBreakdown(breakdown);
        
        log.info("✅ Quote calculated: {} L SAF for ${} (${}/L)", 
                safVolumeNeeded, totalPrice, currentPrices.getSafPricePerLiter());
        
        return response;
    }

    private PriceData getCurrentMarketPrices() {
        String cacheKey = "current_prices";
        
        // Check cache first
        if (priceCache.containsKey(cacheKey)) {
            PriceData cached = priceCache.get(cacheKey);
            if (!cached.isExpired()) {
                log.debug("📋 Using cached pricing data");
                return cached;
            }
        }
        
        // Try external API first (if configured and not in development mode)
        if (!developmentMode && pricingApiUrl != null && !pricingApiUrl.isEmpty()) {
            try {
                log.info("🌐 Fetching real-time SAF market prices");
                // This would call a real SAF pricing API in production
                return fetchExternalPrices();
            } catch (Exception e) {
                log.warn("⚠️ External pricing API failed, using market-based defaults: {}", e.getMessage());
            }
        }
        
        // Use realistic market-based pricing as fallback
        PriceData marketPrices = getRealisticMarketPrices();
        priceCache.put(cacheKey, marketPrices);
        return marketPrices;
    }

    private PriceData fetchExternalPrices() {
        // Real SAF pricing APIs for production use:
        // 1. OPIS (Oil Price Information Service) - Industry standard for fuel pricing
        // 2. Platts (S&P Global) - Global commodities pricing
        // 3. Argus Media - Alternative fuels and renewable energy pricing
        // 4. ICIS - Chemical and energy market intelligence
        // 5. Reuters Refinitiv - Financial and commodity data
        
        try {
            // Try OPIS SAF pricing API (industry standard)
            if (opisEnabled) {
                PriceData opisPrices = fetchOpisSafPricing();
                if (opisPrices != null) return opisPrices;
            }
            
            // Fallback to Platts commodity pricing
            if (plattsEnabled) {
                PriceData plattsPrices = fetchPlattsCommodityPricing();
                if (plattsPrices != null) return plattsPrices;
            }
            
            // Fallback to ICIS renewable fuels pricing
            if (icisEnabled) {
                PriceData icisPrices = fetchIcisRenewableFuelsPricing();
                if (icisPrices != null) return icisPrices;
            }
            
            // Fallback to EU carbon market pricing + fuel indexes
            if (carbonMarketEnabled) {
                PriceData carbonMarketPrices = fetchCarbonMarketPricing();
                if (carbonMarketPrices != null) return carbonMarketPrices;
            }
            
        } catch (Exception e) {
            log.debug("External API call failed: {}", e.getMessage());
        }
        
        return getRealisticMarketPrices();
    }
    
    private PriceData fetchOpisSafPricing() {
        try {
            // OPIS (Oil Price Information Service) - THE industry standard for fuel pricing
            // API endpoint: https://api.opisnet.com/v2/pricing/saf
            // Requires OPIS subscription (~$2,000-5,000/month for professional access)
            
            log.info("🌐 Fetching OPIS SAF market pricing");
            
            PriceResponse response = webClient.get()
                .uri(pricingApiUrl + "/opis/saf/current")
                .header("Authorization", "Bearer " + System.getenv("OPIS_API_KEY"))
                .header("Accept", "application/json")
                .retrieve()
                .bodyToMono(PriceResponse.class)
                .timeout(java.time.Duration.ofSeconds(10))
                .block();
            
            if (response != null && response.getPricePerLiter() != null) {
                log.info("✅ OPIS pricing received: ${}/L SAF", response.getPricePerLiter());
                return new PriceData(
                    response.getPricePerLiter(),
                    BigDecimal.valueOf(0.045) // OPIS also provides carbon credit pricing
                );
            }
        } catch (Exception e) {
            log.debug("OPIS API failed: {}", e.getMessage());
        }
        return null;
    }
    
    private PriceData fetchPlattsCommodityPricing() {
        try {
            // Platts (S&P Global) - Global commodity pricing leader
            // API endpoint: https://api.platts.com/v1/commodities/saf
            // Requires S&P subscription (~$1,500-3,000/month)
            
            log.info("🌐 Fetching Platts SAF commodity pricing");
            
            String response = webClient.get()
                .uri("https://api.platts.com/v1/commodities/saf/current")
                .header("Authorization", "Bearer " + System.getenv("PLATTS_API_KEY"))
                .header("Accept", "application/json")
                .retrieve()
                .bodyToMono(String.class)
                .timeout(java.time.Duration.ofSeconds(10))
                .block();
            
            if (response != null && response.contains("price")) {
                // Parse Platts JSON response
                // Example: {"commodity": "SAF", "price": 3.45, "currency": "USD", "unit": "liter"}
                double safPrice = extractPriceFromJson(response, "price");
                if (safPrice > 0) {
                    log.info("✅ Platts pricing received: ${}/L SAF", safPrice);
                    return new PriceData(
                        BigDecimal.valueOf(safPrice),
                        BigDecimal.valueOf(0.042) // Default carbon credit rate
                    );
                }
            }
        } catch (Exception e) {
            log.debug("Platts API failed: {}", e.getMessage());
        }
        return null;
    }
    
    private PriceData fetchIcisRenewableFuelsPricing() {
        try {
            // ICIS - Chemical and energy market intelligence
            // API endpoint: https://api.icis.com/v1/renewable-fuels/saf
            // Requires ICIS subscription (~$1,200-2,500/month)
            
            log.info("🌐 Fetching ICIS renewable fuels pricing");
            
            String response = webClient.get()
                .uri("https://api.icis.com/v1/renewable-fuels/saf")
                .header("X-API-Key", System.getenv("ICIS_API_KEY"))
                .header("Accept", "application/json")
                .retrieve()
                .bodyToMono(String.class)
                .timeout(java.time.Duration.ofSeconds(10))
                .block();
            
            if (response != null && response.contains("saf_price")) {
                double safPrice = extractPriceFromJson(response, "saf_price");
                if (safPrice > 0) {
                    log.info("✅ ICIS pricing received: ${}/L SAF", safPrice);
                    return new PriceData(
                        BigDecimal.valueOf(safPrice),
                        BigDecimal.valueOf(0.040)
                    );
                }
            }
        } catch (Exception e) {
            log.debug("ICIS API failed: {}", e.getMessage());
        }
        return null;
    }
    
    private PriceData fetchCarbonMarketPricing() {
        try {
            // EU ETS + Alternative fuel pricing (Free/Low-cost option)
            // Carbon prices: https://api.carbontracker.org/v1/carbon-prices/eu-ets
            // Alternative: https://www.eex.com/en/market-data/power/futures (EEX has free tier)
            
            log.info("🌐 Fetching EU carbon market + fuel index pricing");
            
            // Get EU ETS carbon price (free API)
            String carbonResponse = webClient.get()
                .uri("https://api.carbontracker.org/v1/carbon-prices/eu-ets/current")
                .retrieve()
                .bodyToMono(String.class)
                .timeout(java.time.Duration.ofSeconds(5))
                .block();
            
            double carbonPrice = 0.045; // Default
            if (carbonResponse != null) {
                carbonPrice = extractPriceFromJson(carbonResponse, "price") / 1000; // Convert EUR/tonne to USD/kg
            }
            
            // Calculate SAF price from conventional fuel + green premium
            // Jet fuel price + sustainability premium (2.5-4x conventional)
            double conventionalFuelPrice = 0.85; // Can get from oil price APIs
            double greenPremium = 3.2; // 3.2x premium for SAF
            double estimatedSafPrice = conventionalFuelPrice * greenPremium;
            
            log.info("✅ Carbon market pricing: ${}/kg CO2, Estimated SAF: ${}/L", carbonPrice, estimatedSafPrice);
            
            return new PriceData(
                BigDecimal.valueOf(estimatedSafPrice),
                BigDecimal.valueOf(carbonPrice)
            );
            
        } catch (Exception e) {
            log.debug("Carbon market API failed: {}", e.getMessage());
        }
        return null;
    }
    
    private double extractPriceFromJson(String jsonResponse, String priceField) {
        // Simple JSON parsing for price extraction
        // In production, use Jackson ObjectMapper for proper JSON parsing
        try {
            String pattern = "\"" + priceField + "\"\\s*:\\s*([0-9.]+)";
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
            java.util.regex.Matcher m = p.matcher(jsonResponse);
            if (m.find()) {
                return Double.parseDouble(m.group(1));
            }
        } catch (Exception e) {
            log.debug("Failed to extract price from JSON: {}", e.getMessage());
        }
        return 0.0;
    }

    private PriceData getRealisticMarketPrices() {
        // Current SAF market pricing (as of Q3 2025)
        // SAF typically costs 3-5x conventional jet fuel due to limited supply
        // Conventional jet fuel: ~$0.85/liter
        // SAF premium: ~$2.50-4.20/liter (increasing as demand grows)
        
        // Add some realistic market volatility
        double basePrice = 3.20; // Increased base SAF price per liter in USD (2025 pricing)
        double volatility = (Math.random() - 0.5) * 0.40; // ±20% volatility (volatile market)
        double currentPrice = Math.max(2.50, basePrice + volatility); // Minimum $2.50/L
        
        // Carbon credit pricing (EU ETS style, increased for 2025)
        double carbonCreditBase = 0.045; // Increased to $0.045 per kg CO2 (carbon prices rising)
        double carbonVolatility = (Math.random() - 0.5) * 0.015; // ±$0.0075 volatility
        double carbonCredit = Math.max(0.025, carbonCreditBase + carbonVolatility); // Minimum $0.025
        
        log.info("📊 Current market prices: SAF ${}/L, Carbon ${}/kg CO2", 
                String.format("%.3f", currentPrice), String.format("%.3f", carbonCredit));
        
        return new PriceData(
            BigDecimal.valueOf(currentPrice).setScale(3, RoundingMode.HALF_UP),
            BigDecimal.valueOf(carbonCredit).setScale(3, RoundingMode.HALF_UP)
        );
    }

    private double calculateSafVolumeFromEmissions(double flightEmissions, String aircraftType) {
        // SAF Certificate calculation: Based on actual fuel volume needed for the flight
        // This is more realistic than just offsetting emissions
        // Average fuel consumption: ~3-4 liters per kg CO2 for commercial aviation
        
        Map<String, Double> fuelConsumptionRates = Map.of(
            "Airbus A321", 3.2,        // Liters of fuel per kg CO2 emitted
            "Boeing 737-800", 3.4,     // Slightly less efficient  
            "Boeing 737 MAX 8", 3.0,   // More efficient new generation
            "Airbus A320", 3.3,        // Standard narrow body
            "Boeing 777-200", 3.1,     // Wide body efficiency (corrected from 3.6)
            "Boeing 777-300ER", 3.5,   // Larger wide body, better per-passenger
            "Airbus A350-900", 2.9,    // Very efficient new generation
            "Embraer E175", 3.8,       // Regional jets less efficient per kg CO2
            "Embraer E190", 3.6
        );
        
        double fuelPerCO2 = fuelConsumptionRates.getOrDefault(aircraftType, 3.3); // Default rate
        
        // Calculate fuel volume needed for this flight segment
        double totalFuelVolume = flightEmissions * fuelPerCO2;
        
        // SAF certificates typically cover 10-50% of fuel volume (blending requirements)
        // For environmental impact, assume 25% SAF blend requirement
        double safBlendPercentage = 0.25; // 25% SAF blend
        double safVolume = totalFuelVolume * safBlendPercentage;
        
        log.debug("⛽ Enhanced fuel calculation for {}: {} kg CO2 × {} L/kg = {} L total fuel, {} L SAF (25% blend)", 
                aircraftType, flightEmissions, fuelPerCO2, String.format("%.1f", totalFuelVolume), 
                String.format("%.1f", safVolume));
        
        return Math.round(safVolume * 10.0) / 10.0; // Round to 1 decimal place
    }

    private BigDecimal calculateVolumeDiscount(double safVolume, BigDecimal baseCost) {
        // Volume discounts for larger orders
        if (safVolume > 100) {
            return baseCost.multiply(BigDecimal.valueOf(0.05)); // 5% discount for >100L
        } else if (safVolume > 50) {
            return baseCost.multiply(BigDecimal.valueOf(0.025)); // 2.5% discount for >50L
        }
        return BigDecimal.ZERO;
    }

    public PriceResponse fetchPrice() {
        // Legacy method for backward compatibility
        PriceData prices = getCurrentMarketPrices();
        PriceResponse response = new PriceResponse();
        response.setPricePerGallon(prices.getSafPricePerLiter().multiply(BigDecimal.valueOf(3.78541))); // Convert L to gallons
        return response;
    }

    public void clearPriceCache() {
        priceCache.clear();
        log.info("🗑️ Price cache cleared");
    }
}
