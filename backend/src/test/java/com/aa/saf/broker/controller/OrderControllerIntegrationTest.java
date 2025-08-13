package com.aa.saf.broker.controller;

import com.aa.saf.broker.dto.OrderRequest;
import com.aa.saf.broker.model.Order;
import com.aa.saf.broker.repository.OrderRepository;
import com.aa.saf.broker.service.EmailService;
import com.aa.saf.broker.service.PdfService;
import com.aa.saf.broker.service.RegistryService;
import com.aa.saf.broker.config.TestSecurityConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderRepository orderRepository;

    @MockBean
    private com.aa.saf.broker.repository.CertificateRepository certificateRepository;

    @MockBean
    private PdfService pdfService;

    @MockBean
    private RegistryService registryService;

    @MockBean
    private EmailService emailService;
    
    @MockBean
    private com.aa.saf.broker.service.FlightEmissionsService flightEmissionsService;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() throws Exception {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule()); // Enable JSR310 support for LocalDateTime
        
        // Mock external services
        when(pdfService.generateCertificatePdf(anyLong(), anyString(), anyDouble(), anyDouble()))
                .thenReturn("http://mock-pdf-url.com/cert.pdf");
        when(registryService.registerCertificate(anyLong(), anyString()))
                .thenReturn("REG-TEST-123");
        
        // Mock certificate repository save
        com.aa.saf.broker.model.Certificate mockCert = new com.aa.saf.broker.model.Certificate();
        mockCert.setId(1L);
        mockCert.setCertNumber("CERT-1-MOCK");
        mockCert.setRegistryId("REG-TEST-123");
        when(certificateRepository.save(any(com.aa.saf.broker.model.Certificate.class)))
                .thenReturn(mockCert);
    }

        @Test
    void createOrder_Success() throws Exception {
        // Given
        OrderRequest orderRequest = new OrderRequest();
        orderRequest.setUserEmail("test@example.com");
        orderRequest.setFlightEmissions(1000.0);
        orderRequest.setSafVolume(30.0);
        orderRequest.setPriceUsd(new BigDecimal("75.00"));
        orderRequest.setFlightNumber("AA123");
        orderRequest.setDepartureAirport("DFW");
        orderRequest.setArrivalAirport("LAX");
        orderRequest.setFlightDate(LocalDateTime.now().plusDays(1).toString());

        Order savedOrder = createTestOrder("test@example.com", Order.OrderStatus.COMPLETED);
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        // When & Then
        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orderRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userEmail").value("test@example.com"))
                .andExpect(jsonPath("$.flightEmissions").value(1000.0))
                .andExpect(jsonPath("$.safVolume").value(30.0))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    void getOrderById_Success() throws Exception {
        // Given
        Order order = createTestOrder("user@example.com", Order.OrderStatus.COMPLETED);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        // When & Then
        mockMvc.perform(get("/api/orders/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.userEmail").value("user@example.com"));
    }

    @Test
    void getOrderById_NotFound() throws Exception {
        // Given
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/orders/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    private Order createTestOrder(String userEmail, Order.OrderStatus status) {
        Order order = new Order();
        order.setId(1L);
        order.setUserEmail(userEmail);
        order.setFlightEmissions(1000.0);
        order.setSafVolume(30.0);
        order.setPriceUsd(new BigDecimal("75.00"));
        order.setStatus(status);
        order.setCreatedAt(LocalDateTime.now());
        order.setFlightNumber("AA123");
        order.setDepartureAirport("DFW");
        order.setArrivalAirport("LAX");
        
        return order;
    }
}
