#!/bin/bash

# Suno Music Generation App - Startup Script
# This script starts both the backend and frontend servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Suno Music Generation App${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    
    # Kill background jobs
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    echo -e "${GREEN}Servers stopped.${NC}"
    exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup SIGINT SIGTERM

# Check if backend virtual environment exists
if [ ! -d "$SCRIPT_DIR/backend/venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv "$SCRIPT_DIR/backend/venv"
    
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    source "$SCRIPT_DIR/backend/venv/bin/activate"
    pip install -r "$SCRIPT_DIR/backend/requirements.txt"
else
    source "$SCRIPT_DIR/backend/venv/bin/activate"
fi

# Check if .env file exists
if [ ! -f "$SCRIPT_DIR/backend/.env" ]; then
    echo -e "${RED}Warning: backend/.env file not found!${NC}"
    echo -e "${YELLOW}Please create a .env file with your SUNO_API_KEY and PUBLIC_BASE_URL${NC}"
    echo ""
fi

# Start Backend
echo -e "${GREEN}Starting Backend Server...${NC}"
cd "$SCRIPT_DIR/backend"
python3 main.py &
BACKEND_PID=$!
echo -e "${GREEN}Backend running on http://localhost:8000 (PID: $BACKEND_PID)${NC}"

# Wait a moment for backend to start
sleep 2

# Start Frontend
echo -e "${GREEN}Starting Frontend Server...${NC}"
cd "$SCRIPT_DIR/frontend"
python3 -m http.server 8080 &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend running on http://localhost:8080 (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Both servers are running!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Frontend: ${BLUE}http://localhost:8080${NC}"
echo -e "Backend:  ${BLUE}http://localhost:8000${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

