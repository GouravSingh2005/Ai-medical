# Extension Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide helps you quickly set up the new **Report & Communication Agent** and **Location & Distance Agent** features.

---

## Prerequisites

✅ Existing system already installed and working  
✅ Node.js 18+ installed  
✅ MySQL 8+ running  
✅ OpenAI API key configured  

---

## Step 1: Install Dependencies (1 minute)

```bash
cd Backend
npm install nodemailer @types/nodemailer twilio axios @googlemaps/google-maps-services-js
```

**Or run the automated script:**
```bash
chmod +x setup-extension.sh
./setup-extension.sh
```

---

## Step 2: Update Database Schema (1 minute)

```bash
# Update Doctor table with clinic location fields
mysql -u root -p medical_ai_system < database.sql

# Load doctor clinic coordinates
mysql -u root -p medical_ai_system < seed-data.sql
```

**What this adds:**
- `clinic_address` - Full clinic address
- `clinic_latitude` - Latitude coordinate
- `clinic_longitude` - Longitude coordinate  
- `whatsapp_number` - Doctor's WhatsApp number

---

## Step 3: Configure Environment Variables (2 minutes)

### Required (System will work with these):

```env
# Google Maps API (Required for distance calculation)
GOOGLE_MAPS_API_KEY=AIzaSy-your-key-here
```

**Get Google Maps API Key:**
1. Go to https://console.cloud.google.com/
2. Create project → Enable APIs → Distance Matrix API
3. Credentials → Create API Key
4. Copy key to `.env`

### Optional (Features work without these, but recommended):

```env
# Email Reports (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx

# WhatsApp Reports (Optional)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=+14155238886
```

**Get Gmail App Password:**
1. Google Account → Security → 2-Step Verification (enable)
2. App Passwords → Mail → Generate
3. Copy 16-char password to `SMTP_PASS`

**Get Twilio Credentials:**
1. https://www.twilio.com/try-twilio (free trial)
2. Console → Account SID + Auth Token
3. Messaging → WhatsApp Sandbox → Join sandbox
4. Copy credentials to `.env`

---

## Step 4: Start the System (30 seconds)

```bash
# Backend
cd Backend
npm run dev

# Frontend (in new terminal)
cd Frontend/Medinet
npm run dev
```

---

## Step 5: Test the Extension (30 seconds)

1. **Open browser:** http://localhost:5173
2. **Allow location permission** when prompted (or skip)
3. **Start consultation** and answer AI questions
4. **View final response** - should include:
   - ✅ AI Diagnosis
   - ✅ Appointment confirmation
   - ✅ **Clinic distance & travel time** (NEW)
   - ✅ **Google Maps navigation link** (NEW)
   - ✅ **Report delivery confirmation** (NEW)

5. **Check doctor's email/WhatsApp** for report (if configured)

---

## What You Should See

### In Browser Console:
```
📍 Location captured: 13.0827, 80.2707
📍 Location sent: 13.0827, 80.2707
```

### In Backend Console:
```
✅ Email service configured
✅ WhatsApp service configured
✅ Location service configured
📍 Location updated for session: abc-123 (13.0827, 80.2707)
🗺️ Distance calculated: 8.5 km, 22 mins
📧 Email sent to doctor@example.com: <message-id>
📱 WhatsApp sent to +91xxxxxxxxxx: SM...
```

### In Chat Response:
```
📅 Your appointment has been scheduled:
Doctor: Dr. Rajesh Kumar
Date: December 17, 2024
Time: 10:00 AM

📍 Clinic Location:
Distance: 8.5 km
Travel Time: 22 mins
🗺️ Navigation: https://www.google.com/maps/dir/?api=1&origin=...

✅ Medical report has been sent to Dr. Rajesh Kumar via email and WhatsApp.
```

---

## Troubleshooting

### Location not captured?
- ✅ Check browser console for errors
- ✅ Allow location permission when prompted
- ✅ System continues without location (non-blocking)

