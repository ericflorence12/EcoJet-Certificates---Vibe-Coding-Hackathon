package com.aa.saf.broker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.UUID;

@Service
public class RegistryService {

    private static final Logger log = LoggerFactory.getLogger(RegistryService.class);
    private final WebClient webClient;

    @Value("${registry.api.url}")
    private String registryApiUrl;

    @Value("${app.development.mode:false}")
    private boolean developmentMode;

    public RegistryService(WebClient webClient) {
        this.webClient = webClient;
        log.info("🔧 RegistryService initialized");
    }

    public String registerCertificate(long orderId, String pdfUrl) {
        log.info("🌐 Registering certificate for order: {} with PDF: {}", orderId, pdfUrl);

        // Skip external API in development mode for faster response
        if (developmentMode) {
            String mockRegistryId = "REG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            log.info("🧪 Development mode: Using mock registry ID: {}", mockRegistryId);
            return mockRegistryId;
        }

        try {
            // Simplified request body
            var requestBody = new java.util.HashMap<String, Object>();
            requestBody.put("orderId", orderId);
            requestBody.put("pdfUrl", pdfUrl);

            log.info("📤 Sending certificate registration request to: {}", registryApiUrl + "/certificates");
            var response = webClient.post()
                .uri(registryApiUrl + "/certificates")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(java.util.Map.class)
                .block();

            String registryId = response != null ? (String) response.get("registryId") : null;
            
            if (registryId != null) {
                log.info("✅ Certificate registered successfully with ID: {}", registryId);
                return registryId;
            } else {
                log.warn("⚠️ Registry response missing registryId, using fallback");
                return generateFallbackRegistryId();
            }
            
        } catch (Exception e) {
            log.error("❌ Failed to register certificate with external registry: {}", e.getMessage(), e);
            log.info("🔄 Using fallback registry ID generation");
            return generateFallbackRegistryId();
        }
    }

    private String generateFallbackRegistryId() {
        String fallbackId = "REG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("🆔 Generated fallback registry ID: {}", fallbackId);
        return fallbackId;
    }
}
