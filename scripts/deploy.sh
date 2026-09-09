#!/bin/bash

# Telemedicine Platform Deployment Script
# This script handles deployment to different environments

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
DOCKER_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
ENV_FILE="$PROJECT_ROOT/.env"

# Default values
ENVIRONMENT="development"
BUILD_IMAGES=false
PULL_IMAGES=false
MIGRATE_DB=false
SEED_DB=false
BACKUP_DB=false
RESTORE_DB=""
HEALTH_CHECK=true

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

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy the Telemedicine Platform

OPTIONS:
    -e, --environment ENV    Set environment (development|staging|production) [default: development]
    -b, --build             Build Docker images before deployment
    -p, --pull              Pull latest images before deployment
    -m, --migrate           Run database migrations
    -s, --seed              Seed database with initial data
    --backup                Create database backup before deployment
    --restore FILE          Restore database from backup file
    --no-health-check       Skip health checks after deployment
    -h, --help              Show this help message

EXAMPLES:
    $0 -e production -b -m    Deploy to production with build and migrations
    $0 -e staging -p -s       Deploy to staging with image pull and seeding
    $0 --backup -m            Backup database and run migrations
    $0 --restore backup.sql   Restore from backup file

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -b|--build)
            BUILD_IMAGES=true
            shift
            ;;
        -p|--pull)
            PULL_IMAGES=true
            shift
            ;;
        -m|--migrate)
            MIGRATE_DB=true
            shift
            ;;
        -s|--seed)
            SEED_DB=true
            shift
            ;;
        --backup)
            BACKUP_DB=true
            shift
            ;;
        --restore)
            RESTORE_DB="$2"
            shift 2
            ;;
        --no-health-check)
            HEALTH_CHECK=false
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

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    print_error "Valid environments: development, staging, production"
    exit 1
fi

# Load environment variables
if [[ -f "$ENV_FILE" ]]; then
    print_status "Loading environment variables from $ENV_FILE"
    set -a
    source "$ENV_FILE"
    set +a
else
    print_warning "Environment file not found: $ENV_FILE"
fi

# Set environment-specific variables
case $ENVIRONMENT in
    "production")
        COMPOSE_FILE="$PROJECT_ROOT/docker-compose.prod.yml"
        if [[ -f "$COMPOSE_FILE" ]]; then
            DOCKER_COMPOSE_FILE="$COMPOSE_FILE"
        fi
        ;;
    "staging")
        COMPOSE_FILE="$PROJECT_ROOT/docker-compose.staging.yml"
        if [[ -f "$COMPOSE_FILE" ]]; then
            DOCKER_COMPOSE_FILE="$COMPOSE_FILE"
        fi
        ;;
esac

print_status "Deploying to $ENVIRONMENT environment"
print_status "Using Docker Compose file: $DOCKER_COMPOSE_FILE"

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to backup database
backup_database() {
    if [[ "$BACKUP_DB" == true ]]; then
        print_status "Creating database backup..."
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-telemedicine}" > "$BACKUP_FILE"
        print_success "Database backup created: $BACKUP_FILE"
    fi
}

# Function to restore database
restore_database() {
    if [[ -n "$RESTORE_DB" ]]; then
        if [[ ! -f "$RESTORE_DB" ]]; then
            print_error "Backup file not found: $RESTORE_DB"
            exit 1
        fi
        print_status "Restoring database from: $RESTORE_DB"
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-telemedicine}" < "$RESTORE_DB"
        print_success "Database restored successfully"
    fi
}

# Function to run database migrations
run_migrations() {
    if [[ "$MIGRATE_DB" == true ]]; then
        print_status "Running database migrations..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec backend npx prisma migrate deploy
        print_success "Database migrations completed"
    fi
}

# Function to seed database
seed_database() {
    if [[ "$SEED_DB" == true ]]; then
        print_status "Seeding database..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec backend npm run seed
        print_success "Database seeded successfully"
    fi
}

# Function to health check services
health_check() {
    if [[ "$HEALTH_CHECK" == true ]]; then
        print_status "Performing health checks..."
        
        # Wait for services to be ready
        sleep 30
        
        # Check backend health
        if curl -f http://localhost:${BACKEND_PORT:-3001}/health > /dev/null 2>&1; then
            print_success "Backend service is healthy"
        else
            print_error "Backend service health check failed"
            return 1
        fi
        
        # Check frontend health
        if curl -f http://localhost:${FRONTEND_PORT:-3000}/api/health > /dev/null 2>&1; then
            print_success "Frontend service is healthy"
        else
            print_error "Frontend service health check failed"
            return 1
        fi
        
        # Check database connection
        if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_isready -U "${POSTGRES_USER:-postgres}" > /dev/null 2>&1; then
            print_success "Database is healthy"
        else
            print_error "Database health check failed"
            return 1
        fi
        
        print_success "All health checks passed"
    fi
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
    
    print_status "Service Logs (last 10 lines):"
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=10
}

# Main deployment function
deploy() {
    print_status "Starting deployment process..."
    
    # Check Docker
    check_docker
    
    # Stop existing services
    print_status "Stopping existing services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    # Backup database if requested
    backup_database
    
    # Pull or build images
    if [[ "$PULL_IMAGES" == true ]]; then
        print_status "Pulling latest images..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" pull
    elif [[ "$BUILD_IMAGES" == true ]]; then
        print_status "Building Docker images..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
    fi
    
    # Start services
    print_status "Starting services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    timeout=60
    while ! docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T postgres pg_isready -U "${POSTGRES_USER:-postgres}" > /dev/null 2>&1; do
        sleep 2
        timeout=$((timeout - 2))
        if [[ $timeout -le 0 ]]; then
            print_error "Database failed to start within 60 seconds"
            exit 1
        fi
    done
    
    # Restore database if requested
    restore_database
    
    # Run migrations
    run_migrations
    
    # Seed database
    seed_database
    
    # Health checks
    health_check
    
    # Show final status
    show_status
    
    print_success "Deployment completed successfully!"
    print_status "Frontend: http://localhost:${FRONTEND_PORT:-3000}"
    print_status "Backend API: http://localhost:${BACKEND_PORT:-3001}"
    print_status "Grafana: http://localhost:${GRAFANA_PORT:-3002}"
    print_status "Prometheus: http://localhost:${PROMETHEUS_PORT:-9090}"
}

# Trap to cleanup on exit
cleanup() {
    if [[ $? -ne 0 ]]; then
        print_error "Deployment failed!"
        print_status "Checking service logs..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=50
    fi
}

trap cleanup EXIT

# Run deployment
deploy
