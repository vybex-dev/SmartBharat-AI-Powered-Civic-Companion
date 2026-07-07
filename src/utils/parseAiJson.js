// ============================================================
// AI JSON PARSING HELPER
// Several features (scheme matching, document checklists, complaint
// classification) ask the AI to reply with structured JSON instead
// of free text. Models sometimes wrap JSON in markdown code fences
// or add stray whitespace, so this single helper cleans and parses
// the reply consistently everywhere it's needed.
// ============================================================

/**
 * Strips markdown code fences (```json ... ```) if present, then
 * parses the remaining text as JSON.
 * @param {string} rawText - the AI's raw text reply.
 * @returns {any} the parsed JSON value (object or array).
 * @throws {Error} if the text is not valid JSON after cleaning.
 */
export function parseAiJson(rawText) {
  const cleaned = rawText.replace(/```json|```/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error("Could not understand the AI's response. Please try again.");
  }
}
