// ============================================================
// COMPLAINT REPORTING & TRACKING — v2 Premium
// Implements UI from file 3:
// - AI Smart Summary Widget with live stats (bento grid top)
// - Grievance form with AI categorization hint
// - Map placeholder widget
// - Timeline-style complaint tracker
// ============================================================

import { callAI } from "../utils/aiClient.js";
import { parseAiJson } from "../utils/parseAiJson.js";
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES, MAX_COMPLAINT_LENGTH, CATEGORY_HINT_DEBOUNCE_MS } from "../config/config.js";
import { getComplaints, saveComplaint, updateComplaintStatus } from "../utils/storage.js";
import { DEMO_COMPLAINT, getFallbackComplaintSummary } from "../utils/demoData.js";
import { showToast } from "../utils/toast.js";

const AUTO_CATEGORY_VALUE = "auto";

function generateComplaintId() {
  return `SB-${Date.now().toString(36).toUpperCase()}`;
}

async function classifyAndSummarize(description, location, language) {
  const languageInstruction =
    language === "hi"
      ? "Write the summary in Hindi, using Devanagari script."
      : "Write the summary in English.";

  const prompt = `A citizen has filed this civic complaint:
Description: "${description}"
Location: "${location}"

Classify it into exactly ONE of these categories: ${COMPLAINT_CATEGORIES.join(", ")}.
Also write a short, official-sounding one-sentence summary suitable for a government complaint register.

Respond with ONLY a valid JSON object, no markdown fences, no extra commentary, in exactly this shape:
{"category": "one of the categories above", "summary": "official-sounding one-sentence summary"}

${languageInstruction}`;

  const systemPrompt =
    "You are a municipal complaint triage assistant for an Indian civic app. " +
    "You always reply with strictly valid JSON and nothing else.";

  let parsed;
  try {
    const rawReply = await callAI(prompt, systemPrompt);
    parsed = parseAiJson(rawReply);
  } catch {
    return getFallbackComplaintSummary(description, location, "", language);
  }

  return {
    category: COMPLAINT_CATEGORIES.includes(parsed.category) ? parsed.category : "Other",
    summary: parsed.summary || description,
  };
}

async function summarizeOnly(description, location, category, language) {
  const languageInstruction =
    language === "hi"
      ? "Write the summary in Hindi, using Devanagari script."
      : "Write the summary in English.";

  const prompt = `A citizen has filed this civic complaint under the "${category}" category:
Description: "${description}"
Location: "${location}"

Write ONLY a short, official-sounding one-sentence summary suitable for a government complaint register. No preamble, no quotation marks, just the sentence. ${languageInstruction}`;

  const systemPrompt = "You are a municipal complaint triage assistant for an Indian civic app.";

  try {
    const summary = await callAI(prompt, systemPrompt);
    return summary.trim();
  } catch {
    return getFallbackComplaintSummary(description, location, category, language).summary;
  }
}

