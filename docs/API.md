# API Documentation

This document provides comprehensive API documentation for the Telemedicine Platform backend
services.

## 🔗 Base URLs

- **Development**: `http://localhost:3001`
- **Staging**: `https://api-staging.telemedicine.com`
- **Production**: `https://api.telemedicine.com`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication with refresh token support.

### Authentication Flow

1. **Register/Login** → Receive access token + refresh token
2. **Include access token** in `Authorization: Bearer <token>` header
3. **Refresh token** when access token expires

### Token Endpoints

```http
POST /auth/signup
POST /auth/login
POST /auth/verify-otp
POST /auth/refresh-token
POST /auth/logout
```

## 📋 API Endpoints

### Authentication Module

#### Register User

```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "PATIENT"
}
```

**Response:**

```json
{
  "message": "User registered successfully. Please verify your phone number.",
  "userId": "uuid",
  "requiresOtpVerification": true
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PATIENT",
    "isVerified": true
  }
}
```

#### Verify OTP

```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phone": "+1234567890",
  "otp": "123456"
}
```

#### Refresh Token

```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Users Module

#### Get Profile

```http
GET /users/profile
Authorization: Bearer <token>
```

#### Update Profile

```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

#### Get All Users (Admin Only)

```http
GET /users?page=1&limit=10&role=PATIENT&search=john
Authorization: Bearer <token>
```

### Appointments Module

#### Create Appointment

```http
POST /appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctorId": "uuid",
  "appointmentDate": "2023-12-01T10:00:00Z",
  "type": "VIDEO_CONSULTATION",
  "reason": "Regular checkup",
  "symptoms": ["headache", "fever"]
}
```

**Response:**

```json
{
  "id": "uuid",
  "appointmentDate": "2023-12-01T10:00:00Z",
  "status": "PENDING",
  "type": "VIDEO_CONSULTATION",
  "reason": "Regular checkup",
  "doctor": {
    "id": "uuid",
    "firstName": "Dr. Jane",
    "lastName": "Smith",
    "specialization": "General Medicine"
  },
  "patient": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Get Appointments

```http
GET /appointments?status=PENDING&page=1&limit=10
Authorization: Bearer <token>
```

#### Update Appointment Status

```http
PATCH /appointments/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONFIRMED",
  "notes": "Appointment confirmed for video consultation"
}
```

#### Get Doctor Availability

```http
GET /appointments/doctors/:doctorId/availability?date=2023-12-01
Authorization: Bearer <token>
```

**Response:**

```json
{
  "date": "2023-12-01",
  "availableSlots": ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30"],
  "bookedSlots": ["11:00", "11:30", "15:00"]
}
```

### Video Consultation Module

#### Create Video Room

```http
POST /video/rooms
Authorization: Bearer <token>
Content-Type: application/json

