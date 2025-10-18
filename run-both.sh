#!/bin/bash
echo "🚀 Starting Both Services..."
echo ""

# Start React frontend
echo "📱 Starting React Frontend on http://localhost:8080..."
cd "/Users/pruthvisamane/Downloads/groupinvest-hub-main-2"
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

# Start Spring Boot backend
echo "☕ Starting Spring Boot Backend on http://localhost:8081..."
/Users/pruthvisamane/Downloads/groupinvest-hub-main-2/start-backend.sh &
BACKEND_PID=$!

echo ""
echo "✅ Both services are starting..."
echo "📱 Frontend: http://localhost:8080"
echo "☕ Backend:  http://localhost:8081"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for user to stop
wait
