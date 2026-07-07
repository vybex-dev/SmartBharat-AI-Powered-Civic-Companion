// ============================================================
// STORAGE
// Smart Bharat has no backend, so every piece of user data
// (complaints, chat history, language preference) is persisted in
// the browser's localStorage. All reads/writes go through the
// helpers below so the rest of the app never touches
// localStorage directly.
// ============================================================

import {
  MAX_CHAT_HISTORY_MESSAGES,
  MAX_STORAGE_ENTRY_SIZE,
} from "../config/config.js";

const STORAGE_KEYS = {
  COMPLAINTS:   "smartBharat_complaints",
  CHAT_HISTORY: "smartBharat_chatHistory",
  LANGUAGE:     "smartBharat_language",
};

/** Safely reads and parses JSON from localStorage, with a fallback. */
function readJSON(key, fallbackValue) {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallbackValue;
  } catch (error) {
    console.error(`Could not read "${key}" from storage:`, error);
    return fallbackValue;
  }
}

/** Safely stringifies and writes a value to localStorage. */
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not write "${key}" to storage:`, error);
  }
}

// ---- Complaints -------------------------------------------------

export function getComplaints() {
  return readJSON(STORAGE_KEYS.COMPLAINTS, []);
}

export function saveComplaint(complaint) {
  const complaints = getComplaints();

  // Guard: never write a single entry that is unreasonably large
  // (prevents runaway AI summaries bloating localStorage).
  const entrySize = (complaint.description?.length || 0) + (complaint.summary?.length || 0);
  if (entrySize > MAX_STORAGE_ENTRY_SIZE) {
    complaint = {
      ...complaint,
      description: complaint.description?.slice(0, 1000) || complaint.description,
      summary: complaint.summary?.slice(0, 500) || complaint.summary,
    };
  }

  complaints.unshift(complaint); // newest first
  writeJSON(STORAGE_KEYS.COMPLAINTS, complaints);
  return complaints;
}

export function updateComplaintStatus(complaintId, newStatus) {
  const complaints = getComplaints().map((complaint) =>
    complaint.id === complaintId
      ? { ...complaint, status: newStatus }
      : complaint
  );
  writeJSON(STORAGE_KEYS.COMPLAINTS, complaints);
  return complaints;
}

// ---- Chat history -------------------------------------------------

export function getChatHistory() {
  return readJSON(STORAGE_KEYS.CHAT_HISTORY, []);
}

export function saveChatHistory(messages) {
  // Cap history length so localStorage doesn't grow without bound.
  const capped = messages.slice(-MAX_CHAT_HISTORY_MESSAGES);
  writeJSON(STORAGE_KEYS.CHAT_HISTORY, capped);
}

export function clearChatHistory() {
  localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
}

// ---- Language preference -------------------------------------------------

export function getStoredLanguage() {
  return localStorage.getItem(STORAGE_KEYS.LANGUAGE);
}

export function setStoredLanguage(languageCode) {
  localStorage.setItem(STORAGE_KEYS.LANGUAGE, languageCode);
}
