# Smart Bharat 🇮🇳
### AI-Powered Civic Companion

> Built for the **Google for Developers x Devengers "PromptWars"** Hackathon

Smart Bharat is a GenAI-powered web app that helps Indian citizens understand government services, get matched to relevant schemes, know exactly what paperwork to gather, and track civic complaints to resolution — all in plain language, in English or Hindi.

---

## 1. Problem Statement

Government services in India are powerful but hard to navigate: information is scattered across departments, written in bureaucratic language, and rarely available in a citizen's own language. Most people don't know which scheme they're eligible for, what documents a given service actually requires, or how to follow up once they've reported a civic issue like a broken streetlight or a water leak.

Smart Bharat addresses this by putting a generative-AI companion at the center of the citizen's experience — one that simplifies government information, answers questions directly, recommends the right services, prepares citizens for the paperwork ahead, and keeps their complaints visible and trackable — making civic interactions **faster, smarter, and more user-friendly**.

---

## 2. Solution Overview

Each of the six hackathon requirements is implemented as a distinct, working feature. Below, each requirement links to exactly where it lives in the code.

### 1. Simplify complex government information → `src/components/chat.js`
The AI Companion's system prompt (`buildSystemPrompt` in `chat.js`) explicitly instructs the model to act as *"a knowledgeable, friendly Indian civic assistant"* that avoids bureaucratic jargon and explains things in plain language. Every reply is routed through the shared `callAI()` function in `src/utils/aiClient.js`.

### 2. Answer citizen queries → `src/components/chat.js`
The same AI Companion chat interface handles free-form questions like *"How do I apply for a ration card"* or *"What is Ayushman Bharat"*. Five clickable starter-question chips (`t.chat.starters` in `src/utils/translations.js`) guarantee a reliable, on-brief demo even without typing.

### 3. Recommend relevant public services → `src/components/schemes.js`
The Service Recommendation Engine takes a free-text description of the citizen's situation, sends it alongside a curated list of 20 real government schemes (`src/data/schemes.json`) to the AI, and asks it to return the top 3 relevant matches with a plain-language reason for each — rendered as cards with official links.

### 4. Assist with document requirements → `src/components/documents.js`
The Document Requirement Assistant takes a goal (e.g. "passport", "driving license", "caste certificate") and asks the AI for a structured JSON checklist of required documents, ordered steps, and an estimated processing time, rendered as a checkable list.

### 5. Track complaints → `src/components/complaints.js`
The Complaint Reporting & Tracking feature lets a citizen describe an issue and a location. The AI auto-classifies it into a department (Roads/Water/Electricity/Sanitation/Other) and writes an official-sounding summary. Complaints are saved to `localStorage` (`src/utils/storage.js`) with an ID, timestamp, and status, and shown in a tracker with status badges and a demo-only "simulate progress" button that advances Submitted → In Review → Resolved.

### 6. Multilingual support → `src/utils/translations.js` + language toggle in `src/components/navbar.js`
A navbar toggle switches the whole UI between English and Hindi, persisted in `localStorage`. All static text is looked up from the `translations` dictionary. Every AI-generated response (chat, scheme reasons, checklists, complaint summaries) is requested directly in the selected language by appending an explicit language instruction to the prompt sent to Gemini/Groq — see the `languageInstruction` variable in each of `chat.js`, `schemes.js`, `documents.js`, and `complaints.js`.

---

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Plain HTML/CSS + vanilla JS (ES modules) | Zero build step, zero config risk — runs immediately, which matters most in a 4-hour solo hackathon window. |
| AI (primary) | Google Gemini (`gemini-2.0-flash`) | Fast, free-tier friendly, strong multilingual generation. |
| AI (fallback) | Groq (`llama-3.1-8b-instant`, OpenAI-compatible endpoint) | Automatic fallback if Gemini rate-limits mid-demo — see `callAI()` in `src/utils/aiClient.js`. |
| Persistence | `localStorage` | No backend/database needed; complaints, chat history, and language preference all persist across reloads instantly. |
| Fonts | "Hind" (Google Fonts) | One type family that natively covers both Latin and Devanagari script, so English and Hindi share the same typographic voice. |

---

## 4. Features

