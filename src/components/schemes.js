// ============================================================
// SERVICE RECOMMENDATION ENGINE — v2 Premium
// Implements UI from file 2:
// - Hero banner with gradient overlay
// - Category filter chips (scrollable)
// - Featured bento card (spans 2 cols) with image
// - Regular service cards in grid
// - "How it Works / BharatAI" section
// ============================================================

import { callAI } from "../utils/aiClient.js";
import { parseAiJson } from "../utils/parseAiJson.js";
import { DEMO_SCHEME_SITUATION, getFallbackSchemeMatches } from "../utils/demoData.js";

let schemesCache = null;

async function loadSchemes() {
  if (schemesCache) return schemesCache;
  const response = await fetch(new URL("../data/schemes.json", import.meta.url));
  if (!response.ok) throw new Error("Could not load the schemes database.");
  schemesCache = await response.json();
  return schemesCache;
}

async function findMatchingSchemes(situationText, language) {
  const schemes = await loadSchemes();

  const compactSchemeList = schemes.map((scheme) => ({
    id: scheme.id,
    name: scheme.name,
    category: scheme.category,
    eligibility: scheme.eligibility,
    description: scheme.description,
  }));

  const languageInstruction =
    language === "hi"
      ? 'Write every "reason" value in Hindi, using Devanagari script.'
      : 'Write every "reason" value in English.';

  const prompt = `A citizen describes their situation like this: "${situationText}"

Here is a JSON list of available Indian government schemes:
${JSON.stringify(compactSchemeList)}

Pick the TOP 3 schemes from this list that are most relevant to the citizen's situation. Respond with ONLY a valid JSON array, no markdown fences, no extra commentary, in exactly this shape:
[{"id": "scheme-id-from-the-list", "reason": "one short plain-language sentence on why this scheme fits this citizen"}]

${languageInstruction}`;

  const systemPrompt =
    "You are a precise matching engine for an Indian civic-services app. " +
    "You always reply with strictly valid JSON and nothing else.";

  let matches;
  try {
    const rawReply = await callAI(prompt, systemPrompt);
    const parsedReply = parseAiJson(rawReply);
    matches = Array.isArray(parsedReply) ? parsedReply : [];
  } catch {
    return getFallbackSchemeMatches(situationText, schemes, language);
  }

  return matches
    .map((match) => {
      const scheme = schemes.find((candidate) => candidate.id === match.id);
      return scheme ? { ...scheme, reason: match.reason } : null;
    })
    .filter(Boolean);
}

const CATEGORIES = [
  { label: "Education", icon: "school" },
  { label: "Healthcare", icon: "medical_services" },
  { label: "Agriculture", icon: "agriculture" },
  { label: "Finance", icon: "payments" },
  { label: "Transport", icon: "commute" },
];

