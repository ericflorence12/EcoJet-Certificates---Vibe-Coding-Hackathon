#!/bin/bash

echo "Waiting for SAF Certificate Broker to start..."

# Wait for application to be ready
for i in {1..30}; do
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo "✅ Application is ready!"
        break
    elif curl -s http://localhost:8080/ > /dev/null 2>&1; then
        echo "✅ Application is ready!"
        break
    else
        echo "⏳ Waiting... (attempt $i/30)"
        sleep 2
    fi
done

echo ""
echo "🧪 Testing API endpoints..."

# Test quote endpoint
echo "1. Testing quote endpoint:"
curl -X POST http://localhost:8080/api/quote \
  -H "Content-Type: application/json" \
  -d '{"flightEmissions": 1000.0}' \
  -w "\nStatus: %{http_code}\n\n"

# Test orders endpoint (GET)
echo "2. Testing orders endpoint:"
curl -X GET http://localhost:8080/api/orders \
  -H "Accept: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo "✅ API tests completed!"
