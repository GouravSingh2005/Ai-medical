# Deployment Checklist

## Pre-Deployment Requirements

### Environment Setup
- [ ] Production server provisioned (AWS, Azure, DigitalOcean, etc.)
- [ ] Domain name registered
- [ ] SSL/TLS certificate obtained
- [ ] MySQL production database created
- [ ] OpenAI API key with sufficient quota
- [ ] Backup storage configured

---

## Security Hardening

### Authentication & Authorization
- [ ] Implement JWT authentication
- [ ] Add refresh token mechanism
- [ ] Create role-based access control (Patient/Doctor/Admin)
- [ ] Add session management
- [ ] Implement password reset flow
- [ ] Add email verification

### API Security
- [ ] Enable rate limiting (express-rate-limit)
- [ ] Add input validation and sanitization
- [ ] Implement SQL injection prevention
- [ ] Add XSS protection headers
- [ ] Configure CSRF tokens
- [ ] Set up API key rotation

### Data Protection
- [ ] Encrypt sensitive data at rest
- [ ] Use HTTPS/WSS only
- [ ] Hash passwords with bcrypt (rounds >= 10)
- [ ] Implement data anonymization
- [ ] Add audit logging
- [ ] Configure database encryption

### CORS & Headers
```typescript
// Production CORS config
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers
app.use(helmet());
app.use(compression());
```

---

## Database Configuration

### Production Database
- [ ] Use connection pooling
- [ ] Set up read replicas
- [ ] Configure automated backups
- [ ] Enable binary logging
- [ ] Set up monitoring
- [ ] Optimize indexes

```sql
-- Production optimizations
ALTER TABLE ConversationLog ADD INDEX idx_consultation (Consultation_ID);
ALTER TABLE Appointment ADD INDEX idx_date_time (appointment_date, appointment_time);
ALTER TABLE Consultation ADD INDEX idx_patient_status (Patient_ID, status);
```

### Backup Strategy
- [ ] Daily automated backups
- [ ] Weekly full backups
- [ ] Test restore procedures
- [ ] Off-site backup storage
- [ ] Backup retention policy (30 days)

---

## Environment Variables

### Backend .env (Production)
```env
# Database
DB_HOST=production-db-host
DB_USER=app_user
DB_PASSWORD=<strong-password>
DB_NAME=medical_ai_prod
DB_PORT=3306

# OpenAI
OPENAI_API_KEY=<production-key>

# Server
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com

# Security
JWT_SECRET=<random-256-bit-key>
JWT_EXPIRY=15m
REFRESH_TOKEN_SECRET=<random-256-bit-key>
REFRESH_TOKEN_EXPIRY=7d

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Session
SESSION_SECRET=<random-256-bit-key>
SESSION_TIMEOUT_MS=1800000

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/medical-ai/app.log

# Email (for notifications)
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASSWORD=<password>
```

---

## Frontend Configuration

### Build Configuration
```bash
# Build for production
cd Frontend/Medinet
npm run build

# Output: dist/ folder
```

### Environment Variables
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/ws
VITE_ENV=production
```

---

## Server Setup

### Node.js Application

**Option 1: PM2 (Recommended)**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/index.js --name medical-ai-backend

# Configure auto-restart
pm2 startup
pm2 save

# Monitor
pm2 monit
```

**Option 2: Docker**
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

```bash
# Build and run
docker build -t medical-ai-backend .
docker run -d -p 3001:3001 --name backend medical-ai-backend
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/medical-ai

upstream backend {
    server localhost:3001;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend (static files)
    root /var/www/medical-ai/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }
}
```

---

## Monitoring & Logging

### Application Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure performance monitoring (New Relic/DataDog)
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure alerts (PagerDuty)

### Logging Setup
```typescript
// Install winston
npm install winston

// Configure logger
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### Database Monitoring
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Monitor connections
SHOW PROCESSLIST;

-- Check table sizes
SELECT 
    table_name,
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'medical_ai_prod'
ORDER BY (data_length + index_length) DESC;
```

---

