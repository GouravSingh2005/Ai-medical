# Quick Start Guide

## Prerequisites Checklist
- [ ] Node.js v18+ installed
- [ ] MySQL 8+ installed and running
- [ ] OpenAI API key obtained
- [ ] Git (optional, for version control)

## Step-by-Step Setup

### 1. Database Setup (5 minutes)

**Option A: Using MySQL Command Line**
```bash
# Login to MySQL
mysql -u root -p

# Execute schema
source /path/to/Ai-medical/Backend/database.sql

# (Optional) Load sample data
source /path/to/Ai-medical/Backend/seed-data.sql

# Verify tables
USE myproject;
SHOW TABLES;
```

**Option B: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your MySQL instance
3. File → Run SQL Script
4. Select `database.sql` and execute
5. (Optional) Run `seed-data.sql` for test data

### 2. Backend Setup (3 minutes)

```bash
# Navigate to backend
cd Ai-medical/Backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # or use your preferred editor

# Required: Update these variables in .env
# - OPENAI_API_KEY: Your OpenAI API key
# - DB_PASSWORD: Your MySQL root password

# Start backend server
npm run dev
```

✅ Backend should be running on `http://localhost:3001`
✅ WebSocket server on `ws://localhost:3001/ws`

### 3. Frontend Setup (2 minutes)

```bash
# Open new terminal
cd Ai-medical/Frontend/Medinet

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend should be running on `http://localhost:5173`

### 4. Test the System

1. **Open browser** to `http://localhost:5173`
2. **Register/Login** as a patient
3. **Start a consultation** from dashboard
4. **Chat with AI doctor**:
   - Describe symptoms
   - Answer follow-up questions
   - Receive diagnosis
   - Get appointment scheduled

### 5. Verify Everything Works

**Test Backend Health**:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-XX-XX...",
  "service": "Agentic AI Medical System"
}
```

**Test WebSocket**:
```bash
curl http://localhost:3001/ws/stats
```

Expected response:
```json
{
  "connections": 0,
  "activeSessions": 0
}
```

**Test Database Connection**:
Check backend console for:
```
✅ Connected to MySQL Database
🚀 HTTP Server running at http://localhost:3001
🔌 WebSocket Server running at ws://localhost:3001/ws
```

## Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution**:
```bash
# Check if MySQL is running
mysql.server status  # macOS
sudo systemctl status mysql  # Linux
net start MySQL  # Windows

# Test connection
mysql -u root -p

# Verify credentials in .env match MySQL
```

### Issue: "OpenAI API error"
**Solution**:
- Verify API key is correct in `.env`
- Check API quota: https://platform.openai.com/usage
- Ensure no extra spaces in OPENAI_API_KEY

### Issue: "WebSocket connection failed"
**Solution**:
- Ensure backend is running
- Check if port 3001 is available
- Verify CORS settings in backend

### Issue: "Port already in use"
**Solution**:
```bash
# Find process using port 3001
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process or change PORT in .env
```

## Testing with Sample Data

If you loaded `seed-data.sql`:

**Sample Patient Login**:
- Email: `patient1@example.com`
- Password: `password123`

**Sample Doctor Login**:
- Email: `dr.patel@hospital.com`
- Password: `password123`

**Note**: These passwords are for testing only. In production, use strong, unique passwords.

## Next Steps

1. **Read the full README.md** for architecture details
2. **Explore the code** in `Backend/src/agents/`
3. **Customize prompts** in `llm-config.ts`
4. **Add more specialties** or modify workflow
5. **Implement authentication** for production

## Development Tips

**Hot Reload**:
- Backend: Uses `ts-node` - auto-reloads on file changes
- Frontend: Vite provides instant HMR

**Debugging**:
```bash
# Backend logs
console.log statements appear in backend terminal

# Frontend logs
Open browser DevTools → Console

# WebSocket messages
Browser DevTools → Network → WS → Messages
```

**Database Queries**:
```bash
# View recent consultations
mysql -u root -p myproject -e "SELECT * FROM Consultation ORDER BY session_start DESC LIMIT 5;"

# View conversation logs
mysql -u root -p myproject -e "SELECT * FROM ConversationLog WHERE Consultation_ID='<id>' ORDER BY timestamp;"
```

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use secure passwords (bcrypt with high rounds)
- [ ] Enable HTTPS/WSS
- [ ] Implement JWT authentication
- [ ] Set up rate limiting
- [ ] Configure proper CORS
- [ ] Use environment-specific .env files
- [ ] Set up monitoring and logging
- [ ] Backup database regularly
- [ ] Review security best practices

## Need Help?

- Check the main README.md for detailed documentation
- Review code comments in agent files
- Check browser/backend console for errors
- Ensure all prerequisites are met

---

**Estimated Total Setup Time**: 10-15 minutes

**Ready to go?** Start with step 1 above! 🚀
