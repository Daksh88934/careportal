# Care Portal Telemedicine Platform - Setup Guide

## 🚀 Quick Start

Your Care Portal telemedicine platform is now fully configured and ready to run! This guide will help you
set up and deploy the complete video consultation system.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Supabase Account** (for database)
- **Jitsi Meet Account** (for video calls)
- **Twilio Account** (for SMS/OTP)
- **Cloudinary Account** (for file storage)
- **Razorpay Account** (for payments - optional)

## 🔧 Environment Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd c:\Users\piyus\OneDrive\Desktop\Hackthon

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 2. Environment Variables

Your `.env` file is already configured with production credentials:

```bash
# Database - Supabase
DATABASE_URL=postgresql://your_user:your_password@your-supabase-host:6543/postgres

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Twilio SMS
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Jitsi Meet Video Calls
JITSI_APP_ID=your_jitsi_app_id
JITSI_API_KEY=your_jitsi_api_key
JITSI_DOMAIN=8x8.vc
```

## 🗄️ Database Setup

### 1. Run Prisma Migrations

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Seed database with sample data
npx prisma db seed

cd ..
```

### 2. Verify Database Connection

```bash
# Open Prisma Studio to verify data
cd backend
npx prisma studio
```

## 🚀 Running the Application

### Option 1: Quick Start (Windows)

```bash
# Use the provided batch script
.\run-app.bat
```

### Option 2: Manual Start

```bash
# Start backend (Terminal 1)
cd backend
npm run start:dev

# Start frontend (Terminal 2)
cd frontend
npm run dev
```

### Option 3: Docker (Full Stack)

```bash
# Start all services including PostgreSQL, Redis, monitoring
docker-compose up -d

# Then start the applications
npm run dev
```

## 🌐 Access URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Documentation:** http://localhost:3001/api/docs
- **Prisma Studio:** http://localhost:5555

## 👥 Test Accounts

The database is seeded with these test accounts:

| Role     | Email              | Password    | Description          |
| -------- | ------------------ | ----------- | -------------------- |
| Admin    | admin@carex.com    | admin123    | System administrator |
| Doctor   | dr.smith@carex.com | doctor123   | Sample doctor        |
| Patient  | patient@carex.com  | patient123  | Sample patient       |
| Pharmacy | pharmacy@carex.com | pharmacy123 | Sample pharmacy      |

## 🎯 Video Consultation Workflow

### 1. Complete Patient Journey

1. **Patient Registration/Login**
   - Visit http://localhost:3000
   - Register or login as patient

2. **Book Appointment**
   - Browse available doctors
   - Select date and time slot
   - Enter symptoms and notes
   - Proceed to payment

3. **Payment Processing**
   - Razorpay integration (requires setup)
   - Appointment confirmed after payment

4. **Video Consultation**
   - Access consultation room via unique link
   - Join Jitsi Meet video call
   - Real-time video/audio communication

5. **Post-Consultation**
   - Doctor creates prescription
   - PDF prescription generated
   - Follow-up scheduling

### 2. Doctor Workflow

1. **Doctor Login**
   - Login with doctor credentials
   - Access doctor dashboard

2. **Manage Appointments**
   - View scheduled appointments
   - Start video consultations
   - End consultations

3. **Create Prescriptions**
   - Add medicines with dosage
   - Include diagnosis and notes
   - Generate PDF prescriptions

## 🔧 Key Features

### ✅ Implemented Features

- **User Authentication** (JWT-based)
- **Role-based Access Control** (Patient, Doctor, Admin, Pharmacy)
- **Video Consultations** (Jitsi Meet integration)
- **Appointment Booking** (with payment)
- **E-Prescriptions** (PDF generation)
- **Medicine Ordering** (pharmacy integration)
- **Payment Processing** (Razorpay/Stripe)
- **AI Health Assistant** (Google Gemini)
- **SMS Notifications** (Twilio)
- **File Storage** (Cloudinary)
- **Real-time Features** (Socket.io)

### 🎥 Video Call Features

- **Mute/Unmute Audio**
- **Enable/Disable Video**
- **Screen Sharing**
- **In-call Chat**
- **Recording** (doctor-only)
- **Participant Management**
- **Custom Branding**

## 🔒 Security Features

- **JWT Authentication**
- **Role-based Authorization**
- **API Rate Limiting**
- **CORS Configuration**
- **Input Validation**
- **SQL Injection Prevention**
- **XSS Protection**

## 📱 API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

### Appointments

- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments/:id` - Get appointment details

### Video Consultation

- `POST /api/video/room/create/:appointmentId` - Create video room
- `POST /api/video/room/join/:appointmentId` - Join video room
- `POST /api/video/call/end/:appointmentId` - End video call

### Prescriptions

- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/:id/pdf` - Download prescription PDF

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**

   ```bash
   # Check Supabase connection
   cd backend
   npx prisma db push
   ```

2. **Video Call Not Loading**
   - Verify Jitsi credentials in `.env`
   - Check browser permissions for camera/microphone
   - Ensure HTTPS in production

3. **Payment Integration**
   - Add Razorpay keys to `.env`
   - Configure webhook endpoints

4. **SMS Not Working**
   - Verify Twilio credentials
   - Check phone number format

### Logs and Debugging

```bash
# Backend logs
cd backend
npm run start:dev

# Frontend logs
cd frontend
npm run dev

# Database logs
cd backend
npx prisma studio
```

## 🚀 Production Deployment

### 1. Environment Setup

```bash
# Set production environment variables
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
```

### 2. Build Applications

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

### 3. Deploy Options

- **Vercel** (Frontend)
- **Railway/Render** (Backend)
- **Supabase** (Database)
- **Docker** (Full stack)

## 📞 Support

For technical support or questions:

- **Documentation:** Check `docs/` folder
- **API Reference:** http://localhost:3001/api/docs
- **Issues:** Create GitHub issues
- **Email:** support@carex.com

## 🎉 Success!

Your Care Portal telemedicine platform is now ready for production use with:

- ✅ Complete video consultation workflow
- ✅ Payment integration
- ✅ Prescription management
- ✅ AI health assistant
- ✅ Multi-role dashboards
- ✅ Real-time notifications
- ✅ Comprehensive testing

**Next Steps:**

1. Test the complete patient journey
2. Configure payment gateways
3. Set up monitoring and analytics
4. Deploy to production environment

Happy coding! 🚀
