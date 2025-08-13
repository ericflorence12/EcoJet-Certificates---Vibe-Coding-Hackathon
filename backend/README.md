# SAF Certificate Broker API

## Overview

The **Sustainable Aviation Fuel (SAF) Certificate Broker** is a comprehensive backend API system that facilitates the trading, certification, and management of sustainable aviation fuel certificates. This enterprise-grade application provides airlines, fuel suppliers, and regulatory bodies with a robust platform to handle SAF transactions, compliance tracking, and environmental impact reporting.

## 🚀 Key Features

### Core Functionality
- **SAF Certificate Trading**: End-to-end certificate creation, validation, and transfer
- **Flight Emissions Calculation**: Real-time integration with aviation APIs for accurate emissions data
- **Regulatory Compliance**: Automated certificate registration with external regulatory bodies
- **PDF Certificate Generation**: Professional certificate documents with QR codes and security features
- **Email Notifications**: Comprehensive notification system for all transaction stages

### Enterprise Features
- **JWT Authentication**: Secure user authentication and authorization
- **Role-Based Access Control**: USER, ADMIN, and AIRLINE_PARTNER roles
- **Advanced Search & Filtering**: Comprehensive order and certificate search capabilities
- **Pagination & Sorting**: Optimized data retrieval for large datasets
- **Statistics & Analytics**: Real-time reporting and dashboard metrics
- **External API Integration**: Flight emissions data from multiple aviation providers

## 🏗 Architecture

### Technology Stack
- **Framework**: Spring Boot 3.5.4
- **Database**: H2 (Development), MySQL/PostgreSQL (Production)
- **Security**: Spring Security 6.5.2 with JWT
- **Testing**: JUnit 5, Mockito, Spring Boot Test
- **Documentation**: Swagger/OpenAPI 3
- **Email**: Spring Mail with HTML templates
- **PDF Generation**: Custom PDF service with QR codes

### Project Structure
```
backend/
├── src/main/java/com/aa/saf/broker/
│   ├── controller/          # REST API endpoints
│   ├── dto/                 # Data Transfer Objects
│   ├── model/               # Entity classes
│   ├── repository/          # Data access layer
│   ├── service/             # Business logic
│   ├── security/            # Authentication & authorization
│   └── config/              # Configuration classes
├── src/test/java/           # Unit and integration tests
└── src/main/resources/      # Configuration files
```

## 📋 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "pilot@americanairlines.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Pilot",
  "company": "American Airlines",
  "role": "USER"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "pilot@americanairlines.com",
  "firstName": "John",
  "lastName": "Pilot",
  "company": "American Airlines",
  "role": "USER",
  "createdAt": "2025-08-08T10:30:00"
}
```

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "pilot@americanairlines.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "pilot@americanairlines.com",
    "firstName": "John",
    "lastName": "Pilot",
    "role": "USER"
  },
  "expiresIn": 86400
}
```

### Order Management Endpoints

