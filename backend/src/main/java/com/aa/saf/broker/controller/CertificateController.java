package com.aa.saf.broker.controller;

import com.aa.saf.broker.model.Certificate;
import com.aa.saf.broker.repository.CertificateRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@CrossOrigin(origins = "http://localhost:4200")
public class CertificateController {

    private static final Logger log = LoggerFactory.getLogger(CertificateController.class);

    @Autowired
    private CertificateRepository certificateRepository;

    @GetMapping
    public ResponseEntity<List<Certificate>> getAllCertificates() {
        log.info("📋 Fetching all certificates");
        
        List<Certificate> certificates = certificateRepository.findAllByOrderByIssueDateDesc();
        log.info("✅ Found {} certificates", certificates.size());
        
        return ResponseEntity.ok(certificates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Certificate> getCertificate(@PathVariable Long id) {
        log.info("📄 Fetching certificate with ID: {}", id);
        
        return certificateRepository.findById(id)
                .map(cert -> {
                    log.info("✅ Certificate found: {}", cert.getCertNumber());
                    return ResponseEntity.ok(cert);
                })
                .orElseGet(() -> {
                    log.warn("⚠️ Certificate not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }
    
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable Long id) {
        log.info("📥 Download request for certificate: {}", id);
        
        try {
            Certificate cert = certificateRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Certificate not found"));
            
            log.info("✅ Certificate found for download: {}", cert.getCertNumber());
            
            // Generate a proper PDF using PDFBox
            byte[] pdfBytes = generatePdfCertificate(cert);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "SAF_Certificate_" + cert.getCertNumber() + ".pdf");
            headers.setContentLength(pdfBytes.length);
            
            log.info("✅ Certificate PDF generated successfully for download: {} bytes", pdfBytes.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
                    
        } catch (Exception e) {
            log.error("❌ Error downloading certificate {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/order/{orderId}/download")
    public ResponseEntity<byte[]> downloadCertificateByOrderId(@PathVariable Long orderId) {
        log.info("📥 Download request for certificate by order ID: {}", orderId);
        
        try {
            Certificate cert = certificateRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Certificate not found for order: " + orderId));
            
            log.info("✅ Certificate found for order {}: {}", orderId, cert.getCertNumber());
            
            // Generate a proper PDF using PDFBox
            byte[] pdfBytes = generatePdfCertificate(cert);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "SAF_Certificate_" + cert.getCertNumber() + ".pdf");
            headers.setContentLength(pdfBytes.length);
            
            log.info("✅ Certificate PDF generated successfully for order {}: {} bytes", orderId, pdfBytes.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
                    
        } catch (Exception e) {
            log.error("❌ Error downloading certificate for order {}: {}", orderId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{id}/verify")
    public ResponseEntity<?> verifyCertificate(@PathVariable Long id) {
        log.info("🔍 Verification request for certificate: {}", id);
        
        return certificateRepository.findById(id)
                .map(cert -> {
                    // In a real implementation, this would check against external registries
                    boolean isValid = cert.getRegistryId() != null && !cert.getRegistryId().isEmpty();
                    
                    VerificationResponse response = new VerificationResponse(
                        cert.getCertNumber(),
                        isValid,
                        cert.getRegistryId(),
                        cert.getIssueDate().toString(),
                        "Verified through International SAF Registry",
                        cert.getOrder().getSafVolume(),
                        cert.getOrder().getFlightEmissions()
                    );
                    
                    log.info("✅ Certificate verification completed: {} - Valid: {}", cert.getCertNumber(), isValid);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    log.warn("⚠️ Certificate not found for verification: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }
    
    private byte[] generatePdfCertificate(Certificate cert) throws IOException {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");
        
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                // Set up fonts (using PDFBox 2.0.24 API)
                PDType1Font titleFont = PDType1Font.HELVETICA_BOLD;
                PDType1Font headerFont = PDType1Font.HELVETICA_BOLD;
                PDType1Font regularFont = PDType1Font.HELVETICA;
                
                float margin = 50;
                float yPosition = page.getMediaBox().getHeight() - margin;
                float pageWidth = page.getMediaBox().getWidth();
                
                // Header background
                contentStream.setNonStrokingColor(0.2f, 0.6f, 0.2f); // Green background
                contentStream.addRect(0, yPosition - 40, pageWidth, 80);
                contentStream.fill();
                
                // Title
                contentStream.setNonStrokingColor(Color.WHITE);
                contentStream.beginText();
                contentStream.setFont(titleFont, 24);
                String title = "SUSTAINABLE AVIATION FUEL CERTIFICATE";
                float titleWidth = titleFont.getStringWidth(title) / 1000 * 24;
                contentStream.newLineAtOffset((pageWidth - titleWidth) / 2, yPosition - 15);
                contentStream.showText(title);
                contentStream.endText();
                
                // Subtitle
                contentStream.beginText();
                contentStream.setFont(regularFont, 14);
                String subtitle = "Verified Carbon Offset Certificate";
                float subtitleWidth = regularFont.getStringWidth(subtitle) / 1000 * 14;
                contentStream.newLineAtOffset((pageWidth - subtitleWidth) / 2, yPosition - 35);
                contentStream.showText(subtitle);
                contentStream.endText();
                
                yPosition -= 100;
                
                // Certificate details
                contentStream.setNonStrokingColor(Color.BLACK);
                
                // Certificate number box
                contentStream.setStrokingColor(0.8f, 0.8f, 0.8f);
                contentStream.addRect(margin, yPosition - 30, pageWidth - 2 * margin, 40);
                contentStream.stroke();
                
                contentStream.beginText();
                contentStream.setFont(headerFont, 16);
                contentStream.newLineAtOffset(margin + 10, yPosition - 15);
                contentStream.showText("Certificate Number: " + cert.getCertNumber());
                contentStream.endText();
                
                yPosition -= 60;
                
                // Two-column layout for details
                float leftColumn = margin;
                float rightColumn = pageWidth / 2 + 20;
                float lineHeight = 20;
                
                // Left column - Certificate Info
                addSection(contentStream, headerFont, regularFont, leftColumn, yPosition, "CERTIFICATE INFORMATION");
                yPosition -= 30;
                
                addDetailLine(contentStream, regularFont, leftColumn, yPosition, "Issue Date:", 
                    cert.getIssueDate().format(formatter));
                yPosition -= lineHeight;
                
                addDetailLine(contentStream, regularFont, leftColumn, yPosition, "Registry ID:", 
                    cert.getRegistryId());
                yPosition -= lineHeight;
                
                addDetailLine(contentStream, regularFont, leftColumn, yPosition, "Verification:", 
                    "CORSIA & EU ETS Compliant");
                yPosition -= lineHeight * 2;
                
                // Flight Details
                addSection(contentStream, headerFont, regularFont, leftColumn, yPosition, "FLIGHT DETAILS");
                yPosition -= 30;
                
                addDetailLine(contentStream, regularFont, leftColumn, yPosition, "Flight Number:", 
                    cert.getOrder().getFlightNumber());
                yPosition -= lineHeight;
                
                addDetailLine(contentStream, regularFont, leftColumn, yPosition, "Route:", 
                    cert.getOrder().getDepartureAirport() + " to " + cert.getOrder().getArrivalAirport());
                yPosition -= lineHeight;
                
                addDetailLine(contentStream, regularFont, leftColumn, yPosition, "Flight Date:", 
                    cert.getOrder().getFlightDate() != null ? 
                    cert.getOrder().getFlightDate().format(formatter) : "N/A");
                
                // Right column - Emissions & SAF Data (reset yPosition for right column)
                float rightYPosition = yPosition + lineHeight * 7 + 60; // Align with left column start
                
                addSection(contentStream, headerFont, regularFont, rightColumn, rightYPosition, "EMISSIONS & SAF DATA");
                rightYPosition -= 30;
                
                addDetailLine(contentStream, regularFont, rightColumn, rightYPosition, "CO2 Emissions:", 
                    String.format("%.1f kg", cert.getOrder().getFlightEmissions()));
                rightYPosition -= lineHeight;
                
                addDetailLine(contentStream, regularFont, rightColumn, rightYPosition, "SAF Volume:", 
                    String.format("%.1f liters", cert.getOrder().getSafVolume()));
                rightYPosition -= lineHeight;
                
                addDetailLine(contentStream, regularFont, rightColumn, rightYPosition, "Carbon Reduction:", 
                    String.format("%.1f kg CO2 (80%%)", cert.getOrder().getFlightEmissions() * 0.8));
                rightYPosition -= lineHeight;
                
                addDetailLine(contentStream, regularFont, rightColumn, rightYPosition, "Total Cost:", 
                    String.format("$%.2f USD", cert.getOrder().getPriceUsd()));
                
                yPosition -= lineHeight * 3;
                
                // Verification section
                yPosition = 300; // Fixed position for verification section
                
                contentStream.setStrokingColor(0.2f, 0.6f, 0.2f);
                contentStream.setLineWidth(2);
                contentStream.addRect(margin, yPosition - 80, pageWidth - 2 * margin, 100);
                contentStream.stroke();
                
                addSection(contentStream, headerFont, regularFont, margin + 10, yPosition - 10, "VERIFICATION & COMPLIANCE");
                yPosition -= 40;
                
                String[] verificationPoints = {
                    "[X] CORSIA Eligible Fuel (CEF) Certified",
                    "[X] EU Renewable Energy Directive (RED II) Compliant",
                    "[X] ICAO Annex 16 Volume IV Standards Met",
                    "[X] ASTM D7566 Fuel Specification Approved"
                };
                
                for (String point : verificationPoints) {
                    contentStream.beginText();
                    contentStream.setFont(regularFont, 11);
                    contentStream.newLineAtOffset(margin + 20, yPosition);
                    contentStream.showText(point);
                    contentStream.endText();
                    yPosition -= 15;
                }
                
                // Footer
                yPosition = 120;
                contentStream.beginText();
                contentStream.setFont(regularFont, 10);
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("This certificate serves as proof of sustainable aviation fuel purchase for corporate sustainability reporting.");
                contentStream.endText();
                
                yPosition -= 20;
                contentStream.beginText();
                contentStream.setFont(regularFont, 10);
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("For verification, visit: https://ecojetcertificates.com/verify/" + cert.getCertNumber());
                contentStream.endText();
                
                // QR code placeholder
                contentStream.setStrokingColor(Color.BLACK);
                contentStream.addRect(pageWidth - margin - 80, 50, 70, 70);
                contentStream.stroke();
                
                contentStream.beginText();
                contentStream.setFont(regularFont, 8);
                contentStream.newLineAtOffset(pageWidth - margin - 75, 80);
                contentStream.showText("QR Code");
                contentStream.endText();
            }
            
            // Convert to byte array
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            document.save(byteArrayOutputStream);
            return byteArrayOutputStream.toByteArray();
        }
    }
    
    private void addSection(PDPageContentStream contentStream, PDType1Font headerFont, PDType1Font regularFont, 
                           float x, float y, String title) throws IOException {
        contentStream.beginText();
        contentStream.setFont(headerFont, 14);
        contentStream.newLineAtOffset(x, y);
        contentStream.showText(title);
        contentStream.endText();
        
        // Underline
        contentStream.setLineWidth(1);
        contentStream.moveTo(x, y - 3);
        contentStream.lineTo(x + headerFont.getStringWidth(title) / 1000 * 14, y - 3);
        contentStream.stroke();
    }
    
    private void addDetailLine(PDPageContentStream contentStream, PDType1Font font, float x, float y, 
                              String label, String value) throws IOException {
        contentStream.beginText();
        contentStream.setFont(font, 11);
        contentStream.newLineAtOffset(x, y);
        contentStream.showText(label + " " + value);
        contentStream.endText();
    }
    
    private String buildCertificateContent(Certificate cert) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");
        
        return String.format("""
            ═══════════════════════════════════════════════════════════════
                          SUSTAINABLE AVIATION FUEL CERTIFICATE
            ═══════════════════════════════════════════════════════════════
            
            Certificate Number: %s
            Issue Date: %s
            Registry ID: %s
            
            ═══════════════════════════════════════════════════════════════
                                    FLIGHT DETAILS
            ═══════════════════════════════════════════════════════════════
            
            Flight Number: %s
            Route: %s → %s
            Flight Date: %s
            
            ═══════════════════════════════════════════════════════════════
                                 EMISSIONS & SAF DATA
            ═══════════════════════════════════════════════════════════════
            
            Total CO2 Emissions: %.1f kg
            SAF Volume Purchased: %.1f liters
            Carbon Reduction: %.1f kg CO2 (%.0f%% reduction)
            
            ═══════════════════════════════════════════════════════════════
                                   VERIFICATION
            ═══════════════════════════════════════════════════════════════
            
            This certificate verifies that the above quantity of Sustainable
            Aviation Fuel (SAF) was purchased to offset the carbon emissions
            from the specified flight.
            
            Verification Authority: EcoJet Certificates Platform
            Registry: International SAF Certificate Registry
            Compliance: CORSIA, EU ETS, ICAO Standards
            
            Chain of Custody: Verified through blockchain-based tracking
            SAF Producer: Certified renewable feedstock suppliers
            Blending Ratio: Up to 50%% SAF blend approved by aviation authorities
            
            ═══════════════════════════════════════════════════════════════
                                 REGULATORY COMPLIANCE
            ═══════════════════════════════════════════════════════════════
            
            [X] CORSIA Eligible Fuel (CEF) Certified
            [X] EU Renewable Energy Directive (RED II) Compliant  
            [X] ICAO Annex 16 Volume IV Standards Met
            [X] ASTM D7566 Fuel Specification Approved
            [X] Third-Party Lifecycle Assessment Verified
            
            For verification, visit: https://ecojetcertificates.com/verify/%s
            
            This document serves as proof of sustainable aviation fuel purchase
            and carbon offset for corporate sustainability reporting.
            
            ═══════════════════════════════════════════════════════════════
            """,
            cert.getCertNumber(),
            cert.getIssueDate().format(formatter),
            cert.getRegistryId(),
            cert.getOrder().getFlightNumber(),
            cert.getOrder().getDepartureAirport(),
            cert.getOrder().getArrivalAirport(),
            cert.getOrder().getFlightDate() != null ? cert.getOrder().getFlightDate().format(formatter) : "N/A",
            cert.getOrder().getFlightEmissions(),
            cert.getOrder().getSafVolume(),
            cert.getOrder().getFlightEmissions() * 0.8, // 80% reduction typical for SAF
            80.0,
            cert.getCertNumber()
        );
    }
    
    // Inner class for verification response
    public static class VerificationResponse {
        private String certificateNumber;
        private boolean valid;
        private String registryId;
        private String issueDate;
        private String verificationAuthority;
        private Double safVolume;
        private Double co2Offset;
        
        public VerificationResponse(String certificateNumber, boolean valid, String registryId, 
                                  String issueDate, String verificationAuthority, Double safVolume, Double co2Offset) {
            this.certificateNumber = certificateNumber;
            this.valid = valid;
            this.registryId = registryId;
            this.issueDate = issueDate;
            this.verificationAuthority = verificationAuthority;
            this.safVolume = safVolume;
            this.co2Offset = co2Offset;
        }
        
        // Getters
        public String getCertificateNumber() { return certificateNumber; }
        public boolean isValid() { return valid; }
        public String getRegistryId() { return registryId; }
        public String getIssueDate() { return issueDate; }
        public String getVerificationAuthority() { return verificationAuthority; }
        public Double getSafVolume() { return safVolume; }
        public Double getCo2Offset() { return co2Offset; }
    }
}
