# 📊 Comprehensive Logging Guide

## 🚀 System Status
All services are running with enhanced logging:

- ✅ **MySQL**: Docker container `ai_medical_mysql` (Port 3306)
- ✅ **Backend**: Running on http://localhost:3001
- ✅ **Frontend**: Running on http://localhost:5173
- ✅ **WebSocket**: ws://localhost:3001/ws

---

## 📝 What to Look For in Logs

### 1️⃣ **When Patient Sends Message**

```
============================================================
[WebSocket] 📨 Received patient message
Session ID: abc123...
Message: "I have a headache"
============================================================
```

### 2️⃣ **Orchestrator Processing**

```
************************************************************
[Orchestrator] 🔄 Processing Patient Message #1
Session: abc123...
Patient: "I have a headache"
************************************************************
```

### 3️⃣ **DoctorAgent Question Flow**

For each question (1-6), you'll see:

```
────────────────────────────────────────────────────────────
[DoctorAgent] 🤖 Question 1/6
Response Length: 85 chars
Response Preview: How long have you been experiencing these symptoms?...
────────────────────────────────────────────────────────────

[DoctorAgent] 📊 Decision Points:
  ✓ Has DIAGNOSIS_READY marker: false
  ✓ Min questions met (3): false
  ✓ Max questions reached (6): false
  ➜ DIAGNOSIS READY: ❌ NO
```

### 4️⃣ **Diagnosis Phase Activation**

When AI decides to diagnose (after 3-6 questions):

```
████████████████████████████████████████████████████████████
[Orchestrator] ✅ DIAGNOSIS PHASE ACTIVATED
Total Messages: 8
Patient Messages: 4
████████████████████████████████████████████████████████████

[Orchestrator] 🔬 Step 2: Calling DiagnosisAgent...
[DiagnosisAgent] 📋 Extracting symptom text...
[DiagnosisAgent] Gemini Response: {"diseases":[...]}...
[DiagnosisAgent] Parsed diseases: 3
[Orchestrator] ✅ Diagnosis received: 3 diseases identified
```

### 5️⃣ **Specialty Mapping**

```
[Orchestrator] 🏥 Step 3: Calling SpecialtyMapper...
[Orchestrator] ✅ Specialty mapped: Neurology
```

### 6️⃣ **Appointment Booking**

```
[Orchestrator] 📅 Step 5: Calling BookingAgent...
[Orchestrator] ✅ Appointment booked with Doctor ID: doc_123456
```

### 7️⃣ **Response Sent**

```
============================================================
[WebSocket] 📤 Sending response to patient
State: completed
Has Diagnosis: true
Has Appointment: true
============================================================
```

---

## 🧪 Testing Scenarios

### Scenario 1: Normal Flow (3-4 Questions)
**Expected Logs:**
1. Message #1: Patient reports initial symptom
2. Question 1/6: DIAGNOSIS READY: ❌ NO
3. Message #2: Patient provides more info
4. Question 2/6: DIAGNOSIS READY: ❌ NO
5. Message #3: Patient clarifies symptoms
6. Question 3/6: DIAGNOSIS READY: ❌ NO (min met, but AI wants more info)
7. Message #4: Patient gives detailed answer
8. Question 4/6: DIAGNOSIS READY: ✅ YES
9. DIAGNOSIS PHASE ACTIVATED
10. Specialty mapped, appointment booked

### Scenario 2: Maximum Questions (6 Questions)
**Expected Logs:**
1. Questions 1-5: DIAGNOSIS READY: ❌ NO
2. Question 6/6: Max questions reached: true → DIAGNOSIS READY: ✅ YES
3. Forced transition to diagnosis phase

### Scenario 3: Quick Diagnosis (AI Decides Early)
**Expected Logs:**
1. Question 1-2/6: DIAGNOSIS READY: ❌ NO
2. Question 3/6: AI responds with "DIAGNOSIS_READY" → ✅ YES
3. Diagnosis phase starts

