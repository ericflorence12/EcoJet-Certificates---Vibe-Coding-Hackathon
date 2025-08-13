package com.aa.saf.broker.service;

import com.aa.saf.broker.model.User;
import com.aa.saf.broker.repository.UserRepository;
import com.aa.saf.broker.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("test@example.com", "password123", "John", "Doe");
        testUser.setId(1L);
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setActive(true);
    }

    @Test
    void registerUser_Success() {
        // Given
        when(userRepository.existsByEmail(testUser.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User result = userService.registerUser(testUser);

        // Then
        assertNotNull(result);
        assertEquals(testUser.getEmail(), result.getEmail());
        verify(userRepository).existsByEmail(testUser.getEmail());
        verify(passwordEncoder).encode(anyString());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerUser_UserAlreadyExists() {
        // Given
        when(userRepository.existsByEmail(testUser.getEmail())).thenReturn(true);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> userService.registerUser(testUser));
        assertEquals("User already exists with email: " + testUser.getEmail(), exception.getMessage());
        verify(userRepository).existsByEmail(testUser.getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void authenticateUser_Success() {
        // Given
        String rawPassword = "password123";
        String encodedPassword = "encodedPassword";
        String token = "jwt-token";
        
        testUser.setPassword(encodedPassword);
        
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(rawPassword, encodedPassword)).thenReturn(true);
        when(jwtUtil.generateToken(testUser.getEmail(), testUser.getRole().toString())).thenReturn(token);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        String result = userService.authenticateUser(testUser.getEmail(), rawPassword);

        // Then
        assertEquals(token, result);
        verify(userRepository).findByEmail(testUser.getEmail());
        verify(passwordEncoder).matches(rawPassword, encodedPassword);
        verify(jwtUtil).generateToken(testUser.getEmail(), testUser.getRole().toString());
        verify(userRepository).save(any(User.class)); // For updating last login
    }

    @Test
    void authenticateUser_UserNotFound() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> userService.authenticateUser("notfound@example.com", "password"));
        assertEquals("Invalid credentials", exception.getMessage());
    }

    @Test
    void authenticateUser_InvalidPassword() {
        // Given
        testUser.setPassword("encodedPassword");
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> userService.authenticateUser(testUser.getEmail(), "wrongpassword"));
        assertEquals("Invalid credentials", exception.getMessage());
    }

    @Test
    void authenticateUser_InactiveUser() {
        // Given
        testUser.setActive(false);
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> userService.authenticateUser(testUser.getEmail(), "password"));
        assertEquals("Account is deactivated", exception.getMessage());
    }

    @Test
    void findByEmail_Success() {
        // Given
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));

        // When
        Optional<User> result = userService.findByEmail(testUser.getEmail());

        // Then
        assertTrue(result.isPresent());
        assertEquals(testUser.getEmail(), result.get().getEmail());
    }

    @Test
    void deactivateUser_Success() {
        // Given
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        userService.deactivateUser(testUser.getId());

        // Then
        verify(userRepository).findById(testUser.getId());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void deactivateUser_UserNotFound() {
        // Given
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
                () -> userService.deactivateUser(999L));
        assertTrue(exception.getMessage().contains("User not found"));
    }
}
