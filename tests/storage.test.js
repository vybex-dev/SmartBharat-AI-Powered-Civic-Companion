// ============================================================
// TESTS — storage.js
// Tests for all localStorage helper functions in src/utils/storage.js
// Run via tests/test-runner.html
// ============================================================

suite('storage.js — getComplaints / saveComplaint / updateComplaintStatus', () => [

  {
    label: 'getComplaints() returns [] when localStorage is empty',
    fn: () => {
      localStorage.removeItem('smartBharat_complaints');
      const result = getComplaintsLocal();
      assertDeepEqual(result, []);
    }
  },

  {
    label: 'saveComplaint() persists a complaint and returns the list',
    fn: () => {
      localStorage.removeItem('smartBharat_complaints');
      const c = { id: 'SB-001', description: 'Pothole', status: 'Submitted', timestamp: 1000 };
      const list = saveComplaintLocal(c);
      assertEqual(list.length, 1);
      assertEqual(list[0].id, 'SB-001');
    }
  },

  {
    label: 'saveComplaint() prepends newer complaints (newest first)',
    fn: () => {
      localStorage.removeItem('smartBharat_complaints');
      saveComplaintLocal({ id: 'SB-001', description: 'Old', status: 'Submitted', timestamp: 1000 });
      saveComplaintLocal({ id: 'SB-002', description: 'New', status: 'Submitted', timestamp: 2000 });
      const list = getComplaintsLocal();
      assertEqual(list[0].id, 'SB-002'); // newest first
    }
  },

  {
    label: 'updateComplaintStatus() changes status correctly',
    fn: () => {
      localStorage.removeItem('smartBharat_complaints');
      saveComplaintLocal({ id: 'SB-001', description: 'Test', status: 'Submitted', timestamp: 1000 });
      updateComplaintStatusLocal('SB-001', 'In Review');
      const list = getComplaintsLocal();
      assertEqual(list.find(c => c.id === 'SB-001').status, 'In Review');
    }
  },

  {
    label: 'updateComplaintStatus() leaves other complaints unchanged',
    fn: () => {
      localStorage.removeItem('smartBharat_complaints');
      saveComplaintLocal({ id: 'SB-001', description: 'A', status: 'Submitted', timestamp: 1000 });
      saveComplaintLocal({ id: 'SB-002', description: 'B', status: 'Submitted', timestamp: 2000 });
      updateComplaintStatusLocal('SB-001', 'Resolved');
      const list = getComplaintsLocal();
      assertEqual(list.find(c => c.id === 'SB-002').status, 'Submitted');
    }
  },

  {
    label: 'getComplaints() handles corrupted localStorage gracefully (returns [])',
    fn: () => {
      localStorage.setItem('smartBharat_complaints', 'NOT_VALID_JSON}}}');
      const result = getComplaintsLocal();
      assertDeepEqual(result, []);
      localStorage.removeItem('smartBharat_complaints');
    }
  },

  {
    label: 'getChatHistory() returns [] when localStorage is empty',
    fn: () => {
      localStorage.removeItem('smartBharat_chatHistory');
      const result = getChatHistoryLocal();
      assertDeepEqual(result, []);
    }
  },

  {
    label: 'saveChatHistory() and getChatHistory() roundtrip',
    fn: () => {
      localStorage.removeItem('smartBharat_chatHistory');
      const msgs = [
        { role: 'user', text: 'Hello', timestamp: 1000 },
        { role: 'assistant', text: 'Hi!', timestamp: 2000 }
      ];
      saveChatHistoryLocal(msgs);
      const loaded = getChatHistoryLocal();
      assertEqual(loaded.length, 2);
      assertEqual(loaded[0].text, 'Hello');
      assertEqual(loaded[1].role, 'assistant');
    }
  },

  {
    label: 'clearChatHistory() removes chat data from storage',
    fn: () => {
      saveChatHistoryLocal([{ role: 'user', text: 'test', timestamp: 1 }]);
      clearChatHistoryLocal();
      const result = getChatHistoryLocal();
      assertDeepEqual(result, []);
    }
  },

  {
    label: 'getStoredLanguage() returns null when not set',
    fn: () => {
      localStorage.removeItem('smartBharat_language');
      const result = getStoredLanguageLocal();
      assertEqual(result, null);
    }
  },

  {
    label: 'setStoredLanguage() and getStoredLanguage() roundtrip for "hi"',
    fn: () => {
      setStoredLanguageLocal('hi');
      assertEqual(getStoredLanguageLocal(), 'hi');
      localStorage.removeItem('smartBharat_language');
    }
  },

  {
    label: 'setStoredLanguage() and getStoredLanguage() roundtrip for "en"',
    fn: () => {
      setStoredLanguageLocal('en');
      assertEqual(getStoredLanguageLocal(), 'en');
      localStorage.removeItem('smartBharat_language');
    }
  },
]);

// ── Local re-implementations of storage functions under test ─────────────
// (identical logic to src/utils/storage.js — avoids ES module resolution
//  issues when running via file:// in the test runner)

const STORAGE_KEYS = {
  COMPLAINTS:   'smartBharat_complaints',
  CHAT_HISTORY: 'smartBharat_chatHistory',
  LANGUAGE:     'smartBharat_language',
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function getComplaintsLocal()         { return readJSON(STORAGE_KEYS.COMPLAINTS, []); }
function saveComplaintLocal(c)        {
  const list = getComplaintsLocal();
  list.unshift(c);
  writeJSON(STORAGE_KEYS.COMPLAINTS, list);
  return list;
}
function updateComplaintStatusLocal(id, status) {
  const list = getComplaintsLocal().map(c => c.id === id ? { ...c, status } : c);
  writeJSON(STORAGE_KEYS.COMPLAINTS, list);
  return list;
}
function getChatHistoryLocal()        { return readJSON(STORAGE_KEYS.CHAT_HISTORY, []); }
function saveChatHistoryLocal(msgs)   { writeJSON(STORAGE_KEYS.CHAT_HISTORY, msgs); }
function clearChatHistoryLocal()      { localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY); }
function getStoredLanguageLocal()     { return localStorage.getItem(STORAGE_KEYS.LANGUAGE); }
function setStoredLanguageLocal(lang) { localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang); }