{
  "appointmentId": "uuid"
}
```

**Response:**

```json
{
  "roomId": "uuid",
  "appointmentId": "uuid",
  "status": "ACTIVE",
  "participants": [],
  "createdAt": "2023-12-01T10:00:00Z",
  "iceServers": [
    {
      "urls": "stun:stun.l.google.com:19302"
    }
  ]
}
```

#### Join Video Room

```http
POST /video/rooms/:roomId/join
Authorization: Bearer <token>
```

#### End Video Room

```http
POST /video/rooms/:roomId/end
Authorization: Bearer <token>
```

### Prescriptions Module

#### Create Prescription

```http
POST /prescriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "appointmentId": "uuid",
  "medicines": [
    {
      "medicineId": "uuid",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "7 days",
      "instructions": "Take after meals"
    }
  ],
  "diagnosis": "Common cold",
  "notes": "Rest and stay hydrated"
}
```

#### Get Prescriptions

```http
GET /prescriptions?patientId=uuid&page=1&limit=10
Authorization: Bearer <token>
```

#### Download Prescription PDF

```http
GET /prescriptions/:id/pdf
Authorization: Bearer <token>
```

### Medicines Module

#### Search Medicines

```http
GET /medicines?search=paracetamol&category=PAIN_RELIEF&page=1&limit=10
Authorization: Bearer <token>
```

**Response:**

```json
{
  "medicines": [
    {
      "id": "uuid",
      "name": "Paracetamol",
      "genericName": "Acetaminophen",
      "category": "PAIN_RELIEF",
      "manufacturer": "PharmaCorp",
      "strength": "500mg",
      "form": "TABLET",
      "price": 25.5,
      "requiresPrescription": false,
      "inStock": true,
      "description": "Pain relief and fever reducer"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### Get Medicine Details

```http
GET /medicines/:id
Authorization: Bearer <token>
```

#### Add Medicine (Admin Only)

```http
POST /medicines
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Paracetamol",
  "genericName": "Acetaminophen",
  "category": "PAIN_RELIEF",
  "manufacturer": "PharmaCorp",
  "strength": "500mg",
  "form": "TABLET",
  "price": 25.50,
  "requiresPrescription": false,
  "description": "Pain relief and fever reducer"
}
```

### Orders Module

#### Create Order

```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "prescriptionId": "uuid",
  "pharmacyId": "uuid",
  "items": [
    {
      "medicineId": "uuid",
      "quantity": 2,
      "price": 25.50
    }
  ],
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

#### Get Orders

```http
GET /orders?status=PENDING&page=1&limit=10
Authorization: Bearer <token>
```

#### Update Order Status

```http
PATCH /orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "CONFIRMED",
  "estimatedDelivery": "2023-12-03T18:00:00Z",
  "trackingNumber": "TRK123456789"
}
```

#### Cancel Order

```http
POST /orders/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Changed mind"
}
```

### Payments Module

#### Create Payment

```http
POST /payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "uuid",
  "amount": 51.00,
  "currency": "USD",
  "gateway": "STRIPE"
}
```

**Response:**

```json
{
  "id": "uuid",
  "orderId": "uuid",
  "amount": 51.0,
  "currency": "USD",
  "status": "PENDING",
  "gateway": "STRIPE",
  "gatewayPaymentId": "pi_1234567890",
  "clientSecret": "pi_1234567890_secret_abcd"
}
```

#### Verify Payment

```http
POST /payments/:id/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "gatewayPaymentId": "pi_1234567890",
  "signature": "stripe_signature_hash"
}
```

#### Process Refund

```http
POST /payments/:id/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 25.50,
  "reason": "Cancelled order"
}
```

### Pharmacies Module

#### Register Pharmacy

```http
POST /pharmacies
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "City Pharmacy",
  "licenseNumber": "PH123456",
  "address": {
    "street": "456 Pharmacy Ave",
    "city": "New York",
    "state": "NY",
    "zipCode": "10002",
    "country": "USA"
  },
  "phone": "+1234567891",
  "email": "contact@citypharmacy.com",
  "deliveryRadius": 10,
  "deliveryFee": 5.00
}
```

#### Get Nearby Pharmacies

```http
GET /pharmacies/nearby?lat=40.7128&lng=-74.0060&radius=10
Authorization: Bearer <token>
```

#### Get Pharmacy Orders

```http
GET /pharmacies/:id/orders?status=PENDING&page=1&limit=10
Authorization: Bearer <token>
```

## 📊 Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [
    /* array of items */
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🔒 Role-Based Access Control

### Roles

- **PATIENT**: Can book appointments, view prescriptions, place orders
- **DOCTOR**: Can manage appointments, create prescriptions, conduct consultations
- **PHARMACY**: Can manage orders, update inventory
- **ADMIN**: Full system access, user management

### Permission Matrix

| Endpoint                       | PATIENT | DOCTOR | PHARMACY | ADMIN |
| ------------------------------ | ------- | ------ | -------- | ----- |
| GET /users/profile             | ✅      | ✅     | ✅       | ✅    |
| GET /users                     | ❌      | ❌     | ❌       | ✅    |
| POST /appointments             | ✅      | ❌     | ❌       | ✅    |
| PATCH /appointments/:id/status | ❌      | ✅     | ❌       | ✅    |
| POST /prescriptions            | ❌      | ✅     | ❌       | ✅    |
| GET /prescriptions             | ✅      | ✅     | ❌       | ✅    |
| POST /orders                   | ✅      | ❌     | ❌       | ✅    |
| PATCH /orders/:id/status       | ❌      | ❌     | ✅       | ✅    |
| POST /medicines                | ❌      | ❌     | ❌       | ✅    |

## 🚨 Error Codes

| Code                    | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| `UNAUTHORIZED`          | Invalid or missing authentication token                   |
| `FORBIDDEN`             | Insufficient permissions for the requested action         |
| `VALIDATION_ERROR`      | Request data validation failed                            |
| `NOT_FOUND`             | Requested resource not found                              |
| `CONFLICT`              | Resource conflict (e.g., appointment time already booked) |
| `RATE_LIMIT_EXCEEDED`   | Too many requests from the client                         |
| `INTERNAL_SERVER_ERROR` | Unexpected server error                                   |
| `SERVICE_UNAVAILABLE`   | External service temporarily unavailable                  |

## 📈 Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Authentication endpoints**: 5 requests per minute per IP
- **General API endpoints**: 100 requests per minute per user
- **File upload endpoints**: 10 requests per minute per user
- **Payment endpoints**: 20 requests per minute per user

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔍 Filtering and Sorting

### Query Parameters

Most list endpoints support filtering and sorting:

```http
GET /appointments?status=PENDING&doctorId=uuid&sort=appointmentDate&order=desc&page=1&limit=10
```

### Common Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Field to sort by
- `order`: Sort order (`asc` or `desc`)
- `search`: Text search across relevant fields

## 🔄 WebSocket Events

The platform supports real-time communication via WebSocket for video consultations and
notifications.

### Connection

```javascript
const socket = io('ws://localhost:3001', {
  auth: {
    token: 'your-jwt-token',
  },
});
```

### Video Consultation Events

```javascript
// Join video room
socket.emit('join-room', { roomId: 'uuid' });

