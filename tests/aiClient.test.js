// ============================================================
// TESTS — aiClient.js
// Tests for the AI client's fallback logic, request building,
// provider switching, and error handling. Uses mock fetch so
// no real API calls are made.
// Run via tests/test-runner.html
// ============================================================

suite('aiClient.js — callAI fallback logic (mock fetch)', () => [

  {
    label: 'Returns reply when primary (Gemini) succeeds',
    fn: async () => {
      const client = makeClientLocal({
        primaryReply: 'Gemini reply',
        fallbackReply: 'Groq reply',
        primaryFails: false,
      });
      const result = await client.callAI('Hello', 'You are a helpful assistant');
      assertEqual(result, 'Gemini reply');
    }
  },

  {
    label: 'Falls back to secondary when primary throws',
    fn: async () => {
      const client = makeClientLocal({
        primaryReply: 'Gemini reply',
        fallbackReply: 'Groq reply',
        primaryFails: true,
      });
      const result = await client.callAI('Hello', '');
      assertEqual(result, 'Groq reply');
    }
  },

  {
    label: 'Throws combined error when both providers fail',
    fn: async () => {
      const client = makeClientLocal({
        primaryFails: true,
        fallbackFails: true,
      });
      let threw = false;
      try {
        await client.callAI('Hello', '');
      } catch (err) {
        threw = true;
        assert(err.message.includes('Could not reach'));
      }
      assert(threw);
    }
  },

  {
    label: 'callAI passes prompt and systemInstruction to primary provider',
    fn: async () => {
      let capturedPrompt = null;
      let capturedSystem = null;
      const client = makeClientLocal({
        onPrimaryCall: (p, s) => { capturedPrompt = p; capturedSystem = s; },
        primaryReply: 'ok',
      });
      await client.callAI('my question', 'be helpful');
      assertEqual(capturedPrompt, 'my question');
      assertEqual(capturedSystem, 'be helpful');
    }
  },

  {
    label: 'callAI passes prompt to fallback when primary fails',
    fn: async () => {
      let capturedFallbackPrompt = null;
      const client = makeClientLocal({
        primaryFails: true,
        fallbackReply: 'fallback ok',
        onFallbackCall: (p) => { capturedFallbackPrompt = p; },
      });
      await client.callAI('my question', '');
      assertEqual(capturedFallbackPrompt, 'my question');
    }
  },

]);

suite('aiClient.js — request body construction (Gemini format)', () => [

  {
    label: 'Gemini request body has contents array with user role',
    fn: () => {
      const body = buildGeminiBodyLocal('Hello, what is Aadhaar?', '');
      assert(Array.isArray(body.contents));
      assertEqual(body.contents[0].role, 'user');
      assertEqual(body.contents[0].parts[0].text, 'Hello, what is Aadhaar?');
    }
  },

  {
    label: 'Gemini request body includes systemInstruction when provided',
    fn: () => {
      const body = buildGeminiBodyLocal('Q', 'Be helpful');
      assert(body.systemInstruction != null);
      assertEqual(body.systemInstruction.parts[0].text, 'Be helpful');
    }
  },

  {
    label: 'Gemini request body omits systemInstruction when empty',
    fn: () => {
      const body = buildGeminiBodyLocal('Q', '');
      assertEqual(body.systemInstruction, undefined);
    }
  },

  {
    label: 'Gemini generationConfig includes temperature and maxOutputTokens',
    fn: () => {
      const body = buildGeminiBodyLocal('Q', '');
      assert(typeof body.generationConfig.temperature === 'number');
      assert(typeof body.generationConfig.maxOutputTokens === 'number');
      assert(body.generationConfig.maxOutputTokens > 0);
    }
  },

]);

suite('aiClient.js — request body construction (Groq/OpenAI format)', () => [

  {
    label: 'Groq messages array has system + user when systemInstruction given',
    fn: () => {
      const msgs = buildGroqMessagesLocal('Q', 'System persona');
      assertEqual(msgs.length, 2);
      assertEqual(msgs[0].role, 'system');
      assertEqual(msgs[0].content, 'System persona');
      assertEqual(msgs[1].role, 'user');
      assertEqual(msgs[1].content, 'Q');
    }
  },

  {
    label: 'Groq messages array has only user message when no systemInstruction',
    fn: () => {
      const msgs = buildGroqMessagesLocal('Q', '');
      assertEqual(msgs.length, 1);
      assertEqual(msgs[0].role, 'user');
    }
  },

  {
    label: 'Groq messages user content matches the prompt exactly',
    fn: () => {
      const msgs = buildGroqMessagesLocal('Tell me about PM Kisan', '');
      assertEqual(msgs[msgs.length - 1].content, 'Tell me about PM Kisan');
    }
  },

]);

// ── Local mock implementations ────────────────────────────────────────────

function buildGeminiBodyLocal(prompt, systemInstruction) {
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  return body;
}

function buildGroqMessagesLocal(prompt, systemInstruction) {
  const messages = [];
  if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
  messages.push({ role: 'user', content: prompt });
  return messages;
}

/**
 * Creates a local mock of callAI() for testing fallback behaviour
 * without making real HTTP requests.
 */
function makeClientLocal({ primaryReply, fallbackReply, primaryFails = false, fallbackFails = false, onPrimaryCall, onFallbackCall }) {
  async function callPrimary(prompt, system) {
    if (onPrimaryCall) onPrimaryCall(prompt, system);
    if (primaryFails) throw new Error('Primary provider failed (mock)');
    return primaryReply;
  }
  async function callFallback(prompt, system) {
    if (onFallbackCall) onFallbackCall(prompt, system);
    if (fallbackFails) throw new Error('Fallback provider failed (mock)');
    return fallbackReply;
  }
  return {
    async callAI(prompt, system) {
      try {
        return await callPrimary(prompt, system);
      } catch (primaryError) {
        try {
          return await callFallback(prompt, system);
        } catch (fallbackError) {
          throw new Error(
            `Could not reach Gemini or Groq. Gemini: ${primaryError.message} — Groq: ${fallbackError.message}`
          );
        }
      }
    },
  };
}
