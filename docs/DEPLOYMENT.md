# Deployment Guide

This guide covers deployment strategies for the Telemedicine Platform across different environments.

## 🏗️ Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │     Nginx       │    │   Application   │
│   (CloudFlare)  │────│  Reverse Proxy  │────│    Services     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Static Files  │    │    Database     │
                       │   (AWS S3/CDN)  │    │  (PostgreSQL)   │
                       └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Deployment

### Using Deployment Script

```bash
# Development environment
./scripts/deploy.sh -e development -b -m -s

# Staging environment
./scripts/deploy.sh -e staging -p -m

# Production environment
./scripts/deploy.sh -e production -p -m --backup
```

### Script Options

| Option           | Description                                  |
| ---------------- | -------------------------------------------- |
| `-e, --env`      | Environment (development/staging/production) |
| `-b, --build`    | Build Docker images locally                  |
| `-p, --pull`     | Pull latest images from registry             |
| `-m, --migrate`  | Run database migrations                      |
| `-s, --seed`     | Seed database with initial data              |
| `--backup`       | Create database backup before deployment     |
| `--restore`      | Restore from backup file                     |
| `--health-check` | Run health checks after deployment           |

## 🐳 Docker Deployment

### Single Server Deployment

```bash
# Clone repository
git clone <repository-url>
cd telemedicine-platform

# Setup environment
./scripts/setup.sh

# Configure environment variables
cp .env.example .env
# Edit .env with production values

# Deploy with Docker Compose
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Multi-Server Deployment

For production environments, consider deploying services across multiple servers:

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  nginx:
    deploy:
      replicas: 2
      placement:
        constraints: [node.role == manager]

  backend:
    deploy:
      replicas: 3
      placement:
        constraints: [node.role == worker]

  frontend:
    deploy:
      replicas: 2
      placement:
        constraints: [node.role == worker]
```

## ☁️ Cloud Deployment

### AWS Deployment

#### Prerequisites

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
```

#### ECS Deployment

```bash
# Build and push images
docker build -t telemedicine-backend ./backend
docker build -t telemedicine-frontend ./frontend

# Tag and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag telemedicine-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/telemedicine-backend:latest
docker tag telemedicine-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/telemedicine-frontend:latest

docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/telemedicine-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/telemedicine-frontend:latest
```

#### RDS Setup

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier telemedicine-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 14.9 \
  --master-username postgres \
  --master-user-password <secure-password> \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name default \
  --backup-retention-period 7 \
  --multi-az
```

### Google Cloud Platform

#### Prerequisites

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

#### GKE Deployment

```bash
# Create GKE cluster
gcloud container clusters create telemedicine-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 10

# Get credentials
gcloud container clusters get-credentials telemedicine-cluster --zone us-central1-a

# Deploy to Kubernetes
kubectl apply -f k8s/
```

### Digital Ocean

#### App Platform Deployment

```yaml
# .do/app.yaml
name: telemedicine-platform
services:
  - name: backend
    source_dir: /backend
    github:
      repo: your-username/telemedicine-platform
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 2
    instance_size_slug: basic-xxs
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        type: SECRET
        value: postgresql://...

  - name: frontend
    source_dir: /frontend
    github:
      repo: your-username/telemedicine-platform
      branch: main
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /
```

## 🔧 Environment Configuration

### Development

```env
NODE_ENV=development
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
REDIS_HOST=localhost
REDIS_PORT=6379
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
```

### Staging

```env
NODE_ENV=staging
POSTGRES_HOST=staging-db.internal
POSTGRES_PORT=5432
REDIS_HOST=staging-redis.internal
REDIS_PORT=6379
FRONTEND_URL=https://staging.telemedicine.com
BACKEND_URL=https://api-staging.telemedicine.com
```

### Production

```env
NODE_ENV=production
POSTGRES_HOST=prod-db.internal
POSTGRES_PORT=5432
REDIS_HOST=prod-redis.internal
REDIS_PORT=6379
FRONTEND_URL=https://telemedicine.com
BACKEND_URL=https://api.telemedicine.com

# Security
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>

# External Services
RAZORPAY_KEY_ID=<production-key>
RAZORPAY_KEY_SECRET=<production-secret>
STRIPE_SECRET_KEY=<production-key>
TWILIO_ACCOUNT_SID=<production-sid>
AWS_ACCESS_KEY_ID=<production-key>
```

