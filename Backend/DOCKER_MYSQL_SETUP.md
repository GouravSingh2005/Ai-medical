# Docker MySQL Setup

## Quick Start

### 1. Start MySQL in Docker
```bash
cd Backend
docker-compose up -d
```

This will:
- Download MySQL 8.0 image (first time only)
- Create a container named `ai_medical_mysql`
- Initialize the database with `database.sql`
- Expose MySQL on port 3306

### 2. Verify MySQL is Running
```bash
docker-compose ps
```

You should see:
```
NAME                  STATUS    PORTS
ai_medical_mysql      Up        0.0.0.0:3306->3306/tcp
```

### 3. Check MySQL Logs
```bash
docker-compose logs mysql
```

### 4. Access MySQL CLI (optional)
```bash
docker exec -it ai_medical_mysql mysql -u medical_user -pmedical_pass ai_medical
```

### 5. Start Backend Server
```bash
npm run dev
```

## Docker Commands

### Stop MySQL
```bash
docker-compose down
```

### Stop and remove all data
```bash
docker-compose down -v
```

### Restart MySQL
```bash
docker-compose restart
```

### View logs in real-time
```bash
docker-compose logs -f mysql
```

## Database Credentials

**From .env file:**
- Host: `127.0.0.1` or `localhost`
- Port: `3306`
- User: `medical_user`
- Password: `medical_pass`
- Database: `ai_medical`

**Root credentials (for admin tasks):**
- User: `root`
- Password: `rootpassword`

## Troubleshooting

### Port 3306 already in use
If you have MySQL installed locally, stop it first:
```bash
sudo systemctl stop mysql
# or
sudo service mysql stop
```

Or change the port in docker-compose.yml:
```yaml
ports:
  - "3307:3306"  # Use port 3307 instead
```
Then update DB_PORT in .env to 3307

### Permission denied
Run docker with sudo or add your user to docker group:
```bash
sudo usermod -aG docker $USER
# Then logout and login again
```

### Database not initialized
If database.sql didn't run, manually import it:
```bash
docker exec -i ai_medical_mysql mysql -u medical_user -pmedical_pass ai_medical < database.sql
```

## Check Connection from Backend

The backend will show:
```
✅ MySQL database connected successfully
```

If you see errors, check:
1. Docker container is running: `docker-compose ps`
2. Credentials match in .env
3. Database is initialized: Check logs
