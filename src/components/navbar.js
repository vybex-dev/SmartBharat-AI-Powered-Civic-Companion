// ============================================================
// NAVBAR COMPONENT — v2 Premium
// Top navigation bar with glassmorphic design, search, language
// toggle, and profile button.
// ============================================================

const NAV_ITEMS = [
  { view: "dashboard", key: "home" },
  { view: "chat", key: "chat" },
  { view: "schemes", key: "schemes" },
  { view: "documents", key: "documents" },
  { view: "complaints", key: "complaints" },
];

export function renderNavbar(container, t, currentView, currentLanguage, onNavigate, onLanguageChange) {
  const navLinksHtml = NAV_ITEMS.map(
    (item) => `
      <button
        class="nav-link ${currentView === item.view ? "nav-link--active" : ""}"
        data-view="${item.view}"
      >${t.nav[item.key]}</button>
    `
  ).join("");

  container.innerHTML = `
    <div class="navbar__inner">
      <div class="navbar__left">
        <div class="navbar__brand" data-view="dashboard" role="button" tabindex="0" aria-label="Go to dashboard">
          <span class="navbar__wheel" aria-hidden="true">${wheelIconSvg()}</span>
          <span class="navbar__title">${t.appName}</span>
        </div>
        <nav class="navbar__links" aria-label="Primary navigation">
          ${navLinksHtml}
        </nav>
      </div>

      <div class="navbar__right">

        <button class="navbar__icon-btn" aria-label="Language">
          <span class="material-symbols-outlined" style="font-size: 22px;">language</span>
        </button>
        <button class="navbar__icon-btn" aria-label="Profile">
          <span class="material-symbols-outlined" style="font-size: 22px;">account_circle</span>
        </button>
        <div class="lang-toggle" role="group" aria-label="${t.common.language}">
          <button class="lang-toggle__btn ${currentLanguage === "en" ? "lang-toggle__btn--active" : ""}" data-lang="en">EN</button>
          <button class="lang-toggle__btn ${currentLanguage === "hi" ? "lang-toggle__btn--active" : ""}" data-lang="hi">हिं</button>
        </div>
      </div>
    </div>
  `;

  // Wire up nav links
  container.querySelectorAll("[data-view]").forEach((element) => {
    element.addEventListener("click", () => onNavigate(element.dataset.view));
  });

  // Wire up language toggle
  container.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => onLanguageChange(button.dataset.lang));
  });
}

/** Ashoka Chakra-inspired wheel icon */
function wheelIconSvg() {
  return `
    <svg viewBox="0 0 40 40" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width="2.2"/>
      <circle cx="20" cy="20" r="2.6" fill="currentColor"/>
      ${Array.from({ length: 16 })
        .map((_, index) => {
          const angle = (index * 360) / 16;
          return `<line x1="20" y1="20" x2="20" y2="4" stroke="currentColor" stroke-width="1.4" transform="rotate(${angle} 20 20)"/>`;
        })
        .join("")}
    </svg>
  `;
}