- 💬 **AI Civic Companion** — chat UI with message bubbles, loading state, starter-question chips, and full conversation persistence.
- 🎯 **Service Recommendation Engine** — free-text situation → top 3 matched government schemes from a curated real-world database, with reasons and official links.
- 📋 **Document Requirement Assistant** — any service/document goal → a structured checklist of documents, steps, and estimated processing time.
- 📢 **Complaint Reporting & Tracking** — AI-classified, AI-summarized complaints stored locally, with a live status tracker (Submitted / In Review / Resolved).
- 🌐 **English/Hindi toggle** — persisted language preference; both static UI text and all AI-generated content switch languages.
- 🎨 **Polished civic-tech dashboard** — hero section, feature cards, and a subtle Ashoka Chakra–inspired brand mark and loading spinner.
- 🔁 **Automatic Gemini → Groq fallback** on every AI call, so a single rate-limited request doesn't break the demo.
- ⚠️ **Full error handling** — every AI call is wrapped in try/catch with user-facing error messages and loading states; no unhandled promise rejections.

---

## 5. Setup Instructions

1. **Add your API key(s)** in a local `.env` file:
   ```bash
   cp .env.example .env
   ```

   Then edit `.env`:
   ```bash
   SMART_BHARAT_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   SMART_BHARAT_GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
   SMART_BHARAT_AI_PROVIDER=gemini
   ```
   You only need **one** working key for the app to function; the other is used automatically as a fallback if it's configured too.

   `.env` is intentionally ignored by Git so API keys are not pushed to GitHub. Keep `.env.example` committed as the safe template.

2. **Run it.** Since this is plain HTML/JS with no build step, any local static server works. From the project folder:
   ```bash
   npx live-server
   ```
   or, with VS Code's **Live Server** extension, right-click `index.html` → "Open with Live Server".

   > Note: opening `index.html` directly via `file://` will not work in most browsers because ES modules and `fetch()` (used to load `schemes.json`) require `http://`. Always serve it through a local server.

3. Open the app in your browser (Live Server will open it automatically, typically at `http://127.0.0.1:8080`).

---

## 6. Architecture / File Structure

```
smart-bharat/
├── index.html                  # App shell: navbar + #app mount point
├── README.md
└── src/
    ├── main.js                 # SPA entry point: view routing + language state
    ├── config/
    │   └── config.js           # Public config + ignored .env runtime loader
    ├── utils/
    │   ├── aiClient.js         # callGemini(), callGroq(), callAI() with fallback
    │   ├── storage.js          # localStorage helpers (complaints, chat, language)
    │   ├── translations.js     # English/Hindi dictionary for static UI text
    │   └── parseAiJson.js      # Shared safe-JSON-parsing helper for AI replies
    ├── data/
    │   └── schemes.json        # 20 real Indian government schemes
    ├── components/
    │   ├── navbar.js           # Nav links + language toggle
    │   ├── dashboard.js        # Landing/hero + feature cards
    │   ├── chat.js             # AI Civic Companion (reqs #1 and #2)
    │   ├── schemes.js          # Service Recommendation Engine (req #3)
    │   ├── documents.js        # Document Requirement Assistant (req #4)
    │   └── complaints.js       # Complaint Reporting & Tracking (req #5)
    └── styles/
        └── main.css            # Full design system (colors, type, components)
```

---

## 7. Future Scope

With more time, Smart Bharat could add real-time complaint routing to actual municipal APIs/email where available, voice input for citizens with low literacy, and support for more Indian languages beyond English and Hindi (the translation architecture already generalizes to any language). A lightweight backend would also allow complaints to be shared across users/devices instead of being local to one browser.

---

## 8. Alignment with Hackathon Goals

Smart Bharat directly serves the hackathon's goals of **transparency**, **accessibility**, and **digital inclusion**. It promotes transparency by giving every complaint a trackable status and every scheme a direct official link. It improves accessibility by explaining government processes in plain language instead of bureaucratic jargon, removing a major barrier for first-time users of civic services. And it advances digital inclusion by supporting Hindi alongside English, so the app speaks to citizens in the language they're actually comfortable in — making civic interactions genuinely faster, smarter, and more user-friendly.
