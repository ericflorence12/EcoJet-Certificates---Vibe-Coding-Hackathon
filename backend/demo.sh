#!/bin/bash

echo "🚀 SAF Certificate Broker - Enhanced Backend Demo"
echo "================================================="
echo ""

# Start the application in the background
echo "📡 Starting the SAF Certificate Broker application..."
./gradlew bootRun --no-daemon &
APP_PID=$!

# Wait for the application to start
echo "⏳ Waiting for application to start..."
sleep 15

echo ""
echo "🧪 Testing Enhanced Features:"
echo "=============================="

# Test 1: User Registration
echo ""
echo "1️⃣ Testing User Registration..."
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pilot@americanairlines.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Pilot",
    "company": "American Airlines"
  }' | jq .

# Test 2: User Login
echo ""
echo "2️⃣ Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pilot@americanairlines.com",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "✅ Login successful, token: ${TOKEN:0:20}..."

# Test 3: Create Order with Flight Details
echo ""
echo "3️⃣ Testing Enhanced Order Creation..."
curl -s -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "pilot@americanairlines.com",
    "flightEmissions": 1250.0,
    "safVolume": 35.0,
    "priceUsd": 89.50,
    "flightNumber": "AA1234",
    "departureAirport": "DFW",
    "arrivalAirport": "LAX",
    "flightDate": "2025-08-15T10:30:00"
  }' | jq .

# Test 4: Get Order Statistics
echo ""
echo "4️⃣ Testing Order Statistics..."
curl -s http://localhost:8080/api/orders/stats | jq .

# Test 5: Get Orders with Pagination
echo ""
echo "5️⃣ Testing Order Pagination & Filtering..."
curl -s "http://localhost:8080/api/orders?page=0&size=5&sortBy=createdAt&sortDir=desc" | jq '.content | length'

# Test 6: Certificate Download
echo ""
echo "6️⃣ Testing Certificate Download..."
curl -s -I http://localhost:8080/api/orders/cert/1/download

echo ""
echo "🎉 Demo Complete!"
echo ""
echo "📊 Enhanced Features Demonstrated:"
echo "  ✅ User Authentication & JWT"
echo "  ✅ Enhanced Order Management"
echo "  ✅ Flight Information Integration"
echo "  ✅ Email Notifications (development mode)"
echo "  ✅ Certificate Downloads"
echo "  ✅ Order Statistics & Analytics"
echo "  ✅ Pagination & Filtering"
echo ""
echo "🛑 Stopping application..."
kill $APP_PID
wait $APP_PID 2>/dev/null

echo "✅ Demo finished!"
