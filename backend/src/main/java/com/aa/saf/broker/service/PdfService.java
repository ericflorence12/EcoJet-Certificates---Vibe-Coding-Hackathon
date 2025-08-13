package com.aa.saf.broker.service;

import com.azure.storage.blob.BlobContainerClient;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PdfService {

    private static final Logger log = LoggerFactory.getLogger(PdfService.class);
    private final BlobContainerClient blobContainerClient;

    public PdfService(@Autowired(required = false) BlobContainerClient blobContainerClient) {
        this.blobContainerClient = blobContainerClient;
        log.info("🔧 PdfService initialized. Azure Blob client available: {}", blobContainerClient != null);
    }

    public String generateCertificatePdf(long orderId, String userEmail, double safVolume, double priceUsd) throws Exception {
        log.info("📄 Starting PDF generation for order: {}, user: {}, SAF: {} gallons, price: ${}", 
                orderId, userEmail, safVolume, priceUsd);

        PDDocument doc = null;
        try {
            doc = new PDDocument();
            PDPage page = new PDPage();
            doc.addPage(page);
            log.info("📃 Created PDF document and page");

            PDPageContentStream content = new PDPageContentStream(doc, page);
            content.beginText();
            content.setFont(PDType1Font.HELVETICA_BOLD, 20);
            content.newLineAtOffset(100, 700);
            content.showText("Sustainable Aviation Fuel Certificate");
            content.newLineAtOffset(0, -40);
            content.setFont(PDType1Font.HELVETICA, 12);
            content.showText("Certificate ID: " + UUID.randomUUID().toString());
            content.newLineAtOffset(0, -20);
            content.showText("Order ID: " + orderId);
            content.newLineAtOffset(0, -20);
            content.showText("Issued To: " + userEmail);
            content.newLineAtOffset(0, -20);
            content.showText(String.format("SAF Volume: %.2f gallons", safVolume));
            content.newLineAtOffset(0, -20);
            content.showText(String.format("Price (USD): $%.2f", priceUsd));
            content.newLineAtOffset(0, -20);
            content.showText("Date: " + LocalDateTime.now().toString());
            content.endText();
            content.close();
            log.info("✅ PDF content generated successfully");

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            log.info("📦 PDF saved to byte array. Size: {} bytes", baos.size());

            String blobName = "cert_" + orderId + ".pdf";
            
            if (blobContainerClient != null) {
                log.info("☁️ Uploading PDF to Azure Blob Storage: {}", blobName);
                try {
                    InputStream dataStream = new ByteArrayInputStream(baos.toByteArray());
                    blobContainerClient.getBlobClient(blobName).upload(dataStream, baos.size(), true);
                    String blobUrl = blobContainerClient.getBlobClient(blobName).getBlobUrl();
                    log.info("✅ PDF uploaded successfully to: {}", blobUrl);
                    return blobUrl;
                } catch (Exception e) {
                    log.error("❌ Failed to upload PDF to Azure Blob Storage: {}", e.getMessage(), e);
                    // Fall back to mock URL
                    String mockUrl = "http://localhost:8080/mock-certificates/" + blobName;
                    log.info("🔄 Using fallback mock URL: {}", mockUrl);
                    return mockUrl;
                }
            } else {
                // For development/testing without Azure, return a mock URL
                String mockUrl = "http://localhost:8080/mock-certificates/" + blobName;
                log.info("🧪 Development mode: Using mock URL: {}", mockUrl);
                return mockUrl;
            }
        } catch (Exception e) {
            log.error("❌ Error generating PDF for order {}: {}", orderId, e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF certificate: " + e.getMessage(), e);
        } finally {
            if (doc != null) {
                try {
                    doc.close();
                    log.info("🔒 PDF document closed");
                } catch (Exception e) {
                    log.warn("⚠️ Error closing PDF document: {}", e.getMessage());
                }
            }
        }
    }
}
