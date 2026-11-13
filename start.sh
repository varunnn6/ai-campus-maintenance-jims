#!/usr/bin/env bash

# ==============================================================================
# Jagan Institute of Management Studies (JIMS), Sector-5, Rohini, Delhi
# MCA Semester 3 Project: AI-Driven Predictive Campus Maintenance System
# Startup Launcher Script
# ==============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "=================================================================="
echo " Starting JIMS AI-Driven Predictive Campus Maintenance System "
echo "=================================================================="

# Function to kill child processes on exit
cleanup() {
  echo ""
  echo ">>> Shutting down maintenance system services..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start Python AI Microservice (Port 5001)
echo ">>> [1/3] Starting Python AI & Computer Vision Microservice on port 5001..."
python3 ai_service/app.py &
AI_PID=$!

# Wait for AI service to initialize
sleep 2

# 2. Start Node.js / Express Backend (Port 5005)
echo ">>> [2/3] Starting Express.js Backend REST API on port 5005..."
node server/server.js &
SERVER_PID=$!

# Wait for Backend to initialize
sleep 2

# 3. Start React Vite Frontend (Port 3000)
echo ">>> [3/3] Starting React.js Frontend on port 3000..."
cd client
npm run dev -- --host 0.0.0.0 --port 3000 &
CLIENT_PID=$!

cd "$SCRIPT_DIR"

echo ""
echo "=================================================================="
echo " SYSTEM ALL READY AND RUNNING! "
echo " - Web Application: http://localhost:3000"
echo " - Backend API:     http://localhost:5005"
echo " - API Health:      http://localhost:5005/health"
echo " - Python AI:       http://localhost:5001/health"
echo "=================================================================="
echo "Press Ctrl+C to stop all services."
echo ""

# Keep running
wait
