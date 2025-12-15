# System Architecture Documentation

## Overview

The Agentic AI Medical Assistance System is built on a **multi-agent architecture** where specialized AI agents collaborate to provide intelligent medical screening and appointment scheduling.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │  Chat UI       │  │  Dashboard     │  │  History View  │   │
│  │  Component     │  │  Component     │  │  Component     │   │
│  └────────┬───────┘  └────────────────┘  └────────────────┘   │
│           │                                                      │
│           │ WebSocket Connection (Real-time)                    │
└───────────┼──────────────────────────────────────────────────────┘
            │
            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    WEBSOCKET SERVER (ws)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Connection Management | Session Tracking | Broadcasting   │ │
│  └────────────────────────┬───────────────────────────────────┘ │
└─────────────────────────────┼───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT ORCHESTRATOR                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  • Workflow Coordination                                    │ │
│  │  • Session Management                                       │ │
│  │  • Agent Communication                                      │ │
│  │  • State Management                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ├─────────────────────┬────────────────┬────────────────┐
          ↓                     ↓                ↓                ↓
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐ │
│  DOCTOR AGENT   │   │ DIAGNOSIS AGENT │   │ SPECIALTY MAPPER│ │
│  🩺             │   │  🔬            │   │  🏥            │ │
│                 │   │                 │   │                 │ │
│ • Greeting      │   │ • Symptom      │   │ • Disease to   │ │
│ • Questioning   │   │   Analysis     │   │   Specialty    │ │
│ • LLM-powered   │   │ • Disease      │   │   Mapping      │ │
│   Follow-ups    │   │   Prediction   │   │ • Rule-based + │ │
│ • Symptom       │   │ • Severity     │   │   AI hybrid    │ │
│   Extraction    │   │   Scoring      │   │                 │ │
└─────────────────┘   └─────────────────┘   └─────────────────┘ │
          │                     │                     │            │
          └─────────────────────┴─────────────────────┴────────────┘
                                │
                    ┌───────────┴───────────┐
                    ↓                       ↓
          ┌─────────────────┐     ┌─────────────────┐
          │  BOOKING AGENT  │     │  LOGGER AGENT   │
          │  📅            │     │  📝            │
          │                 │     │                 │
          │ • Doctor        │     │ • Conversation  │
          │   Matching      │     │   Logging       │
          │ • Priority-     │     │ • Database      │
          │   based         │     │   Recording     │
          │   Scheduling    │     │ • Audit Trail   │
          │ • Slot          │     │ • History       │
          │   Management    │     │   Tracking      │
          └─────────────────┘     └─────────────────┘
                    │                       │
                    └───────────┬───────────┘
                                ↓
                    ┌───────────────────────┐
                    │   MYSQL DATABASE      │
                    │                       │
                    │  • Patient            │
                    │  • Doctor             │
                    │  • Consultation       │
                    │  • ConversationLog    │
                    │  • Appointment        │
                    │  • Diagnosis          │
                    │  • Specialty          │
                    └───────────────────────┘
                                ↑
                    ┌───────────┴───────────┐
                    │   OPENAI GPT-4o-mini  │
                    │   (LLM API)           │
                    │                       │
                    │  • Natural Language   │
                    │    Understanding      │
                    │  • Question           │
                    │    Generation         │
                    │  • Diagnosis          │
                    │    Analysis           │
                    └───────────────────────┘
```

---

## Agent Workflow Sequence

### Phase 1: Session Initialization
```
User → WebSocket Server → Orchestrator → Doctor Agent
                                   ↓
                            Logger Agent (Log Start)
                                   ↓
                            Return Greeting Message
```

### Phase 2: Conversation (Repeated 3-6 times)
```
Patient Message → WebSocket → Orchestrator
                                   ↓
                            Doctor Agent
                                   ↓
                         Call OpenAI API
                                   ↓
                    Generate Follow-up Question
                                   ↓
                         Logger Agent (Log Messages)
                                   ↓
                    Return to Patient via WebSocket
