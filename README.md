# Agentic AI Medical Assistance & Appointment Scheduling System

## 🎯 Project Overview

This is a full-stack Agentic AI-based medical assistance and appointment scheduling system developed as an academic prototype. The system demonstrates the practical application of multi-agent architecture, Large Language Models (LLMs), real-time WebSocket communication, and modern web technologies in the healthcare domain.

### ⚠️ Important Disclaimer
**This system is designed for educational and demonstration purposes only.** It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical concerns.

---

## 🏗️ System Architecture

### Multi-Agent Architecture

The system consists of five specialized agents that work together in a coordinated workflow:

1. **Doctor Agent** 🩺
   - Conducts interactive patient consultations
   - Uses GPT-4o-mini to ask intelligent follow-up questions
   - Mimics real doctor's cross-questioning behavior
   - Collects comprehensive symptom information

2. **Diagnosis Agent** 🔬
   - Analyzes patient symptoms using AI
   - Predicts possible diseases with confidence scores
   - Calculates severity scores (0-100)
   - Categorizes urgency (low, medium, high, critical)

3. **Specialty Mapper Agent** 🏥
   - Maps diseases to appropriate medical specialties
   - Uses both rule-based and AI-based mapping
   - Supports 10 major medical specialties

4. **Booking Agent** 📅
   - Schedules appointments based on severity priority
   - Auto-assigns time slots (critical cases get immediate slots)
   - Matches patients with appropriate specialists
   - Manages doctor availability

5. **Logger Agent** 📝
   - Records all conversation interactions
   - Maintains complete audit trail
   - Stores diagnosis results and appointments
   - Enables historical analysis

### Agent Orchestrator

The **AgentOrchestrator** coordinates the workflow:
```
Patient Input → Doctor Agent → Diagnosis Agent → Specialty Mapper → Booking Agent → Logger
                     ↓              ↓                    ↓              ↓            ↓
              Conversation    Disease Prediction    Specialty      Appointment   Database
              Management      & Severity Score      Selection      Scheduling     Logging
```

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Real-time Communication**: WebSocket (ws library)
- **Database**: MySQL
- **AI/LLM**: OpenAI GPT-4o-mini API
- **Utilities**: date-fns, uuid, dotenv

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Real-time**: WebSocket Client
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Database Schema
- **Patient**: User profiles and demographics
- **Doctor**: Specialist information and availability
- **Consultation**: Session tracking and diagnosis
- **ConversationLog**: Complete chat history
- **Appointment**: Scheduled bookings with priority
- **Diagnosis**: AI-generated disease predictions
- **Specialty**: Medical specialty reference data

---

## 📁 Project Structure

```
Ai-medical/
├── Backend/
│   ├── src/
│   │   ├── agents/                 # Multi-agent system
│   │   │   ├── DoctorAgent.ts      # Patient interaction & questioning
│   │   │   ├── DiagnosisAgent.ts   # AI-powered diagnosis
│   │   │   ├── SpecialtyMapperAgent.ts  # Specialty mapping
│   │   │   ├── BookingAgent.ts     # Appointment scheduling
│   │   │   ├── LoggerAgent.ts      # Interaction logging
│   │   │   └── AgentOrchestrator.ts # Workflow coordinator
│   │   ├── config/
│   │   │   └── llm-config.ts       # LLM prompts & configuration
│   │   ├── routes/
│   │   │   ├── Patient.ts          # Patient REST endpoints
│   │   │   ├── doctor.ts           # Doctor REST endpoints
│   │   │   └── consultation.ts     # Consultation endpoints
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript type definitions
│   │   ├── websocket/
│   │   │   └── WebSocketServer.ts  # Real-time WebSocket server
│   │   ├── db.ts                   # Database connection
│   │   └── index.ts                # Main server entry point
│   ├── database.sql                # Database schema
│   ├── package.json
│   └── .env.example                # Environment variables template
├── Frontend/
│   └── Medinet/
│       ├── src/
│       │   ├── components/
│       │   │   ├── ChatInterface.tsx      # Real-time chat UI
│       │   │   ├── PatientDashboard.tsx   # Patient overview
│       │   │   ├── DoctorDashboard.tsx    # Doctor interface
│       │   │   └── ...
│       │   ├── hooks/
│       │   │   └── useWebSocket.ts        # WebSocket hook
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── package.json
│       └── vite.config.ts
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)
- OpenAI API Key

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd Ai-medical/Backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` file with your credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=myproject

OPENAI_API_KEY=your_openai_api_key_here

PORT=3001
FRONTEND_URL=http://localhost:5173
```

4. **Set up database**:
```bash
mysql -u root -p < database.sql
```

Or manually execute the SQL file in MySQL Workbench/CLI.

5. **Start the backend server**:
```bash
npm run dev
```

Backend will run on `http://localhost:3001` and WebSocket on `ws://localhost:3001/ws`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd Ai-medical/Frontend/Medinet
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🎮 Usage

### Starting a Consultation

1. **Patient logs in** (or creates account)
2. **Clicks "Start Consultation"** to open chat interface
3. **Describes symptoms** in natural language
4. **AI Doctor asks follow-up questions** (4-6 exchanges)
5. **System generates diagnosis** with confidence scores
6. **Appointment is auto-scheduled** based on severity
7. **Patient receives confirmation** with doctor details

