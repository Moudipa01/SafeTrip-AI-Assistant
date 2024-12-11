# 🛡️ SafeTrip AI Guardian

> AI-powered real-time travel safety assistant with intelligent route recommendations, predictive danger alerts, and emergency SOS system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Next.js (App Router), React, TypeScript, Tailwind CSS |
| AI        | Hugging Face (Mistral-7B-Instruct) |
| State     | Zustand                           |
| Maps      | Canvas-based custom renderer      |
| Icons     | Lucide React                      |

## ✨ Features

- **AI Chat Assistant** – Natural language safety queries
- **Safe Route Planner** – Risk-scored route recommendations
- **Safety Heatmap** – Community-driven risk visualization
- **Passive Monitoring** – Background movement analysis
- **Emergency SOS** – One-click + auto-trigger alerts
- **Personal Safety Score** – Real-time safety metrics
- **Voice Input** – "I feel unsafe" voice detection
- **Trusted Contacts** – Emergency contact management

## 🗂️ Project Structure

```
├── app/
│   ├── api/           # API routes (chat, safety, alerts, etc.)
│   ├── layout.tsx     # Root layout with SEO
│   ├── page.tsx       # Main application page
│   └── globals.css    # Design system
├── components/        # React components
├── lib/
│   ├── ai/            # AI service layer
│   ├── db/            # Mock datasets
│   ├── services/      # Safety & location services
│   ├── store/         # Zustand state management
│   └── types/         # TypeScript type definitions
```

## 🔌 API Endpoints

| Route              | Method | Description                    |
|---------------------|--------|-------------------------------|
| `/api/chat`         | POST   | AI chat responses             |
| `/api/safety`       | POST   | Safety risk assessment        |
| `/api/route-plan`   | POST   | Safe route recommendations    |
| `/api/alerts`       | GET/POST| Alert management             |
| `/api/emergency`    | GET/POST| SOS & emergency events       |
| `/api/heatmap`      | GET    | Heatmap & safety zone data   |
| `/api/search`       | GET    | Location search              |
| `/api/tracking`     | GET/POST| Movement tracking            |

## 🔑 Environment Variables

Create `.env.local`:
```
HUGGINGFACE_API_KEY=hf_your_key  # Optional: enables HF LLM
```

The app works fully without API keys using intelligent local responses.

## 📝 License

MIT
