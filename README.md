# ElderMuscle — AI Nutrition Agent for Sarcopenia Prevention

> An AI-powered protein tracking app for elderly users, built on Google Cloud's Gemini API.  
> Diagnose sarcopenia stage from InBody scan data and track daily nutrition with meal photo analysis.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![Gemini](https://img.shields.io/badge/Gemini-1.5-blue)](https://ai.google.dev)

---

## Architecture

![Architecture Diagram](architecture_diagram.png)

See [`architecture_diagram.md`](architecture_diagram.md) for a detailed text description.

---

## Features

- **InBody Analysis** — Input muscle mass, height, weight, age and get instant sarcopenia stage diagnosis based on AWGS 2019 clinical criteria (SMI thresholds)
- **Meal Photo Analysis** — Upload a meal photo; Gemini 1.5 Flash identifies food items and estimates protein content
- **Daily Protein Tracking** — Visual progress toward personalized daily protein target (g/kg body weight)
- **AI Nutrition Agent** — Conversational agent powered by Gemini 1.5 Pro with function calling for personalized guidance
- **Weekly Reports** — Email summary of weekly protein intake trends
- **Demo Mode** — Fully functional without any API keys (realistic mock data)

---

## Google Cloud Products Used

| Product | Usage |
|---|---|
| **Gemini 1.5 Flash** | Meal photo vision analysis — identifies foods, estimates protein |
| **Gemini 1.5 Pro** | AI nutrition agent with function calling for InBody diagnostics |
| **Cloud Run** | Containerized deployment (Dockerfile included) |

## Splunk Integration (Observability Track)

ElderMuscle sends operational events to **Splunk via HTTP Event Collector (HEC)** for real-time observability:

| Event | Source Type | Key Fields |
|---|---|---|
| Meal photo analyzed | `meal_analysis` | `total_protein_g`, `food_item_count`, `mode` |
| Meal logged | `meal_logged` | `userId`, `meal_type`, `total_protein_g` |
| Profile saved | `profile_saved` | `sarcopenia_stage`, `smi`, `daily_protein_target_g` |
| AI agent query | `agent_interaction` | `function_calls_made`, `response_length` |

Use these events in Splunk to build dashboards tracking:
- Population-level sarcopenia risk distribution
- Daily protein intake trends across users
- Meal analysis usage patterns
- AI agent engagement metrics

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS
- **AI**: Google Gemini 1.5 Flash + Pro (`@google/generative-ai`)
- **Database**: MongoDB Atlas
- **Email**: Resend
- **Deployment**: Vercel / Google Cloud Run

---

## Setup & Run

### Prerequisites

- Node.js 20+
- npm

### 1. Clone & Install

```bash
git clone https://github.com/gocks77777/eldermuscle.git
cd eldermuscle
npm install
```

### 2. Environment Variables

Create a `.env.local` file at the project root:

```env
# Required for AI features (leave as-is for demo mode)
GOOGLE_API_KEY=your_google_api_key_here

# Required for data persistence (leave as-is for demo mode)
MONGODB_URI=your_mongodb_uri_here

# Required for email reports (leave as-is for demo mode)
RESEND_API_KEY=your_resend_api_key_here
```

> **Demo Mode**: If you leave these as placeholder values, the app runs fully in demo mode with realistic mock data — no API keys needed.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for Production

```bash
npm run build
npm start
```

---

## Docker / Cloud Run Deployment

```bash
# Build
docker build -t eldermuscle .

# Run locally
docker run -p 3000:3000 \
  -e GOOGLE_API_KEY=your_key \
  -e MONGODB_URI=your_uri \
  eldermuscle

# Deploy to Google Cloud Run
gcloud run deploy eldermuscle \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_API_KEY=your_key,MONGODB_URI=your_uri
```

---

## Example Configuration

### Demo Mode (no API keys)

```env
GOOGLE_API_KEY=your_google_api_key_here
MONGODB_URI=your_mongodb_uri_here
RESEND_API_KEY=your_resend_api_key_here
```

All features work with rotating realistic mock data.

### Full Mode

```env
GOOGLE_API_KEY=AIza...          # Google AI Studio key
MONGODB_URI=mongodb+srv://...   # MongoDB Atlas connection string
RESEND_API_KEY=re_...           # Resend.com API key
```

---

## Project Structure

```
eldermuscle/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── dashboard/page.tsx    # Daily protein tracking
│   │   ├── onboarding/page.tsx   # InBody analysis + profile setup
│   │   ├── report/page.tsx       # Weekly report
│   │   └── api/
│   │       ├── analyze-meal/     # Gemini Vision meal analysis
│   │       ├── agent/            # Gemini Pro AI agent
│   │       ├── log-meal/         # MongoDB meal logging
│   │       ├── save-profile/     # MongoDB profile storage
│   │       └── send-report/      # Resend email report
│   ├── components/
│   │   └── BottomNav.tsx         # Mobile navigation
│   └── lib/
│       ├── sarcopenia.ts         # AWGS 2019 SMI calculation
│       └── mongodb.ts            # MongoDB client singleton
├── Dockerfile                    # Cloud Run deployment
└── architecture_diagram.md       # System architecture
```

---

## Clinical Background

ElderMuscle uses **AWGS 2019** (Asian Working Group for Sarcopenia) diagnostic thresholds:

| Gender | Normal SMI | At-Risk SMI | Sarcopenia SMI |
|--------|-----------|-------------|----------------|
| Male   | ≥ 8.0 kg/m² | 7.0–7.9 kg/m² | < 7.0 kg/m² |
| Female | ≥ 6.0 kg/m² | 5.4–5.9 kg/m² | < 5.4 kg/m² |

SMI = Skeletal Muscle Mass (kg) / Height² (m²)

---

## License

MIT © 2026 — see [LICENSE](LICENSE)