#### POST `/api/orders`
Create a new SAF certificate order with comprehensive flight details.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userEmail": "pilot@americanairlines.com",
  "flightNumber": "AA1234",
  "departureAirport": "DFW",
  "arrivalAirport": "LAX",
  "flightDate": "2025-08-15T14:30:00",
  "flightEmissions": 1500.0,
  "safVolume": 45.0,
  "priceUsd": 112.50
}
```

**Response:**
```json
{
  "id": 1,
  "userEmail": "pilot@americanairlines.com",
  "flightNumber": "AA1234",
  "departureAirport": "DFW",
  "arrivalAirport": "LAX",
  "flightDate": "2025-08-15T14:30:00",
  "flightEmissions": 1500.0,
  "safVolume": 45.0,
  "priceUsd": 112.50,
  "status": "COMPLETED",
  "certificateNumber": "CERT-1-ABC123",
  "registryId": "REG-2025-001234",
  "pdfUrl": "https://certificates.safbroker.com/cert-1.pdf",
  "createdAt": "2025-08-08T10:30:00",
  "completedAt": "2025-08-08T10:30:15"
}
```

#### GET `/api/orders/{id}`
Retrieve a specific order by ID.

**Response:**
```json
{
  "id": 1,
  "userEmail": "pilot@americanairlines.com",
  "flightNumber": "AA1234",
  "status": "COMPLETED",
  "certificate": {
    "id": 1,
    "certNumber": "CERT-1-ABC123",
    "registryId": "REG-2025-001234",
    "pdfUrl": "https://certificates.safbroker.com/cert-1.pdf"
  }
}
```

#### GET `/api/orders`
List orders with advanced filtering and pagination.

**Query Parameters:**
- `page` (int): Page number (0-based, default: 0)
- `size` (int): Page size (default: 10, max: 100)
- `sort` (string): Sort field (default: "createdAt")
- `direction` (string): Sort direction ("asc" or "desc", default: "desc")
- `userEmail` (string): Filter by user email
- `status` (string): Filter by order status
- `flightNumber` (string): Filter by flight number
- `fromDate` (string): Filter orders from date (ISO format)
- `toDate` (string): Filter orders to date (ISO format)

**Example:** `GET /api/orders?page=0&size=20&sort=createdAt&direction=desc&status=COMPLETED&userEmail=pilot@americanairlines.com`

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "userEmail": "pilot@americanairlines.com",
      "flightNumber": "AA1234",
      "status": "COMPLETED",
      "createdAt": "2025-08-08T10:30:00"
    }
  ],
  "page": {
    "size": 20,
    "number": 0,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

#### GET `/api/orders/statistics`
Get comprehensive order and emissions statistics.

**Response:**
```json
{
  "totalOrders": 156,
  "completedOrders": 142,
  "pendingOrders": 14,
  "totalEmissionsReduced": 285600.5,
  "totalSafVolumeTraded": 8567.25,
  "totalRevenue": 214238.75,
  "averageOrderValue": 1373.84,
  "topAirports": [
    {"airport": "DFW", "orderCount": 45},
    {"airport": "LAX", "orderCount": 38}
  ],
  "monthlyStats": [
    {"month": "2025-07", "orders": 67, "revenue": 92845.50},
    {"month": "2025-08", "orders": 89, "revenue": 121393.25}
  ]
}
```

### Certificate Management Endpoints

#### GET `/api/certificates/{id}`
Retrieve certificate details by ID.

**Response:**
```json
{
  "id": 1,
  "certNumber": "CERT-1-ABC123",
  "orderId": 1,
  "registryId": "REG-2025-001234",
  "pdfUrl": "https://certificates.safbroker.com/cert-1.pdf",
  "flightEmissions": 1500.0,
  "safVolume": 45.0,
  "issuedAt": "2025-08-08T10:30:15",
  "validUntil": "2026-08-08T10:30:15",
  "status": "ACTIVE"
}
```

#### GET `/api/certificates/{id}/download`
Download certificate PDF with proper authentication.

**Response:** Binary PDF file with appropriate headers.

### Quote System Endpoints

#### POST `/api/quotes`
Get real-time pricing quote for SAF certificates.

**Request Body:**
```json
{
  "flightNumber": "AA1234",
  "departureAirport": "DFW",
  "arrivalAirport": "LAX",
  "flightDate": "2025-08-15T14:30:00",
  "estimatedEmissions": 1500.0
}
```

**Response:**
```json
{
  "flightEmissions": 1520.3,
  "recommendedSafVolume": 45.61,
  "pricePerLiter": 2.47,
  "totalPrice": 112.66,
  "carbonReduction": 4561.2,
  "validUntil": "2025-08-08T11:30:00",
  "priceBreakdown": {
    "baseCost": 98.50,
    "carbonCredit": 8.75,
    "processingFee": 3.50,
    "regulatoryFee": 1.91
  }
}
```

### User Management Endpoints

#### GET `/api/users/profile`
Get current user profile (requires authentication).

**Response:**
```json
{
  "id": 1,
  "email": "pilot@americanairlines.com",
  "firstName": "John",
  "lastName": "Pilot",
  "company": "American Airlines",
  "role": "USER",
  "totalOrders": 23,
  "totalEmissionsReduced": 34567.8,
  "memberSince": "2025-01-15T09:00:00"
}
```

#### PUT `/api/users/profile`
Update user profile information.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Pilot",
  "company": "American Airlines International"
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Database Configuration
SPRING_DATASOURCE_URL=jdbc:h2:mem:testdb
SPRING_DATASOURCE_USERNAME=sa
SPRING_DATASOURCE_PASSWORD=

# JWT Configuration
JWT_SECRET=your-256-bit-secret-key
JWT_EXPIRATION=86400

# Email Configuration
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@company.com
SPRING_MAIL_PASSWORD=your-app-password

# External API Keys
AVIATION_STACK_API_KEY=your-aviation-stack-key
FLIGHT_AWARE_API_KEY=your-flight-aware-key

# Application Settings
APP_MODE=development
APP_PDF_BASE_URL=https://certificates.safbroker.com
APP_REGISTRY_URL=https://registry.aviation.gov
```

