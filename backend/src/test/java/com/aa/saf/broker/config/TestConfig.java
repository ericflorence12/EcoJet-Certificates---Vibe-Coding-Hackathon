package com.aa.saf.broker.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

@TestConfiguration
@Profile("test")
public class TestConfig {

    @Bean
    @Primary
    public MockBlobContainerClient blobContainerClient() {
        return new MockBlobContainerClient();
    }

    // Mock implementation for testing
    public static class MockBlobContainerClient {
        public String uploadBlob(String blobName, byte[] data) {
            return "http://localhost:8080/mock-blob/" + blobName;
        }
        
        public boolean exists() {
            return true;
        }
    }
}
