# Environment Configuration Guide

## Overview
This document provides comprehensive configuration instructions for all required environment variables and API keys needed to run the extended Agentic AI Medical System with Report & Communication Agent and Location & Distance Agent.

---

## Backend Environment Variables

Create a `.env` file in the `Backend/` directory with the following variables:

### Database Configuration

```env
# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=medical_ai_system
```

### OpenAI Configuration

```env
# OpenAI API for AI Doctor Agent
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

### Google Maps API Configuration

```env
# Google Maps Distance Matrix API
GOOGLE_MAPS_API_KEY=AIza-your-google-maps-api-key-here
```

**How to get Google Maps API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable **Distance Matrix API** and **Maps JavaScript API**
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **API Key**
6. Copy the API key and add it to `.env`
7. **Important:** Restrict the API key to specific APIs (Distance Matrix, Maps JavaScript)

### Email Configuration (Nodemailer)

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

**Gmail App Password Setup:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to **App Passwords** section
4. Select **Mail** and **Other (Custom name)** → Enter "Medical AI System"
5. Click **Generate** and copy the 16-character password
6. Use this password in `SMTP_PASS` (not your regular Gmail password)

**Alternative SMTP Providers:**
- **SendGrid:** `SMTP_HOST=smtp.sendgrid.net`, `SMTP_PORT=587`
- **Mailgun:** `SMTP_HOST=smtp.mailgun.org`, `SMTP_PORT=587`
- **AWS SES:** `SMTP_HOST=email-smtp.region.amazonaws.com`, `SMTP_PORT=587`

### WhatsApp Configuration (Twilio)

```env
# Twilio WhatsApp Business API
TWILIO_ACCOUNT_SID=AC-your-account-sid-here
TWILIO_AUTH_TOKEN=your-auth-token-here
TWILIO_WHATSAPP_FROM=+14155238886
```

**Twilio WhatsApp Setup:**
1. Sign up for [Twilio Account](https://www.twilio.com/try-twilio)
2. Go to **Console** → **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Follow the instructions to connect your WhatsApp number to Twilio sandbox
4. Copy **Account SID** and **Auth Token** from Console Dashboard
5. Use Twilio WhatsApp number: `+14155238886` (sandbox) or your verified WhatsApp Business number
6. **Important:** For production, apply for [WhatsApp Business API](https://www.twilio.com/whatsapp)

**Testing WhatsApp:**
1. Send `join <sandbox-code>` to `+1 415 523 8886` from your WhatsApp
2. Example: `join coffee-speak` (your unique sandbox code will be shown in Twilio Console)

### Server Configuration

```env
# Server Port
PORT=3001

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

---

## Frontend Environment Variables

Create a `.env` file in the `Frontend/Medinet/` directory:

```env
# WebSocket URL
VITE_WS_URL=ws://localhost:3001/ws

# Backend API URL
VITE_API_URL=http://localhost:3001/api
```

---

## Complete `.env` Example (Backend)

```env
# ============================================
# Database Configuration
# ============================================
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=MySecurePassword123!
DB_NAME=medical_ai_system

# ============================================
# OpenAI Configuration
# ============================================
OPENAI_API_KEY=0000000000000000000000000000000000
OPENAI_MODEL=gpt-4o-mini

# ============================================
# Google Maps Configuration
# ============================================
GOOGLE_MAPS_API_KEY=000000000000

# ============================================
# Email Configuration (Gmail)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=yourmedicalapp@gmail.com
SMTP_PASS=abcd efgh ijkl mnop

# ============================================
# WhatsApp Configuration (Twilio)
# ============================================
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_FROM=+1234567890

# ============================================
# Server Configuration
# ============================================
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

---

## Security Best Practices

### 1. **Never commit `.env` files to Git**
Add to `.gitignore`:
```gitignore
# Environment variables
.env
.env.local
.env.production
```

### 2. **Use different `.env` files for different environments**
```bash
.env.development   # Local development
.env.staging       # Staging server
.env.production    # Production server
```

### 3. **Restrict API Keys**
- **Google Maps API:** Restrict to specific APIs and domains
- **OpenAI API:** Set usage limits and rate limits
- **Twilio:** Enable geo-permissions and webhook authentication

### 4. **Rotate API Keys Regularly**
- Change API keys every 90 days
- Immediately rotate if compromised

### 5. **Use Environment-Specific Variables**
```typescript
// config/environment.ts
export const config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  apiKeys: {
    openai: process.env.OPENAI_API_KEY!,
    googleMaps: process.env.GOOGLE_MAPS_API_KEY!,
  },
};
```

---

## Testing Configuration

### Check if all environment variables are loaded:

Create `Backend/src/config/validate-env.ts`:

```typescript
import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'OPENAI_API_KEY',
  'GOOGLE_MAPS_API_KEY',
];