### Distance not showing?
- ✅ Verify `GOOGLE_MAPS_API_KEY` in `.env`
- ✅ Enable Distance Matrix API in Google Cloud Console
- ✅ Check API key restrictions (should allow Distance Matrix API)
- ✅ System falls back to straight-line distance if API unavailable

### Email not sent?
- ✅ Check `SMTP_*` variables in `.env`
- ✅ Use Gmail App Password, not regular password
- ✅ Enable 2FA in Gmail first
- ✅ Console shows: `⚠️ Email service not configured` if missing

### WhatsApp not sent?
- ✅ Check `TWILIO_*` variables in `.env`
- ✅ Join Twilio WhatsApp sandbox first: Send `join <code>` to +1 415 523 8886
- ✅ Verify doctor has `whatsapp_number` in database
- ✅ Console shows: `⚠️ WhatsApp service not configured` if missing

---

## Graceful Degradation

The system is designed to work even if some services are unavailable:

| Feature | If Missing | System Behavior |
|---------|-----------|-----------------|
| Location Permission | Denied | ✅ Continues without distance calculation |
| Google Maps API | Not configured | ✅ Falls back to straight-line distance |
| SMTP Credentials | Not configured | ✅ Skips email, continues normally |
| Twilio Credentials | Not configured | ✅ Skips WhatsApp, continues normally |

**All features are optional except:**
- ✅ Database (MySQL)
- ✅ OpenAI API

---

## Verify Installation

Run this command to check agent status:

```bash
cd Backend
npm run dev
```

**Expected console output:**
```
✅ Email service configured
✅ WhatsApp service configured
✅ Location service configured
🚀 WebSocket server initialized on /ws
✅ Server running on port 3001
```

**If you see warnings:**
```
⚠️ Email service not configured (SMTP credentials missing)
⚠️ WhatsApp service not configured (Twilio credentials missing)
```

→ These are optional. System works without them, but reports won't be sent.

---

## Next Steps

### For Development:
- ✅ Review `EXTENSION_SUMMARY.md` for complete details
- ✅ Read `ENV_CONFIGURATION.md` for full setup guide
- ✅ Check agent source code in `Backend/src/agents/`

### For Production:
- 🔐 Apply for WhatsApp Business API (Twilio sandbox only for testing)
- 🔐 Set up proper SMTP service (SendGrid, Mailgun, AWS SES)
- 🔐 Restrict Google Maps API key to production domains
- 🔐 Enable HTTPS/WSS for WebSocket
- 🔐 Use environment secrets manager (AWS Secrets Manager, Azure Key Vault)

---

## Summary

### What's New:
✅ **Distance Calculation:** Real-time distance between patient & doctor  
✅ **Navigation Links:** Google Maps navigation for patients  
✅ **Email Reports:** Comprehensive HTML reports to doctors  
✅ **WhatsApp Reports:** Quick summaries via Twilio WhatsApp  
✅ **Geolocation:** Automatic browser location capture  

### Files Added:
- `Backend/src/agents/LocationDistanceAgent.ts`
- `Backend/src/agents/ReportCommunicationAgent.ts`
- `Backend/ENV_CONFIGURATION.md`
- `Backend/EXTENSION_SUMMARY.md`
- `Backend/EXTENSION_QUICKSTART.md` (this file)

### Dependencies Added:
```json
{
  "nodemailer": "^6.9.7",
  "@types/nodemailer": "^6.4.14",
  "twilio": "^4.19.0",
  "axios": "^1.6.2",
  "@googlemaps/google-maps-services-js": "^3.3.42"
}
```

---

## Support

**Documentation:**
- 📘 Complete setup: `ENV_CONFIGURATION.md`
- 📗 Extension details: `EXTENSION_SUMMARY.md`
- 📙 Main system: `README.md`

**APIs:**
- Google Maps: https://developers.google.com/maps/documentation/distance-matrix
- Twilio: https://www.twilio.com/docs/whatsapp
- Nodemailer: https://nodemailer.com/

---

**🎉 You're all set! Enjoy the enhanced medical consultation system!**
