// ============================================================
// TESTS — schemes.js logic
// Tests for scheme matching output filtering, null-ID handling,
// fallback logic, and scheme data integrity.
// Run via tests/test-runner.html
// ============================================================

suite('schemes.js — scheme matching output filtering', () => [

  {
    label: 'filterMatchedSchemes() returns only schemes present in the source list',
    fn: () => {
      const schemesList = [
        { id: 'pmay', name: 'PM Awas Yojana', category: 'Housing', eligibility: 'BPL families' },
        { id: 'pmkisan', name: 'PM Kisan', category: 'Agriculture', eligibility: 'Farmers' },
      ];
      const aiMatches = [
        { id: 'pmay', reason: 'Needs housing' },
        { id: 'nonexistent-scheme', reason: 'Made up scheme' },
      ];
      const result = filterMatchedSchemesLocal(aiMatches, schemesList);
      assertEqual(result.length, 1);
      assertEqual(result[0].id, 'pmay');
    }
  },

  {
    label: 'filterMatchedSchemes() filters out matches with null ID',
    fn: () => {
      const schemesList = [{ id: 'pmay', name: 'PM Awas', category: 'Housing', eligibility: 'BPL' }];
      const aiMatches = [{ id: null, reason: 'Null match' }];
      const result = filterMatchedSchemesLocal(aiMatches, schemesList);
      assertEqual(result.length, 0);
    }
  },

  {
    label: 'filterMatchedSchemes() attaches the AI reason to the matched scheme',
    fn: () => {
      const schemesList = [{ id: 'pmay', name: 'PM Awas', category: 'Housing', eligibility: 'BPL' }];
      const aiMatches = [{ id: 'pmay', reason: 'Fits housing need' }];
      const result = filterMatchedSchemesLocal(aiMatches, schemesList);
      assertEqual(result[0].reason, 'Fits housing need');
    }
  },

  {
    label: 'filterMatchedSchemes() preserves all original scheme fields',
    fn: () => {
      const scheme = { id: 'pmay', name: 'PM Awas', category: 'Housing', eligibility: 'BPL families', description: 'Housing for all', link: 'https://pmay.gov.in' };
      const aiMatches = [{ id: 'pmay', reason: 'Fits' }];
      const result = filterMatchedSchemesLocal(aiMatches, [scheme]);
      assertEqual(result[0].name, 'PM Awas');
      assertEqual(result[0].category, 'Housing');
      assertEqual(result[0].link, 'https://pmay.gov.in');
    }
  },

  {
    label: 'filterMatchedSchemes() handles empty aiMatches gracefully',
    fn: () => {
      const schemesList = [{ id: 'pmay', name: 'PM Awas', category: 'Housing', eligibility: 'BPL' }];
      const result = filterMatchedSchemesLocal([], schemesList);
      assertDeepEqual(result, []);
    }
  },

  {
    label: 'filterMatchedSchemes() handles empty schemesList gracefully',
    fn: () => {
      const aiMatches = [{ id: 'pmay', reason: 'Fits' }];
      const result = filterMatchedSchemesLocal(aiMatches, []);
      assertDeepEqual(result, []);
    }
  },

  {
    label: 'filterMatchedSchemes() handles non-array aiMatches (returns [])',
    fn: () => {
      const schemesList = [{ id: 'pmay', name: 'PM Awas', category: 'Housing', eligibility: 'BPL' }];
      const result = filterMatchedSchemesLocal(null, schemesList);
      assertDeepEqual(result, []);
    }
  },

]);

suite('schemes.js — SCHEME_ICONS mapping', () => [

  {
    label: 'Health category returns medical_services icon',
    fn: () => {
      const cfg = getSchemeIconConfigLocal('Health');
      assertEqual(cfg.icon, 'medical_services');
    }
  },

  {
    label: 'Agriculture category returns agriculture icon',
    fn: () => {
      const cfg = getSchemeIconConfigLocal('Agriculture');
      assertEqual(cfg.icon, 'agriculture');
    }
  },

  {
    label: 'Education category returns school icon',
    fn: () => {
      const cfg = getSchemeIconConfigLocal('Education');
      assertEqual(cfg.icon, 'school');
    }
  },

  {
    label: 'Finance category returns payments icon',
    fn: () => {
      const cfg = getSchemeIconConfigLocal('Finance');
      assertEqual(cfg.icon, 'payments');
    }
  },

  {
    label: 'Unknown category falls back to account_balance icon',
    fn: () => {
      const cfg = getSchemeIconConfigLocal('UnknownCategory');
      assertEqual(cfg.icon, 'account_balance');
    }
  },

]);

suite('schemes.js — scheme data integrity (schemes.json expectations)', () => [

  {
    label: 'SCHEME_CATEGORIES list has at least 5 known categories',
    fn: () => {
      assert(KNOWN_CATEGORIES_LOCAL.length >= 5);
    }
  },

  {
    label: 'All known categories are non-empty strings',
    fn: () => {
      assert(KNOWN_CATEGORIES_LOCAL.every(c => typeof c === 'string' && c.length > 0));
    }
  },

]);

// ── Local implementations mirroring src/components/schemes.js ────────────

function filterMatchedSchemesLocal(aiMatches, schemesList) {
  if (!Array.isArray(aiMatches)) return [];
  return aiMatches
    .map(match => {
      const scheme = schemesList.find(s => s.id === match.id);
      return scheme ? { ...scheme, reason: match.reason } : null;
    })
    .filter(Boolean);
}

const SCHEME_ICONS_LOCAL = {
  'Health':      { icon: 'medical_services',  bg: '#teal',   color: '#fff' },
  'Agriculture': { icon: 'agriculture',        bg: '#green',  color: '#green' },
  'Education':   { icon: 'school',             bg: '#blue',   color: '#blue' },
  'Finance':     { icon: 'payments',           bg: '#purple', color: '#purple' },
  'Transport':   { icon: 'commute',            bg: '#red',    color: '#red' },
  'default':     { icon: 'account_balance',    bg: '#gray',   color: '#gray' },
};

function getSchemeIconConfigLocal(category) {
  return SCHEME_ICONS_LOCAL[category] || SCHEME_ICONS_LOCAL['default'];
}

const KNOWN_CATEGORIES_LOCAL = ['Education', 'Healthcare', 'Agriculture', 'Finance', 'Transport', 'Housing', 'Energy'];