## 🔒 SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d telemedicine.com -d www.telemedicine.com -d api.telemedicine.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Custom SSL Certificate

```nginx
server {
    listen 443 ssl http2;
    server_name telemedicine.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;

    # ... rest of configuration
}
```

## 📊 Monitoring Setup

### Prometheus Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - 'rules/*.yml'

scrape_configs:
  - job_name: 'telemedicine-backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'telemedicine-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
```

### Grafana Dashboard Import

```bash
# Import pre-built dashboards
curl -X POST \
  http://admin:admin@localhost:3002/api/dashboards/db \
  -H 'Content-Type: application/json' \
  -d @monitoring/dashboards/application-overview.json
```

## 🔄 CI/CD Pipeline

### GitHub Actions

The platform includes a comprehensive CI/CD pipeline:

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:ci
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Deployment commands
```

### Manual Deployment

```bash
# Build production images
docker build -t telemedicine-backend:latest ./backend
docker build -t telemedicine-frontend:latest ./frontend

# Tag for registry
docker tag telemedicine-backend:latest registry.com/telemedicine-backend:latest
docker tag telemedicine-frontend:latest registry.com/telemedicine-frontend:latest

# Push to registry
docker push registry.com/telemedicine-backend:latest
docker push registry.com/telemedicine-frontend:latest

# Deploy to production
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 🗄️ Database Management

### Migrations

```bash
# Run migrations
cd backend
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database
npx prisma db seed
```

### Backup and Restore

```bash
# Create backup
pg_dump -h localhost -U postgres -d telemedicine > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -h localhost -U postgres -d telemedicine < backup_20231201_120000.sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB > $BACKUP_DIR/backup_$TIMESTAMP.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

## 🔍 Health Checks

### Application Health Endpoints

```typescript
// Backend health check
@Get('/health')
async healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: await this.checkDatabase(),
    redis: await this.checkRedis(),
  };
}
```

### Docker Health Checks

```dockerfile
# Backend Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Frontend Dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

### Load Balancer Health Checks

```nginx
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check database connectivity
pg_isready -h localhost -p 5432

# Check database logs
docker logs telemedicine-postgres

# Test connection from application
docker exec -it telemedicine-backend npx prisma db pull
```

#### Memory Issues

```bash
# Check memory usage
docker stats

# Increase memory limits
docker-compose up -d --scale backend=2
```

#### SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in certificate.crt -text -noout

# Test SSL connection
openssl s_client -connect telemedicine.com:443
```

### Log Analysis

```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Search for errors
docker-compose logs backend | grep ERROR

# Monitor real-time logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 📋 Pre-deployment Checklist

### Security

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database credentials secured
- [ ] API keys rotated
- [ ] Rate limiting configured
- [ ] CORS settings verified
- [ ] Security headers enabled

### Performance

- [ ] Database indexes optimized
- [ ] Static assets cached
- [ ] CDN configured
- [ ] Image optimization enabled
- [ ] Gzip compression enabled
- [ ] Database connection pooling configured

### Monitoring

- [ ] Health checks configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Log aggregation setup
- [ ] Alerting rules configured
- [ ] Backup strategy implemented

### Testing

- [ ] All tests passing
- [ ] Load testing completed
- [ ] Security scanning done
- [ ] Accessibility testing verified
- [ ] Cross-browser testing completed
- [ ] Mobile responsiveness verified

## 🔄 Rollback Strategy

### Quick Rollback

```bash
# Rollback to previous version
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --scale backend=0
docker tag telemedicine-backend:previous telemedicine-backend:latest
docker-compose -f docker-compose.prod.yml up -d
```

### Database Rollback

```bash
# Restore from backup
psql -h localhost -U postgres -d telemedicine < backup_previous.sql

# Rollback migrations
cd backend
npx prisma migrate reset --force
npx prisma migrate deploy --to 20231201000000
```

## 📞 Support

For deployment issues:

1. Check the troubleshooting section above
2. Review application logs
3. Verify environment configuration
4. Test individual components
5. Create an issue in the repository

---

This deployment guide covers the most common scenarios. For specific cloud providers or custom
setups, refer to their respective documentation.
