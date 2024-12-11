# SafeTrip AI Guardian

**SafeTrip AI Guardian** is a state-of-the-art, AI-powered personal safety platform designed to provide real-time protection and monitoring for travelers, solo walkers, and vulnerable users. Built with a "Safety First" philosophy, it combines advanced behavioral AI with environmental data to predict and prevent risks before they escalate.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-blue)
![AI](https://img.shields.io/badge/AI-Hugging%20Face-yellow)

---

## Key Features

### AI Safety Guardian (Chat & Voice)
- **Hugging Face Whisper STT**: Studio-grade voice transcription powered by `whisper-base`. Record voice commands hands-free even in noisy environments.
- **Mistral AI Safety Engine**: Real-time safety advice and emergency coordination through a secure AI chat interface.
- **Dynamic Map Actions**: AI can automatically zoom into safe zones, pin police stations, or highlight safe hotels based on your conversation.

### Passive Safety Monitoring
- **GPS Anomaly Detection**: Automatically detects route deviations, prolonged inactivity (potential accidents), or rapid movement (e.g., being pulled into a vehicle).
- **Live Safety Heatmap**: Visualizes high-risk zones using real-world CSV crime data, safety indices, and lighting information.
- **Safety Score Breakdown**: Provides a real-time "Personal Safety Score" based on your current route, area safety, and behavioral patterns.

### Emergency Response System
- **One-Tap SOS**: Instantly triggers high-priority alerts to emergency services (112) and trusted contacts.
- **Auditory Notifications**: Severity-aware sound alerts (Critical/Standard) that cut through background noise when a risk is detected.
- **Trusted Contacts Hub**: Manage and notify your personal network with live location sharing during emergencies.

### Premium Interface
- **High-Contrast Solid UI**: A professional, non-transparent "Enterprise Grade" interface designed for maximum legibility in high-stress situations.
- **Mobile Responsive**: Fully optimized for smartphones with an Apple-standard bottom navigation dock and "Safe Area" awareness.
- **Interactive Map**: Custom-designed dark-theme map with real-time safety legend and control system.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15, React, TypeScript |
| **Styling** | Tailwind CSS (Solid High-Contrast Design) |
| **AI (ASR)** | Hugging Face Inference (Whisper Base) |
| **AI (LLM)** | Hugging Face (Mistral-7B-Instruct) |
| **State** | Zustand (Global App State Management) |
| **Icons** | Lucide React |
| **Mapping** | Google Maps API (Custom Dark Theme) |

---

## Getting Started

### 1. Prerequisites
- Node.js 18.x or higher
- A Hugging Face API Key
- A Google Maps API Key

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Moudipa01/SafeTrip-AI-Assistant.git

# Navigate to the project directory
cd safetrip_ai

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add your keys:
```env
HUGGINGFACE_API_KEY=your_hf_token_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

### 4. Running the App
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

---

## Data Privacy
SafeTrip AI Guardian is designed with **Privacy by Design**. User location data is processed locally where possible and transmitted over secure, encrypted channels. Passive monitoring is opt-in and can be toggled off at any time.

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Future Roadmap

### Parental Alert Integration
We are currently developing a deep-integration feature to link user accounts with parental or primary emergency contact numbers.
- **Automated Distress Triggers**: If a user indicates they are "not safe" via the AI Chat or Voice interface, the system will automatically dispatch a high-priority distress message to verified emergency contacts.
- **Alert Synchronization**: Critical safety alerts (such as route deviations or high-risk zone entries) will be mirrored to the connected parent/guardian device in real-time.
- **Geo-Fencing Notifications**: Automatic "safe arrival" check-ins and departure notifications for pre-defined safe zones.

## Contribution

We welcome contributions from the developer community to help make travel safer for everyone. If you are interested in contributing to the core safety engine, UI/UX, or backend integrations, please reach out.

**Contact**: moudipajana2002@gmail.com

---

**SafeTrip AI Guardian** - *Your safety is our priority. Don't just travel, travel with a Guardian.*