// WebRTC signaling
socket.emit('offer', { roomId: 'uuid', offer: sdpOffer });
socket.emit('answer', { roomId: 'uuid', answer: sdpAnswer });
socket.emit('ice-candidate', { roomId: 'uuid', candidate: iceCandidate });

// Room controls
socket.emit('toggle-video', { roomId: 'uuid', enabled: false });
socket.emit('toggle-audio', { roomId: 'uuid', enabled: true });
socket.emit('start-recording', { roomId: 'uuid' });
```

### Notification Events

```javascript
// Listen for notifications
socket.on('appointment-reminder', data => {
  console.log('Appointment reminder:', data);
});

socket.on('order-status-update', data => {
  console.log('Order status updated:', data);
});

socket.on('new-message', data => {
  console.log('New message:', data);
});
```

## 📝 OpenAPI/Swagger

Interactive API documentation is available at:

- Development: `http://localhost:3001/api`
- Production: `https://api.telemedicine.com/api`

The Swagger UI provides:

- Interactive endpoint testing
- Request/response examples
- Schema definitions
- Authentication testing

## 🧪 Testing the API

### Using cURL

```bash
# Register user
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+1234567890",
    "role": "PATIENT"
  }'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Get profile (with token)
curl -X GET http://localhost:3001/users/profile \
  -H "Authorization: Bearer your-jwt-token"
```

### Using Postman

1. Import the OpenAPI specification from `/api-json`
2. Set up environment variables for base URL and tokens
3. Use the pre-request scripts for automatic token refresh

### Using JavaScript/TypeScript

```typescript
// API client example
class TelemedicineAPI {
  private baseURL = 'http://localhost:3001';
  private token: string | null = null;

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    this.token = data.accessToken;
    return data;
  }

  async getProfile() {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    return response.json();
  }

  async createAppointment(appointmentData: any) {
    const response = await fetch(`${this.baseURL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(appointmentData),
    });

    return response.json();
  }
}
```

## 📚 SDK and Libraries

### Official SDKs

- **JavaScript/TypeScript**: `@telemedicine/api-client`
- **React Hooks**: `@telemedicine/react-hooks`

### Installation

```bash
npm install @telemedicine/api-client @telemedicine/react-hooks
```

### Usage

```typescript
import { TelemedicineClient } from '@telemedicine/api-client';
import { useAuth, useAppointments } from '@telemedicine/react-hooks';

const client = new TelemedicineClient({
  baseURL: 'https://api.telemedicine.com',
  apiKey: 'your-api-key',
});

// React hooks
function MyComponent() {
  const { user, login, logout } = useAuth();
  const { appointments, createAppointment } = useAppointments();

  // Component logic
}
```

---

For more detailed information, refer to the interactive API documentation at `/api` endpoint or
contact the development team.