```

### Phase 3: Diagnosis & Booking
```
Sufficient Info Collected
         ↓
  Diagnosis Agent
         ↓
  Call OpenAI for Analysis
         ↓
  Generate Disease Predictions + Severity
         ↓
  Specialty Mapper Agent
         ↓
  Map to Medical Specialty
         ↓
  Booking Agent
         ↓
  Find Available Doctors
         ↓
  Calculate Priority Slot
         ↓
  Schedule Appointment
         ↓
  Logger Agent (Log Everything)
         ↓
  Return Complete Results to Patient
```

---

## Data Flow Diagram

```
┌──────────────┐
│   Patient    │
│   Browser    │
└──────┬───────┘
       │ 1. Start Session
       ↓
┌──────────────────────┐
│  WebSocket Server    │
│  (Port 3001/ws)      │
└──────┬───────────────┘
       │ 2. Create Session
       ↓
┌──────────────────────┐
│ Agent Orchestrator   │
│ (Session Manager)    │
└──────┬───────────────┘
       │ 3. Initialize
       ↓
┌──────────────────────┐
│   Doctor Agent       │
│   (GPT-4o-mini)      │
└──────┬───────────────┘
       │ 4. Generate Greeting
       ↓
┌──────────────────────┐
│   Logger Agent       │
│   (MySQL)            │
└──────┬───────────────┘
       │ 5. Store in DB
       ↓
┌──────────────────────┐
│   Response to        │
│   Patient (WS)       │
└──────────────────────┘
       ↓
   [Conversation Loop]
       ↓
┌──────────────────────┐
│  Diagnosis Trigger   │
└──────┬───────────────┘
       │
       ├─→ Diagnosis Agent (Analyze Symptoms)
       │        ↓
       │   OpenAI API Call
       │        ↓
       │   Disease Predictions + Severity
       │
       ├─→ Specialty Mapper (Map to Specialty)
       │        ↓
       │   Medical Specialty Selected
       │
       ├─→ Booking Agent (Schedule)
       │        ↓
       │   Query Doctor Availability
       │        ↓
       │   Create Appointment Record
       │
       └─→ Logger Agent (Record All)
                ↓
           Update Database
                ↓
       ┌────────────────────┐
       │  Final Response    │
       │  • Diagnosis       │
       │  • Appointment     │
       │  • Recommendations │
       └────────────────────┘
