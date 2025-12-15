#!/bin/bash

# ============================================
# Agentic AI Medical System - Extension Setup Script
# ============================================

echo "🏥 Agentic AI Medical System - Extension Setup"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running from Backend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the Backend directory${NC}"
    exit 1
fi

echo "📦 Installing new dependencies..."
echo "   - nodemailer (Email service)"
echo "   - @types/nodemailer (TypeScript types)"
echo "   - twilio (WhatsApp service)"
echo "   - axios (HTTP client)"
echo "   - @googlemaps/google-maps-services-js (Google Maps API)"
echo ""

npm install nodemailer @types/nodemailer twilio axios @googlemaps/google-maps-services-js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo ""
echo "=============================================="
echo "📝 Next Steps:"
echo "=============================================="
echo ""
echo "1. Configure Environment Variables:"
echo "   cp .env.example .env"
echo "   # Edit .env and add:"
echo "   - GOOGLE_MAPS_API_KEY"
echo "   - SMTP credentials (optional)"
echo "   - TWILIO credentials (optional)"
echo ""
echo "2. Update Database Schema:"
echo "   mysql -u root -p medical_ai_system < database.sql"
echo ""
echo "3. Update Seed Data (Doctor locations):"
echo "   mysql -u root -p medical_ai_system < seed-data.sql"
echo ""
echo "4. Start Backend Server:"
echo "   npm run dev"
echo ""
echo "=============================================="
echo "📚 Documentation:"
echo "=============================================="
echo ""
echo "- Environment Setup: ENV_CONFIGURATION.md"
echo "- Extension Details: EXTENSION_SUMMARY.md"
echo "- Main Docs: README.md"
echo ""
echo "=============================================="
echo "🔑 Required API Keys:"
echo "=============================================="
echo ""
echo "✅ OpenAI API: https://platform.openai.com/api-keys"
echo "✅ Google Maps: https://console.cloud.google.com/"
echo "🔵 Gmail (optional): https://myaccount.google.com/security"
echo "🔵 Twilio (optional): https://www.twilio.com/console"
echo ""
echo "For detailed instructions, read ENV_CONFIGURATION.md"
echo ""
echo -e "${GREEN}🎉 Setup script completed!${NC}"