export function renderComplaints(container, t, language) {
  const categoryOptionsHtml = [
    `<option value="${AUTO_CATEGORY_VALUE}">${t.complaints.categoryAuto}</option>`,
    ...COMPLAINT_CATEGORIES.map((category) => `<option value="${category}">${category}</option>`),
  ].join("");

  container.innerHTML = `
    <section class="view-header">
      <h1>${t.complaints.title}</h1>
      <p>${t.complaints.subtitle}</p>
    </section>

    <div class="demo-banner">
      <div class="demo-banner__text">
        <strong>${t.complaints.demoTitle}</strong>
        <p>${t.complaints.demoBody}</p>
      </div>
      <button class="btn btn--primary btn--small" id="complaintDemoBtn">${t.complaints.demoButton}</button>
    </div>

    <!-- AI Smart Summary Widget (spans full) -->
    <div class="complaints-ai-summary" style="margin-bottom: 24px;" aria-label="AI local issues summary">
      <div class="complaints-ai-summary__header">
        <div class="complaints-ai-summary__info">
          <div class="complaints-ai-summary__icon">
            <span class="material-symbols-outlined" style="font-size: 22px;">auto_awesome</span>
          </div>
          <div>
            <h3 style="font-size:1rem; font-weight:800; color:var(--on-surface); margin-bottom:4px;">${t.complaints.localIssuesTitle}</h3>
            <p style="font-size:0.82rem; color:var(--on-surface-variant);">${t.complaints.aiReport}</p>
          </div>
        </div>
        <span class="complaints-ai-summary__label">${t.complaints.liveAnalysis}</span>
      </div>
      <div class="complaints-ai-summary__stats">
        <div class="complaint-stat">
          <p class="complaint-stat__label">${t.complaints.topConcern}</p>
          <p class="complaint-stat__value">${t.complaints.streetLighting}</p>
          <div class="complaint-stat__bar">
            <div class="complaint-stat__bar-fill" style="width:75%; background:var(--secondary);"></div>
          </div>
          <p class="complaint-stat__note">${t.complaints.reports24h}</p>
        </div>
        <div class="complaint-stat">
          <p class="complaint-stat__label">${t.complaints.avgResolution}</p>
          <p class="complaint-stat__value">${t.complaints.days4_2}</p>
          <div class="complaint-stat__bar">
            <div class="complaint-stat__bar-fill" style="width:85%; background:var(--tertiary);"></div>
          </div>
          <p class="complaint-stat__note">${t.complaints.fasterAvg}</p>
        </div>
        <div class="complaint-stat">
          <p class="complaint-stat__label">${t.complaints.activeIssues}</p>
          <p class="complaint-stat__value">${t.complaints.centralPark}</p>
          <div style="display:flex; gap:4px; margin: 8px 0;">
            <div style="width:20px;height:20px;border-radius:50%;background:var(--primary);border:2px solid #fff;"></div>
            <div style="width:20px;height:20px;border-radius:50%;background:var(--secondary);border:2px solid #fff; margin-left:-8px;"></div>
            <div style="width:20px;height:20px;border-radius:50%;background:var(--tertiary);border:2px solid #fff; margin-left:-8px;"></div>
          </div>
          <p class="complaint-stat__note">${t.complaints.crewsNearby}</p>
        </div>
      </div>
    </div>

    <!-- Main Bento Grid: Form + Map/Tracker -->
    <div class="bento-grid--complaints">

      <!-- Grievance Form -->
      <div class="complaint-form-panel col-span-7">
        <div class="complaint-form-panel__header">
          <h2 style="font-size:1.05rem; font-weight:800; color:var(--on-surface);">${t.complaints.formTitle}</h2>
          <div class="complaint-step-indicator" aria-label="Form step 1 of 3">
            <div class="complaint-step complaint-step--active"></div>
            <div class="complaint-step"></div>
            <div class="complaint-step"></div>
          </div>
        </div>

        <form id="complaintForm">
          <label class="field-label" for="complaintDescription">${t.complaints.descriptionLabel}</label>
          <div style="position:relative; margin-bottom:8px;">
            <textarea
              id="complaintDescription"
              class="text-input text-area"
              rows="3"
              placeholder="${t.complaints.descriptionPlaceholder}"
              style="margin-bottom:0; padding-right:50px;"
              required
            ></textarea>
            <button type="button" id="complaintVoiceBtn"
              style="position:absolute; right:12px; bottom:12px; background:none; border:none; cursor:pointer; color:var(--secondary);"
              title="${t.complaints.voiceButton}" aria-label="${t.complaints.voiceButton}">
              <span class="material-symbols-outlined" style="font-size:22px;">mic</span>
            </button>
          </div>

          <!-- AI categorization hint -->
          <div class="ai-categorization-hint" id="aiHint" style="display:none;">
            <span class="material-symbols-outlined" style="font-size:16px; font-variation-settings:'FILL' 1;">auto_awesome</span>
            ${t.complaints.aiCategorizing} <strong id="aiHintText">Public Utility</strong>
          </div>

          <div class="field-row" style="margin-top: 16px;">
            <div>
              <label class="field-label" for="complaintCategory">${t.complaints.categoryLabel}</label>
              <select id="complaintCategory" class="text-input">${categoryOptionsHtml}</select>
            </div>
            <div>
              <label class="field-label" for="complaintLocation">${t.complaints.locationLabel}</label>

              <input
                type="text"
                id="complaintLocation"
                class="text-input"
                placeholder="${t.complaints.locationPlaceholder}"
                style="margin-bottom:0;"
                required
              />
            </div>
          </div>


          <p id="complaintFormError" class="error-text" role="alert" aria-live="assertive"></p>

          <button type="submit" class="btn btn--primary" id="submitComplaintBtn" style="width:100%;" aria-label="${t.complaints.submitButton}">
            ${t.complaints.submitButton}
            <span class="material-symbols-outlined" style="font-size:18px;">arrow_forward</span>
          </button>
        </form>
      </div>

      <!-- Right Column: Map + Tracker -->
      <div class="col-span-5" style="display:flex; flex-direction:column; gap:20px;">

        <!-- Map Widget -->
        <div class="map-widget" aria-label="Issue map">
          <div class="map-widget__img" style="background-image: url('https://api.mapbox.com/styles/v1/mapbox/light-v11/static/79.0882,21.1458,3.5/400x220?access_token=YOUR_MAPBOX_ACCESS_TOKEN'); background-color: #e8ecf0;"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(59,130,246,0.08), transparent);"></div>
          <div class="map-widget__controls">
            <button class="map-widget__control-btn" id="mapZoomIn" aria-label="Zoom in">
              <span class="material-symbols-outlined" style="font-size:20px;">add</span>
            </button>
            <button class="map-widget__control-btn" id="mapZoomOut" aria-label="Zoom out">
              <span class="material-symbols-outlined" style="font-size:20px;">remove</span>
            </button>
          </div>
          <div class="map-widget__badge">
            <span class="map-widget__pulse"></span>
            8 Issues Nearby
          </div>
          <div class="map-widget__marker" aria-hidden="true">
            <span class="material-symbols-outlined" style="font-size:40px; color:var(--primary); font-variation-settings:'FILL' 1;">location_on</span>
          </div>
        </div>

        <!-- Active Tracking Timeline -->
        <div class="panel" style="flex:1; margin-bottom:0;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
            <h3 class="panel__title" style="margin-bottom:0;">${t.complaints.trackerTitle}</h3>
            <button class="btn btn--ghost btn--small" style="font-size:0.78rem; padding:6px 12px;" id="viewAllTracker">
              View All
              <span class="material-symbols-outlined" style="font-size:16px;">open_in_new</span>
            </button>
          </div>
          <div id="complaintTracker"></div>
        </div>

      </div>
    </div>
  `;

  // Wire up elements
  const formEl = container.querySelector("#complaintForm");
  const descriptionEl = container.querySelector("#complaintDescription");
  const categoryEl = container.querySelector("#complaintCategory");
  const locationEl = container.querySelector("#complaintLocation");
  const submitBtn = container.querySelector("#submitComplaintBtn");
  const formErrorEl = container.querySelector("#complaintFormError");
  const trackerEl = container.querySelector("#complaintTracker");
  const demoBtn = container.querySelector("#complaintDemoBtn");
  const voiceBtn = container.querySelector("#complaintVoiceBtn");
  const aiHint = container.querySelector("#aiHint");
  const aiHintText = container.querySelector("#aiHintText");
  const viewAllBtn = container.querySelector("#viewAllTracker");
  const mapZoomIn = container.querySelector("#mapZoomIn");
  const mapZoomOut = container.querySelector("#mapZoomOut");

  renderTracker(trackerEl, t);

  // Wire up missing buttons
  if (viewAllBtn) {
    viewAllBtn.addEventListener("click", () => showToast("View All Complaints feature coming soon!", "info"));
  }

  if (mapZoomIn)  mapZoomIn.addEventListener("click",  () => showToast("Map interaction is disabled in this prototype.", "info"));
  if (mapZoomOut) mapZoomOut.addEventListener("click", () => showToast("Map interaction is disabled in this prototype.", "info"));

  // AI hint on text input — debounced to avoid firing on every keystroke
  const CATEGORY_KEYWORDS = {
    "Water Supply": ["water", "pipe", "leakage", "leak", "supply", "pani"],
    "Street Lighting": ["light", "lamp", "street", "bulb", "dark", "pole"],
    "Garbage": ["garbage", "waste", "trash", "dustbin", "litter", "कचरा"],
    "Road": ["road", "pothole", "crack", "pavement", "sarak"],
    "Sanitation": ["drain", "sewage", "toilet", "sewer", "gutter"],
  };

  let hintTimer = null;
  descriptionEl.addEventListener("input", () => {
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => {
      const val = descriptionEl.value.toLowerCase();
      let detected = null;
      for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some((kw) => val.includes(kw))) {
          detected = cat;
          break;
        }
      }
      if (detected && val.length > 5) {
        aiHintText.textContent = detected;
        aiHint.style.display = "flex";
      } else {
        aiHint.style.display = "none";
      }
    }, CATEGORY_HINT_DEBOUNCE_MS);
  });

  demoBtn.addEventListener("click", () => {
    const demo = DEMO_COMPLAINT[language] || DEMO_COMPLAINT.en;
    descriptionEl.value = demo.description;
    locationEl.value = demo.location;
    categoryEl.value = AUTO_CATEGORY_VALUE;
    descriptionEl.dispatchEvent(new Event("input"));
    formEl.requestSubmit();
  });

  setupVoiceInput(voiceBtn, descriptionEl, language, t);

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const description = descriptionEl.value.trim();
    const location = locationEl.value.trim();
    if (!description || !location) {
      formErrorEl.textContent = "Please fill out both the description and location fields.";
      return;
    }

    // Input length validation
    if (description.length > MAX_COMPLAINT_LENGTH) {
      formErrorEl.textContent = `Description is too long. Please keep it under ${MAX_COMPLAINT_LENGTH} characters.`;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="material-symbols-outlined wheel-spinner" style="font-size:18px;">refresh</span> ${t.complaints.submitting}`;
    formErrorEl.textContent = "";

    try {
      const selectedCategory = categoryEl.value;
      const { category, summary } =
        selectedCategory === AUTO_CATEGORY_VALUE
          ? await classifyAndSummarize(description, location, language)
          : {
              category: selectedCategory,
              summary: await summarizeOnly(description, location, selectedCategory, language),
            };

      saveComplaint({
        id: generateComplaintId(),
        timestamp: Date.now(),
        description,
        location,
        category,
        summary,
        status: COMPLAINT_STATUSES[0],
      });

      formEl.reset();
      aiHint.style.display = "none";
      renderTracker(trackerEl, t);
      trackerEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      formErrorEl.textContent = error.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${t.complaints.submitButton} <span class="material-symbols-outlined" style="font-size:18px;">arrow_forward</span>`;
    }
  });
}

