#!/bin/bash

# See skript alustab backendi, frontendi ja ngroki
# Autor: Oliver Iida, Karl Elmar Vikat, Elias Teikari
# Kuupäev: 16.12.2025

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# PIDs for cleanup
BACKEND_PID=""
FRONTEND_PID=""
NGROK_PID=""

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
    if [ ! -z "$NGROK_PID" ]; then
        kill $NGROK_PID 2>/dev/null || true
    fi
    
    echo -e "${GREEN}Servers stopped.${NC}"
    exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup SIGINT SIGTERM

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}ERROR: ngrok is not installed!${NC}"
    echo -e "${YELLOW}Please install ngrok: https://ngrok.com/download${NC}"
    echo -e "${YELLOW}On macOS: brew install ngrok${NC}"
    exit 1
fi

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
    echo -e "${RED}ERROR: backend/.env file not found!${NC}"
    echo -e "${YELLOW}Please create backend/.env with at least:${NC}"
    echo -e "  SUNO_API_KEY=your_api_key_here"
    echo -e "  PUBLIC_BASE_URL=http://localhost:8000"
    exit 1
fi

# Start ngrok first to get the public URL
echo -e "${GREEN}Starting ngrok tunnel...${NC}"
ngrok http 8000 --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start and get the URL
echo -e "${YELLOW}Waiting for ngrok to initialize...${NC}"
sleep 3

# Get ngrok public URL from the API
NGROK_URL=""
for i in {1..10}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*' | cut -d'"' -f4 | head -1)
    if [ ! -z "$NGROK_URL" ]; then
        break
    fi
    sleep 1
done

if [ -z "$NGROK_URL" ]; then
    echo -e "${RED}ERROR: Could not get ngrok URL. Make sure ngrok is configured properly.${NC}"
    echo -e "${YELLOW}You may need to run 'ngrok config add-authtoken YOUR_TOKEN' first.${NC}"
    cleanup
    exit 1
fi

echo -e "${GREEN}ngrok URL: ${CYAN}$NGROK_URL${NC}"

# Update the PUBLIC_BASE_URL in .env file
if grep -q "^PUBLIC_BASE_URL=" "$SCRIPT_DIR/backend/.env"; then
    # Replace existing PUBLIC_BASE_URL
    sed -i.bak "s|^PUBLIC_BASE_URL=.*|PUBLIC_BASE_URL=$NGROK_URL|" "$SCRIPT_DIR/backend/.env"
else
    # Add PUBLIC_BASE_URL if it doesn't exist
    echo "PUBLIC_BASE_URL=$NGROK_URL" >> "$SCRIPT_DIR/backend/.env"
fi
echo -e "${GREEN}Updated backend/.env with ngrok URL${NC}"

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
echo -e "${GREEN}All servers are running!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Frontend:    ${CYAN}http://localhost:8080${NC}"
echo -e "Backend:     ${CYAN}http://localhost:8000${NC}"
echo -e "ngrok URL:   ${CYAN}$NGROK_URL${NC}"
echo -e "ngrok Admin: ${CYAN}http://localhost:4040${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
