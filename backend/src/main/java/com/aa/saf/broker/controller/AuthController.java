package com.aa.saf.broker.controller;

import com.aa.saf.broker.dto.LoginRequest;
import com.aa.saf.broker.dto.LoginResponse;
import com.aa.saf.broker.dto.RegisterRequest;
import com.aa.saf.broker.model.User;
import com.aa.saf.broker.service.UserService;
import com.aa.saf.broker.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private EmailService emailService;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        log.info("👤 Registration request for email: {}", request.getEmail());
        
        try {
            User user = new User(request.getEmail(), request.getPassword(), 
                               request.getFirstName(), request.getLastName());
            user.setCompany(request.getCompany());
            
            User savedUser = userService.registerUser(user);
            
            // Send welcome email
            emailService.sendWelcomeEmail(savedUser);
            
            // Generate token for immediate login
            String token = userService.authenticateUser(savedUser.getEmail(), request.getPassword());
            
            log.info("✅ User registered successfully: {}", savedUser.getEmail());
            
            return ResponseEntity.ok(new LoginResponse(token, savedUser.getEmail(), 
                    savedUser.getFullName(), savedUser.getRole().toString()));
                    
        } catch (Exception e) {
            log.error("❌ Registration failed for {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse("Registration failed: " + e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        log.info("🔐 Login request for email: {}", request.getEmail());
        
        try {
            String token = userService.authenticateUser(request.getEmail(), request.getPassword());
            
            User user = userService.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            log.info("✅ User logged in successfully: {}", request.getEmail());
            
            return ResponseEntity.ok(new LoginResponse(token, user.getEmail(), 
                    user.getFullName(), user.getRole().toString()));
                    
        } catch (Exception e) {
            log.error("❌ Login failed for {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse("Login failed: " + e.getMessage()));
        }
    }
    
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam String email) {
        log.info("👤 Profile request for email: {}", email);
        
        try {
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Create a safe user profile response (no password)
            UserProfileResponse profile = new UserProfileResponse(
                    user.getId(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getCompany(),
                    user.getRole().toString(),
                    user.getCreatedAt(),
                    user.getLastLogin()
            );
            
            return ResponseEntity.ok(profile);
            
        } catch (Exception e) {
            log.error("❌ Profile retrieval failed for {}: {}", email, e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse("Profile retrieval failed: " + e.getMessage()));
        }
    }
    
    // DTOs for requests and responses
    public static class ErrorResponse {
        private String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
    
    public static class UserProfileResponse {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String company;
        private String role;
        private java.time.LocalDateTime createdAt;
        private java.time.LocalDateTime lastLogin;
        
        public UserProfileResponse(Long id, String email, String firstName, String lastName, 
                                 String company, String role, java.time.LocalDateTime createdAt, 
                                 java.time.LocalDateTime lastLogin) {
            this.id = id;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.company = company;
            this.role = role;
            this.createdAt = createdAt;
            this.lastLogin = lastLogin;
        }
        
        // Getters
        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public String getCompany() { return company; }
        public String getRole() { return role; }
        public java.time.LocalDateTime getCreatedAt() { return createdAt; }
        public java.time.LocalDateTime getLastLogin() { return lastLogin; }
    }
}