function renderTracker(trackerEl, t) {
  const complaints = getComplaints();

  if (complaints.length === 0) {
    trackerEl.innerHTML = `
      <div class="timeline">
        <div class="timeline__item">
          <div class="timeline__dot timeline__dot--done">
            <span class="material-symbols-outlined" style="font-size:11px; color:#fff; font-variation-settings:'wght' 700;">check</span>
          </div>
          <div class="timeline__content">
            <div class="timeline__header">
              <p class="timeline__title">${t.complaints.potholeRepair} #SB-9021</p>
              <span class="timeline__time">2h ago</span>
            </div>
            <p class="timeline__desc">${t.complaints.potholeDesc}</p>
            <span class="status-badge status-badge--in-review">${t.complaints.inProgress}</span>
          </div>
        </div>
        <div class="timeline__item">
          <div class="timeline__dot timeline__dot--pending">
            <span style="width:6px;height:6px;border-radius:50%;background:var(--outline);display:block;"></span>
          </div>
          <div class="timeline__content">
            <div class="timeline__header">
              <p class="timeline__title">${t.complaints.garbageOverflow} #SB-8842</p>
              <span class="timeline__time">${t.complaints.yesterday}</span>
            </div>
            <p class="timeline__desc">${t.complaints.garbageDesc}</p>
            <span class="status-badge status-badge--submitted">${t.complaints.pendingVerification}</span>
          </div>
        </div>
      </div>
      <p class="results-area__empty" style="margin-top:16px;">${t.complaints.noComplaints}</p>
    `;
    return;
  }

  const timelineHtml = complaints
    .map((complaint) => {
      const isResolved = complaint.status === "Resolved";
      const isDone = complaint.status === "In Review" || isResolved;
      const filedDate = new Date(complaint.timestamp).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      });

      return `
        <div class="timeline__item">
          <div class="timeline__dot ${isDone ? "timeline__dot--done" : "timeline__dot--pending"}">
            ${isDone ? `<span class="material-symbols-outlined" style="font-size:11px; color:#fff; font-variation-settings:'wght' 700;">check</span>` : `<span style="width:6px;height:6px;border-radius:50%;background:var(--outline);display:block;"></span>`}
          </div>
          <div class="timeline__content">
            <div class="timeline__header">
              <p class="timeline__title">${complaint.category} ${complaint.id}</p>
              <span class="timeline__time">${filedDate}</span>
            </div>
            <p class="timeline__desc">${complaint.summary}</p>
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span class="status-badge status-badge--${slugifyStatus(complaint.status)}">${t.complaints.statuses[complaint.status] || complaint.status}</span>
              <span style="font-size:0.72rem; color:var(--on-surface-variant);">${complaint.location}</span>
              ${!isResolved ? `<button class="btn btn--ghost btn--small" data-simulate="${complaint.id}" style="padding:4px 10px; font-size:0.72rem; min-height:28px;">${t.complaints.simulateButton}</button>` : ""}
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  trackerEl.innerHTML = `<div class="timeline">${timelineHtml}</div>`;

  trackerEl.querySelectorAll("[data-simulate]").forEach((button) => {
    button.addEventListener("click", () => {
      const complaintId = button.dataset.simulate;
      const complaint = getComplaints().find((item) => item.id === complaintId);
      if (!complaint) return;
      const currentIndex = COMPLAINT_STATUSES.indexOf(complaint.status);
      const nextStatus = COMPLAINT_STATUSES[Math.min(currentIndex + 1, COMPLAINT_STATUSES.length - 1)];
      updateComplaintStatus(complaintId, nextStatus);
      renderTracker(trackerEl, t);
    });
  });
}

function setupVoiceInput(button, inputEl, language, t) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    button.disabled = true;
    return;
  }

  button.addEventListener("click", () => {
    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    button.style.color = "var(--error)";
    recognition.start();
    recognition.onresult = (event) => {
      inputEl.value = event.results[0][0].transcript;
      inputEl.dispatchEvent(new Event("input"));
      inputEl.focus();
    };
    recognition.onend = () => { button.style.color = "var(--secondary)"; };
    recognition.onerror = () => { button.style.color = "var(--secondary)"; };
  });
}

function slugifyStatus(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}
