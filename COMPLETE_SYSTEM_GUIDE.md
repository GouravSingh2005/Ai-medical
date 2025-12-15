# AI Medical Assistant - Full Stack Application

## 🏥 Project Overview

An intelligent medical consultation system powered by multi-agent AI architecture using Google Gemini. The system enables real-time patient-doctor interactions, AI-powered diagnosis, and automated appointment booking.

## 🏗️ System Architecture

### Backend (Node.js + TypeScript + Express)
- **Multi-Agent AI System**: DoctorAgent, DiagnosisAgent, SpecialtyMapperAgent, BookingAgent, LocationDistanceAgent, LoggerAgent, ReportCommunicationAgent
- **AI Provider**: Google Gemini API (gemini-1.5-flash)
- **Database**: MySQL 8.0 (Docker)
- **Real-time Communication**: WebSocket (ws library)
- **Authentication**: Bcrypt password hashing, UUID-based IDs

### Frontend (React + TypeScript + Vite)
- **UI Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with dark mode support
- **Animations**: Framer Motion
- **Real-time**: WebSocket client with auto-reconnect
- **State Management**: React Hooks (useState, useEffect, useRef)

## 📁 Project Structure

```
Ai-medical/
├── Backend/
│   ├── src/
│   │   ├── agents/              # AI Agent System
│   │   │   ├── AgentOrchestrator.ts     # Coordinates all agents
│   │   │   ├── DoctorAgent.ts           # Handles patient interaction
│   │   │   ├── DiagnosisAgent.ts        # AI diagnosis engine
│   │   │   ├── SpecialtyMapperAgent.ts  # Maps diseases to specialties
│   │   │   ├── BookingAgent.ts          # Appointment scheduling
│   │   │   ├── LocationDistanceAgent.ts # Geolocation services
│   │   │   ├── LoggerAgent.ts           # Logging service
│   │   │   └── ReportCommunicationAgent.ts # WhatsApp/Email notifications
│   │   ├── routes/
│   │   │   ├── Patient.ts       # Patient auth endpoints
│   │   │   ├── doctor.ts        # Doctor auth endpoints
│   │   │   └── consultation.ts  # Consultation REST APIs
│   │   ├── websocket/
│   │   │   └── WebSocketServer.ts # WebSocket server implementation
│   │   ├── config/
│   │   │   └── llm-config.ts    # Gemini API configuration
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript type definitions
│   │   ├── db.ts                # MySQL connection pool
│   │   └── index.ts             # Main server entry point
│   ├── database.sql             # Database schema
│   ├── docker-compose.yml       # MySQL Docker setup
│   ├── .env                     # Environment variables
│   └── package.json
│
└── Frontend/
    └── Medinet/
        ├── src/
        │   ├── components/
        │   │   ├── LandingPage.tsx       # Home page
        │   │   ├── LoginPage.tsx         # Auth page (patient/doctor)
        │   │   ├── PatientDashboard.tsx  # Patient dashboard
        │   │   ├── DoctorDashboard.tsx   # Doctor dashboard
        │   │   ├── ConsultationPage.tsx  # Consultation landing
        │   │   ├── MedicalChat.tsx       # Chat interface
        │   │   ├── MessageBubble.tsx     # Chat message component
        │   │   ├── PatientInput.tsx      # Chat input component
        │   │   ├── DiagnosisPanel.tsx    # Diagnosis display
        │   │   ├── BookingConfirmation.tsx # Appointment confirm
        │   │   ├── BookingCalendar.tsx   # Calendar view
        │   │   ├── ThemeToggle.tsx       # Dark mode toggle
        │   │   └── Navbar.tsx            # Navigation bar
        │   ├── hooks/
        │   │   └── useMedicalChat.ts     # WebSocket hook
        │   ├── types/
        │   │   └── index.ts              # TypeScript types
        │   ├── utils/
        │   │   └── api.ts                # API utilities
        │   ├── App.tsx                   # Main app component
        │   └── main.tsx                  # Entry point
        ├── .env                          # Frontend config
        └── package.json
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ (Recommended: 22.17.1)
- Docker & Docker Compose
- npm or yarn

### 1. Clone Repository
```bash
cd /home/gourav-singh/Final-year/Ai-medical
```

### 2. Backend Setup

#### a. Install Dependencies
```bash
cd Backend
npm install
```

#### b. Configure Environment
The `.env` file is already configured with:
```env
DB_HOST=127.0.0.1
DB_USER=medical_user
DB_PASSWORD=medical_pass
DB_NAME=myproject
DB_PORT=3306

