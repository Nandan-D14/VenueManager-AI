# VenueCommand AI: Event Coordination Engine

## Objective
A professional active control system designed for large-scale global cricket tournaments (T20, ODI, World Cup). Unlike passive analytics dashboards, VenueCommand AI processes multi-modal data through the Google Gemini API to output real-time crowd movement and coordination commands.

## Technology Stack
- **Frontend**: Next.js (App Router, Tailwind CSS, Dark Mode)
- **Backend**: Python FastAPI
- **AI Engine**: Google Gemini API
- **Data**: Lightweight JSON-based spatial and historical states

## Architectural Overview
The system relies on three core data streams to inform the Gemini Decision Engine:
1. **`format_history.json`**: Baseline exit profiles for different match formats (T20, ODI, Test).
2. **`live_transport.json`**: Real-time external variables such as metro delays and arterial road traffic.
3. **`live_venue.json`**: Internal venue spatial data including gate capacities and concourse bottlenecks.

## Setup Instructions

### Backend (Server)
1. Navigate to `/server`.
2. Create a virtual environment: `python -m venv venv`.
3. Install dependencies: `pip install -r requirements.txt`.
4. Configure `.env` with your `GEMINI_API_KEY`.
5. Run the server: `uvicorn main:app --reload`.

### Frontend (Client)
1. Navigate to the root level.
2. Initialize the Next.js app:
   ```bash
   npx create-next-app@latest client --typescript --tailwind --eslint --app --use-npm
   ```
3. Copy `client/.env.local` to the new directory.
4. Run the development server: `npm run dev`.

---
*Developed for PromptWars: Virtual GenAI Challenge*
