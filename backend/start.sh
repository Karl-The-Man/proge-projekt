#!/bin/bash
# Startup script for the Suno API backend

set -e

echo "=========================================="
echo "Suno API Backend Startup"
echo "=========================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please create .env from .env.example:"
    echo "  cp .env.example .env"
    echo "  # Edit .env and add your SUNO_API_KEY"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d venv ]; then
    echo "Virtual environment not found. Creating..."
    python3 -m venv venv
    echo "Virtual environment created!"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "Dependencies not installed. Installing..."
    pip install -r requirements.txt
    echo "Dependencies installed!"
fi

# Test connection
echo ""
echo "Testing Suno API connection..."
python test_connection.py

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "Starting FastAPI server..."
    echo "=========================================="
    echo ""
    python main.py
else
    echo ""
    echo "Connection test failed. Please fix the issues above."
    exit 1
fi
