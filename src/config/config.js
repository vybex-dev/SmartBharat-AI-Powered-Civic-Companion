// ============================================================
// SMART BHARAT — CONFIGURATION
// Public configuration only. API keys live in the root .env file,
// which is ignored by Git. Copy .env.example to .env for local use.
// ============================================================

// ---- 1. Gemini (primary provider) ----------------------------
// Get a free key at https://aistudio.google.com/apikey
export const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
export const GEMINI_MODEL = "gemini-2.0-flash";
export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ---- 2. Groq (fallback provider) -------------------------------
// Get a free key at https://console.groq.com/keys
// Used automatically if Gemini fails or rate-limits (e.g. during a
// live demo), so the app keeps working either way.
export const GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE";
export const GROQ_MODEL = "llama-3.1-8b-instant";
export const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ---- 3. Which provider is active? ------------------------------
// Set to "gemini" or "groq". The other one is used automatically
// as a fallback if this one's call fails.
export const AI_PROVIDER = "gemini";

// ---- 4. App-wide settings ---------------------------------------
export const APP_NAME = "Smart Bharat";
export const DEFAULT_LANGUAGE = "en"; // "en" or "hi"

// Complaint categories used across the Complaint Reporting feature
export const COMPLAINT_CATEGORIES = [
  "Roads",
  "Water",
  "Electricity",
  "Sanitation",
  "Other",
];

// Complaint status values, in the order they progress during the
// demo-only "simulate progress" action on the tracker.
export const COMPLAINT_STATUSES = ["Submitted", "In Review", "Resolved"];

let envCache = null;

/**
 * Loads local secrets from the root .env file at runtime.
 *
 * This app intentionally has no build step, so browser-side .env
 * loading is only meant to keep keys out of GitHub during local demos.
 * Do not deploy a real production frontend with raw API keys.
 */
export async function getRuntimeConfig() {
  if (envCache) return envCache;

  const env = await loadDotEnv();
  envCache = {
    geminiApiKey: env.SMART_BHARAT_GEMINI_API_KEY || GEMINI_API_KEY,
    groqApiKey: env.SMART_BHARAT_GROQ_API_KEY || GROQ_API_KEY,
    aiProvider: env.SMART_BHARAT_AI_PROVIDER || AI_PROVIDER,
  };

  return envCache;
}

async function loadDotEnv() {
  try {
    const response = await fetch(new URL("../../.env", import.meta.url));
    if (!response.ok) return {};
    return parseDotEnv(await response.text());
  } catch {
    return {};
  }
}

function parseDotEnv(rawText) {
  return rawText.split(/\r?\n/).reduce((values, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return values;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return values;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
    values[key] = value;
    return values;
  }, {});
}
