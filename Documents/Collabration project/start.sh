#!/bin/bash

echo "========================================"
echo "  ProjectBridge - Starting Application"
echo "========================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm run install-all
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "IMPORTANT: Please edit .env file with your MongoDB URI and JWT secret"
    echo "Press any key to continue after editing .env..."
    read -n 1 -s
fi

echo "Starting ProjectBridge..."
echo "Backend will run on http://localhost:5000"
echo "Frontend will run on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop the servers"
echo ""

npm run dev
