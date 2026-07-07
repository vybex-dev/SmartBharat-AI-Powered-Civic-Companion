// ============================================================
// TESTS — parseAiJson.js
// Tests for the JSON parsing helper that strips markdown fences
// from AI replies before JSON.parse().
// Run via tests/test-runner.html
// ============================================================

suite('parseAiJson.js — fence stripping and JSON parsing', () => [

  {
    label: 'Parses a plain JSON object without any fences',
    fn: () => {
      const result = parseAiJsonLocal('{"category":"Roads","summary":"Pothole on MG Road"}');
      assertEqual(result.category, 'Roads');
      assertEqual(result.summary, 'Pothole on MG Road');
    }
  },

  {
    label: 'Strips ```json ... ``` fences before parsing',
    fn: () => {
      const input = '```json\n{"key":"value"}\n```';
      const result = parseAiJsonLocal(input);
      assertEqual(result.key, 'value');
    }
  },

  {
    label: 'Strips plain ``` fences (no language tag)',
    fn: () => {
      const input = '```\n{"key":"value"}\n```';
      const result = parseAiJsonLocal(input);
      assertEqual(result.key, 'value');
    }
  },

  {
    label: 'Parses a JSON array correctly',
    fn: () => {
      const input = '[{"id":"scheme-1","reason":"Fits student"},{"id":"scheme-2","reason":"Fits farmer"}]';
      const result = parseAiJsonLocal(input);
      assert(Array.isArray(result));
      assertEqual(result.length, 2);
      assertEqual(result[0].id, 'scheme-1');
    }
  },

  {
    label: 'Parses a JSON array wrapped in ```json fences',
    fn: () => {
      const input = '```json\n[{"id":"scheme-1","reason":"test"}]\n```';
      const result = parseAiJsonLocal(input);
      assert(Array.isArray(result));
      assertEqual(result[0].id, 'scheme-1');
    }
  },

  {
    label: 'Handles extra leading/trailing whitespace',
    fn: () => {
      const input = '   \n  {"key":"value"}  \n  ';
      const result = parseAiJsonLocal(input);
      assertEqual(result.key, 'value');
    }
  },

  {
    label: 'Throws on invalid JSON (after fence stripping)',
    fn: () => {
      assertThrows(() => parseAiJsonLocal('this is not json'));
    }
  },

  {
    label: 'Throws on empty string',
    fn: () => {
      assertThrows(() => parseAiJsonLocal(''));
    }
  },

  {
    label: 'Throws on JSON with trailing comma (invalid JSON)',
    fn: () => {
      assertThrows(() => parseAiJsonLocal('{"key":"value",}'));
    }
  },

  {
    label: 'Preserves nested objects correctly',
    fn: () => {
      const input = '{"outer":{"inner":"deep"}}';
      const result = parseAiJsonLocal(input);
      assertEqual(result.outer.inner, 'deep');
    }
  },

  {
    label: 'Handles boolean and number values',
    fn: () => {
      const input = '{"active":true,"count":42}';
      const result = parseAiJsonLocal(input);
      assertEqual(result.active, true);
      assertEqual(result.count, 42);
    }
  },

  {
    label: 'Case-insensitive: handles ```JSON (uppercase) fences',
    fn: () => {
      const input = '```JSON\n{"key":"value"}\n```';
      const result = parseAiJsonLocal(input);
      assertEqual(result.key, 'value');
    }
  },
]);

// ── Local implementation identical to src/utils/parseAiJson.js ───────────
function parseAiJsonLocal(rawText) {
  const cleaned = rawText.replace(/```json|```/gi, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Could not understand the AI's response. Please try again.");
  }
}