### Workflow Example

```
Patient: "I have severe headache and fever for 3 days"

AI Doctor: "I understand you're experiencing a headache and fever. 
           On a scale of 1-10, how severe is the headache?"

Patient: "Around 8, it's really painful"

AI Doctor: "Have you noticed any other symptoms like nausea, 
           sensitivity to light, or neck stiffness?"

Patient: "Yes, I feel nauseous and light bothers me"

AI Doctor: "How high is your fever? Have you measured it?"

Patient: "It's around 102°F"

[System analyzes symptoms]

Diagnosis:
- Migraine with fever (75% confidence)
- Viral infection (60% confidence)
Severity: High
Specialty: Neurology

Appointment Scheduled:
- Doctor: Dr. Smith (Neurology)
- Date: Tomorrow, 9:00 AM
- Priority: High
```

---

## 🧪 Key Features

### Real-time Communication
- **WebSocket-based bidirectional communication**
- **Instant AI responses** without page refresh
- **Live typing indicators** and status updates
- **Automatic reconnection** on connection loss

### Intelligent Diagnosis
- **LLM-powered symptom analysis**
- **Multiple disease predictions** with confidence scores
- **Severity scoring algorithm** (0-100 scale)
- **Urgency categorization** (4 levels)

### Priority-based Scheduling
- **Critical**: Same day, ASAP
- **High**: Within 1-2 days
- **Medium**: Within 3-5 days
- **Low**: Within 7-14 days

### Complete Audit Trail
- **Every message logged** to database
- **Diagnosis results stored** with timestamps
- **Appointment history tracked**
- **Patient consultation history** accessible

### Doctor Dashboard Features
- View upcoming appointments
- Access patient consultation history
- Review diagnosis details
- Manage availability status

---

## 🔐 Security Considerations

**Important for Production Deployment**:

1. **Authentication & Authorization**
   - Implement JWT-based authentication
   - Role-based access control (Patient/Doctor/Admin)
   - Session management and token refresh

2. **Data Privacy**
   - Encrypt sensitive medical data
   - HIPAA compliance (if applicable)
   - Secure WebSocket connections (WSS)

3. **API Security**
   - Rate limiting
   - Input validation and sanitization
   - SQL injection prevention
   - CORS configuration

4. **Environment Variables**
   - Never commit `.env` files
   - Use secrets management (AWS Secrets Manager, etc.)

---

## 📊 Database Schema Highlights

### Consultation Table
Tracks complete consultation sessions with diagnosis results.

### ConversationLog Table
Stores every message exchanged between patient and AI, enabling:
- Session replay
- Quality analysis
- AI training data
- Compliance audit

### Appointment Table
Priority-based scheduling with:
- Severity priority (1-4)
- Status tracking
- Doctor assignment
- Time slot management

---

## 🧩 Extending the System

### Adding New Agents

1. Create new agent class in `src/agents/`
2. Implement core logic methods
3. Update `AgentOrchestrator` to include new agent
4. Define agent's role in workflow

### Adding New Specialties

1. Update `DISEASE_SPECIALTY_MAP` in `llm-config.ts`
2. Add specialty to database:
```sql
INSERT INTO Specialty (Specialty_ID, name, description) 
VALUES (UUID(), 'Specialty Name', 'Description');
```
3. Update specialty mapper validation

### Customizing LLM Behavior

Edit system prompts in `src/config/llm-config.ts`:
- `DOCTOR_AGENT`: Modify questioning style
- `DIAGNOSIS_AGENT`: Adjust diagnosis criteria
- `SPECIALTY_MAPPER`: Update specialty mapping rules

---

## 🐛 Troubleshooting

### WebSocket Connection Issues
- Ensure backend is running on correct port
- Check CORS configuration
- Verify WebSocket URL in frontend

### Database Connection Errors
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database schema is created

### OpenAI API Errors
- Verify API key is valid
- Check API quota and limits
- Handle rate limiting gracefully

### Build Errors
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify TypeScript configuration

---

## 📈 Future Enhancements

- [ ] **Multi-language support** for international users
- [ ] **Voice input/output** for accessibility
- [ ] **Medical image analysis** (X-rays, MRI scans)
- [ ] **Prescription generation** and management
- [ ] **Telemedicine integration** (video consultations)
- [ ] **Wearable device data** integration
- [ ] **Advanced analytics dashboard** for doctors
- [ ] **Appointment reminders** (email/SMS)
- [ ] **Payment gateway integration**
- [ ] **Insurance verification** system

---

## 📝 License

This project is developed for educational purposes as part of a final year academic project.

---

## 👥 Contributors

Developed as part of Final Year Project demonstrating Agentic AI in Healthcare.

---

## 🙏 Acknowledgments

- OpenAI for GPT-4o-mini API
- Open-source community for excellent libraries
- Medical professionals for domain insights (educational context)

---

## 📞 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Review documentation
- Check troubleshooting section

---

**Remember**: This is a prototype for educational purposes. Real medical applications require rigorous testing, regulatory approval, and professional medical oversight.
