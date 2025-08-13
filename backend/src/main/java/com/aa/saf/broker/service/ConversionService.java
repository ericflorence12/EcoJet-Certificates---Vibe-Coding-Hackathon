package com.aa.saf.broker.service;

import com.aa.saf.broker.dto.ConversionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class ConversionService {

    private final WebClient webClient;

    @Value("${conversion.api.url}")
    private String conversionApiUrl;

    @Value("${app.development.mode:false}")
    private boolean developmentMode;

    public ConversionService(WebClient webClient) {
        this.webClient = webClient;
    }

    public double convertEmissions(double flightEmissions) {
        // Skip external API in development mode for faster response
        if (developmentMode) {
            System.out.println("Development mode: Using local calculation for " + flightEmissions + " kg CO2");
            return getDefaultConversion(flightEmissions);
        }

        try {
            ConversionResponse response = webClient.post()
                .uri(conversionApiUrl)
                .bodyValue(flightEmissions)
                .retrieve()
                .bodyToMono(ConversionResponse.class)
                .block();
            return response != null ? response.getSafVolume() : getDefaultConversion(flightEmissions);
        } catch (Exception e) {
            // Fallback to calculated conversion when external API is unavailable
            System.out.println("External conversion API unavailable, using fallback calculation: " + e.getMessage());
            return getDefaultConversion(flightEmissions);
        }
    }

    private double getDefaultConversion(double flightEmissions) {
        // Industry standard: ~1 kg CO2 = ~0.03 gallons SAF (rough conversion)
        // This is a simplified calculation for demo purposes
        return flightEmissions * 0.03;
    }
}
