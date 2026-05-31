# CivicLens

**Public Surveillance Transparency Dashboard** — a full-stack web application at the intersection of mass surveillance and public safety.

CivicLens gives citizens transparency into public monitoring infrastructure, tools for anonymous safety reporting, privacy risk scoring for routes, and contextual legal rights information.

## Features

| Route | Description |
|-------|-------------|
| `/` | Hero landing page with theme statement and CTAs |
| `/map` | Interactive Leaflet map with surveillance zone markers, district overlays, and layer toggles |
| `/report` | Anonymous, client-side encrypted safety report form with confirmation hash |
| `/score` | Privacy Route Checker — calculates a 0–100 Privacy Risk Score for any route |
| `/rights` | Know Your Rights panel with district-specific legal frameworks |

## Tech Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS v4 + Vite
- **Map:** Leaflet.js + react-leaflet (CartoDB dark tiles, no API key)
- **Backend:** Node.js + Express 5
- **Database:** SQLite via better-sqlite3
- **Encryption:** crypto-js (client-side AES before submission)

## Project Structure

```
CivicLens/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # Typed API client
│   │   ├── components/     # Map, Navbar, panels
│   │   ├── pages/          # Route pages
│   │   ├── types/          # TypeScript interfaces
│   │   └── utils/          # Encryption helpers
│   └── vite.config.ts      # Proxy to API on :3001
├── server/
│   ├── db/
│   │   ├── database.js     # SQLite schema
│   │   └── seed.js         # Seed script (45 nodes, 5 districts, 10 reports)
│   ├── routes/
│   │   ├── zones.js        # GET /api/zones
│   │   ├── reports.js      # GET/POST /api/reports
│   │   └── score.js        # POST /api/score
│   └── index.js            # Express entry point
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
# Terminal 1 — Backend
cd server
npm install
npm run dev

# Terminal 2 — Frontend
cd client
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

The database seeds automatically on first server start with:
- **45** surveillance nodes (CCTV, facial recognition, data collection, safe zones)
- **5** city districts with risk levels
- **10** sample anonymized reports

To re-seed manually: delete `server/db/civiclens.db` and restart the server.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/zones` | All nodes + districts + city center |
| GET | `/api/zones/:id` | Single node with district legal info |
| GET | `/api/zones/districts/all` | Districts with node counts |
| GET | `/api/reports` | Anonymized report metadata |
| POST | `/api/reports` | Submit encrypted report |
| GET | `/api/reports/verify/:hash` | Verify submission by hash |
| POST | `/api/score` | Calculate privacy risk score for a route |

### Score API Example

```json
POST /api/score
{
  "startLat": 40.758,
  "startLng": -73.9855,
  "endLat": 40.772,
  "endLng": -73.972
}
```

## Demo Instructions

1. **Map** — Toggle CCTV / Facial Recognition / Data Collection / Safe Zone layers. Click markers for operator and retention details. District overlays show risk zones (red = high, yellow = medium, green = low).

2. **Report** — Fill in incident type and description, click the map to pin location, submit. Save the confirmation hash shown after submission.

3. **Privacy Score** — Click "Set Start Point" then click the map, repeat for end point, hit "Calculate Score". Review the 0–100 score, breakdown, and recommendations.

4. **Know Your Rights** — Select a district to see its legal framework and available citizen actions.

## Design

- Dark theme: `#0f172a` background, `#38bdf8` cyan accent, `#ef4444` danger
- Mobile responsive with collapsible nav
- Smooth map fly-to transitions and slide-in detail panels

## Scalability

This demo uses seeded mock data for the fictional city of **Metrovale**. The architecture is designed to scale to real city open data APIs — swap the seed script for ETL pipelines pulling from municipal surveillance registries, transit authority feeds, or FOIA-published datasets.

## License

MIT — Demo project for educational and hackathon purposes.
