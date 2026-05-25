# ElderMuscle — Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER (Mobile Browser)                     │
│                                                                  │
│   Landing Page → Onboarding → Dashboard → Report → AI Chat      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js 15 App (Vercel / Cloud Run)           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    API Routes                            │    │
│  │                                                          │    │
│  │  /api/analyze-meal   /api/agent   /api/log-meal          │    │
│  │  /api/save-profile   /api/send-report                    │    │
│  └───────┬─────────────────┬──────────────────┬────────────┘    │
│          │                 │                  │                  │
└──────────┼─────────────────┼──────────────────┼─────────────────┘
           │                 │                  │
           ▼                 ▼                  ▼
┌──────────────────┐ ┌──────────────────┐ ┌───────────────┐
│   Google Cloud   │ │  MongoDB Atlas   │ │    Resend     │
│                  │ │                  │ │               │
│ Gemini 1.5 Flash │ │  Collections:    │ │  Weekly Email │
│  (Vision API)    │ │  - profiles      │ │  Reports      │
│  Meal photo →    │ │  - meal_logs     │ │               │
│  protein (g)     │ └──────────────────┘ └───────────────┘
│                  │
│ Gemini 1.5 Pro   │
│  (Function Call) │
│  InBody analysis │
│  + AI agent chat │
└──────────────────┘
```

## Data Flow

### 1. InBody Analysis (Onboarding)
```
User inputs → age, gender, weight, height, skeletal muscle mass
     ↓
/api/save-profile → MongoDB (profiles collection)
     ↓
sarcopenia.ts → SMI = muscle mass / height²
     ↓
AWGS 2019 thresholds → Stage: Normal / At-Risk / Sarcopenia
     ↓
Daily protein target = weight × 1.2g (at-risk) or 1.5g (sarcopenia)
```

### 2. Meal Photo Analysis (Dashboard)
```
User uploads meal photo
     ↓
/api/analyze-meal → base64 encode image
     ↓
Gemini 1.5 Flash Vision API
     ↓
JSON response: { food_items[], total_protein_g, notes }
     ↓
/api/log-meal → MongoDB (meal_logs collection)
     ↓
Dashboard updates protein progress bar
```

### 3. AI Agent Chat
```
User asks question (e.g. "What's my protein intake today?")
     ↓
/api/agent → Gemini 1.5 Pro with function declarations
     ↓
Function calls (if needed):
  analyze_inbody(age, gender, weight, height, skeletalMuscleMass)
  calculate_daily_progress(userId, date, dailyTarget)
     ↓
Tool results fed back to Gemini → natural language response
     ↓
Streaming text response to user
```

## Key Design Decisions

- **Demo Mode**: All features work without API keys using realistic mock data
- **AWGS 2019**: Clinically validated sarcopenia thresholds for Asian populations
- **Standalone output**: `next.config.mjs` uses `output: 'standalone'` for Cloud Run
- **MongoDB singleton**: Connection pooled via module-level client promise
