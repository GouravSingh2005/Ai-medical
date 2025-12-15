# Testing Guide - Agentic AI Medical System

## Overview
This guide provides comprehensive testing procedures for the Agentic AI Medical Assistance System.

---

## Prerequisites for Testing

- [ ] Backend server running (`npm run dev` in Backend/)
- [ ] Frontend server running (`npm run dev` in Frontend/Medinet/)
- [ ] MySQL database initialized with schema
- [ ] OpenAI API key configured
- [ ] Sample data loaded (optional but recommended)

---

## Test Scenarios

### Scenario 1: Basic Consultation Flow (Happy Path)

**Objective**: Test complete consultation from start to appointment scheduling

**Steps**:
1. Open `http://localhost:5173`
2. Click "Start Consultation"
3. Describe symptoms: "I have a severe headache and fever for 3 days"
4. Answer AI questions (example responses):
   - "The headache is around 8/10 in severity"
   - "Yes, I feel nauseous and light hurts my eyes"
   - "My fever is around 102°F"
   - "It started suddenly 3 days ago"
5. Wait for diagnosis
6. Verify appointment is scheduled

**Expected Results**:
- ✅ AI asks 3-6 relevant follow-up questions
- ✅ Diagnosis shows predicted diseases with confidence scores
- ✅ Severity level is calculated (should be "high" or "critical")
- ✅ Specialty is recommended (likely "Neurology")
- ✅ Appointment is auto-scheduled within 1-2 days
- ✅ All messages appear in real-time

**Database Verification**:
```sql
-- Check consultation was created
SELECT * FROM Consultation ORDER BY session_start DESC LIMIT 1;

-- Check conversation logs
SELECT * FROM ConversationLog WHERE Consultation_ID = '<your-consultation-id>' ORDER BY timestamp;

-- Check diagnosis was saved
SELECT * FROM Diagnosis WHERE Consultation_ID = '<your-consultation-id>';

-- Check appointment was created
SELECT * FROM Appointment WHERE Consultation_ID = '<your-consultation-id>';
```

---

### Scenario 2: Low Severity Consultation

**Objective**: Test system handles low-priority cases correctly

**Steps**:
1. Start new consultation
2. Describe mild symptoms: "I have a mild cold and runny nose"
3. Answer questions:
   - "Started yesterday"
   - "It's mild, around 3/10"
   - "No fever, just some sneezing"

**Expected Results**:
- ✅ Diagnosis shows common cold or similar
- ✅ Severity level is "low"
- ✅ Appointment scheduled 7-14 days out
- ✅ Specialty: "General Medicine"

---

### Scenario 3: Critical Urgency Test

**Objective**: Test priority scheduling for critical cases

**Steps**:
1. Start consultation
2. Describe: "I have severe chest pain radiating to my left arm"
3. Continue: "It started suddenly 30 minutes ago, very intense"
4. Add: "I'm also feeling short of breath and dizzy"

**Expected Results**:
- ✅ Severity level: "critical" or "high"
- ✅ Specialty: "Cardiology"
- ✅ Appointment: Same day or next day
- ✅ Priority: 1 or 2

---

### Scenario 4: WebSocket Reconnection

**Objective**: Test system handles connection issues

**Steps**:
1. Start consultation
2. Send first message
3. Disconnect Wi-Fi or stop backend
4. Try to send message (should fail gracefully)
5. Reconnect and restart backend
6. Refresh page

**Expected Results**:
- ✅ UI shows "Connecting..." when disconnected
- ✅ No crash or error messages to user
- ✅ Reconnects automatically
- ✅ Can start new session after reconnection

---

### Scenario 5: Multiple Concurrent Sessions

**Objective**: Test system handles multiple users simultaneously

**Steps**:
1. Open 2-3 browser tabs/windows
2. Start consultation in each
3. Send messages from different tabs
4. Verify each session is independent