---

## 🔍 Debugging Tips

### If AI Asks Too Few Questions
Look for:
```
[DoctorAgent] 📊 Decision Points:
  ✓ Has DIAGNOSIS_READY marker: true  ← AI sent marker too early
```
**Fix**: Check if patient symptoms are very clear/specific

### If AI Asks Too Many Questions
Look for:
```
[DoctorAgent] 🤖 Question 6/6
  ✓ Max questions reached (6): true
  ➜ DIAGNOSIS READY: ✅ YES  ← Force triggered
```
**Expected**: System should force diagnosis at question 6

### If Diagnosis Fails
Look for:
```
[DiagnosisAgent] ❌ No JSON found in response
```
**Cause**: Gemini API didn't return proper JSON format

### If No Specialty Found
Look for:
```
[SpecialtyMapper] ⚠️ No matching specialty found for diseases
```
**Cause**: Disease names don't match specialty mapping rules

---

## 📊 Log Legend

| Symbol | Meaning |
|--------|---------|
| 🤖 | DoctorAgent action |
| 🔬 | DiagnosisAgent action |
| 🏥 | SpecialtyMapper action |
| 📅 | BookingAgent action |
| 🔄 | Orchestrator processing |
| 📨 | Incoming message |
| 📤 | Outgoing message |
| ✅ | Success/Positive check |
| ❌ | Negative check/Not ready |
| ⚠️ | Warning |
| ➜ | Decision result |

---

## 🎯 Quick Test Command

Open http://localhost:5173, start consultation, and paste:

**Test Message 1:**
```
I have been having severe headaches for 3 days
```

**Expected Log Flow:**
- WebSocket receives message
- Orchestrator processes
- DoctorAgent Q1: Asks about severity/location
- Response sent

**Test Message 2:**
```
The pain is on the right side, very sharp, and gets worse with light
```

**Expected Log Flow:**
- DoctorAgent Q2: Asks about triggers or associated symptoms
- Should NOT trigger diagnosis yet (only 2 questions)

**Test Message 3:**
```
Yes, I also feel nauseous and sometimes see flashing lights
```

**Expected Log Flow:**
- DoctorAgent Q3: Min questions met, may ask more or trigger diagnosis
- Check "DIAGNOSIS READY" decision

---

## 🚨 Common Issues

### 1. No Logs Appearing
- Check terminal IDs: Backend should show logs
- Verify WebSocket connection: Frontend console should show "Connected"

### 2. Logs Show "Session not found"
- Patient didn't click "Start Consultation"
- Session expired (30 min timeout)

### 3. Diagnosis Never Triggers
- Check if DoctorAgent question count incrementing
- Verify `hasEnoughQuestions` becomes true at Q3

### 4. Backend Crashes
- Check Gemini API key is valid
- Verify MySQL connection (should see "✅ Connected to MySQL Database")

---

## 📈 Performance Metrics

Track these values in logs:

- **Questions Asked**: Should be 3-6
- **Response Time**: Gemini API typically 1-3 seconds
- **Diseases Identified**: Usually 3-5
- **Session Duration**: Full consultation typically 2-5 minutes

---

## 🔧 Log Configuration

Current settings in code:

```typescript
MIN_QUESTIONS: 3  // Minimum before allowing diagnosis
MAX_QUESTIONS: 6  // Force diagnosis after this
SESSION_TIMEOUT: 30 minutes
```

To adjust logging verbosity, modify console.log statements in:
- `WebSocketServer.ts`
- `AgentOrchestrator.ts`
- `DoctorAgent.ts`
- `DiagnosisAgent.ts`

---

**Last Updated**: System restarted with comprehensive logging
**Backend Process**: Running with enhanced logs
**Frontend Process**: Running on Vite dev server
**MySQL**: Docker container healthy

🎉 **Ready for Testing!**
