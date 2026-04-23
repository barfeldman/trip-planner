# 🌴 Thailand Trip Planner

A personal web app for planning a trip to Thailand for two. Built with React, Express, SQLite, and a Thailand-inspired design.

## Quick Start (Development)

```bash
# Install root dependencies
npm install

# Install all project dependencies
cd server && npm install && cd ../client && npm install && cd ..

# Set up the database with sample data
cd server && npx prisma migrate dev && cd ..

# Start both frontend and backend
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Quick Start (Docker)

```bash
docker compose up --build
```

App will be available at http://localhost:3001

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React + Vite + TypeScript         |
| Styling   | Tailwind CSS v4 + shadcn/ui       |
| Backend   | Node.js + Express                 |
| Database  | SQLite + Prisma ORM               |
| Maps      | Leaflet + OpenStreetMap            |
| Deploy    | Docker / Docker Compose            |

## Features

- **Dashboard** — Trip countdown, budget overview, route timeline
- **Itinerary Builder** — Day-by-day planner grouped by destination
- **Accommodations** — Track hotels/resorts with booking status
- **Activities & Places** — Things to do with interest-level voting
- **Budget Tracker** — Planned vs actual spending by category
- **Flights & Transport** — All transport bookings in one place
- **Packing List** — Shared checklist with Thailand-specific suggestions
- **Documents Vault** — Upload passport scans, insurance, confirmations
- **Map View** — Interactive map with all destinations and activities
- **Notes & Ideas** — Shared notepad for tips, phrases, restaurants
- **Dark Mode** — Toggle between light and dark themes
- **Mobile Responsive** — Works on phones while traveling

## Project Structure

```
trip-planner/
├── client/               # React frontend
│   └── src/
│       ├── components/   # UI components (shadcn/ui style)
│       ├── pages/        # Page components
│       └── lib/          # Utilities & API client
├── server/               # Express backend
│   ├── src/
│   │   └── routes/       # API routes
│   └── prisma/
│       ├── schema.prisma # Database schema
│       └── seed.ts       # Sample Thailand data
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Seed Data

The database is pre-populated with a 14-day Thailand itinerary:
- **Bangkok** (3 days) — Grand Palace, Wat Pho, Chatuchak Market
- **Chiang Mai** (3 days) — Doi Suthep, Elephant Sanctuary, Cooking Class
- **Phuket** (4 days) — Patong Beach, Phi Phi Islands, Big Buddha
- **Koh Samui** (4 days) — Chaweng Beach, Ang Thong Marine Park

Plus 48 Thailand-specific packing items, Thai phrase cheat sheet, emergency contacts, and restaurant recommendations.

## Environment Variables

| Variable       | Default             | Description              |
|----------------|---------------------|--------------------------|
| `DATABASE_URL` | `file:./dev.db`     | SQLite database path     |
| `PORT`         | `3001`              | Server port              |
| `UPLOAD_DIR`   | `./uploads`         | File upload directory    |
