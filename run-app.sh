#!/bin/bash

# CareX Startup Script
# This script starts the complete CareX platform with all services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | sed 's/v//')
    print_success "Node.js version $NODE_VERSION found"
    
    if ! command_exists npm; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if command_exists docker; then
        if docker info > /dev/null 2>&1; then
            print_success "Docker is running"
            DOCKER_AVAILABLE=true
        else
            print_warning "Docker is installed but not running"
            DOCKER_AVAILABLE=false
        fi
    else
        print_warning "Docker is not installed. Will run without containerized services"
        DOCKER_AVAILABLE=false
    fi
}

# Start Docker services
start_docker_services() {
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_status "Starting Docker services (PostgreSQL, Redis, Monitoring)..."
        docker-compose up -d postgres redis prometheus grafana
        
        print_status "Waiting for services to be ready..."
        sleep 10
        
        # Check if PostgreSQL is ready
        for i in {1..30}; do
            if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
                print_success "PostgreSQL is ready"
                break
            fi
            if [ $i -eq 30 ]; then
                print_error "PostgreSQL failed to start"
                exit 1
            fi
            sleep 2
        done
        
        # Check if Redis is ready
        if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
            print_success "Redis is ready"
        else
            print_warning "Redis may not be ready"
        fi
    else
        print_warning "Skipping Docker services. Make sure PostgreSQL and Redis are running locally."
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing root dependencies..."
        npm install
    fi
    
    if [ ! -d "backend/node_modules" ]; then
        print_status "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
    fi
    
    if [ ! -d "frontend/node_modules" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
    fi
    
    print_success "Dependencies installed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    cd backend
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Run migrations
    print_status "Running database migrations..."
    npx prisma migrate deploy || {
        print_warning "Migration failed, trying to create database..."
        npx prisma migrate dev --name init || {
            print_error "Failed to setup database"
            cd ..
            exit 1
        }
    }
    
    # Seed database
    print_status "Seeding database with initial data..."
    npx prisma db seed || print_warning "Database seeding failed (this is optional)"
    
    cd ..
    print_success "Database setup completed"
}

# Start application services
start_application() {
    print_status "Starting CareX..."
    
    # Create log directory
    mkdir -p logs
    
    # Start backend
    print_status "Starting backend server..."
    cd backend
    npm run start:dev > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait a bit for backend to start
    sleep 5
    
    # Check if backend is running
    if kill -0 $BACKEND_PID 2>/dev/null; then
        print_success "Backend started (PID: $BACKEND_PID)"
    else
        print_error "Backend failed to start"
        exit 1
    fi
    
    # Start frontend
    print_status "Starting frontend server..."
    cd frontend
    npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Wait a bit for frontend to start
    sleep 5
    
    # Check if frontend is running
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        print_success "Frontend started (PID: $FRONTEND_PID)"
    else
        print_error "Frontend failed to start"
        exit 1
    fi
    
    # Save PIDs for cleanup
    echo $BACKEND_PID > logs/backend.pid
    echo $FRONTEND_PID > logs/frontend.pid
}

# Display access information
show_access_info() {
    echo ""
    print_success "🚀 CareX is running!"
    echo ""
    echo "📱 Frontend Application: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:3001"
    echo "📚 API Documentation: http://localhost:3001/api"
    echo "📊 Grafana Dashboard: http://localhost:3002 (admin/admin)"
    echo "🔍 Prometheus Metrics: http://localhost:9090"
    echo ""
    echo "📋 Available Dashboards:"
    echo "   • Patient Dashboard: http://localhost:3000/patient"
    echo "   • Doctor Dashboard: http://localhost:3000/doctor"
    echo "   • Pharmacy Dashboard: http://localhost:3000/pharmacy"
    echo "   • Admin Dashboard: http://localhost:3000/admin"
    echo ""
    echo "📝 Logs are available in the logs/ directory"
    echo "🛑 To stop the application, run: ./stop-app.sh"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    if [ -f logs/backend.pid ]; then
        BACKEND_PID=$(cat logs/backend.pid)
        kill $BACKEND_PID 2>/dev/null || true
        rm logs/backend.pid
    fi
    if [ -f logs/frontend.pid ]; then
        FRONTEND_PID=$(cat logs/frontend.pid)
        kill $FRONTEND_PID 2>/dev/null || true
        rm logs/frontend.pid
    fi
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Main execution
main() {
    echo "🏥 CareX Startup"
    echo "================================"
    echo ""
    
    check_prerequisites
    start_docker_services
    install_dependencies
    setup_database
    start_application
    show_access_info
    
    # Keep script running
    print_status "Platform is running. Press Ctrl+C to stop."
    while true; do
        sleep 1
    done
}

# Run main function
main