**Expected Results**:
- ✅ Each session has unique session ID
- ✅ Messages don't mix between sessions
- ✅ All sessions complete successfully

**Backend Verification**:
```bash
curl http://localhost:3001/ws/stats
# Should show multiple active connections
```

---

### Scenario 6: Agent Fallback Testing

**Objective**: Test system when OpenAI API is unavailable

**Steps**:
1. Temporarily set invalid OpenAI API key in `.env`
2. Restart backend
3. Start consultation

**Expected Results**:
- ✅ System uses fallback questions
- ✅ Diagnosis uses rule-based approach
- ✅ No system crash
- ✅ User receives some response (even if basic)

**Restore**:
- Reset correct API key and restart

---

### Scenario 7: Database Query Testing

**Objective**: Verify data persistence

**Test Queries**:

```sql
-- Test 1: View all consultations
SELECT 
    c.Consultation_ID,
    p.name as patient_name,
    c.symptoms,
    c.severity_score,
    c.specialty_recommended,
    c.status
FROM Consultation c
JOIN Patient p ON c.Patient_ID = p.Patient_ID
ORDER BY c.session_start DESC;

-- Test 2: View conversation for specific consultation
SELECT 
    message_type,
    message_text,
    timestamp
FROM ConversationLog
WHERE Consultation_ID = '<consultation-id>'
ORDER BY timestamp ASC;

-- Test 3: View appointments with doctor info
SELECT 
    a.appointment_date,
    a.appointment_time,
    a.severity_priority,
    d.name as doctor_name,
    d.specialty,
    p.name as patient_name
FROM Appointment a
JOIN Doctor d ON a.Doctor_ID = d.Doctor_ID
JOIN Patient p ON a.Patient_ID = p.Patient_ID
ORDER BY a.appointment_date, a.appointment_time;

-- Test 4: Check AI diagnosis accuracy
SELECT 
    d.disease_name,
    d.confidence_score,
    d.severity_level,
    c.symptoms
FROM Diagnosis d
JOIN Consultation c ON d.Consultation_ID = c.Consultation_ID
ORDER BY d.created_at DESC;
```

---

## API Testing

### REST Endpoints

**Health Check**:
```bash
curl http://localhost:3001/health
```

**Get Consultation**:
```bash
curl http://localhost:3001/consultation/<consultation-id>
```

**Get Patient Consultations**:
```bash
curl http://localhost:3001/consultation/patient/<patient-id>
```

**WebSocket Stats**:
```bash
curl http://localhost:3001/ws/stats
```

---

## Performance Testing

### Load Test (Simple)
```bash
# Install Apache Bench
sudo apt-get install apache2-utils  # Linux
brew install httpd  # macOS

# Test HTTP endpoints
ab -n 1000 -c 10 http://localhost:3001/health

# Results should show:
# - All requests successful (200 status)
# - Average response time < 100ms
```

### WebSocket Connection Test
```javascript
// Create test script: test-ws.js
const WebSocket = require('ws');

const numConnections = 10;
const connections = [];

for (let i = 0; i < numConnections; i++) {
  const ws = new WebSocket('ws://localhost:3001/ws');
  
  ws.on('open', () => {
    console.log(`Connection ${i + 1} opened`);
  });
  
  connections.push(ws);
}

// Run: node test-ws.js
```

---

## Integration Testing Checklist

### Doctor Agent
- [ ] Generates appropriate greeting
- [ ] Asks relevant follow-up questions
- [ ] Recognizes when sufficient info collected
- [ ] Extracts symptoms correctly
- [ ] Handles API failures gracefully

### Diagnosis Agent
- [ ] Analyzes symptoms accurately
- [ ] Generates disease predictions
- [ ] Calculates severity scores
- [ ] Determines urgency levels
- [ ] Provides recommendations

### Specialty Mapper
- [ ] Maps common diseases correctly
- [ ] Falls back to LLM when needed
- [ ] Validates specialty names
- [ ] Handles unknown conditions