## Performance Optimization

### Backend
- [ ] Enable gzip compression
- [ ] Implement caching (Redis)
- [ ] Optimize database queries
- [ ] Use connection pooling
- [ ] Minify responses
- [ ] Implement CDN for static assets

```typescript
// Redis caching example
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache doctor availability
const cacheKey = `doctors:${specialty}`;
let doctors = await redis.get(cacheKey);

if (!doctors) {
  doctors = await queryDatabase();
  await redis.setex(cacheKey, 300, JSON.stringify(doctors)); // 5 min cache
}
```

### Frontend
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] Service worker (PWA)

---

## Testing in Production

### Smoke Tests
```bash
# Health check
curl https://yourdomain.com/health

# API test
curl -X POST https://yourdomain.com/api/test \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# WebSocket test
wscat -c wss://yourdomain.com/ws
```

### Load Testing
```bash
# Install k6
brew install k6  # macOS
# or download from k6.io

# Load test script
cat > load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up
    { duration: '5m', target: 50 },  // Stay at 50
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function() {
  let res = http.get('https://yourdomain.com/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
EOF

# Run load test
k6 run load-test.js
```

---

## Compliance & Legal

### HIPAA Compliance (if applicable)
- [ ] Business Associate Agreement (BAA)
- [ ] Access controls
- [ ] Audit trails
- [ ] Data encryption
- [ ] Incident response plan
- [ ] Privacy policy
- [ ] Terms of service

### GDPR Compliance (EU users)
- [ ] Data protection officer
- [ ] Privacy policy
- [ ] Cookie consent
- [ ] Data export capability
- [ ] Right to deletion
- [ ] Data processing agreement

### General Legal
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Disclaimer (NOT medical advice)
- [ ] Cookie policy
- [ ] User consent forms

---

## CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          cd Backend
          npm install
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/medical-ai
            git pull
            cd Backend && npm install && npm run build
            pm2 restart medical-ai-backend
```

---

## Go-Live Checklist

### Final Verification
- [ ] All tests passing
- [ ] SSL certificate valid
- [ ] DNS configured correctly
- [ ] Database backups working
- [ ] Monitoring alerts configured
- [ ] Error tracking working
- [ ] Load balancer configured (if applicable)
- [ ] CDN configured (if applicable)

### Communication
- [ ] Notify stakeholders
- [ ] Prepare support documentation
- [ ] Set up feedback channels
- [ ] Plan maintenance windows

### Post-Launch
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Review logs daily (first week)
- [ ] Collect user feedback
- [ ] Plan iteration cycle

---

## Rollback Plan

If issues occur:
```bash
# Quick rollback with PM2
pm2 restart medical-ai-backend --update-env

# Restore database backup
mysql -u user -p medical_ai_prod < backup_YYYYMMDD.sql

# Revert git commit
git revert HEAD
npm run build
pm2 restart all
```

---

## Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review performance metrics

### Weekly
- [ ] Database backup verification
- [ ] Security updates
- [ ] Performance review

### Monthly
- [ ] Full system audit
- [ ] Dependency updates
- [ ] Cost analysis
- [ ] User feedback review

---

## Cost Estimation

### Infrastructure (Monthly)
- Server: $20-100 (AWS/DigitalOcean)
- Database: $15-50 (managed MySQL)
- SSL: $0 (Let's Encrypt)
- CDN: $0-20 (Cloudflare)
- Monitoring: $0-50 (Sentry free tier)
- **Total**: ~$35-220/month

### API Costs
- OpenAI: $0.002 per 1K tokens
- Estimated: $10-50/month for moderate use

### Total Monthly: **$45-270**

---

## Support & Maintenance

### Documentation
- [ ] User guide
- [ ] Admin guide
- [ ] API documentation
- [ ] Troubleshooting guide

### Support Channels
- [ ] Email support
- [ ] Bug tracking system
- [ ] Feature request system
- [ ] Status page

---

**Status**: Ready for deployment when requirements met
**Review Date**: Before production launch
**Approved By**: [Project Lead / Instructor]
