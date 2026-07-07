// ============================================================
// DASHBOARD / LANDING VIEW — v2 Premium
// Implements the bento grid design from UI ideas:
// - Hero section with AI search bar (File 1)
// - Latest Schemes image cards (File 1)
// - Applications status panel (File 1)
// - AI Recommendations panel (File 1)
// - Impact stats band
// - Feature cards for 4 core views
// ============================================================

const FEATURE_CARDS = [
  { view: "chat",       titleKey: "chatCardTitle",       descKey: "chatCardDesc",       metricKey: "chatMetric",       icon: "smart_toy",      color: "primary" },
  { view: "schemes",    titleKey: "schemesCardTitle",    descKey: "schemesCardDesc",    metricKey: "schemesMetric",    icon: "account_balance",color: "secondary" },
  { view: "documents",  titleKey: "documentsCardTitle",  descKey: "documentsCardDesc",  metricKey: "documentsMetric",  icon: "description",    color: "tertiary" },
  { view: "complaints", titleKey: "complaintsCardTitle", descKey: "complaintsCardDesc", metricKey: "complaintsMetric", icon: "report_problem", color: "error" },
];

export function renderDashboard(container, t, onNavigate) {
  const cardsHtml = FEATURE_CARDS.map((card, i) => `
    <article class="feature-card" data-view="${card.view}" role="button" tabindex="0" aria-label="Open ${t.dashboard[card.titleKey]}">
      <div class="feature-card__top">
        <div class="feature-card__icon">
          <span class="material-symbols-outlined" style="font-size: 26px;">${card.icon}</span>
        </div>
        <span class="feature-card__metric">${t.dashboard[card.metricKey]}</span>
      </div>
      <h3 class="feature-card__title">${t.dashboard[card.titleKey]}</h3>
      <p class="feature-card__desc">${t.dashboard[card.descKey]}</p>
      <span class="feature-card__cta">
        ${t.dashboard.openLabel}
        <span class="material-symbols-outlined" style="font-size: 18px;">arrow_forward</span>
      </span>
    </article>
  `).join("");

  container.innerHTML = `
    <!-- Hero Section with AI Search -->
    <section class="hero hero-pattern" aria-label="Welcome hero">
      <div class="hero__blob-right" aria-hidden="true"></div>
      <div class="hero__blob-bottom" aria-hidden="true"></div>
      <div class="hero__inner">
        <div class="hero__eyebrow">
          <span class="material-symbols-outlined" style="font-size: 16px; font-variation-settings: 'FILL' 1;">spa</span>
          ${t.hero.eyebrow}
        </div>
        <h1 class="hero__title">
          ${t.dashboard.heroTitle}
        </h1>

        <!-- AI Search Bar -->
        <div class="hero__search-wrapper" role="search">
          <div class="hero__search-glow" aria-hidden="true"></div>
          <div class="hero__search-bar glass-ai">
            <span class="material-symbols-outlined">search</span>
            <input
              type="text"
              id="heroSearchInput"
              placeholder="${t.dashboard.searchPlaceholder}"
              aria-label="Search government services"
            />
            <button class="hero__search-btn" id="heroAskBtn">
              <span class="material-symbols-outlined" style="font-size: 18px; font-variation-settings: 'FILL' 1;">auto_awesome</span>
              ${t.dashboard.askAi}
            </button>
          </div>
        </div>

        <!-- Suggestion chips -->
        <div class="hero__suggestions" aria-label="Suggested searches">
          <span style="font-size:0.82rem;font-weight:600;color:var(--on-surface-variant);line-height:32px;">${t.dashboard.suggested}</span>
          <button class="hero__suggestion" data-query="PAN Card Update">${t.dashboard.sug1}</button>
          <button class="hero__suggestion" data-query="Gas Subsidy Status">${t.dashboard.sug2}</button>
          <button class="hero__suggestion" data-query="DigiLocker Access">${t.dashboard.sug3}</button>
          <button class="hero__suggestion" data-query="Ration Card">${t.dashboard.sug4}</button>
        </div>
      </div>
    </section>

    <!-- Dashboard Bento Grid -->
    <section class="bento-grid" style="margin-top: 32px;" aria-label="Dashboard overview">

      <!-- Latest Schemes -->
      <div class="dash-schemes-card col-span-8">
        <div class="dash-schemes-card__header">
          <h2 class="dash-schemes-card__title">
            <span class="material-symbols-outlined" style="color: var(--secondary); font-size: 22px; font-variation-settings: 'FILL' 1;">campaign</span>
            ${t.dashboard.latestSchemes}
          </h2>
          <button class="dash-schemes-card__viewall" data-view="schemes">
            ${t.dashboard.viewAll} <span class="material-symbols-outlined" style="font-size: 16px;">arrow_forward</span>
          </button>
        </div>
        <div class="dash-schemes-grid">
          <div class="dash-scheme-img-card" data-view="schemes">
            <div class="dash-scheme-img-card__bg" style="background-image: url('https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400&q=75');" aria-label="PM Kisan scheme"></div>
            <div class="dash-scheme-img-card__overlay"></div>
            <div class="dash-scheme-img-card__info">
              <p>${t.dashboard.scheme1Title}</p>
              <p>${t.dashboard.scheme1Desc}</p>
            </div>
          </div>
          <div class="dash-scheme-img-card" data-view="schemes">
            <div class="dash-scheme-img-card__bg" style="background-image: url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=75');" aria-label="Digital India Internship"></div>
            <div class="dash-scheme-img-card__overlay"></div>
            <div class="dash-scheme-img-card__info">
              <p>${t.dashboard.scheme2Title}</p>
              <p>${t.dashboard.scheme2Desc}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Applications Status -->
      <div class="dash-applications-card col-span-4">
        <div class="dash-applications-card__title">
          <span class="material-symbols-outlined" style="font-size: 22px;">fact_check</span>
          ${t.dashboard.applications}
        </div>
        <div class="app-status-item" data-view="documents" role="button" tabindex="0">
          <div class="app-status-item__header">
            <span class="app-status-item__name">${t.dashboard.app1Title}</span>
            <span class="app-status-badge app-status-badge--review">${t.dashboard.app1Status}</span>
          </div>
          <div class="app-status-item__progress">
            <div class="app-status-item__progress-fill app-status-item__progress-fill--review" style="width: 70%"></div>
          </div>
          <p class="app-status-item__note">${t.dashboard.app1Note}</p>
        </div>
        <div class="app-status-item" data-view="documents" role="button" tabindex="0">
          <div class="app-status-item__header">
            <span class="app-status-item__name">${t.dashboard.app2Title}</span>
            <span class="app-status-badge app-status-badge--approved">${t.dashboard.app2Status}</span>
          </div>
          <div class="app-status-item__progress">
            <div class="app-status-item__progress-fill app-status-item__progress-fill--approved" style="width: 100%"></div>
          </div>
          <p class="app-status-item__note">${t.dashboard.app2Note}</p>
        </div>
        <button class="btn btn--ghost btn--small" data-view="documents" style="width: 100%; margin-top: 8px; background: rgba(255,255,255,1); color: var(--primary);">
          ${t.dashboard.manageAll}
        </button>
      </div>

      <!-- Active Complaints -->
      <div class="col-span-8">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 16px;">
          <h2 style="font-size: 1.1rem; font-weight: 800; color: var(--primary); display:flex; align-items:center; gap:8px;">
            <span class="material-symbols-outlined" style="color: var(--secondary); font-size: 22px; font-variation-settings: 'FILL' 1;">chat_bubble</span>
            ${t.dashboard.activeComplaints}
          </h2>
          <button class="btn btn--ghost btn--small" data-view="complaints">${t.dashboard.viewAll}</button>
        </div>

        <div class="complaint-card" style="margin-bottom: 12px;">
          <div style="display:flex; align-items:flex-start; gap:14px;">
            <div class="complaint-card__icon" style="background: var(--error-soft); color: var(--error);">
              <span class="material-symbols-outlined">water_drop</span>
            </div>
            <div style="flex:1;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                <h4 style="font-size:0.95rem; font-weight:700; color:var(--on-surface);">${t.dashboard.comp1Title}</h4>
                <span style="font-size:0.72rem; color:var(--on-surface-variant);">${t.dashboard.comp1Ticket}</span>
              </div>
              <p style="font-size:0.875rem; color:var(--on-surface-variant); margin-bottom:10px;">${t.dashboard.comp1Desc}</p>
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:0.75rem; font-weight:700; color:var(--tertiary);">${t.dashboard.comp1Status}</span>
                <div style="flex:1;height:1px;background:var(--outline-variant);"></div>
                <span style="font-size:0.72rem; color:var(--on-surface-variant);">${t.dashboard.comp1Time}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="complaint-card">
          <div style="display:flex; align-items:flex-start; gap:14px;">
            <div class="complaint-card__icon" style="background: var(--primary-soft); color: var(--primary);">
              <span class="material-symbols-outlined">lightbulb</span>
            </div>
            <div style="flex:1;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                <h4 style="font-size:0.95rem; font-weight:700; color:var(--on-surface);">${t.dashboard.comp2Title}</h4>
                <span style="font-size:0.72rem; color:var(--on-surface-variant);">${t.dashboard.comp2Ticket}</span>
              </div>
              <p style="font-size:0.875rem; color:var(--on-surface-variant); margin-bottom:10px;">${t.dashboard.comp2Desc}</p>
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="padding: 3px 10px; background:var(--surface-container-high); border-radius:var(--radius-full); font-size:0.72rem; font-weight:700;">${t.dashboard.comp2Status}</span>
                <div style="flex:1;height:1px;background:var(--outline-variant);"></div>
                <span style="font-size:0.72rem; color:var(--on-surface-variant);">${t.dashboard.comp2Time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Recommendations -->
      <div class="ai-recommendations col-span-4">
        <div class="ai-recommendations__header">
          <span class="material-symbols-outlined" style="color: var(--secondary); font-size: 22px; font-variation-settings: 'FILL' 1;">auto_awesome</span>
          <h3>${t.dashboard.forYou}</h3>
        </div>
        <p class="ai-recommendations__subtitle">${t.dashboard.forYouDesc}</p>
        <div class="ai-rec-item" data-view="chat" role="button" tabindex="0">
          <p class="ai-rec-item__title">${t.dashboard.rec1Title}</p>
          <p class="ai-rec-item__desc">${t.dashboard.rec1Desc}</p>
        </div>
        <div class="ai-rec-item" data-view="chat" role="button" tabindex="0">
          <p class="ai-rec-item__title">${t.dashboard.rec2Title}</p>
          <p class="ai-rec-item__desc">${t.dashboard.rec2Desc}</p>
        </div>
        <div class="ai-rec-item" data-view="chat" role="button" tabindex="0">
          <p class="ai-rec-item__title">${t.dashboard.rec3Title}</p>
          <p class="ai-rec-item__desc">${t.dashboard.rec3Desc}</p>
        </div>
        <button class="btn btn--primary btn--small" data-view="chat" style="width:100%; margin-top:16px;">
          <span class="material-symbols-outlined" style="font-size:18px;">psychology</span>
          ${t.dashboard.analyze}
        </button>
      </div>

    </section>

    <!-- Impact Band -->
    <section class="impact-band" aria-label="${t.dashboard.impactAria}">
      <div class="impact-band__item">
        <strong class="impact-band__value">${t.dashboard.impactOneValue}</strong>
        <span class="impact-band__label">${t.dashboard.impactOneLabel}</span>
      </div>
      <div class="impact-band__item">
        <strong class="impact-band__value">${t.dashboard.impactTwoValue}</strong>
        <span class="impact-band__label">${t.dashboard.impactTwoLabel}</span>
      </div>
      <div class="impact-band__item">
        <strong class="impact-band__value">${t.dashboard.impactThreeValue}</strong>
        <span class="impact-band__label">${t.dashboard.impactThreeLabel}</span>
      </div>
    </section>

    <!-- Feature Cards Grid -->
    <section class="feature-grid" aria-label="Main features">${cardsHtml}</section>
  `;

  // Wire up all navigation triggers
  container.querySelectorAll("[data-view]").forEach((element) => {
    element.addEventListener("click", () => onNavigate(element.dataset.view));
  });

  // AI search bar — navigate to chat with pre-filled query
  const heroSearchInput = container.querySelector("#heroSearchInput");
  const heroAskBtn = container.querySelector("#heroAskBtn");

  function handleHeroSearch() {
    const query = heroSearchInput?.value?.trim();
    if (query) {
      // Store query for chat to pick up
      sessionStorage.setItem("sb_hero_query", query);
    }
    onNavigate("chat");
  }

  heroAskBtn?.addEventListener("click", handleHeroSearch);
  heroSearchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleHeroSearch();
  });

  // Suggestion chips
  container.querySelectorAll(".hero__suggestion").forEach((chip) => {
    chip.addEventListener("click", () => {
      if (heroSearchInput) heroSearchInput.value = chip.dataset.query;
      handleHeroSearch();
    });
  });

  // Keyboard accessibility for feature cards and interactive items
  container.querySelectorAll(".feature-card, .app-status-item, .ai-rec-item").forEach((card) => {
    card.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onNavigate(card.dataset.view);
      }
    });
  });
}
