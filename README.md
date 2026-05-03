# 🗳️ CivicTruth

**AI-Powered Election Assistant & Misinformation Firewall**

Built for the Vibe Coding Hackathon. CivicTruth combines highly personalized election journeys with real-time AI fact-checking to combat misinformation and increase civic engagement.

---

## 🌟 The Problem
Elections are complicated, timelines are confusing, and misinformation is at an all-time high. Voters often feel overwhelmed by legalese and unsure of who to trust, leading to voter apathy.

## 🚀 Our Solution: CivicTruth
CivicTruth is a modern, AI-first web application that acts as your personal "Civic Twin." It cuts through the noise to deliver exactly what you need to know, when you need to know it, while actively protecting you from election misinformation.

### Core Features
1. **The Civic Twin Onboarding**: Tell us your state, voter status, and top issues. The AI instantly generates a customized election journey, pulling in real local deadlines and adapting the reading level to your preference.
2. **Adaptive Knowledge Graph**: Watch your "civic brain" grow visually as you interact with the app. Master topics like registration deadlines and local propositions to unlock new nodes.
3. **Vote Simulator**: A mock ballot practice arena. Click "Explain This" on any proposition or candidate to get a plain-English translation from the AI, highlighting how it impacts *your* specific top issues.
4. **TruthPoll Misinformation Firewall**: See a scary claim on Twitter? Paste it into TruthPoll. The AI instantly returns a verdict, assigns a trust score, identifies the manipulation tactic (e.g., *Fear-mongering*), and teaches you how to spot it next time.

---

## 🛠️ Tech Stack
- **Frontend**: React + Vite
- **Styling**: Vanilla CSS (Glassmorphism, Dark Mode, Custom Animations)
- **AI Integration**: Google Gemini API (`@google/genai` / REST integration)
- **Icons**: Lucide React
- **Animations**: Framer Motion

---

## 💻 Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/priyal2505/civivtruth.git
   cd civivtruth
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Add your API Key**
   - Open `http://localhost:5173` in your browser.
   - Click the ⚙️ Gear icon in the top right.
   - Paste your **Google Gemini API Key** and hit Save.

---

## 🎨 Design Philosophy (Vibe Coding)
We opted for a **premium, dynamic aesthetic** over generic UI frameworks. The app features:
- Deep space backgrounds (`#0f111a`) with vibrant, glowing primary accents.
- Glassmorphic panels with subtle backdrop blurs and hover effects.
- Fluid, satisfying micro-animations powered by Framer Motion.
- Highly contextual UI that adapts structurally to the AI's real-time outputs.

---

*Built with ❤️ and AI for the Vibe Coding Hackathon.*
