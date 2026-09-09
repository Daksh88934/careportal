#!/bin/bash

# Care Portal Stop Script
# This script stops all running services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🛑 Stopping Care Portal"
echo "================="
echo ""

# Stop application services
if [ -f logs/backend.pid ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    print_status "Stopping backend server (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null && print_success "Backend stopped" || print_warning "Backend was not running"
    rm logs/backend.pid
fi

if [ -f logs/frontend.pid ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    print_status "Stopping frontend server (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null && print_success "Frontend stopped" || print_warning "Frontend was not running"
    rm logs/frontend.pid
fi

# Stop Docker services
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    print_status "Stopping Docker services..."
    docker-compose down
    print_success "Docker services stopped"
else
    print_warning "Docker not available or not running"
fi

# Kill any remaining Node.js processes (optional)
print_status "Cleaning up any remaining processes..."
pkill -f "npm run start:dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

print_success "Care Portal stopped successfully!"
echo ""
