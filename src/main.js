// ============================================================
// APP ENTRY POINT — v2 (Premium UI/UX Upgrade)
// Smart Bharat is a single-page app with no build step and no
// router library: this file swaps which "view" component is
// mounted into #app, and re-renders the navbar, sidebar, and
// bottom nav whenever the view or language changes.
// All real state lives in localStorage via utils/storage.js.
// ============================================================

import { DEFAULT_LANGUAGE } from "./config/config.js";
import { getStoredLanguage, setStoredLanguage } from "./utils/storage.js";
import { getTranslations } from "./utils/translations.js";
import { renderNavbar } from "./components/navbar.js";
import { renderDashboard } from "./components/dashboard.js";
import { renderChat } from "./components/chat.js";
import { renderSchemes } from "./components/schemes.js";
import { renderDocuments } from "./components/documents.js";
import { renderComplaints } from "./components/complaints.js";
import { showToast } from "./utils/toast.js";

const navbarEl = document.getElementById("navbar");
const sidebarEl = document.getElementById("sidebar");
const bottomNavEl = document.getElementById("bottomNav");
const appEl = document.getElementById("app");
const aiFab = document.getElementById("aiFab");

let currentView = "dashboard";
let currentLanguage = getStoredLanguage() || DEFAULT_LANGUAGE;

const NAV_ITEMS = [
  { view: "dashboard", icon: "dashboard", labelKey: "home" },
  { view: "chat", icon: "smart_toy", labelKey: "chat" },
  { view: "schemes", icon: "account_balance", labelKey: "schemes" },
  { view: "documents", icon: "description", labelKey: "docs" },
  { view: "complaints", icon: "report_problem", labelKey: "issues" },
];

function navigateTo(view) {
  currentView = view;
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Move focus to main content area so screen reader users
  // know the page content has changed (SPA navigation pattern).
  requestAnimationFrame(() => {
    appEl.setAttribute("tabindex", "-1");
    appEl.focus({ preventScroll: true });
  });
}

function changeLanguage(languageCode) {
  currentLanguage = languageCode;
  setStoredLanguage(languageCode);
  // Update the html[lang] attribute so assistive technologies
  // and the browser's translation engine know the content language.
  document.documentElement.lang = languageCode;
  renderApp();
}

function renderSidebar() {
  const t = getTranslations(currentLanguage);
  sidebarEl.innerHTML = `
    <div class="sidebar__user">
      <div class="sidebar__avatar">
        <span class="material-symbols-outlined">public</span>
      </div>
      <div>
        <p class="sidebar__user-name">${t.sidebar.userName}</p>
        <p class="sidebar__user-id">${t.sidebar.userId}</p>
      </div>
    </div>

    <nav class="sidebar__nav">
      <div class="sidebar__link ${currentView === "dashboard" ? "sidebar__link--active" : ""}" data-view="dashboard">
        <span class="material-symbols-outlined">dashboard</span>
        <span>${t.sidebar.dashboard}</span>
      </div>
      <div class="sidebar__link ${currentView === "schemes" ? "sidebar__link--active" : ""}" data-view="schemes">
        <span class="material-symbols-outlined">account_balance</span>
        <span>${t.sidebar.schemes}</span>
      </div>
      <div class="sidebar__link ${currentView === "complaints" ? "sidebar__link--active" : ""}" data-view="complaints">
        <span class="material-symbols-outlined">report_problem</span>
        <span>${t.sidebar.complaints}</span>
      </div>
      <div class="sidebar__link ${currentView === "documents" ? "sidebar__link--active" : ""}" data-view="documents">
        <span class="material-symbols-outlined">description</span>
        <span>${t.sidebar.documents}</span>
      </div>
      <div class="sidebar__link sidebar__link--ai ${currentView === "chat" ? "sidebar__link--active" : ""}" data-view="chat">
        <span class="material-symbols-outlined">auto_awesome</span>
        <span>${t.sidebar.chat}</span>
      </div>
    </nav>

    <div class="sidebar__footer">
      <button class="sidebar__emergency" id="sidebarEmergencyBtn">
        <span class="material-symbols-outlined">sos</span>
        <span>${t.sidebar.emergency}</span>
      </button>
      <div class="sidebar__link" id="sidebarSettingsBtn" role="button" tabindex="0">
        <span class="material-symbols-outlined">settings</span>
        <span>${t.sidebar.settings}</span>
      </div>
    </div>
  `;

  sidebarEl.querySelectorAll("[data-view]").forEach((el) => {
    el.addEventListener("click", () => navigateTo(el.dataset.view));
  });

  const emergencyBtn = sidebarEl.querySelector("#sidebarEmergencyBtn");
  if (emergencyBtn) {
    emergencyBtn.addEventListener("click", () => {
      showToast(t.sidebar.emergencyAlert, "warning", 8000);
    });
  }

  const settingsBtn = sidebarEl.querySelector("#sidebarSettingsBtn");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      showToast(t.sidebar.settingsAlert, "info");
    });
  }
}

function renderBottomNav() {
  const t = getTranslations(currentLanguage);
  bottomNavEl.innerHTML = NAV_ITEMS.map((item) => `
    <div class="bottom-nav__item ${currentView === item.view ? "bottom-nav__item--active" : ""}" data-view="${item.view}">
      <span class="material-symbols-outlined" style="font-size: 22px; ${currentView === item.view ? "font-variation-settings: 'FILL' 1;" : ""}">${item.icon}</span>
      <span>${t.bottomNav[item.labelKey]}</span>
    </div>
  `).join("");

  bottomNavEl.querySelectorAll("[data-view]").forEach((el) => {
    el.addEventListener("click", () => navigateTo(el.dataset.view));
  });
}

function renderApp() {
  const t = getTranslations(currentLanguage);
  document.title = `${t.appName} · ${t.tagline}`;

  renderNavbar(navbarEl, t, currentView, currentLanguage, navigateTo, changeLanguage);
  renderSidebar();
  renderBottomNav();

  switch (currentView) {
    case "chat":
      renderChat(appEl, t, currentLanguage);
      break;
    case "schemes":
      renderSchemes(appEl, t, currentLanguage);
      break;
    case "documents":
      renderDocuments(appEl, t, currentLanguage);
      break;
    case "complaints":
      renderComplaints(appEl, t, currentLanguage);
      break;
    case "dashboard":
    default:
      renderDashboard(appEl, t, navigateTo);
      break;
  }
}

// AI FAB navigates to chat
if (aiFab) {
  aiFab.addEventListener("click", () => navigateTo("chat"));
}

renderApp();
