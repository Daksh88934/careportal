# Telemedicine Platform Makefile
# Provides convenient commands for development, testing, and deployment

.PHONY: help install dev build start test lint format clean docker-up docker-down db-setup db-migrate db-seed db-studio deploy-staging deploy-production

# Default target
help:
	@echo "Telemedicine Platform - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  install          Install all dependencies"
	@echo "  dev              Start development servers"
	@echo "  build            Build all projects"
	@echo "  start            Start production servers"
	@echo ""
	@echo "Database:"
	@echo "  db-setup         Set up database with Docker"
	@echo "  db-migrate       Run database migrations"
	@echo "  db-seed          Seed database with sample data"
	@echo "  db-studio        Open Prisma Studio"
	@echo "  db-reset         Reset database (development only)"
	@echo ""
	@echo "Testing:"
	@echo "  test             Run all tests"
	@echo "  test-unit        Run unit tests"
	@echo "  test-e2e         Run E2E tests"
	@echo "  test-coverage    Run tests with coverage"
	@echo ""
	@echo "Code Quality:"
	@echo "  lint             Run linting"
	@echo "  format           Format code"
	@echo "  type-check       Run TypeScript type checking"
	@echo ""
	@echo "Docker:"
	@echo "  docker-up        Start all services with Docker"
	@echo "  docker-down      Stop all Docker services"
	@echo "  docker-logs      View Docker logs"
	@echo "  docker-clean     Clean Docker containers and volumes"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy-staging   Deploy to staging environment"
	@echo "  deploy-prod      Deploy to production environment"
	@echo ""
	@echo "Utilities:"
	@echo "  clean            Clean build artifacts"
	@echo "  backup-db        Backup database"
	@echo "  restore-db       Restore database from backup"

# Installation
install:
	@echo "📦 Installing dependencies..."
	npm install
	cd frontend && npm install
	cd backend && npm install

# Development
dev:
	@echo "🚀 Starting development servers..."
	npm run dev

build:
	@echo "🔨 Building all projects..."
	npm run build

start:
	@echo "▶️  Starting production servers..."
	npm run start

# Database
db-setup:
	@echo "🗄️  Setting up database..."
	docker-compose up -d postgres redis
	sleep 5
	make db-migrate
	make db-seed

db-migrate:
	@echo "📊 Running database migrations..."
	cd backend && npx prisma migrate dev

db-seed:
	@echo "🌱 Seeding database..."
	cd backend && npx prisma db seed

db-studio:
	@echo "🎨 Opening Prisma Studio..."
	cd backend && npx prisma studio

db-reset:
	@echo "⚠️  Resetting database (development only)..."
	@read -p "Are you sure? This will delete all data. Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ]
	cd backend && npx prisma migrate reset --force

# Testing
test:
	@echo "🧪 Running all tests..."
	npm run test

test-unit:
	@echo "🔬 Running unit tests..."
	npm run test:backend
	npm run test:frontend

test-e2e:
	@echo "🎭 Running E2E tests..."
	npm run test:e2e

test-coverage:
	@echo "📊 Running tests with coverage..."
	cd backend && npm run test:cov
	cd frontend && npm run test:coverage

# Code Quality
lint:
	@echo "🔍 Running linting..."
	npm run lint

format:
	@echo "✨ Formatting code..."
	npm run format

type-check:
	@echo "📝 Running TypeScript type checking..."
	cd frontend && npm run type-check
	cd backend && npx tsc --noEmit

# Docker
docker-up:
	@echo "🐳 Starting Docker services..."
	docker-compose up -d

docker-down:
	@echo "🛑 Stopping Docker services..."
	docker-compose down

docker-logs:
	@echo "📋 Viewing Docker logs..."
	docker-compose logs -f

docker-clean:
	@echo "🧹 Cleaning Docker containers and volumes..."
	docker-compose down -v
	docker system prune -f

# Deployment
deploy-staging:
	@echo "🚀 Deploying to staging..."
	@echo "Running pre-deployment checks..."
	make lint
	make test-unit
	@echo "Building for staging..."
	NODE_ENV=staging make build
	@echo "Deploying to staging environment..."
	# Add your staging deployment commands here
	@echo "✅ Staging deployment complete!"

deploy-prod:
	@echo "🚀 Deploying to production..."
	@echo "⚠️  Production deployment requires additional verification"
	@read -p "Are you sure you want to deploy to production? Type 'DEPLOY' to continue: " confirm && [ "$$confirm" = "DEPLOY" ]
	@echo "Running comprehensive checks..."
	make lint
	make test
	make type-check
	@echo "Building for production..."
	NODE_ENV=production make build
	@echo "Deploying to production environment..."
	# Add your production deployment commands here
	@echo "✅ Production deployment complete!"

# Utilities
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf node_modules/.cache
	rm -rf frontend/.next
	rm -rf frontend/out
	rm -rf backend/dist
	rm -rf coverage
	rm -rf test-results
	rm -rf playwright-report

backup-db:
	@echo "💾 Backing up database..."
	@mkdir -p backups
	@timestamp=$$(date +%Y%m%d_%H%M%S) && \
	docker exec telemedicine_postgres pg_dump -U telemedicine_user telemedicine_db > backups/backup_$$timestamp.sql && \
	echo "Database backed up to backups/backup_$$timestamp.sql"

restore-db:
	@echo "📥 Restoring database from backup..."
	@ls -la backups/
	@read -p "Enter backup filename (e.g., backup_20231214_143022.sql): " filename && \
	docker exec -i telemedicine_postgres psql -U telemedicine_user -d telemedicine_db < backups/$$filename && \
	echo "Database restored from backups/$$filename"

# Health checks
health-check:
	@echo "🏥 Running health checks..."
	@echo "Checking backend health..."
	@curl -f http://localhost:3001/api/health || echo "❌ Backend is down"
	@echo "Checking frontend..."
	@curl -f http://localhost:3000 || echo "❌ Frontend is down"
	@echo "Checking database..."
	@docker exec telemedicine_postgres pg_isready -U telemedicine_user || echo "❌ Database is down"
	@echo "Checking Redis..."
	@docker exec telemedicine_redis redis-cli ping || echo "❌ Redis is down"

# Security
security-scan:
	@echo "🔒 Running security scans..."
	cd frontend && npm audit
	cd backend && npm audit
	@echo "Security scan complete"

# Performance
performance-test:
	@echo "⚡ Running performance tests..."
	# Add performance testing commands here
	@echo "Performance tests complete"

# Documentation
docs-build:
	@echo "📚 Building documentation..."
	# Add documentation build commands here
	@echo "Documentation built"

docs-serve:
	@echo "📖 Serving documentation..."
	# Add documentation serve commands here

# Monitoring
logs:
	@echo "📋 Viewing application logs..."
	docker-compose logs -f backend frontend

monitor:
	@echo "📊 Starting monitoring dashboard..."
	# Add monitoring commands here
