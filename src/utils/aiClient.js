// ============================================================
// AI CLIENT
// Every feature in Smart Bharat (chat, scheme matching, document
// checklists, complaint classification) calls the AI through the
// single callAI() function at the bottom of this file. That keeps
// prompt-sending, provider-switching, and error handling in one
// place instead of scattered across every feature file.
// ============================================================

import {
  GEMINI_API_URL,
  GROQ_API_URL,
  GROQ_MODEL,
  getRuntimeConfig,
} from "../config/config.js";

/**
 * Calls Google's Gemini API.
 * @param {string} prompt - the user-facing prompt / question.
 * @param {string} systemInstruction - persona + behaviour rules for the model.
 * @returns {Promise<string>} the model's plain-text reply.
 */
export async function callGemini(prompt, systemInstruction = "") {
  const { geminiApiKey } = await getRuntimeConfig();

  if (!geminiApiKey || geminiApiKey.includes("YOUR_")) {
    throw new Error(
      "Gemini API key is not set. Add it in the root .env file."
    );
  }

  const requestBody = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  };

  // Gemini accepts the persona/rules separately from the user prompt
  // via systemInstruction, which keeps the two concerns cleanly split.
  if (systemInstruction) {
    requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${geminiApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const replyText = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .join("");

  if (!replyText) {
    throw new Error("Gemini returned an empty or unreadable response.");
  }
  return replyText;
}

/**
 * Calls Groq's OpenAI-compatible chat completions endpoint.
 * Used as an automatic fallback if Gemini fails (e.g. rate limit
 * during a live demo).
 * @param {string} prompt - the user-facing prompt / question.
 * @param {string} systemInstruction - persona + behaviour rules for the model.
 * @returns {Promise<string>} the model's plain-text reply.
 */
export async function callGroq(prompt, systemInstruction = "") {
  const { groqApiKey } = await getRuntimeConfig();

  if (!groqApiKey || groqApiKey.includes("YOUR_")) {
    throw new Error(
      "Groq API key is not set. Add it in the root .env file."
    );
  }

  const messages = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const replyText = data?.choices?.[0]?.message?.content;

  if (!replyText) {
    throw new Error("Groq returned an empty or unreadable response.");
  }
  return replyText;
}

/**
 * Single entry point every feature should use to talk to an LLM.
 *
 * It calls whichever provider is set in the runtime config,
 * and if that call throws (bad key, rate limit, network hiccup),
 * it automatically retries once with the other provider. This is
 * what makes the app resilient to a Gemini rate-limit mid-demo:
 * Groq quietly takes over for that single request.
 *
 * @param {string} prompt - the user-facing prompt / question.
 * @param {string} systemInstruction - persona + behaviour rules for the model.
 * @returns {Promise<string>} the model's plain-text reply.
 */
export async function callAI(prompt, systemInstruction = "") {
  // 1. Try Vercel Serverless API first (works when deployed on Vercel)
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.reply) return data.reply;
      throw new Error(data.error || "Unknown error from server API");
    } else if (response.status !== 404) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Server API error: ${response.status}`);
    }
    // If response.status === 404, we are likely running locally without Vercel Dev.
    // Fall back to local client-side logic.
  } catch (error) {
    if (error.message.includes("Server API error") || error.message.includes("API keys are not configured")) {
      throw error; // Rethrow to trigger fallback UI
    }
    // Network errors will just fall through to local logic
  }

  // 2. Fallback to local client-side logic (works with local .env file)
  const { aiProvider } = await getRuntimeConfig();
  const provider = aiProvider === "groq" ? "groq" : "gemini";
  const primaryCall = provider === "groq" ? callGroq : callGemini;
  const fallbackCall = provider === "groq" ? callGemini : callGroq;
  const primaryName = provider === "groq" ? "Groq" : "Gemini";
  const fallbackName = provider === "groq" ? "Gemini" : "Groq";

  try {
    return await primaryCall(prompt, systemInstruction);
  } catch (primaryError) {
    try {
      return await fallbackCall(prompt, systemInstruction);
    } catch (fallbackError) {
      // Both providers failed — surface one clear, actionable error
      // rather than letting a raw promise rejection reach the UI.
      throw new Error(
        `Could not reach ${primaryName} or ${fallbackName}. ` +
          `${primaryName}: ${primaryError.message} — ${fallbackName}: ${fallbackError.message}`
      );
    }
  }
}
