# 🇮🇳 Smart Bharat

### AI-Powered Civic Companion

> Built for **Google for Developers × Devengers — "PromptWars" (Build with AI)** Hackathon
> **Challenge:** _Smart Bharat – AI-Powered Civic Companion_

Smart Bharat is a GenAI-powered web app that helps Indian citizens understand government services, get matched to relevant schemes, know exactly what paperwork to gather, and track civic complaints to resolution — all in plain language, in English or Hindi.

<p align="center">
  <a href="https://smart-bharat-ai-powered-civic-compa-omega.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-View%20App-6C5CE7?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  
</p>

---

## 📖 Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution Overview](#2-solution-overview)
3. [Tech Stack](#3-tech-stack)
4. [Features](#4-features)
5. [Setup Instructions](#5-setup-instructions)
6. [Architecture / File Structure](#6-architecture--file-structure)
7. [How the AI Layer Works](#7-how-the-ai-layer-works)
8. [Future Scope](#8-future-scope)
9. [Alignment with Hackathon Goals](#9-alignment-with-hackathon-goals)

---

## 1. Problem Statement

Government services in India are powerful but hard to navigate: information is scattered across departments, written in bureaucratic language, and rarely available in a citizen's own language. Most people don't know which scheme they're eligible for, what documents a given service actually requires, or how to follow up once they've reported a civic issue like a broken streetlight or a water leak.

Smart Bharat addresses this by putting a generative-AI companion at the center of the citizen's experience — one that simplifies government information, answers questions directly, recommends the right services, prepares citizens for the paperwork ahead, and keeps their complaints visible and trackable. The goal: make civic interactions **faster, smarter, and more user-friendly**.

---

## 2. Solution Overview

Each of the six hackathon requirements is implemented as a distinct, working feature. Below, each requirement links to exactly where it lives in the code.

| #   | Requirement                                 | Implementation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Simplify complex government information** | `src/components/chat.js` — the AI Companion's system prompt (`buildSystemPrompt`) instructs the model to act as a knowledgeable, friendly Indian civic assistant that avoids bureaucratic jargon and explains things in plain language.                                                                                                                                                                                                                                                                                                                   |
| 2   | **Answer citizen queries**                  | `src/components/chat.js` — the same AI Companion chat interface handles free-form questions like _"How do I apply for a ration card"_ or _"What is Ayushman Bharat"_. Five clickable starter-question chips guarantee a reliable, on-brief demo even without typing, and a voice-input mic button (Web Speech API) lets citizens ask by speaking.                                                                                                                                                                                                         |
| 3   | **Recommend relevant public services**      | `src/components/schemes.js` — the Service Recommendation Engine takes a free-text description of the citizen's situation, sends it alongside a curated list of 20 real government schemes (`src/data/schemes.json`) to the AI, and asks it to return the top 3 relevant matches with a plain-language reason for each — rendered as cards with official links.                                                                                                                                                                                            |
| 4   | **Assist with document requirements**       | `src/components/documents.js` — the Document Requirement Assistant takes a goal (e.g. "passport", "driving license", "caste certificate") and asks the AI for a structured JSON checklist of required documents, ordered steps, and an estimated processing time, rendered as a checkable list.                                                                                                                                                                                                                                                           |
| 5   | **Track complaints**                        | `src/components/complaints.js` — a citizen describes an issue and a location (by typing or by voice). The AI auto-classifies it into a department (Roads/Water/Electricity/Sanitation/Other) and writes an official-sounding summary. Complaints are saved to `localStorage` with an ID, timestamp, and status, and shown in a timeline tracker with status badges and a demo-only "simulate progress" button that advances Submitted → In Review → Resolved.                                                                                             |
| 6   | **Multilingual support**                    | `src/utils/translations.js` + language toggle in `src/components/navbar.js` — a navbar toggle switches the whole UI between English and Hindi, persisted in `localStorage`. All static text is looked up from the `translations` dictionary, and every AI-generated response (chat, scheme reasons, checklists, complaint summaries) is requested directly in the selected language by appending an explicit language instruction to the prompt — see the `languageInstruction` variable in `chat.js`, `schemes.js`, `documents.js`, and `complaints.js`. |

---

## 3. Tech Stack

| Layer         | Choice                                                    | Why                                                                                                                 |
| ------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Frontend      | Plain HTML/CSS + vanilla JS (ES modules)                  | Zero build step, zero config risk — runs immediately, which matters most under hackathon time pressure.             |
| AI (primary)  | Google Gemini (`gemini-2.0-flash`)                        | Fast, free-tier friendly, strong multilingual generation.                                                           |
| AI (fallback) | Groq (`llama-3.1-8b-instant`, OpenAI-compatible endpoint) | Automatic fallback if Gemini rate-limits mid-demo — see `callAI()` in `src/utils/aiClient.js`.                      |
| Voice Input   | Web Speech API (`SpeechRecognition`)                      | Native browser speech-to-text for the chat and complaint forms, in English or Hindi, with no extra dependency.      |
| Persistence   | `localStorage`                                            | No backend/database needed; complaints, chat history, and language preference all persist across reloads instantly. |
| Fonts         | "Be Vietnam Pro" + Material Symbols (Google Fonts)        | Clean, modern type paired with a consistent icon set for a polished civic-tech look.                                |

---

## 4. Features

- 💬 **AI Civic Companion** — chat UI with message bubbles, a "thinking" loading state, starter-question chips, a context panel (document scanner shortcut, trending services, alerts), voice input, and full conversation persistence.
- 🎯 **Service Recommendation Engine** — free-text situation → top 3 matched government schemes from a curated real-world database, with plain-language reasons and official links.
- 📋 **Document Requirement Assistant** — any service/document goal → a structured checklist of documents, steps, and estimated processing time, with quick-pick chips for common goals.
- 📢 **Complaint Reporting & Tracking** — AI-classified, AI-summarized complaints (by typing or voice) stored locally, with live keyword-based category hints, a local "issues summary" widget, and a timeline tracker (Submitted / In Review / Resolved).
- 🌐 **English/Hindi toggle** — persisted language preference; both static UI text and all AI-generated content switch languages instantly.
- 🎨 **Polished civic-tech dashboard** — hero search bar, bento-grid layout, latest-schemes cards, application status panel, personalized "For You" AI recommendations, and an animated mesh background.
- 📱 **Responsive, mobile-first shell** — collapsible sidebar, bottom navigation bar, and a floating AI action button (FAB) for quick access to chat on mobile.
- 🔁 **Automatic Gemini → Groq fallback** on every AI call, so a single rate-limited request doesn't break the demo.
- 🧯 **Demo-safe fallbacks everywhere** — if both AI providers fail, every feature (chat, schemes, documents, complaints) falls back to realistic, deterministic canned responses (`src/utils/demoData.js`), clearly labeled so the demo never breaks.
- ⚠️ **Full error handling** — every AI call is wrapped in try/catch with user-facing error messages and loading states; no unhandled promise rejections.

---

## 5. Setup Instructions

> **Repo:** [github.com/vybex-dev/SmartBharat-AI-Powered-Civic-Companion](https://github.com/vybex-dev/SmartBharat-AI-Powered-Civic-Companion)
> **Live demo:** [smart-bharat-ai-powered-civic-compa-omega.vercel.app](https://smart-bharat-ai-powered-civic-compa-omega.vercel.app/)

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

   > **Note:** opening `index.html` directly via `file://` will not work in most browsers, because ES modules and `fetch()` (used to load `schemes.json` and `.env`) require `http://`. Always serve it through a local server.

3. **Open the app** in your browser (Live Server will open it automatically, typically at `http://127.0.0.1:8080`).

4. _(Optional)_ For voice input, use Chrome or Edge — the Web Speech API has the widest support there. If unsupported, the mic button is automatically disabled and the app still works fully by typing.

---

## 6. Architecture / File Structure

```
smart-bharat/
├── index.html                  # App shell: navbar + sidebar + #app mount point
├── README.md
└── src/
    ├── main.js                 # SPA entry point: view routing + language state
    ├── config/
    │   └── config.js           # Public config + ignored .env runtime loader
    ├── utils/
    │   ├── aiClient.js         # callGemini(), callGroq(), callAI() with fallback
    │   ├── storage.js          # localStorage helpers (complaints, chat, language)
    │   ├── translations.js     # English/Hindi dictionary for static UI text
    │   ├── parseAiJson.js      # Shared safe-JSON-parsing helper for AI replies
    │   └── demoData.js         # Deterministic fallback data for every AI feature
    ├── data/
    │   └── schemes.json        # 20 real Indian government schemes
    ├── components/
    │   ├── navbar.js           # Top nav links + language toggle
    │   ├── dashboard.js        # Landing/hero + bento grid + feature cards
    │   ├── chat.js             # AI Civic Companion (reqs #1 and #2)
    │   ├── schemes.js          # Service Recommendation Engine (req #3)
    │   ├── documents.js        # Document Requirement Assistant (req #4)
    │   └── complaints.js       # Complaint Reporting & Tracking (req #5)
    └── styles/
        └── main.css            # Full design system (colors, type, components)
```

---

## 7. How the AI Layer Works

Every feature talks to the model through a **single shared entry point**, `callAI()` in `src/utils/aiClient.js`, which keeps prompt-sending, provider-switching, and error handling in one place instead of scattered across every feature file:

1. Each feature builds its own **prompt** and **system instruction** (persona + output-format rules).
2. `callAI()` calls whichever provider is configured (`gemini` or `groq`) first.
3. If that call throws — bad key, rate limit, network hiccup — it **automatically retries once with the other provider**, so a single rate-limited request never breaks a live demo.
4. If both providers fail, the calling feature catches the error and falls back to a **deterministic, realistic canned response** from `src/utils/demoData.js`, clearly marked in the UI so it's transparent that it's a fallback.
5. Features that need structured data (scheme matches, document checklists, complaint classification) ask the model to reply with **strict JSON only**, and pass the raw reply through `parseAiJson()`, which strips stray markdown fences before parsing.

---

## 8. Future Scope

With more time, Smart Bharat could add:

- Real-time complaint routing to actual municipal APIs or email where available.
- A lightweight backend so complaints and chat history sync across devices instead of being local to one browser.
- Support for more Indian languages beyond English and Hindi — the translation architecture already generalizes to any language.
- Deeper voice support (text-to-speech replies, not just speech-to-text input) for citizens with low literacy.
- Push notifications for complaint status changes and scheme deadline reminders.

---

## 9. Alignment with Hackathon Goals

Smart Bharat directly serves the hackathon's goals of **transparency**, **accessibility**, and **digital inclusion**:

- **Transparency** — every complaint gets a trackable status and ID, and every scheme links directly to its official government page.
- **Accessibility** — government processes are explained in plain language instead of bureaucratic jargon, removing a major barrier for first-time users of civic services, and voice input helps citizens who find typing difficult.
- **Digital inclusion** — full Hindi support alongside English means the app speaks to citizens in the language they're actually comfortable in, making civic interactions genuinely faster, smarter, and more user-friendly.

---

<p align="center"><i>Made with ❤️ for Google for Developers × Devengers "PromptWars" (Build with AI)</i></p>