### Application Properties

```yaml
spring:
  profiles:
    active: development
  
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: ""
  
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: create-drop
    show-sql: true
  
  h2:
    console:
      enabled: true
      path: /h2-console
  
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${SPRING_MAIL_USERNAME:}
    password: ${SPRING_MAIL_PASSWORD:}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true

server:
  port: 8080

logging:
  level:
    com.aa.saf.broker: INFO
    org.springframework.security: DEBUG
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
./gradlew test

# Run specific test class
./gradlew test --tests "OrderControllerIntegrationTest"

# Run tests with coverage
./gradlew test jacocoTestReport
```

### Test Coverage

The application maintains comprehensive test coverage:

- **Unit Tests**: Service layer business logic
- **Integration Tests**: Controller endpoints with MockMvc
- **Repository Tests**: Data access layer validation
- **Security Tests**: Authentication and authorization flows

### Sample Test Data

```bash
# Create test user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "company": "Test Airlines"
  }'

# Create test order
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userEmail": "test@example.com",
    "flightNumber": "TEST123",
    "departureAirport": "DFW",
    "arrivalAirport": "LAX",
    "flightDate": "2025-08-15T14:30:00",
    "flightEmissions": 1000.0,
    "safVolume": 30.0,
    "priceUsd": 75.00
  }'
```

## 🚀 Deployment

### Building the Application

```bash
# Build JAR file
./gradlew build

# Build Docker image
docker build -t saf-certificate-broker .

# Run with Docker
docker run -p 8080:8080 saf-certificate-broker
```

### Health Checks

```bash
# Application health
curl http://localhost:8080/actuator/health

# Application info
curl http://localhost:8080/actuator/info

# Metrics
curl http://localhost:8080/actuator/metrics
```

## 📊 Business Logic

### Order Processing Flow

1. **Order Creation**
   - Validate flight details and user authentication
   - Calculate real-time emissions using external APIs
   - Determine optimal SAF volume and pricing
   - Create order record with PENDING status

2. **Certificate Generation**
   - Generate unique certificate number
   - Create PDF certificate with QR code and security features
   - Register certificate with external regulatory body
   - Update order status to COMPLETED

3. **Notification System**
   - Send order confirmation email to user
   - Send certificate ready notification with download link
   - Notify administrators of high-value transactions

### Pricing Algorithm

The system uses a sophisticated pricing model:

```java
// Base pricing calculation
basePrice = safVolume * currentMarketPrice
carbonCredit = flightEmissions * carbonCreditRate
processingFee = basePrice * 0.035
regulatoryFee = basePrice * 0.017

totalPrice = basePrice + carbonCredit + processingFee + regulatoryFee
```

### Emissions Calculation

Real-time emissions data is obtained through:

1. **Primary**: AviationStack API for flight route data
2. **Secondary**: FlightAware API for backup data
3. **Fallback**: Distance-based calculation using airport coordinates

## 🔐 Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure, stateless authentication
- **Role-Based Access**: USER, ADMIN, AIRLINE_PARTNER roles
- **Password Encryption**: BCrypt hashing with salt
- **Token Expiration**: Configurable token lifetime

### API Security

- **CORS Configuration**: Controlled cross-origin requests
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries

### Data Protection

