package com.aa.saf.broker.service;

import com.aa.saf.broker.model.Order;
import com.aa.saf.broker.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {
    
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    @Value("${app.email.development.mode:true}")
    private boolean emailDevelopmentMode;
    
    @Value("${spring.mail.from:noreply@saf-broker.com}")
    private String fromEmail;
    
    public void sendWelcomeEmail(User user) {
        log.info("📧 Sending welcome email to: {}", user.getEmail());
        
        if (emailDevelopmentMode || mailSender == null) {
            log.info("🧪 Development mode: Simulating welcome email to {}", user.getEmail());
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Welcome to SAF Certificate Broker!");
            message.setText(buildWelcomeEmailContent(user));
            
            mailSender.send(message);
            log.info("✅ Welcome email sent successfully to: {}", user.getEmail());
            
        } catch (Exception e) {
            log.error("❌ Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage());
        }
    }
    
    public void sendOrderConfirmationEmail(Order order) {
        log.info("📧 Sending order confirmation email for order: {}", order.getId());
        
        // Validate email address
        if (order.getUserEmail() == null || order.getUserEmail().trim().isEmpty() || !isValidEmail(order.getUserEmail())) {
            log.warn("⚠️ Invalid email address for order {}: '{}' - skipping email", order.getId(), order.getUserEmail());
            return;
        }
        
        if (emailDevelopmentMode || mailSender == null) {
            log.info("🧪 Development mode: Simulating order confirmation email for order {}", order.getId());
            return;
        }
        
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            
            helper.setFrom(fromEmail);
            helper.setTo(order.getUserEmail());
            helper.setSubject("SAF Certificate Order Confirmation - Order #" + order.getId());
            helper.setText(buildOrderConfirmationEmailContent(order), true);
            
            mailSender.send(mimeMessage);
            log.info("✅ Order confirmation email sent successfully for order: {}", order.getId());
            
        } catch (Exception e) {
            log.error("❌ Failed to send order confirmation email for order {}: {}", order.getId(), e.getMessage());
            // Don't propagate the exception - email failure shouldn't break order creation
        }
    }
    
    public void sendCertificateReadyEmail(Order order, String certificateUrl) {
        log.info("📧 Sending certificate ready email for order: {}", order.getId());
        
        // Validate email address
        if (order.getUserEmail() == null || order.getUserEmail().trim().isEmpty() || !isValidEmail(order.getUserEmail())) {
            log.warn("⚠️ Invalid email address for order {}: '{}' - skipping email", order.getId(), order.getUserEmail());
            return;
        }
        
        if (emailDevelopmentMode || mailSender == null) {
            log.info("🧪 Development mode: Simulating certificate ready email for order {}", order.getId());
            return;
        }
        
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            
            helper.setFrom(fromEmail);
            helper.setTo(order.getUserEmail());
            helper.setSubject("Your SAF Certificate is Ready! - Order #" + order.getId());
            helper.setText(buildCertificateReadyEmailContent(order, certificateUrl), true);
            
            mailSender.send(mimeMessage);
            log.info("✅ Certificate ready email sent successfully for order: {}", order.getId());
            
        } catch (Exception e) {
            log.error("❌ Failed to send certificate ready email for order {}: {}", order.getId(), e.getMessage());
            // Don't propagate the exception - email failure shouldn't break certificate generation
        }
    }
    
    public void sendOrderStatusUpdateEmail(Order order) {
        log.info("📧 Sending order status update email for order: {}", order.getId());
        
        // Validate email address
        if (order.getUserEmail() == null || order.getUserEmail().trim().isEmpty() || !isValidEmail(order.getUserEmail())) {
            log.warn("⚠️ Invalid email address for order {}: '{}' - skipping status update email", order.getId(), order.getUserEmail());
            return;
        }
        
        if (emailDevelopmentMode || mailSender == null) {
            log.info("🧪 Development mode: Simulating status update email for order {} (status: {})", 
                    order.getId(), order.getStatus());
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(order.getUserEmail());
            message.setSubject("Order Status Update - Order #" + order.getId());
            message.setText(buildStatusUpdateEmailContent(order));
            
            mailSender.send(message);
            log.info("✅ Status update email sent successfully for order: {}", order.getId());
            
        } catch (Exception e) {
            log.error("❌ Failed to send status update email for order {}: {}", order.getId(), e.getMessage());
        }
    }
    
    private String buildWelcomeEmailContent(User user) {
        return String.format("""
                Dear %s,
                
                Welcome to the SAF Certificate Broker platform!
                
                Your account has been successfully created. You can now:
                - Calculate emissions for your flights
                - Purchase SAF certificates to offset your carbon footprint
                - Download verified certificates for your records
                - Track your sustainability impact
                
                Thank you for choosing sustainable aviation fuel!
                
                Best regards,
                The SAF Broker Team
                """, user.getFullName());
    }
    
    private String buildOrderConfirmationEmailContent(Order order) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm");
        
        return String.format("""
                <html>
                <body>
                <h2>Order Confirmation</h2>
                <p>Thank you for your SAF certificate purchase!</p>
                
                <h3>Order Details:</h3>
                <ul>
                    <li><strong>Order Number:</strong> #%d</li>
                    <li><strong>Flight Emissions:</strong> %.2f kg CO2</li>
                    <li><strong>SAF Volume:</strong> %.2f gallons</li>
                    <li><strong>Total Amount:</strong> $%.2f</li>
                    <li><strong>Order Date:</strong> %s</li>
                    <li><strong>Status:</strong> %s</li>
                </ul>
                
                %s
                
                <p>Your certificate will be ready shortly. You'll receive another email when it's available for download.</p>
                
                <p>Thank you for supporting sustainable aviation!</p>
                
                <p>Best regards,<br>The SAF Broker Team</p>
                </body>
                </html>
                """, 
                order.getId(),
                order.getFlightEmissions(),
                order.getSafVolume(),
                order.getPriceUsd(),
                order.getCreatedAt().format(formatter),
                order.getStatus(),
                order.getFlightNumber() != null ? 
                    String.format("<li><strong>Flight:</strong> %s (%s → %s)</li>", 
                            order.getFlightNumber(), order.getDepartureAirport(), order.getArrivalAirport()) : ""
        );
    }
    
    private String buildCertificateReadyEmailContent(Order order, String certificateUrl) {
        return String.format("""
                <html>
                <body>
                <h2>🎉 Your SAF Certificate is Ready!</h2>
                <p>Great news! Your SAF certificate for Order #%d is now available.</p>
                
                <h3>Certificate Details:</h3>
                <ul>
                    <li><strong>SAF Volume Offset:</strong> %.2f gallons</li>
                    <li><strong>CO2 Emissions Offset:</strong> %.2f kg</li>
                    <li><strong>Environmental Impact:</strong> You've helped reduce aviation emissions!</li>
                </ul>
                
                <p><a href="%s" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Your Certificate</a></p>
                
                <p>Keep this certificate for your sustainability records and regulatory compliance.</p>
                
                <p>Thank you for choosing sustainable aviation fuel!</p>
                
                <p>Best regards,<br>The SAF Broker Team</p>
                </body>
                </html>
                """, 
                order.getId(),
                order.getSafVolume(),
                order.getFlightEmissions(),
                certificateUrl
        );
    }
    
    private String buildStatusUpdateEmailContent(Order order) {
        return String.format("""
                Dear Customer,
                
                Your order #%d status has been updated to: %s
                
                Order Details:
                - SAF Volume: %.2f gallons
                - Amount: $%.2f
                - Date: %s
                
                %s
                
                Best regards,
                The SAF Broker Team
                """,
                order.getId(),
                order.getStatus(),
                order.getSafVolume(),
                order.getPriceUsd(),
                order.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")),
                getStatusMessage(order.getStatus())
        );
    }
    
    private String getStatusMessage(Order.OrderStatus status) {
        return switch (status) {
            case PENDING -> "Your order is being processed.";
            case PROCESSING -> "We're generating your certificate.";
            case COMPLETED -> "Your certificate is ready for download!";
            case CANCELLED -> "Your order has been cancelled. If this was unexpected, please contact support.";
            case ERROR -> "There was an issue processing your order. Our team has been notified.";
            case PAID -> "Payment successful! Your certificate is being generated.";
        };
    }

    /**
     * Send payment confirmation email
     */
    public void sendPaymentConfirmationEmail(Order order, com.aa.saf.broker.model.Payment payment) {
        log.info("💳 Sending payment confirmation email for order: {} to: {}", order.getId(), order.getUserEmail());
        
        if (emailDevelopmentMode || mailSender == null) {
            log.info("🧪 Development mode: Simulating payment confirmation email for order: {}", order.getId());
            return;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setFrom(fromEmail);
            helper.setTo(order.getUserEmail());
            helper.setSubject("Payment Confirmed - SAF Certificate Order #" + order.getId());
            helper.setText(buildPaymentConfirmationEmailContent(order, payment), true);
            
            mailSender.send(message);
            log.info("✅ Payment confirmation email sent for order: {}", order.getId());
            
        } catch (Exception e) {
            log.error("❌ Failed to send payment confirmation email for order: {} - Error: {}", 
                order.getId(), e.getMessage());
        }
    }

    private String buildPaymentConfirmationEmailContent(Order order, com.aa.saf.broker.model.Payment payment) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0; font-size: 28px;">✅ Payment Confirmed!</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your SAF certificate purchase</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #10b981; margin-top: 0;">Order Details</h2>
                        <table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 12px 0; font-weight: bold;">Order Number:</td>
                                <td style="padding: 12px 0;">#%s</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 12px 0; font-weight: bold;">Flight:</td>
                                <td style="padding: 12px 0;">%s (%s → %s)</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 12px 0; font-weight: bold;">SAF Volume:</td>
                                <td style="padding: 12px 0;">%.1f Liters</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 12px 0; font-weight: bold;">CO₂ Savings:</td>
                                <td style="padding: 12px 0;">%.1f kg</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                                <td style="padding: 12px 0; font-weight: bold;">Amount Paid:</td>
                                <td style="padding: 12px 0; font-size: 18px; font-weight: bold; color: #10b981;">$%.2f</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; font-weight: bold;">Payment Date:</td>
                                <td style="padding: 12px 0;">%s</td>
                            </tr>
                        </table>
                        
                        <div style="background: #e6fffa; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 5px;">
                            <h3 style="margin-top: 0; color: #047857;">🌱 Environmental Impact</h3>
                            <p style="margin: 5px 0;">Your purchase has contributed to:</p>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li><strong>%.1f kg</strong> of CO₂ emissions avoided</li>
                                <li><strong>%.1f liters</strong> of sustainable aviation fuel used</li>
                                <li>Supporting the transition to cleaner aviation</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:4200/orders" 
                               style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                View Your Orders
                            </a>
                        </div>
                        
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
                            <p>Thank you for choosing sustainable aviation!</p>
                            <p>Questions? Contact us at support@ecojet-certificates.com</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """,
            order.getId(),
            order.getFlightNumber(),
            order.getDepartureAirport(),
            order.getArrivalAirport(),
            order.getSafVolume(),
            order.getFlightEmissions(),
            payment.getAmount(),
            payment.getCompletedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' HH:mm")),
            order.getFlightEmissions(),
            order.getSafVolume()
        );
    }
    
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        
        // Basic email validation regex
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        return email.matches(emailRegex);
    }
}
