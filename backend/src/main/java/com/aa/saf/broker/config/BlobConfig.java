package com.aa.saf.broker.config;

import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BlobConfig {

    @Value("${azure.storage.connection-string}")
    private String connectionString;

    @Value("${azure.storage.container-name}")
    private String containerName;

    @Bean
    @ConditionalOnProperty(name = "azure.storage.connection-string", matchIfMissing = false)
    public BlobContainerClient blobContainerClient() {
        try {
            BlobServiceClient client = new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();
            BlobContainerClient containerClient = client.getBlobContainerClient(containerName);
            if (!containerClient.exists()) {
                containerClient.create();
            }
            return containerClient;
        } catch (Exception e) {
            // For development/testing, return a mock client
            return null;
        }
    }
}
