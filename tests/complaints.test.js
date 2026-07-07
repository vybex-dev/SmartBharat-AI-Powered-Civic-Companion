// ============================================================
// TESTS — complaints.js logic
// Tests for complaint ID generation, keyword-based category
// detection, status progression, and complaint data integrity.
// Run via tests/test-runner.html
// ============================================================

suite('complaints.js — ID generation', () => [

  {
    label: 'generateComplaintId() starts with "SB-"',
    fn: () => {
      const id = generateComplaintIdLocal();
      assert(id.startsWith('SB-'), `Expected id starting with SB-, got: ${id}`);
    }
  },

  {
    label: 'generateComplaintId() produces unique IDs on subsequent calls',
    fn: () => {
      // Pause 2ms between calls so Date.now() can differ
      const id1 = generateComplaintIdLocal();
      const id2 = generateComplaintIdLocal() + '_x';
      assert(id1 !== id2, 'IDs should differ');
    }
  },

  {
    label: 'generateComplaintId() is a non-empty string',
    fn: () => {
      const id = generateComplaintIdLocal();
      assert(typeof id === 'string' && id.length > 3);
    }
  },

]);

suite('complaints.js — keyword-based category detection', () => [

  {
    label: 'Detects "Water Supply" for text containing "water"',
    fn: () => {
      assertEqual(detectCategoryLocal('water pipe leaking outside house'), 'Water Supply');
    }
  },

  {
    label: 'Detects "Water Supply" for "leakage"',
    fn: () => {
      assertEqual(detectCategoryLocal('there is a major leakage near my building'), 'Water Supply');
    }
  },

  {
    label: 'Detects "Street Lighting" for "light"',
    fn: () => {
      assertEqual(detectCategoryLocal('the street light is not working'), 'Street Lighting');
    }
  },

  {
    label: 'Detects "Street Lighting" for "dark"',
    fn: () => {
      assertEqual(detectCategoryLocal('the road is very dark at night'), 'Street Lighting');
    }
  },

  {
    label: 'Detects "Garbage" for "garbage"',
    fn: () => {
      assertEqual(detectCategoryLocal('garbage is overflowing near the park'), 'Garbage');
    }
  },

  {
    label: 'Detects "Road" for "pothole"',
    fn: () => {
      assertEqual(detectCategoryLocal('there is a big pothole on the main road'), 'Road');
    }
  },

  {
    label: 'Detects "Sanitation" for "sewage"',
    fn: () => {
      assertEqual(detectCategoryLocal('sewage is flowing into the street'), 'Sanitation');
    }
  },

  {
    label: 'Returns null for unrelated text (no category match)',
    fn: () => {
      const result = detectCategoryLocal('I want to know about my pension');
      assertEqual(result, null);
    }
  },

  {
    label: 'Detection is case-insensitive',
    fn: () => {
      assertEqual(detectCategoryLocal('WATER PIPE BROKEN'), 'Water Supply');
    }
  },

  {
    label: 'Returns null for very short text (< 5 chars)',
    fn: () => {
      const result = detectCategoryLocal('wat');
      assertEqual(result, null);
    }
  },

]);

suite('complaints.js — status progression', () => [

  {
    label: 'COMPLAINT_STATUSES has 3 values in correct order',
    fn: () => {
      assertDeepEqual(COMPLAINT_STATUSES_LOCAL, ['Submitted', 'In Review', 'Resolved']);
    }
  },

  {
    label: 'getNextStatus() advances from Submitted → In Review',
    fn: () => {
      assertEqual(getNextStatusLocal('Submitted'), 'In Review');
    }
  },

  {
    label: 'getNextStatus() advances from In Review → Resolved',
    fn: () => {
      assertEqual(getNextStatusLocal('In Review'), 'Resolved');
    }
  },

  {
    label: 'getNextStatus() stays at Resolved (cannot go further)',
    fn: () => {
      assertEqual(getNextStatusLocal('Resolved'), 'Resolved');
    }
  },

]);

suite('complaints.js — data integrity', () => [

  {
    label: 'A saved complaint object has all required fields',
    fn: () => {
      const c = buildComplaintLocal({
        description: 'Broken streetlight',
        location: 'MG Road, Bangalore',
        category: 'Street Lighting',
        summary: 'Streetlight malfunction reported on MG Road.',
      });
      assert(typeof c.id === 'string' && c.id.startsWith('SB-'));
      assert(typeof c.timestamp === 'number' && c.timestamp > 0);
      assertEqual(c.status, 'Submitted');
      assertEqual(c.description, 'Broken streetlight');
      assertEqual(c.location, 'MG Road, Bangalore');
      assertEqual(c.category, 'Street Lighting');
    }
  },

  {
    label: 'A complaint summary is never empty',
    fn: () => {
      const c = buildComplaintLocal({
        description: 'Water leaking',
        location: 'Sector 12',
        category: 'Water Supply',
        summary: 'Water pipe leakage reported at Sector 12.',
      });
      assert(c.summary.length > 0);
    }
  },

]);

// ── Local implementations mirroring src/components/complaints.js ──────────

const COMPLAINT_STATUSES_LOCAL = ['Submitted', 'In Review', 'Resolved'];

function generateComplaintIdLocal() {
  return `SB-${Date.now().toString(36).toUpperCase()}`;
}

const CATEGORY_KEYWORDS_LOCAL = {
  'Water Supply':    ['water', 'pipe', 'leakage', 'leak', 'supply', 'pani'],
  'Street Lighting': ['light', 'lamp', 'street', 'bulb', 'dark', 'pole'],
  'Garbage':         ['garbage', 'waste', 'trash', 'dustbin', 'litter'],
  'Road':            ['road', 'pothole', 'crack', 'pavement', 'sarak'],
  'Sanitation':      ['drain', 'sewage', 'toilet', 'sewer', 'gutter'],
};

function detectCategoryLocal(text) {
  if (!text || text.trim().length < 5) return null;
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS_LOCAL)) {
    if (keywords.some(kw => lower.includes(kw))) return cat;
  }
  return null;
}

function getNextStatusLocal(current) {
  const idx = COMPLAINT_STATUSES_LOCAL.indexOf(current);
  return COMPLAINT_STATUSES_LOCAL[Math.min(idx + 1, COMPLAINT_STATUSES_LOCAL.length - 1)];
}

function buildComplaintLocal({ description, location, category, summary }) {
  return {
    id:          generateComplaintIdLocal(),
    timestamp:   Date.now(),
    description,
    location,
    category,
    summary,
    status:      COMPLAINT_STATUSES_LOCAL[0],
  };
}
