# 🌾 AgriConnect — Setup & Deployment Guide

## Prerequisites
- Node.js 18+ (recommended: 20 LTS)
- npm or yarn

## Quick Start

```bash
# 1. Install all dependencies (including Prisma, auth libs, etc.)
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your configuration (see below)

# 3. Generate Prisma client & create database
npx prisma generate
npx prisma db push

# 4. Seed the database with demo data
npx tsx prisma/seed.ts

# 5. Start the dev server
npm run dev
```

The app will be running at http://localhost:3000

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Farmer | ramesh@agriconnect.in | password123 |
| Farmer | gurpreet@agriconnect.in | password123 |
| Farmer | sunita@agriconnect.in | password123 |
| Farmer | venkatesh@agriconnect.in | password123 |
| Farmer | babanrao@agriconnect.in | password123 |
| Buyer | rajesh@apexfoods.in | password123 |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | SQLite database path (default: `file:./dev.db`) |
| `JWT_SECRET` | Yes | Secret key for JWT tokens (change in production!) |
| `GEMINI_API_KEY` | No | Google Gemini API key for AI features |
| `OPENWEATHER_API_KEY` | No | OpenWeatherMap API key for real weather data |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | `development` or `production` |

## API Endpoints

### Authentication
- `POST /api/auth/register` — Create new account
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user profile
- `PUT /api/auth/profile` — Update profile
- `PUT /api/auth/verify` — Upgrade verification level

### Listings
- `GET /api/listings` — List all listings (with filtering/sorting)
- `GET /api/listings/:id` — Get single listing
- `POST /api/listings` — Create listing (auth required)
- `PUT /api/listings/:id` — Update listing (owner only)
- `DELETE /api/listings/:id` — Delete listing (owner only)

### Messages
- `GET /api/messages/conversations` — List conversations
- `POST /api/messages/conversations` — Start conversation
- `GET /api/messages/conversations/:id` — Get messages
- `POST /api/messages/send` — Send message
- `PUT /api/messages/offer-status` — Update trade offer

### Market
- `GET /api/market/prices` — Get market ticker prices
- `GET /api/market/trade-offers` — Get user's trade offers

### AI
- `POST /api/ai/advisor` — AI farming assistant chat
- `POST /api/ai/plan` — Farm & trading plan generator
- `POST /api/ai/price-estimate` — Price estimation
- `POST /api/ai/analyze-crop` — Crop image analysis

### Weather
- `POST /api/weather` — Get weather + farming advisory

### Upload
- `POST /api/upload/crop` — Upload crop images
- `POST /api/upload/profile` — Upload profile avatar

### Notifications
- `GET /api/notifications` — List notifications
- `PUT /api/notifications/read` — Mark as read

## Production Deployment

### Build
```bash
npm run build
npm start
```

### Database for Production
For production, consider switching from SQLite to PostgreSQL:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/agriconnect"
   ```

3. Run migration:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

### Environment Security
- Change `JWT_SECRET` to a strong random string
- Set `NODE_ENV=production`
- Never commit `.env` file
- Use HTTPS in production

## Features

### ✅ Implemented
- [x] User registration & authentication (JWT)
- [x] Role-based access (Farmer/Buyer)
- [x] Crop listings CRUD with images
- [x] Marketplace with search, filters, sorting
- [x] Direct messaging with trade offers
- [x] AI farming assistant (Gemini-powered)
- [x] AI crop image analysis
- [x] AI weather + farming advisory
- [x] Real weather API integration (OpenWeatherMap)
- [x] KYC verification system
- [x] Price ticker (mandi vs direct comparison)
- [x] Multi-language support (English, Hindi, Telugu)
- [x] Image upload (crop photos, profile avatars)
- [x] Notification system
- [x] Responsive design (mobile-first)

### 🔄 Optional Enhancements
- [ ] Real-time WebSocket messaging
- [ ] Email/SMS notifications
- [ ] Payment integration (Razorpay/UPI)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Docker deployment