const optionalEnvVars = [
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_FROM',
];

export function validateEnvironment() {
  const missing: string[] = [];
  const optional: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      optional.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((v) => console.error(`   - ${v}`));
    process.exit(1);
  }

  if (optional.length > 0) {
    console.warn('⚠️ Optional environment variables not set (features will be disabled):');
    optional.forEach((v) => console.warn(`   - ${v}`));
  }

  console.log('✅ Environment configuration valid');
}
```

Run validation:
```bash
npm run validate-env
```

---

## Troubleshooting

### Issue: OpenAI API returns 401 Unauthorized
**Solution:** Verify API key is correct and has not expired. Check billing status.

### Issue: Google Maps API returns "REQUEST_DENIED"
**Solution:** Ensure Distance Matrix API is enabled in Google Cloud Console and API key is not restricted.

### Issue: Gmail SMTP authentication failed
**Solution:** Use App Password (not regular password). Enable 2FA first.

### Issue: Twilio WhatsApp sandbox not working
**Solution:** Send `join <code>` to Twilio sandbox number from your WhatsApp. Verify sandbox is active.

### Issue: Database connection refused
**Solution:** Check MySQL is running (`sudo systemctl status mysql`). Verify credentials in `.env`.

---

## Development Mode (Graceful Degradation)

The system is designed to work even if some services are unavailable:

- **No SMTP configured:** Email reports will be skipped (logged to console)
- **No Twilio configured:** WhatsApp messages will be skipped (logged to console)
- **No Google Maps API:** Distance calculation will use Haversine formula (straight-line distance)
- **No patient location:** Distance calculation will be skipped

Check service status:
```typescript
const status = orchestrator.getCommunicationServiceStatus();
console.log('Email:', status.email ? '✅' : '❌');
console.log('WhatsApp:', status.whatsapp ? '✅' : '❌');
```

---

## Production Deployment

### For production environments:

1. **Use secure secret management:**
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Cloud Secret Manager
   - HashiCorp Vault

2. **Enable HTTPS:**
```env
SECURE=true
SSL_CERT=/path/to/cert.pem
SSL_KEY=/path/to/key.pem
```

3. **Use production WhatsApp Business API:**
```env
TWILIO_WHATSAPP_FROM=+91xxxxxxxxxx  # Your verified WhatsApp Business number
```

4. **Enable rate limiting:**
```env
RATE_LIMIT_WINDOW=15  # minutes
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Summary

✅ **Database:** MySQL credentials (required)  
✅ **OpenAI:** API key for AI Doctor (required)  
✅ **Google Maps:** API key for distance calculation (required)  
🔵 **Email (SMTP):** Gmail/SendGrid/Mailgun (optional but recommended)  
🔵 **WhatsApp (Twilio):** Twilio credentials (optional but recommended)  

**Minimum to run:** Database + OpenAI + Google Maps  
**Full features:** All services configured  

---

**For support:** Contact your system administrator or refer to official API documentation.
