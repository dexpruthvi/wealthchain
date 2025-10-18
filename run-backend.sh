#!/bin/bash
# Simple script to run Spring Boot backend

echo "🚀 Starting Simple Spring Boot Backend..."
echo "📊 Your main website on http://localhost:8080 is NOT affected"
echo "🔧 This backend will run on http://localhost:8081"
echo ""

cd backend
./mvnw spring-boot:run
