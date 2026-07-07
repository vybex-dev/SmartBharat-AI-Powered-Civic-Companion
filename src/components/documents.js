// ============================================================
// DOCUMENT REQUIREMENT ASSISTANT
// Implements challenge requirement #4 (assist with document
// requirements). Given a service/document goal, asks the AI for a
// structured checklist: documents needed, steps, and rough timeline.
// ============================================================

import { callAI } from "../utils/aiClient.js";
import { parseAiJson } from "../utils/parseAiJson.js";
import { DEMO_DOCUMENT_GOAL, getFallbackChecklist } from "../utils/demoData.js";

/**
 * Asks the AI for a structured document checklist for a given goal
 * (e.g. "passport", "caste certificate").
 * @returns {Promise<{documents: string[], steps: string[], estimatedTime: string}>}
 */
async function generateChecklist(goalText, language) {
  const languageInstruction =
    language === "hi"
      ? "Write every text value in Hindi, using Devanagari script."
      : "Write every text value in English.";

  const prompt = `A citizen in India wants to obtain or apply for: "${goalText}"

Respond with ONLY a valid JSON object, no markdown fences, no extra commentary, in exactly this shape:
{
  "documents": ["document 1", "document 2", "..."],
  "steps": ["step 1", "step 2", "..."],
  "estimatedTime": "a short plain-language estimate, e.g. '2-3 weeks'"
}

List realistic documents and steps used in India for this goal, in the order a citizen would actually need them.
${languageInstruction}`;

  const systemPrompt =
    "You are an expert on Indian government document and service " +
    "requirements. You always reply with strictly valid JSON and nothing else.";

  let checklist;
  try {
    const rawReply = await callAI(prompt, systemPrompt);
    checklist = parseAiJson(rawReply);
  } catch {
    return getFallbackChecklist(goalText, language);
  }

  return {
    documents: Array.isArray(checklist.documents) ? checklist.documents : [],
    steps: Array.isArray(checklist.steps) ? checklist.steps : [],
    estimatedTime: checklist.estimatedTime || "",
  };
}

/**
 * Renders the document assistant view and wires up its form.
 * @param {HTMLElement} container
 * @param {object} t - active translations object
 * @param {string} language - "en" or "hi"
 */
export function renderDocuments(container, t, language) {
  const quickChipsHtml = t.documents.quickChips
    .map((label) => `<button class="chip" data-chip="${escapeHtml(label)}">${label}</button>`)
    .join("");

  container.innerHTML = `
    <section class="view-header">
      <h1>${t.documents.title}</h1>
      <p>${t.documents.subtitle}</p>
    </section>
    <div class="demo-banner">
      <div class="demo-banner__text">
        <strong>${t.documents.demoTitle}</strong>
        <p>${t.documents.demoBody}</p>
      </div>
      <button class="btn btn--primary btn--small" id="documentsDemoBtn">${t.documents.demoButton}</button>
    </div>
    <div class="bento-grid">
      <section class="panel col-span-5">
        <form id="documentsForm">
          <label class="field-label" for="goalInput">${t.documents.goalLabel}</label>
          <input
            type="text"
            id="goalInput"
            class="text-input"
            placeholder="${t.documents.goalPlaceholder}"
          />
          <div class="chip-row">${quickChipsHtml}</div>
          <button type="submit" class="btn btn--primary" id="generateChecklistBtn">${t.documents.generateButton}</button>
        </form>
      </section>
      <section class="panel col-span-7" style="display: flex; flex-direction: column;">
        <div id="documentsResults" class="results-area" style="flex: 1;">
          <p class="results-area__empty">${t.documents.emptyState}</p>
        </div>
      </section>
    </div>
  `;

  const formEl = container.querySelector("#documentsForm");
  const inputEl = container.querySelector("#goalInput");
  const submitBtn = container.querySelector("#generateChecklistBtn");
  const resultsEl = container.querySelector("#documentsResults");
  const demoBtn = container.querySelector("#documentsDemoBtn");

  demoBtn.addEventListener("click", () => {
    inputEl.value = DEMO_DOCUMENT_GOAL[language] || DEMO_DOCUMENT_GOAL.en;
    formEl.requestSubmit();
  });

  container.querySelectorAll("[data-chip]").forEach((chip) => {
    chip.addEventListener("click", () => {
      inputEl.value = chip.dataset.chip;
      formEl.requestSubmit();
    });
  });

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const goalText = inputEl.value.trim();
    if (!goalText) return;

    submitBtn.disabled = true;
    submitBtn.textContent = t.documents.generating;
    resultsEl.innerHTML = `<p class="results-area__loading">${t.documents.generating}</p>`;
    
    // Auto-scroll to results area on smaller screens (or even large screens)
    resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      const checklist = await generateChecklist(goalText, language);
      renderChecklist(resultsEl, goalText, checklist, t);
    } catch (error) {
      resultsEl.innerHTML = `<p class="error-text">${error.message}</p>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = t.documents.generateButton;
    }
  });
}

function renderChecklist(resultsEl, goalText, checklist, t) {
  const documentsHtml = checklist.documents
    .map(
      (document, index) => `
        <li class="checklist-item">
          <label>
            <input type="checkbox" id="doc-${index}" />
            <span>${document}</span>
          </label>
        </li>
      `
    )
    .join("");

  const stepsHtml = checklist.steps.map((step) => `<li>${step}</li>`).join("");

  resultsEl.innerHTML = `
    <h3 class="results-area__title">${t.documents.checklistTitle}: ${goalText}</h3>
    ${checklist.isFallback ? `<span class="fallback-label">${t.common.demoSafe}</span>` : ""}
    ${checklist.estimatedTime ? `<p class="checklist-time"><strong>⏱ ${checklist.estimatedTime}</strong></p>` : ""}
    <div class="checklist-columns">
      <div>
        <h4>${t.documents.documentsNeededTitle}</h4>
        <ul class="checklist-list">${documentsHtml}</ul>
      </div>
      <div>
        <h4>${t.documents.stepsTitle}</h4>
        <ol class="steps-list">${stepsHtml}</ol>
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