```

---

## Component Details

### 1. WebSocket Server
**Technology**: `ws` library  
**Port**: 3001 (configurable)  
**Path**: `/ws`

**Responsibilities**:
- Manage client connections
- Handle real-time bidirectional communication
- Route messages to orchestrator
- Send responses back to clients
- Connection lifecycle management

**Message Types**:
- `start`: Initialize consultation session
- `message`: Patient symptom messages
- `end`: End consultation session
- `history`: Fetch past consultations
- `ping`: Keep-alive

### 2. Agent Orchestrator
**Location**: `src/agents/AgentOrchestrator.ts`

**Responsibilities**:
- Coordinate agent workflow
- Manage session state
- Route requests to appropriate agents
- Handle agent responses
- Session timeout management

**Key Methods**:
- `startSession(patientId, patientName)`
- `processMessage(sessionId, message)`
- `getSession(sessionId)`
- `endSession(sessionId)`
- `cleanupInactiveSessions()`

### 3. Doctor Agent
**Location**: `src/agents/DoctorAgent.ts`  
**LLM**: OpenAI GPT-4o-mini

**Responsibilities**:
- Generate greeting messages
- Process patient responses
- Generate intelligent follow-up questions
- Determine when enough information is collected
- Extract symptoms from conversation

**Configuration**:
- MIN_QUESTIONS: 3
- MAX_QUESTIONS: 6
- Temperature: 0.7 (creative but focused)

### 4. Diagnosis Agent
**Location**: `src/agents/DiagnosisAgent.ts`  
**LLM**: OpenAI GPT-4o-mini

**Responsibilities**:
- Analyze symptom patterns
- Predict possible diseases
- Calculate confidence scores (0-100)
- Determine severity score (0-100)
- Categorize urgency level

**Output Format**:
```typescript
{
  diseases: Disease[],
  severityScore: number,
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical',
  recommendedActions: string[]
}
```

### 5. Specialty Mapper Agent
**Location**: `src/agents/SpecialtyMapperAgent.ts`

**Responsibilities**:
- Map diseases to medical specialties
- Use rule-based keyword matching
- Fallback to LLM for complex cases
- Validate specialty names

**Supported Specialties**:
- General Medicine, Cardiology, Dermatology
- Orthopedics, Neurology, Gastroenterology
- Pulmonology, Pediatrics, Psychiatry, ENT

### 6. Booking Agent
**Location**: `src/agents/BookingAgent.ts`

**Responsibilities**:
- Find available doctors by specialty
- Calculate appointment slots based on urgency
- Schedule appointments with priority
- Generate booking confirmations

**Priority Scheduling**:
- Critical: Same day, ASAP
- High: 1-2 days
- Medium: 3-5 days
- Low: 7-14 days

### 7. Logger Agent
**Location**: `src/agents/LoggerAgent.ts`

**Responsibilities**:
- Log all conversation messages
- Create consultation records
- Update diagnosis results
- Track appointment scheduling
- Maintain audit trail

---

## Database Schema

### Key Tables

**Consultation**
- Tracks consultation sessions
- Stores diagnosis results
- Links to appointments

**ConversationLog**
- Complete message history
- Timestamp tracking
- Metadata storage

**Appointment**
- Scheduled bookings
- Priority-based
- Status tracking

**Diagnosis**
- AI predictions
- Confidence scores
- Recommended actions

---

## Technology Stack Details

### Backend
- **Node.js v18+**: Runtime environment
- **Express.js**: REST API framework
- **TypeScript**: Type-safe development
- **ws**: WebSocket implementation
- **mysql2**: MySQL driver with promises
- **OpenAI SDK**: LLM integration
- **date-fns**: Date manipulation

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool (fast HMR)
- **TailwindCSS**: Utility-first styling
- **Lucide React**: Icon library
- **WebSocket API**: Real-time communication

### Database
- **MySQL 8+**: Relational database
- **InnoDB**: Storage engine
- **Foreign Keys**: Referential integrity
- **Indexes**: Query optimization

### AI/ML
- **OpenAI GPT-4o-mini**: Main LLM
- **Temperature 0.3-0.7**: Controlled creativity
- **JSON mode**: Structured responses

---

## Security Considerations

### Current Implementation (Development)
- Basic CORS configuration
- Environment variable isolation
- Input validation (basic)

### Production Requirements
- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- HTTPS/WSS encryption
- SQL injection prevention
- XSS protection
- HIPAA compliance (if applicable)

---

## Performance Optimization

### Backend
- MySQL connection pooling
- WebSocket connection reuse
- Session cleanup (inactive > 30 min)
- Async/await throughout

### Frontend
- React component memoization
- Lazy loading
- Vite code splitting
- WebSocket message batching

### Database
- Indexed columns (foreign keys)
- Optimized queries
- Connection limits

---

## Scalability Considerations

### Horizontal Scaling
- Stateless WebSocket server
- Session store externalization (Redis)
- Load balancing

### Vertical Scaling
- Increase connection pool size
- Add database read replicas
- Optimize LLM token usage

---

## Monitoring & Logging

### Current Logging
- Console logs for debugging
- Database audit trail
- Conversation history

### Production Monitoring
- Application metrics
- WebSocket connection stats
- LLM API usage tracking
- Error tracking (Sentry)
- Performance monitoring

---

## Future Enhancements

1. **Advanced AI Features**
   - Multi-modal input (images, voice)
   - Personalized recommendations
   - Predictive analytics

2. **Enhanced Scheduling**
   - Calendar integration
   - Email/SMS reminders
   - Rescheduling workflow

3. **Extended Functionality**
   - Video consultations
   - Prescription management
   - Medical records integration

---

This architecture provides a solid foundation for an educational AI medical system while maintaining extensibility for future enhancements.
