// ============================================================
// STORAGE
// Smart Bharat has no backend, so every piece of user data
// (complaints, chat history, language preference) is persisted in
// the browser's localStorage. All reads/writes go through the
// helpers below so the rest of the app never touches
// localStorage directly.
// ============================================================

const STORAGE_KEYS = {
  COMPLAINTS: "smartBharat_complaints",
  CHAT_HISTORY: "smartBharat_chatHistory",
  LANGUAGE: "smartBharat_language",
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
  writeJSON(STORAGE_KEYS.CHAT_HISTORY, messages);
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
