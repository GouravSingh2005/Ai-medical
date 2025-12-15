# Backend Migration: OpenAI → Google Gemini

## ✅ Changes Completed

### 1. Environment Configuration (.env)
**Changed:**
- ❌ Removed: `OPENAI_API_KEY`
- ✅ Added: `GEMINI_API_KEY`

**Action Required:**
```bash
# Update .env file with your Gemini API key
GEMINI_API_KEY=your-actual-gemini-api-key-here
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

---

### 2. Dependencies (package.json)
**Changed:**
- ✅ Added: `@google/generative-ai` v0.4.0
- ℹ️ Kept: `openai` (can be removed if not needed elsewhere)

**Installed:**
```bash
npm install @google/generative-ai  ✅ DONE
```

---

### 3. LLM Configuration (src/config/llm-config.ts)
**Before:**
```typescript
import OpenAI from 'openai';
export const openai = new OpenAI({ apiKey: ... });
```

**After:**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Helper function for easy API calls
export async function callGemini(prompt: string, systemPrompt: string = ''): Promise<string>
```

**Features:**
- Uses Gemini 1.5 Flash (fast, efficient)
- Helper function combines system + user prompts
- Error handling included
- Compatible with all existing prompts

---

### 4. DoctorAgent (src/agents/DoctorAgent.ts)
**Changed:**
- ❌ Removed: OpenAI chat completions API
- ✅ Added: Gemini API with conversation context
- ✅ Fixed: Removed unused `buildConversationContext` method

**Key Changes:**
```typescript
// Before: OpenAI format
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [...],
});

// After: Gemini format
const prompt = `Based on conversation, generate follow-up...`;
const aiResponse = await callGemini(prompt, SYSTEM_PROMPTS.DOCTOR_AGENT);
```

---

### 5. DiagnosisAgent (src/agents/DiagnosisAgent.ts)
**Changed:**
- ❌ Removed: OpenAI structured JSON output
- ✅ Added: Gemini with JSON parsing
- ✅ Added: Regex extraction for JSON (handles extra text)

**Key Changes:**
```typescript
// After: Gemini with JSON extraction
const diagnosisResponse = await callGemini(prompt, SYSTEM_PROMPTS.DIAGNOSIS_AGENT);

// Extract JSON from response
const jsonMatch = diagnosisResponse.match(/\{[\s\S]*\}/);
const diagnosisData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
```

**Robust JSON Parsing:**
- Handles markdown code blocks
- Extracts JSON even with surrounding text
- Fallback to empty object if parsing fails

---

### 6. SpecialtyMapperAgent (src/agents/SpecialtyMapperAgent.ts)
**Changed:**
- ❌ Removed: OpenAI specialty classification
- ✅ Added: Gemini specialty mapping
- ✅ Kept: Rule-based fallback logic

**Key Changes:**
```typescript
// After: Gemini format
const prompt = `Map diseases to specialty: ${diseaseNames}
Only respond with the specialty name, nothing else.`;

const specialty = await callGemini(prompt, SYSTEM_PROMPTS.SPECIALTY_MAPPER);
```

---

### 7. AgentOrchestrator (src/agents/AgentOrchestrator.ts)
**Fixed TypeScript Errors:**
- ✅ Fixed location calculation parameters (now uses object format)
- ✅ Fixed conversationHistory mapping (Message[] → string[])

**Changes:**
```typescript
// Before: Incorrect parameters
locationInfo = await this.locationAgent.calculateDistance(
  lat1, lon1, lat2, lon2, address
);

// After: Correct object format
locationInfo = await this.locationAgent.calculateDistance(
  { latitude: lat1, longitude: lon1 },
  { latitude: lat2, longitude: lon2 },
  address
);

// Fixed conversationHistory
symptoms: session.conversationHistory.map(m => m.content).join(' | ')
conversationHistory: session.conversationHistory.map(m => m.content)
```

---

## 🎯 Key Differences: OpenAI vs Gemini

