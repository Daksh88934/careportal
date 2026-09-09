#!/bin/bash

# Telemedicine Platform Setup Script
# This script sets up the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

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

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | sed 's/v//')
        REQUIRED_VERSION="18.0.0"
        
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            print_success "Node.js version $NODE_VERSION is compatible"
        else
            print_error "Node.js version $NODE_VERSION is not compatible. Required: >= $REQUIRED_VERSION"
            return 1
        fi
    else
        print_error "Node.js is not installed"
        return 1
    fi
}

# Function to check Docker
check_docker() {
    if command_exists docker; then
        if docker info > /dev/null 2>&1; then
            print_success "Docker is installed and running"
        else
            print_error "Docker is installed but not running"
            return 1
        fi
    else
        print_error "Docker is not installed"
        return 1
    fi
}

# Function to check Docker Compose
check_docker_compose() {
    if command_exists docker-compose || docker compose version > /dev/null 2>&1; then
        print_success "Docker Compose is available"
    else
        print_error "Docker Compose is not installed"
        return 1
    fi
}

# Function to create environment file
create_env_file() {
    ENV_FILE="$PROJECT_ROOT/.env"
    ENV_EXAMPLE="$PROJECT_ROOT/.env.example"
    
    if [[ ! -f "$ENV_FILE" ]]; then
        if [[ -f "$ENV_EXAMPLE" ]]; then
            print_status "Creating .env file from .env.example"
            cp "$ENV_EXAMPLE" "$ENV_FILE"
            print_warning "Please update the .env file with your actual configuration values"
        else
            print_status "Creating default .env file"
            cat > "$ENV_FILE" << EOF
# Environment
NODE_ENV=development

# Database
POSTGRES_DB=telemedicine
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# Redis
REDIS_PASSWORD=redis123
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Payment Gateways
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret

STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# AWS (for file storage)
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Ports
FRONTEND_PORT=3000
BACKEND_PORT=3001
GRAFANA_PORT=3002
PROMETHEUS_PORT=9090

# Monitoring
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin
EOF
            print_warning "Default .env file created. Please update with your actual configuration values"
        fi
    else
        print_success ".env file already exists"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing backend dependencies..."
    cd "$PROJECT_ROOT/backend"
    npm ci
    
    print_status "Installing frontend dependencies..."
    cd "$PROJECT_ROOT/frontend"
    npm ci
    
    cd "$PROJECT_ROOT"
    print_success "Dependencies installed successfully"
}

# Function to generate Prisma client
generate_prisma() {
    print_status "Generating Prisma client..."
    cd "$PROJECT_ROOT/backend"
    npx prisma generate
    print_success "Prisma client generated"
}

# Function to create SSL certificates for development
create_ssl_certs() {
    SSL_DIR="$PROJECT_ROOT/nginx/ssl"
    
    if [[ ! -d "$SSL_DIR" ]]; then
        mkdir -p "$SSL_DIR"
    fi
    
    if [[ ! -f "$SSL_DIR/cert.pem" ]] || [[ ! -f "$SSL_DIR/key.pem" ]]; then
        print_status "Creating self-signed SSL certificates for development..."
        
        if command_exists openssl; then
            openssl req -x509 -newkey rsa:4096 -keyout "$SSL_DIR/key.pem" -out "$SSL_DIR/cert.pem" -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
            print_success "SSL certificates created"
        else
            print_warning "OpenSSL not found. Creating dummy SSL files"
            touch "$SSL_DIR/cert.pem"
            touch "$SSL_DIR/key.pem"
        fi
    else
        print_success "SSL certificates already exist"
    fi
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    # Backend uploads directory
    mkdir -p "$PROJECT_ROOT/backend/uploads"
    
    # Monitoring directories
    mkdir -p "$PROJECT_ROOT/monitoring/grafana/provisioning/dashboards"
    mkdir -p "$PROJECT_ROOT/monitoring/grafana/provisioning/datasources"
    mkdir -p "$PROJECT_ROOT/monitoring/rules"
    
    # Nginx directory
    mkdir -p "$PROJECT_ROOT/nginx/ssl"
    
    print_success "Directories created"
}

# Function to create Grafana datasource configuration
create_grafana_config() {
    DATASOURCE_FILE="$PROJECT_ROOT/monitoring/grafana/provisioning/datasources/prometheus.yml"
    
    if [[ ! -f "$DATASOURCE_FILE" ]]; then
        print_status "Creating Grafana datasource configuration..."
        cat > "$DATASOURCE_FILE" << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF
        print_success "Grafana datasource configuration created"
    fi
}

# Function to run initial setup
run_setup() {
    print_status "Starting Telemedicine Platform setup..."
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_node_version || exit 1
    check_docker || exit 1
    check_docker_compose || exit 1
    
    # Create directories
    create_directories
    
    # Create environment file
    create_env_file
    
    # Install dependencies
    install_dependencies
    
    # Generate Prisma client
    generate_prisma
    
    # Create SSL certificates
    create_ssl_certs
    
    # Create Grafana configuration
    create_grafana_config
    
    print_success "Setup completed successfully!"
    print_status ""
    print_status "Next steps:"
    print_status "1. Update the .env file with your actual configuration values"
    print_status "2. Start the development environment: ./scripts/deploy.sh -e development -b -m -s"
    print_status "3. Access the application:"
    print_status "   - Frontend: http://localhost:3000"
    print_status "   - Backend API: http://localhost:3001"
    print_status "   - Grafana: http://localhost:3002"
    print_status "   - Prometheus: http://localhost:9090"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Setup the Telemedicine Platform development environment

OPTIONS:
    --skip-deps     Skip dependency installation
    --skip-ssl      Skip SSL certificate creation
    -h, --help      Show this help message

EOF
}

# Parse command line arguments
SKIP_DEPS=false
SKIP_SSL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        --skip-ssl)
            SKIP_SSL=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Run setup with options
print_status "Starting Telemedicine Platform setup..."

# Check prerequisites
print_status "Checking prerequisites..."
check_node_version || exit 1
check_docker || exit 1
check_docker_compose || exit 1

# Create directories
create_directories

# Create environment file
create_env_file

# Install dependencies (unless skipped)
if [[ "$SKIP_DEPS" == false ]]; then
    install_dependencies
    generate_prisma
else
    print_warning "Skipping dependency installation"
fi

# Create SSL certificates (unless skipped)
if [[ "$SKIP_SSL" == false ]]; then
    create_ssl_certs
else
    print_warning "Skipping SSL certificate creation"
fi

# Create Grafana configuration
create_grafana_config

print_success "Setup completed successfully!"
print_status ""
print_status "Next steps:"
print_status "1. Update the .env file with your actual configuration values"
print_status "2. Start the development environment: ./scripts/deploy.sh -e development -b -m -s"
print_status "3. Access the application:"
print_status "   - Frontend: http://localhost:3000"
print_status "   - Backend API: http://localhost:3001"
print_status "   - Grafana: http://localhost:3002"
print_status "   - Prometheus: http://localhost:9090"
