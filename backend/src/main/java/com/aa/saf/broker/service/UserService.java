package com.aa.saf.broker.service;

import com.aa.saf.broker.model.User;
import com.aa.saf.broker.repository.UserRepository;
import com.aa.saf.broker.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public User registerUser(User user) {
        log.info("👤 Registering new user: {}", user.getEmail());
        
        // Check if user already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            log.warn("⚠️ User already exists with email: {}", user.getEmail());
            throw new RuntimeException("User already exists with email: " + user.getEmail());
        }
        
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setActive(true);
        
        User saved = userRepository.save(user);
        log.info("✅ User registered successfully with ID: {}", saved.getId());
        
        return saved;
    }
    
    public String authenticateUser(String email, String password) {
        log.info("🔐 Authenticating user: {}", email);
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            log.warn("⚠️ User not found: {}", email);
            throw new RuntimeException("Invalid credentials");
        }
        
        User user = userOpt.get();
        if (!user.isActive()) {
            log.warn("⚠️ User account is deactivated: {}", email);
            throw new RuntimeException("Account is deactivated");
        }
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            log.warn("⚠️ Invalid password for user: {}", email);
            throw new RuntimeException("Invalid credentials");
        }
        
        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().toString());
        log.info("✅ User authenticated successfully: {}", email);
        
        return token;
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public List<User> findAllActiveUsers() {
        return userRepository.findByActiveTrue();
    }
    
    public User updateUser(Long id, User updatedUser) {
        log.info("📝 Updating user with ID: {}", id);
        
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        
        // Update fields (not password or email for security)
        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());
        existingUser.setCompany(updatedUser.getCompany());
        
        // Only admins can change roles
        // existingUser.setRole(updatedUser.getRole());
        
        User saved = userRepository.save(existingUser);
        log.info("✅ User updated successfully: {}", saved.getId());
        
        return saved;
    }
    
    public void deactivateUser(Long id) {
        log.info("🚫 Deactivating user with ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        
        user.setActive(false);
        userRepository.save(user);
        
        log.info("✅ User deactivated successfully: {}", id);
    }
    
    public long getActiveUserCount() {
        return userRepository.countActiveUsers();
    }
    
    public List<User> getUsersByCompany(String company) {
        return userRepository.findActiveUsersByCompany(company);
    }
}