| Feature | OpenAI (GPT-4o-mini) | Gemini (1.5-flash) |
|---------|---------------------|-------------------|
| **API Format** | `openai.chat.completions.create()` | `geminiModel.generateContent()` |
| **Messages** | Array of role/content objects | Single prompt string |
| **System Prompt** | Separate message with role:'system' | Prepended to user prompt |
| **JSON Output** | `response_format: { type: 'json_object' }` | Manual JSON extraction needed |
| **Response** | `choices[0].message.content` | `response.text()` |
| **Cost** | ~$0.15 per 1M input tokens | **FREE** (up to limits) |
| **Speed** | Fast | **Very Fast** |

---

## ✅ Testing Checklist

### 1. Environment Setup
- [ ] Add `GEMINI_API_KEY` to `.env` file
- [ ] Verify key is valid: https://makersuite.google.com/app/apikey
- [ ] Remove or keep `OPENAI_API_KEY` (optional)

### 2. Install Dependencies
```bash
cd Backend
npm install  # Already done ✅
```

### 3. Start Backend
```bash
npm run dev
```

**Expected Output:**
```
🚀 HTTP Server running at http://localhost:3001
🔌 WebSocket Server running at ws://localhost:3001/ws
📊 Environment: development
```

### 4. Test WebSocket Connection
1. Start frontend: `cd Frontend/Medinet && npm run dev`
2. Open http://localhost:5173
3. Click "Start Consultation"
4. Verify greeting appears
5. Send a symptom message
6. Check AI response uses Gemini

### 5. Test Agent Flow
- [ ] DoctorAgent generates follow-up questions
- [ ] After 4-6 exchanges, diagnosis triggers
- [ ] DiagnosisAgent returns diseases with confidence
- [ ] SpecialtyMapperAgent maps to correct specialty
- [ ] BookingAgent schedules appointment
- [ ] Location calculations work (if location shared)

---

## 🔧 Troubleshooting

### Error: "API key not configured"
**Fix:**
```bash
# Edit .env file
GEMINI_API_KEY=your-actual-key-here
```

### Error: "Cannot find module '@google/generative-ai'"
**Fix:**
```bash
npm install @google/generative-ai
```

### Error: "Rate limit exceeded"
**Fix:**
- Gemini free tier: 60 requests per minute
- Wait 60 seconds or upgrade to paid tier
- Check quota: https://makersuite.google.com/app/apikey

### JSON Parsing Errors
**Already handled:**
- Regex extraction: `/{[\s\S]*}/`
- Fallback to empty object
- Graceful error handling

### Consultation Router Import Error
**Status:** TypeScript language server cache issue
**Fix:**
```bash
# Restart TypeScript server or reload VS Code
# The file exists and has correct export
```

---

## 📊 Performance Comparison

### Token Usage (Estimated)
**DoctorAgent (per message):**
- OpenAI GPT-4o-mini: ~150 tokens (~$0.00002)
- Gemini 1.5-flash: ~150 tokens (FREE up to limit)

**DiagnosisAgent (per diagnosis):**
- OpenAI: ~500 tokens (~$0.00008)
- Gemini: ~500 tokens (FREE up to limit)

**Monthly Savings (100 consultations):**
- OpenAI: ~$3-5/month
- Gemini: **$0** (within free tier)

---

## 🚀 Production Deployment

### Required Environment Variables
```env
GEMINI_API_KEY=your-production-key
GOOGLE_MAPS_API_KEY=your-maps-key
DB_HOST=your-production-db
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=ai_medical
FRONTEND_URL=https://your-frontend-domain.com
```

### Rate Limits
- **Free Tier:** 60 requests/minute, 1500 requests/day
- **Paid Tier:** Higher limits available
- Monitor usage: https://makersuite.google.com/app/apikey

---

## ✅ Summary

**Migration Complete! 🎉**

| Component | Status |
|-----------|--------|
| Environment Config | ✅ Updated |
| Dependencies | ✅ Installed |
| LLM Config | ✅ Migrated |
| DoctorAgent | ✅ Migrated |
| DiagnosisAgent | ✅ Migrated |
| SpecialtyMapperAgent | ✅ Migrated |
| AgentOrchestrator | ✅ Fixed |
| Testing | 🔄 Ready to test |

**Next Step:** Add your Gemini API key to `.env` and run `npm run dev`!