export function renderSchemes(container, t, language) {
  container.innerHTML = `
    <section class="view-header" style="margin-bottom: 20px;">
      <h1>${t.schemes.title}</h1>
      <p>${t.schemes.subtitle}</p>
    </section>

    <div class="demo-banner">
      <div class="demo-banner__text">
        <strong>${t.schemes.demoTitle}</strong>
        <p>${t.schemes.demoBody}</p>
      </div>
      <button class="btn btn--primary btn--small" id="schemesDemoBtn">${t.schemes.demoButton}</button>
    </div>

    <!-- Hero Banner -->
    <div class="schemes-hero">
      <div class="schemes-hero__overlay"></div>
      <div class="schemes-hero__content">
        <h2>${t.schemes.promoTitle}</h2>
        <p>${t.schemes.promoDesc}</p>
      </div>
    </div>

    <!-- Category Filters -->
    <div class="category-filters" aria-label="Category filters" role="group">
      <button class="category-btn category-btn--active" data-category="all">
        <span class="material-symbols-outlined" style="font-size:18px;">apps</span>
        ${t.schemes.allSchemes}
      </button>
      ${CATEGORIES.map((cat) => `
        <button class="category-btn" data-category="${cat.label}">
          <span class="material-symbols-outlined" style="font-size:18px;">${cat.icon}</span>
          ${cat.label}
        </button>
      `).join("")}
    </div>

    <!-- Search Form -->
    <div class="panel" style="margin-bottom: 24px;">
      <form id="schemesForm">
        <label class="field-label" for="situationInput">${t.schemes.situationLabel}</label>
        <textarea
          id="situationInput"
          class="text-input text-area"
          rows="3"
          placeholder="${t.schemes.situationPlaceholder}"
        ></textarea>
        <div style="display:flex; gap:12px;">
          <button type="submit" class="btn btn--primary" id="findSchemesBtn">
            <span class="material-symbols-outlined" style="font-size:18px; font-variation-settings:'FILL' 1;">auto_awesome</span>
            ${t.schemes.findButton}
          </button>
          <button type="button" class="btn btn--ghost" id="schemesDemoTrigger">
            <span class="material-symbols-outlined" style="font-size:18px;">play_circle</span>
            ${t.schemes.tryDemo}
          </button>
        </div>
      </form>
    </div>

    <!-- Results -->
    <div id="schemesResults"></div>

    <!-- How it Works / BharatAI Section -->
    <section style="margin-top: 40px; background:var(--primary); color:var(--on-primary); border-radius:var(--radius-xl); padding:40px; overflow:hidden; position:relative; box-shadow:var(--shadow-xl);">
      <div style="position:absolute; bottom:-60px; right:-60px; width:240px; height:240px; background:rgba(249,115,22,0.25); border-radius:50%; filter:blur(60px); pointer-events:none;"></div>
      <div style="display:flex; flex-direction:column; gap:32px; position:relative; z-index:1;" class="how-it-works-inner">
        <div style="flex:1;">
          <h2 style="font-size:clamp(1.5rem,3vw,2rem); color:var(--on-primary); margin-bottom:28px;">${t.schemes.promoSubtitle}</h2>
          <div style="display:flex; flex-direction:column; gap:20px;">
            <div style="display:flex; gap:16px;">
              <div style="width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <span class="material-symbols-outlined" style="color:#fff;">search</span>
              </div>
              <div>
                <h5 style="font-size:1rem; font-weight:700; color:#fff; margin-bottom:4px;">${t.schemes.promoStep1}</h5>
                <p style="color:rgba(255,255,255,0.85); font-size:0.875rem; margin:0;">${t.schemes.promoStep1Desc}</p>
              </div>
            </div>
            <div style="display:flex; gap:16px;">
              <div style="width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <span class="material-symbols-outlined" style="color:#fff;">description</span>
              </div>
              <div>
                <h5 style="font-size:1rem; font-weight:700; color:#fff; margin-bottom:4px;">${t.schemes.promoStep2}</h5>
                <p style="color:rgba(255,255,255,0.85); font-size:0.875rem; margin:0;">${t.schemes.promoStep2Desc}</p>
              </div>
            </div>
            <div style="display:flex; gap:16px;">
              <div style="width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <span class="material-symbols-outlined" style="color:#fff;">task_alt</span>
              </div>
              <div>
                <h5 style="font-size:1rem; font-weight:700; color:#fff; margin-bottom:4px;">${t.schemes.promoStep3}</h5>
                <p style="color:rgba(255,255,255,0.85); font-size:0.875rem; margin:0;">${t.schemes.promoStep3Desc}</p>
              </div>
            </div>
          </div>
        </div>
        <!-- Mini Chat Preview -->
        <div style="background:rgba(255,255,255,0.12); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.2); border-radius:var(--radius-lg); padding:20px; max-width:360px; width:100%;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.2);">
            <span class="material-symbols-outlined" style="color:var(--secondary); font-variation-settings:'FILL' 1;">auto_awesome</span>
            <span style="font-weight:700; color:#fff; font-size:0.9rem;">BharatAI Assistant</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:14px;">
            <div style="background:rgba(255,255,255,0.18); padding:10px 14px; border-radius:var(--radius-sm); border-top-left-radius:4px; font-size:0.85rem; color:#fff;">
              नमस्ते! How can I help you today?
            </div>
            <div style="background:var(--secondary); padding:10px 14px; border-radius:var(--radius-sm); border-top-right-radius:4px; font-size:0.85rem; color:#fff; align-self:flex-end; margin-left:32px;">
              I need a student scholarship.
            </div>
            <div style="background:rgba(255,255,255,0.18); padding:10px 14px; border-radius:var(--radius-sm); border-top-left-radius:4px; font-size:0.85rem; color:#fff; display:flex; gap:8px; align-items:flex-start;">
              <span class="material-symbols-outlined" style="font-size:16px; color:var(--secondary); animation:pulse 2s infinite;">auto_awesome</span>
              Found "Post-Matric Scholarship". Check eligibility?
            </div>
          </div>
          <div style="display:flex; gap:8px;">
            <input type="text" id="miniChatInput" placeholder="Type here..." style="flex:1; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:var(--radius-full); padding:8px 14px; font-size:0.82rem; color:#fff; outline:none; cursor:pointer;" readonly />
            <button style="width:36px; height:36px; background:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; border:none; flex-shrink:0;">
              <span class="material-symbols-outlined" style="font-size:18px; color:var(--primary);">send</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  `;

  // Responsive "how it works" layout
  const howItWorksInner = container.querySelector(".how-it-works-inner");
  const applyLayoutFlex = () => {
    if (window.innerWidth >= 1024) {
      howItWorksInner.style.flexDirection = "row";
      howItWorksInner.style.alignItems = "center";
    } else {
      howItWorksInner.style.flexDirection = "column";
    }
  };
  applyLayoutFlex();
  window.addEventListener("resize", applyLayoutFlex);

  const formEl = container.querySelector("#schemesForm");
  const inputEl = container.querySelector("#situationInput");
  const submitBtn = container.querySelector("#findSchemesBtn");
  const resultsEl = container.querySelector("#schemesResults");
  const demoBtn = container.querySelector("#schemesDemoBtn");
  const demoTrigger = container.querySelector("#schemesDemoTrigger");

  function triggerDemo() {
    inputEl.value = DEMO_SCHEME_SITUATION[language] || DEMO_SCHEME_SITUATION.en;
    formEl.requestSubmit();
  }

  demoBtn.addEventListener("click", triggerDemo);
  demoTrigger.addEventListener("click", triggerDemo);

  // Category filter buttons (UI only — for visual polish)
  container.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".category-btn").forEach((b) => b.classList.remove("category-btn--active"));
      btn.classList.add("category-btn--active");
    });
  });

  const miniChatInput = container.querySelector("#miniChatInput");
  if (miniChatInput) {
    miniChatInput.addEventListener("click", () => {
      const chatLink = document.querySelector('.sidebar__link[data-view="chat"]');
      if (chatLink) chatLink.click();
    });
  }

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const situationText = inputEl.value.trim();
    if (!situationText) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="wheel-spinner" viewBox="0 0 40 40" width="16" height="16"><circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width="3"/><line x1="20" y1="20" x2="20" y2="6" stroke="currentColor" stroke-width="2" transform="rotate(0 20 20)"/></svg>
      ${t.schemes.finding}
    `;

    resultsEl.innerHTML = `<p class="results-area__loading">
      <span class="material-symbols-outlined" style="font-size:18px; color:var(--primary); animation:spin 1s linear infinite;">refresh</span>
      ${t.schemes.finding}
    </p>`;

    resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      const matches = await findMatchingSchemes(situationText, language);
      renderSchemeCards(resultsEl, matches, t);
    } catch (error) {
      resultsEl.innerHTML = `<p class="error-text">${error.message}</p>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span class="material-symbols-outlined" style="font-size:18px; font-variation-settings:'FILL' 1;">auto_awesome</span>
        ${t.schemes.findButton}
      `;
    }
  });
}

const SCHEME_ICONS = {
  "Health": { icon: "medical_services", bg: "var(--tertiary)", color: "#fff" },
  "Agriculture": { icon: "agriculture", bg: "var(--tertiary-soft)", color: "var(--tertiary)" },
  "Education": { icon: "school", bg: "var(--secondary-soft)", color: "var(--secondary-dark)" },
  "Finance": { icon: "payments", bg: "var(--primary-soft)", color: "var(--primary)" },
  "Transport": { icon: "commute", bg: "var(--error-soft)", color: "var(--error)" },
  "default": { icon: "account_balance", bg: "var(--primary-soft)", color: "var(--primary)" },
};

function renderSchemeCards(resultsEl, matches, t) {
  if (matches.length === 0) {
    resultsEl.innerHTML = `<p class="results-area__empty">${t.schemes.emptyState}</p>`;
    return;
  }

  const cardsHtml = matches
    .map((scheme, index) => {
      const iconConfig = SCHEME_ICONS[scheme.category] || SCHEME_ICONS["default"];
      const isFeatured = index === 0;

      return `
        <article class="scheme-card${isFeatured ? " scheme-card--featured" : ""}">
          <div style="flex:1;">
            ${isFeatured ? `
              <span class="scheme-card__badge scheme-card__badge--ai">
                <span class="material-symbols-outlined" style="font-size:14px;">auto_awesome</span>
                ${t.schemes.aiRecommended}
              </span>
            ` : ""}
            <div class="scheme-card__icon" style="background:${iconConfig.bg}; color:${iconConfig.color};">
              <span class="material-symbols-outlined" style="font-size:24px;">${iconConfig.icon}</span>
            </div>
            <div class="scheme-card__header">
              <h3>${scheme.name}</h3>
              <span class="badge">${scheme.category}</span>
            </div>
            ${scheme.isFallback ? `<span class="fallback-label">${t.common.demoSafe}</span>` : ""}
            <div class="scheme-card__reason">
              <span class="material-symbols-outlined" style="font-size:16px; color:var(--primary); flex-shrink:0;">lightbulb</span>
              ${scheme.reason}
            </div>
            <p class="scheme-card__desc">${scheme.description}</p>
            <p class="scheme-card__eligibility"><strong>${t.schemes.eligibilityLabel}:</strong> ${scheme.eligibility}</p>
            <div class="scheme-card__actions">
              <a class="btn btn--ghost btn--small" href="${scheme.link}" target="_blank" rel="noopener noreferrer">
                ${t.schemes.learnMore} ↗
              </a>
              <button class="btn btn--primary btn--small">
                <span class="material-symbols-outlined" style="font-size:16px;">magic_button</span>
                ${t.schemes.applyAi}
              </button>
            </div>
          </div>
          ${isFeatured ? `
            <img class="scheme-card__featured-img"
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=75"
              alt="${scheme.name}"
              loading="lazy"
            />
          ` : ""}
        </article>
      `;
    })
    .join("");

  resultsEl.innerHTML = `
    <h3 style="font-size:1.05rem; font-weight:800; color:var(--on-surface); margin-bottom:16px; display:flex; align-items:center; gap:8px;">
      <span class="material-symbols-outlined" style="color:var(--tertiary);">verified</span>
      ${t.schemes.resultsTitle}
    </h3>
    <div class="scheme-grid">${cardsHtml}</div>
  `;
}