- **Sensitive Data Encryption**: PII and financial data protection
- **Audit Logging**: Complete transaction audit trail
- **Secure File Storage**: Certificate PDF protection
- **HTTPS Enforcement**: SSL/TLS communication

## 📈 Performance Optimization

### Database Optimization

- **Indexing Strategy**: Optimized queries for common searches
- **Connection Pooling**: HikariCP for efficient connections
- **Pagination**: Efficient large dataset handling
- **Caching**: Strategic caching for frequently accessed data

### API Performance

- **Async Processing**: Non-blocking operations for external API calls
- **Response Compression**: Gzip compression for large responses
- **Request Throttling**: Protection against overload
- **Monitoring**: Comprehensive metrics and alerting

## 🛠 Development Setup

### Prerequisites

- Java 17 or higher
- Gradle 8.14.3 or higher
- Git
- IDE (IntelliJ IDEA recommended)

### Local Development

```bash
# Clone repository
git clone https://github.com/your-org/saf-certificate-broker.git
cd saf-certificate-broker/backend

# Run application
./gradlew bootRun

# Run with specific profile
./gradlew bootRun --args='--spring.profiles.active=development'

# Debug mode
./gradlew bootRun --debug-jvm

# Hot reload (with Spring Boot DevTools)
./gradlew bootRun -Pargs=--spring.devtools.restart.enabled=true
```

### Code Quality

```bash
# Code formatting
./gradlew spotlessApply

# Static analysis
./gradlew checkstyleMain

# Dependency vulnerability check
./gradlew dependencyCheckAnalyze

# Generate documentation
./gradlew javadoc
```

## 📚 API Examples

### Complete Workflow Example

```bash
#!/bin/bash

# 1. Register user
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@americanairlines.com",
    "password": "demo123",
    "firstName": "Demo",
    "lastName": "User",
    "company": "American Airlines"
  }')

echo "User registered: $REGISTER_RESPONSE"

# 2. Login and get token
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@americanairlines.com",
    "password": "demo123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "Login token: ${TOKEN:0:20}..."

# 3. Get quote
QUOTE_RESPONSE=$(curl -s -X POST http://localhost:8080/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "flightNumber": "AA1234",
    "departureAirport": "DFW",
    "arrivalAirport": "LAX",
    "flightDate": "2025-08-15T14:30:00",
    "estimatedEmissions": 1500.0
  }')

echo "Quote: $QUOTE_RESPONSE"

# 4. Create order
ORDER_RESPONSE=$(curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userEmail": "demo@americanairlines.com",
    "flightNumber": "AA1234",
    "departureAirport": "DFW",
    "arrivalAirport": "LAX",
    "flightDate": "2025-08-15T14:30:00",
    "flightEmissions": 1500.0,
    "safVolume": 45.0,
    "priceUsd": 112.50
  }')

ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.id')
echo "Order created with ID: $ORDER_ID"

# 5. Check order status
ORDER_STATUS=$(curl -s -X GET http://localhost:8080/api/orders/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN")

echo "Order status: $ORDER_STATUS"

# 6. Download certificate (if completed)
curl -s -X GET http://localhost:8080/api/certificates/$ORDER_ID/download \
  -H "Authorization: Bearer $TOKEN" \
  -o certificate.pdf

echo "Certificate downloaded to certificate.pdf"
```

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Coding Standards

- Follow Java coding conventions
- Write comprehensive unit tests
- Update documentation for new features
- Use meaningful commit messages
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For technical support or questions:

- **Email**: support@safbroker.com
- **Documentation**: https://docs.safbroker.com
- **Issues**: https://github.com/your-org/saf-certificate-broker/issues

## 🎯 Roadmap

### Version 2.0 (Q4 2025)
- [ ] Blockchain integration for certificate immutability
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support
- [ ] Mobile API for iOS/Android apps

### Version 3.0 (Q1 2026)
- [ ] Machine learning price optimization
- [ ] Carbon offset marketplace integration
- [ ] Regulatory compliance automation
- [ ] Enterprise SSO integration

---

**SAF Certificate Broker** - Advancing sustainable aviation through technology.