### Booking Agent
- [ ] Finds available doctors
- [ ] Schedules based on priority
- [ ] Assigns correct time slots
- [ ] Handles no-doctor-available case

### Logger Agent
- [ ] Records all messages
- [ ] Creates consultation records
- [ ] Updates diagnosis results
- [ ] Logs appointments

---

## Common Issues & Solutions

### Issue: "WebSocket connection failed"
```bash
# Check if backend is running
curl http://localhost:3001/health

# Check WebSocket endpoint
curl http://localhost:3001/ws/stats

# Verify port is not blocked
lsof -i :3001
```

### Issue: "OpenAI API errors"
```bash
# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check .env file
cat Backend/.env | grep OPENAI_API_KEY
```

### Issue: "No doctors available"
```sql
-- Check doctor data
SELECT * FROM Doctor WHERE availability_status = 'Available';

-- If empty, load sample data
source seed-data.sql;
```

---

## Test Data Generation

### Create Test Patients
```sql
INSERT INTO Patient (Patient_ID, email, password, name, phone, age, gender) VALUES
(UUID(), 'test1@test.com', '$2b$10$hash', 'Test Patient 1', '+1234567890', 30, 'Male'),
(UUID(), 'test2@test.com', '$2b$10$hash', 'Test Patient 2', '+1234567891', 25, 'Female');
```

### Sample Symptom Sets for Testing

**Test Set 1 - Cardiology**:
- "Chest pain radiating to left arm"
- "Shortness of breath"
- "Irregular heartbeat"

**Test Set 2 - Neurology**:
- "Severe headache with visual disturbances"
- "Numbness in hands"
- "Dizziness and balance issues"

**Test Set 3 - Dermatology**:
- "Red itchy rash on arms"
- "Dry flaky skin"
- "Recent new mole"

**Test Set 4 - General Medicine**:
- "Mild fever and cough"
- "Feeling tired"
- "Sore throat"

---

## Automated Testing (Future)

### Unit Tests (Recommended)
```bash
# Install Jest
npm install --save-dev jest @types/jest ts-jest

# Create test files
# Backend/src/__tests__/agents.test.ts
```

### E2E Tests (Recommended)
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Create E2E tests
# Frontend/e2e/consultation.spec.ts
```

---

## Test Results Documentation

### Template
```markdown
## Test Run: [Date]

**Environment**:
- Backend Version: 1.0.0
- Node.js: v18.x
- MySQL: v8.x
- OpenAI Model: gpt-4o-mini

**Test Results**:
| Scenario | Status | Duration | Notes |
|----------|--------|----------|-------|
| Basic Consultation | ✅ Pass | 2 min | All agents worked correctly |
| Low Severity | ✅ Pass | 1.5 min | Scheduled 7 days out |
| Critical Urgency | ✅ Pass | 2 min | Same-day appointment |
| Reconnection | ⚠️ Partial | N/A | Manual reconnect needed |
| Concurrent Sessions | ✅ Pass | 5 min | 3 sessions tested |

**Issues Found**: None

**Recommendations**: Add auto-reconnect logic
```

---

## Testing Best Practices

1. **Always test with fresh database** for consistent results
2. **Use different symptom sets** for variety
3. **Monitor backend console** for errors
4. **Check browser console** for frontend issues
5. **Verify database records** after each test
6. **Document edge cases** discovered
7. **Test on different browsers** (Chrome, Firefox, Safari)
8. **Test with slow network** (throttle in DevTools)

---

## Success Criteria

A test is successful if:
- ✅ No system crashes or errors
- ✅ All agents execute in correct order
- ✅ Real-time communication works
- ✅ Data persists correctly in database
- ✅ Appointments scheduled appropriately
- ✅ User receives clear feedback
- ✅ System handles edge cases gracefully

---

**Happy Testing! 🧪**