GEMINI_API_KEY=AIzzzzzzzzzzzzzzzzzzzzzzzzzzz

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SESSION_TIMEOUT_MS=1800000
```

#### c. Start MySQL Database (Docker)
```bash
docker-compose up -d
```

This will:
- Create MySQL 8.0 container named `ai_medical_mysql`
- Initialize `myproject` database
- Create tables from `database.sql`
- Setup user `medical_user` with password `medical_pass`

#### d. Verify Database
```bash
docker exec -it ai_medical_mysql mysql -u medical_user -pmedical_pass myproject
```

Run:
```sql
SHOW TABLES;
```

You should see: Patient, Doctor, Consultation, ConversationLog, Appointment, Diagnosis, Specialty

#### e. Start Backend Server
```bash
npm run dev
```

Expected output:
```
🚀 HTTP Server running at http://localhost:3001
🔌 WebSocket Server running at ws://localhost:3001/ws
📊 Environment: development
```

### 3. Frontend Setup

#### a. Install Dependencies
```bash
cd ../Frontend/Medinet
npm install
```

#### b. Configure Environment
The `.env` file is already configured with:
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001/ws
VITE_APP_NAME=AI Medical Assistant
VITE_APP_VERSION=1.0.0
```

#### c. Start Frontend Development Server
```bash
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4. Access Application

Open browser and navigate to: **http://localhost:5173**

## 🔐 Authentication Flow

### Patient Signup
**Required Fields:**
- Email (unique, validated)
- Password (min 6 chars, 1 uppercase, 1 special char)
- Full Name (min 2 chars)

**Optional Fields:**
- Phone
- Age
- Gender (Male/Female/Other)

**Endpoint:** `POST /patient/signup`

### Doctor Signup
**Required Fields:**
- Email (unique, validated)
- Password (min 6 chars, 1 uppercase, 1 special char)
- Full Name (min 2 chars)
- Specialty (e.g., Cardiology, Dermatology)

**Optional Fields:**
- Phone
- Years of Experience

**Endpoint:** `POST /doctor/signup`

### Signin
- Same for both patients and doctors
- Returns user data including name, specialty (doctors), etc.

**Endpoints:**
- `POST /patient/signin`
- `POST /doctor/signin`

## 💬 WebSocket Communication Protocol

### Connection
```
ws://localhost:3001/ws
```

### Message Types

#### Client → Server (Sent)
1. **start** - Start consultation session
```json
{
  "type": "start",
  "payload": {
    "patientId": "uuid",
    "patientName": "John Doe"
  }
}
```

2. **message** - Send patient message
```json
{
  "type": "message",
  "payload": {
    "message": "I have a headache and fever"
  }
}
```

3. **location** - Share patient location
```json
{
  "type": "location",
  "payload": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

4. **end** - End consultation
```json
{
  "type": "end"
}
```

5. **history** - Request consultation history
```json
{
  "type": "history",
  "payload": {
    "patientId": "uuid"
  }
}
```

6. **ping** - Heartbeat (auto-sent every 30s)
```json
{
  "type": "ping"
}
```

#### Server → Client (Received)
1. **connected** - Connection established
2. **session_started** - Session created with greeting
3. **message** - AI doctor response
4. **diagnosis** - Diagnosis results with diseases
5. **appointment** - Appointment booking confirmation
6. **history** - Consultation history data
7. **error** - Error message
8. **pong** - Heartbeat response

## 🤖 Multi-Agent AI System

### Agent Orchestrator
- **Role**: Coordinates all agents
- **Functions**: Session management, message routing, state transitions

### Doctor Agent
- **Role**: Interactive AI doctor
- **Functions**: 
  - Greet patients
  - Ask follow-up questions about symptoms
  - Extract symptom information
  - Natural conversation flow

### Diagnosis Agent
- **Role**: Medical analysis engine
- **Functions**:
  - Analyze symptoms using Gemini AI
  - Predict possible diseases with confidence scores
  - Calculate severity scores (0-100)
  - Determine urgency level (low/medium/high/critical)
  - Provide recommended actions

### Specialty Mapper Agent
- **Role**: Match diseases to medical specialties
- **Functions**:
  - Rule-based specialty mapping
  - AI-powered specialty suggestions
  - Fallback to General Medicine

### Booking Agent
- **Role**: Appointment scheduling
- **Functions**:
  - Find available doctors by specialty
  - Calculate distance from patient location
  - Priority-based scheduling (severity score)
  - Create appointment records

### Location Distance Agent
- **Role**: Geolocation services
- **Functions**:
  - Calculate distance between patient and doctors
  - Haversine formula for accurate distances
  - Sort doctors by proximity

### Logger Agent
- **Role**: Conversation tracking
- **Functions**:
  - Log all messages to ConversationLog table
  - Track message types (Patient/AI_Doctor/System)
  - Store metadata

### Report Communication Agent
- **Role**: Notifications (Future)
- **Functions**:
  - WhatsApp message sending (Twilio)
  - Email notifications (SMTP)
  - PDF report generation

## 📊 Database Schema

### Patient Table
```sql
Patient_ID (CHAR 36, PK)
email (VARCHAR 100, UNIQUE)
password (VARCHAR 100, HASHED)
name (VARCHAR 100, NOT NULL)
phone (VARCHAR 15, OPTIONAL)
age (INT, OPTIONAL)
gender (ENUM: Male/Female/Other, OPTIONAL)
created_at (TIMESTAMP)
```

### Doctor Table
```sql
Doctor_ID (CHAR 36, PK)
email (VARCHAR 100, UNIQUE)
password (VARCHAR 100, HASHED)
name (VARCHAR 100, NOT NULL)
specialty (VARCHAR 100, NOT NULL)
phone (VARCHAR 15, OPTIONAL)
experience_years (INT, OPTIONAL)
availability_status (ENUM: Available/Busy/Offline)
clinic_address (TEXT, OPTIONAL)
clinic_latitude (DECIMAL)
clinic_longitude (DECIMAL)
whatsapp_number (VARCHAR 20, OPTIONAL)
created_at (TIMESTAMP)
```

### Consultation Table
```sql
Consultation_ID (CHAR 36, PK)
Patient_ID (CHAR 36, FK)
session_start (TIMESTAMP)
session_end (TIMESTAMP, NULLABLE)
symptoms (TEXT)
predicted_diseases (JSON)
severity_score (INT)
specialty_recommended (VARCHAR 100)
status (ENUM: Active/Completed/Cancelled)
```

### Appointment Table
```sql
Appointment_ID (CHAR 36, PK)
Consultation_ID (CHAR 36, FK)
Patient_ID (CHAR 36, FK)
Doctor_ID (CHAR 36, FK)
appointment_date (DATE)
appointment_time (TIME)
severity_priority (INT)
status (ENUM: Scheduled/Completed/Cancelled/Rescheduled)
notes (TEXT, OPTIONAL)
created_at (TIMESTAMP)
```

## 🧪 Testing the System

### 1. Test Patient Registration
1. Navigate to http://localhost:5173
2. Click "Get Started" or "Patient Login"
3. Switch to "Sign Up"
4. Fill in:
   - Name: John Doe
   - Email: john@example.com
   - Password: Test@123
   - Phone (optional): +1234567890
5. Click "Sign Up"

### 2. Test Doctor Registration
1. Navigate to "Doctor Login"
2. Switch to "Sign Up"
3. Fill in:
   - Name: Dr. Sarah Wilson
   - Email: sarah@doctor.com
   - Password: Doctor@123
   - Specialty: Cardiology
   - Phone (optional): +9876543210
   - Experience: 10 years
4. Click "Sign Up"

### 3. Test Consultation Flow
1. Login as patient
2. Click "Start Consultation"
3. Click "Start Consultation Now"
4. Wait for AI greeting
5. Type symptoms: "I have chest pain and shortness of breath"
6. Answer follow-up questions from AI
7. Continue for 4-6 message exchanges
8. AI will provide diagnosis with:
   - Possible diseases with confidence scores
   - Severity assessment
   - Recommended specialty
   - Urgency level
9. AI will automatically book appointment
10. Share location (optional) for nearby doctors

### 4. Test WebSocket Connection
Open browser console and check for:
```
✅ WebSocket connected
```

### 5. Test Database Records
```sql
-- Check patient records
SELECT * FROM Patient;

-- Check consultation sessions
SELECT * FROM Consultation;

-- Check conversation logs
SELECT * FROM ConversationLog ORDER BY timestamp DESC LIMIT 20;

-- Check appointments
SELECT * FROM Appointment;
```

## 🛠️ API Endpoints

### Health Check
```
GET /health
```

### Patient Endpoints
```
POST /patient/signup    - Register new patient
POST /patient/signin    - Patient login
```

### Doctor Endpoints
```
POST /doctor/signup     - Register new doctor
POST /doctor/signin     - Doctor login
```

### Consultation Endpoints
```
GET  /consultation/:id                   - Get consultation by ID
GET  /consultation/:id/logs              - Get conversation logs
GET  /consultation/patient/:patientId    - Get patient history
GET  /consultation/                      - Get active consultations
```

### WebSocket Stats
```
GET /ws/stats           - Get connection statistics
```

## 🐛 Troubleshooting

### Backend won't start
1. Check if MySQL container is running:
   ```bash
   docker ps
   ```

2. Check if port 3001 is available:
   ```bash
   lsof -ti:3001
   ```

3. Kill existing process if needed:
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```

### Frontend can't connect
1. Verify backend is running at http://localhost:3001
2. Check WebSocket connection at ws://localhost:3001/ws
3. Open browser console for errors

### Database connection failed
1. Verify MySQL container:
   ```bash
   docker logs ai_medical_mysql
   ```

2. Test connection:
   ```bash
   mysql -h 127.0.0.1 -u medical_user -pmedical_pass myproject
   ```

3. Restart Docker container:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Gemini API errors
1. Verify API key in `.env`
2. Check Gemini API quota at: https://makersuite.google.com/
3. Test API key:
   ```bash
   curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
   ```

## 📝 Development Notes

### TypeScript Considerations
- Backend uses ES modules (`.js` extensions in imports)
- ts-node loader: `node --loader ts-node/esm`
- Frontend uses Vite with automatic TypeScript compilation

### Environment Variables
- Backend: `.env` file in root
- Frontend: `.env` file with `VITE_` prefix for Vite access

### WebSocket Reconnection
- Frontend auto-reconnects on disconnect (max 5 attempts)
- 3-second delay between reconnection attempts
- Heartbeat ping every 30 seconds

### AI Prompt Engineering
- Doctor Agent: Conversational, empathetic tone
- Diagnosis Agent: Medical accuracy, structured JSON output
- Specialty Mapper: Disease-specialty relationships

## 🔮 Future Enhancements

1. **Authentication**
   - JWT token-based authentication
   - Refresh token mechanism
   - Role-based access control (RBAC)

2. **Features**
   - Video consultation integration
   - Medical report upload and OCR
   - Prescription generation
   - Payment gateway integration
   - Multi-language support

3. **AI Improvements**
   - Fine-tuned medical models
   - Medical image analysis
   - Symptom-disease knowledge graph
   - Personalized health recommendations

4. **Notifications**
   - WhatsApp appointment reminders (Twilio)
   - Email notifications (SMTP)
   - Push notifications (FCM)

5. **Analytics**
   - Patient health dashboard
   - Doctor performance metrics
   - System usage statistics

## 👥 Team & Credits

- **AI Model**: Google Gemini 1.5 Flash
- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MySQL 8.0
- **Real-time**: WebSocket (ws library)

## 📄 License

This project is for educational purposes.

---

**Last Updated**: December 15, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
