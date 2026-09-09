# CareX

A comprehensive telemedicine platform built with modern web technologies, featuring video
consultations, appointment booking, e-prescriptions, medicine ordering, and integrated payment
processing.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and shadcn/ui
- **Backend**: NestJS with Prisma ORM and PostgreSQL
- **Real-time**: WebSocket support for video consultations and notifications
- **Payment**: Dual gateway support (Razorpay for India, Stripe for international)
- **Monitoring**: Prometheus and Grafana for observability
- **Deployment**: Docker containers with Nginx reverse proxy

## 🚀 Features

### Core Functionality

- **User Management**: Role-based access control (Patient, Doctor, Pharmacy, Admin)
- **Authentication**: JWT-based auth with refresh tokens and OTP verification
- **Appointment Booking**: Smart scheduling with conflict detection and availability checking
- **Video Consultations**: WebRTC-based video calls with Jitsi Meet fallback
- **E-Prescriptions**: Digital prescriptions with PDF generation and validation
- **Medicine Ordering**: Prescription-based ordering with pharmacy management
- **Payment Processing**: Secure payments with Razorpay and Stripe integration

### Advanced Features

- **Real-time Notifications**: WebSocket-based live updates
- **File Management**: AWS S3 integration for document storage
- **SMS Integration**: Twilio for OTP and notifications
- **Monitoring**: Comprehensive metrics and logging
- **Security**: Rate limiting, CORS, helmet, and input validation

## 📋 Prerequisites

- Node.js >= 18.0.0
- Docker and Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd CareX

# Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Configure Environment

Update the `.env` file with your actual configuration values:

```bash
# Database
POSTGRES_DB=CareX
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Payment Gateways
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
STRIPE_SECRET_KEY=your-stripe-secret-key

# SMS Service
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET=your-s3-bucket-name
```

### 3. Start Development Environment

```bash
# Start with database migration and seeding
./scripts/deploy.sh -e development -b -m -s

# Or start individual services
npm run dev:backend    # Backend API
npm run dev:frontend   # Frontend app
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api
- **Grafana**: http://localhost:3002 (admin/admin)
- **Prometheus**: http://localhost:9090

## 📁 Project Structure

```
CareX/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── appointments/   # Appointment booking
│   │   ├── prescriptions/  # E-prescription system
│   │   ├── medicines/      # Medicine management
│   │   ├── orders/         # Order processing
│   │   ├── payments/       # Payment integration
│   │   ├── video/          # Video consultation
│   │   └── users/          # User management
│   ├── prisma/             # Database schema
│   └── test/               # E2E tests
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # Reusable components
│   │   └── lib/            # Utilities
├── scripts/                # Deployment scripts
├── monitoring/             # Prometheus & Grafana config
├── nginx/                  # Nginx configuration
└── docker-compose.yml      # Container orchestration
```

## 🧪 Testing

### Run All Tests

```bash
# Backend tests
cd backend
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage report

# Frontend tests
cd frontend
npm run test              # Component tests
npm run test:coverage     # Coverage report
```

### Test Coverage

The platform includes comprehensive test coverage:

- **Backend Unit Tests**: Services, controllers, and utilities
- **Backend E2E Tests**: Full API integration tests
- **Frontend Component Tests**: React components and UI interactions
- **Security Tests**: Authentication, authorization, and input validation

## 🚀 Deployment

### Development

```bash
./scripts/deploy.sh -e development -b -m -s
```

### Staging

```bash
./scripts/deploy.sh -e staging -p -m
```

### Production

```bash
./scripts/deploy.sh -e production -p -m --backup
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=3 --scale frontend=2

# View logs
docker-compose logs -f backend
```

## 📊 Monitoring

### Metrics

The platform includes comprehensive monitoring:

- **Application Metrics**: API response times, error rates, throughput
- **System Metrics**: CPU, memory, disk usage
- **Database Metrics**: Connection pool, query performance
- **Business Metrics**: User registrations, appointments, payments

### Grafana Dashboards

Access Grafana at http://localhost:3002 with default credentials (admin/admin):

- **Application Overview**: High-level system metrics
- **API Performance**: Endpoint-specific performance metrics
- **Database Monitoring**: PostgreSQL performance and health
- **Business Analytics**: User activity and revenue metrics

## 🔒 Security

### Authentication & Authorization

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- OTP verification for sensitive operations
- Session management and token rotation

### API Security

- Rate limiting on all endpoints
- CORS configuration
- Helmet.js for security headers
- Input validation and sanitization
- SQL injection prevention with Prisma

### Data Protection

- Password hashing with bcrypt
- Sensitive data encryption
- Secure file upload validation
- HTTPS enforcement in production

## 🔧 Configuration

### Environment Variables

| Variable     | Description                                  | Required |
| ------------ | -------------------------------------------- | -------- |
| `NODE_ENV`   | Environment (development/staging/production) | Yes      |
| `POSTGRES_*` | Database connection settings                 | Yes      |
| `JWT_SECRET` | JWT signing secret                           | Yes      |
| `RAZORPAY_*` | Razorpay payment gateway credentials         | No       |
| `STRIPE_*`   | Stripe payment gateway credentials           | No       |
| `TWILIO_*`   | SMS service credentials                      | No       |
| `AWS_*`      | File storage credentials                     | No       |

### Database Configuration

The platform uses PostgreSQL with Prisma ORM. Database migrations are handled automatically:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

## 📚 API Documentation

The backend provides OpenAPI/Swagger documentation at `/api` endpoint:

- **Authentication**: User registration, login, OTP verification
- **Appointments**: Booking, scheduling, management
- **Prescriptions**: Creation, validation, PDF generation
- **Orders**: Medicine ordering, status tracking
- **Payments**: Payment processing, verification, refunds
- **Video**: Video consultation room management

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `npm run test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- TypeScript for type safety
- ESLint and Prettier for code formatting
- Husky for pre-commit hooks
- Conventional commits for commit messages
- Comprehensive test coverage required

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review the API documentation at `/api`

## 🎯 Roadmap

- [ ] Mobile app development (React Native)
- [ ] AI-powered symptom checker
- [ ] Integration with health devices (IoT)
- [ ] Multi-language support
- [ ] Advanced analytics and reporting
- [ ] Telemedicine marketplace features

---

Built with ❤️ for better healthcare accessibility
