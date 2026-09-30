# 🧠 DeepThink / ThinkAi — Next-Gen Reasoning Chatbot UI

A modern, responsive, high-performance web interface designed for advanced reasoning AI models (inspired by DeepSeek R1, OpenAI o1/o3, and Claude 3.7 Sonnet).

![DeepThink AI Interface](https://img.shields.io/badge/UI-DeepThink%20%7C%20ThinkAi-06b6d4?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-8b5cf6?style=for-the-badge)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Web)-10b981?style=for-the-badge)

---

## ✨ Features

- 🧠 **Dynamic Chain-of-Thought (Reasoning) Accordion**:
  - Displays multi-step reasoning steps (`⚡ Analyzing query...`, `⚡ Formulating logic...`)
  - Live execution timer (e.g. `Thought for 3.2s`)
  - Expandable/collapsible thought container like DeepSeek R1.
- ⚡ **Realtime Token Streaming Simulation**:
  - Realistic typewriter streaming effect for responses with token cursor.
  - Interactive **Stop Generation** button to halt generation at any time.
- 💻 **Syntax-Highlighted Code Blocks**:
  - Language badge header (Python, JavaScript, TypeScript, Bash, etc.).
  - Instant One-Click **Copy** button with animated checkmark feedback.
  - `Fira Code` monospace typography.
- 🎨 **Branding Switcher (DeepThink ⇋ ThinkAi)**:
  - Toggle between **DeepThink** and **ThinkAi** brand identities from the Settings modal.
  - Automatically updates headers, welcome badges, and disclaimers.
- 🌓 **Adaptive Dark / Light Themes**:
  - Cyber-midnight dark mode with cyan and electric purple glow accents.
  - Crisp clean light mode with slate accents.
  - Smooth theme transitions with state stored in `localStorage`.
- 🗂️ **Thread Management & History**:
  - Auto-generated conversation titles based on first query.
  - Realtime history search filter.
  - Create new threads with `Ctrl+K`.
  - Delete individual threads or clear all history.
- 🎙️ **Audio & Utilities**:
  - **Read Aloud (TTS)** using the native Web Speech API.
  - **Export to Markdown**: Download conversations as formatted `.md` files.
  - **Regenerate / Retry**: Re-execute the last prompt with one click.
  - **File Attachment Support**: Attach code or text files (`.py`, `.js`, `.json`, `.txt`, `.md`).
- 🔌 **Dual Backend Support**:
  - **Offline Simulator (Default)**: Interactive demo with multi-step reasoning and pre-configured responses for quantum physics, FastAPI auth, Boolean logic puzzles, and React performance.
  - **Real API Ready**: Connect directly to **OpenAI**, **DeepSeek R1**, **Ollama** (`http://localhost:11434/v1`), or **Google Gemini API** with streaming SSE.

---

## 🚀 How to Run

### Option 1: Direct Double-Click (Zero Setup)
Simply double click [`index.html`](file:///c:/Users/Dolly/OneDrive/Desktop/coding/New%20folder%20%282%29/index.html) in your file explorer to open it in Chrome, Edge, Brave, or Firefox.

### Option 2: Local HTTP Server (Recommended)
Using Python:
```bash
python -m http.server 3000
```
Or using Node.js:
```bash
npx serve .
```
Then navigate to `http://localhost:3000` in your browser.

---

## 📁 File Structure

```
├── index.html         # Main structural layout, header, drawer, composer, and modal
├── styles.css         # Modern design system, themes, reasoning accordion, glassmorphism
├── api-service.js     # Reasoning simulator + OpenAI / DeepSeek / Gemini streaming client
├── app.js             # UI controller, markdown parser, history, event listeners
└── README.md          # Documentation and setup guide
```

---

## ⚙️ Connecting Real AI Models (Optional)

Click the **⚙️ Settings** icon in the sidebar footer:
1. Set **Intelligence Engine** to **OpenAI / DeepSeek / Ollama Compatible API** or **Google Gemini API**.
2. Enter your API Key (`sk-...` or Gemini key).
3. If using local Ollama:
   - Endpoint: `http://localhost:11434/v1`
4. Choose reasoning depth and click **Save Preferences**.
