// ============================================================
// AI CHAT COMPANION — v2 Premium
// Implements the full chat UI from UI idea file 4:
// - Glassmorphic chat layout with context panel
// - Header with AI avatar, online status, language selector
// - Chat bubbles with AI sender label
// - Quick suggestion chips
// - Gradient input bar with mic + send
// - Right context panel: doc scanner, trending, alert
// ============================================================

import { callAI } from "../utils/aiClient.js";
import { getChatHistory, saveChatHistory } from "../utils/storage.js";
import { getFallbackChatReply } from "../utils/demoData.js";
import { showToast } from "../utils/toast.js";
import { MAX_CHAT_INPUT_LENGTH } from "../config/config.js";

function buildSystemPrompt(language) {
  const basePersona =
    "You are Smart Bharat's AI Civic Companion: a knowledgeable, friendly " +
    "Indian civic assistant. You explain government processes, schemes, " +
    "and paperwork in plain, simple language for someone who may not be " +
    "familiar with bureaucratic jargon. Avoid legal or bureaucratic " +
    "terminology unless you immediately explain it. Keep answers concise " +
    "(roughly 4-8 sentences or a short bullet list), practical, and " +
    "specific to India. If you are not fully certain of a fine detail " +
    "(like an exact fee or deadline), say so and point the citizen to the " +
    "right official website or office instead of guessing.";

  const languageInstruction =
    language === "hi"
      ? "Respond in Hindi, written in Devanagari script, in a warm and simple tone."
      : "Respond in English, in a warm and simple tone.";

  return `${basePersona} ${languageInstruction}`;
}

function buildConversationPrompt(history) {
  const recentMessages = history.slice(-8);
  return recentMessages
    .map((message) => `${message.role === "user" ? "Citizen" : "Assistant"}: ${message.text}`)
    .join("\n");
}

export function renderChat(container, t, language) {
  // Check for query from hero search
  const heroQuery = sessionStorage.getItem("sb_hero_query");
  sessionStorage.removeItem("sb_hero_query");

  const starterChipsHtml = t.chat.starters
    .map((question) => `<button class="chip" data-starter="${escapeHtml(question)}">${question}</button>`)
    .join("");

  container.innerHTML = `
    <section class="view-header" style="margin-bottom: 20px;">
      <h1>${t.chat.title}</h1>
      <p>${t.chat.subtitle}</p>
    </section>

    <div class="demo-banner">
      <div class="demo-banner__text">
        <strong>${t.chat.demoTitle}</strong>
        <p>${t.chat.demoBody}</p>
      </div>
      <button class="btn btn--primary btn--small" id="chatDemoBtn">${t.chat.demoButton}</button>
    </div>

    <div class="chat-layout">
      <!-- Main Chat Card -->
      <div class="chat-card">
        <!-- Chat Header -->
        <div class="chat-card__header">
          <div class="chat-card__ai-info">
            <div class="chat-card__ai-avatar">
              <span class="material-symbols-outlined" style="font-size: 22px;">smart_toy</span>
            </div>
            <div>
              <p class="chat-card__ai-name">${t.chat.aiName}</p>
              <div class="chat-card__ai-status">
                <span class="chat-card__ai-dot"></span>
                ${t.chat.aiStatus}
              </div>
            </div>
          </div>
          <select class="chat-card__lang-select" id="chatLangSelect" aria-label="Chat language">
            <option value="en" ${language === "en" ? "selected" : ""}>English</option>
            <option value="hi" ${language === "hi" ? "selected" : ""}>हिन्दी (Hindi)</option>
          </select>
        </div>

        <!-- Messages -->
        <div class="chat-card__messages" id="chatMessages" aria-live="polite" aria-label="Chat conversation"></div>

        <!-- Starter Chips -->
        <div class="chat-card__starters" id="chatStarters">${starterChipsHtml}</div>

        <!-- Input Bar -->
        <form class="chat-card__composer" id="chatForm">
          <input
            type="text"
            id="chatInput"
            class="text-input"
            placeholder="${t.chat.placeholder}"
            autocomplete="off"
            aria-label="${t.chat.placeholder}"
            maxlength="${MAX_CHAT_INPUT_LENGTH}"
          />
          <span id="chatCharCount" style="font-size:0.72rem; color:var(--on-surface-variant); padding:0 4px; white-space:nowrap;"></span>
          <button type="button" class="btn btn--ghost btn--icon" id="chatVoiceBtn" title="${t.chat.voiceButton}" aria-label="${t.chat.voiceButton}">
            <span class="material-symbols-outlined" style="font-size: 20px;">mic</span>
          </button>
          <button type="submit" class="btn btn--primary" id="chatSendBtn" aria-label="${t.chat.send}">
            <span class="material-symbols-outlined" style="font-size: 18px; font-variation-settings: 'FILL' 1;">send</span>
            <span>${t.chat.send}</span>
          </button>
        </form>
      </div>

      <!-- Context Panel (desktop only) -->
      <aside class="chat-context-panel" aria-label="Context panel">
        <h2 class="chat-context-panel__title">${t.chat.contextTitle}</h2>

        <!-- Document Scanner -->
        <div class="doc-scanner">
          <div class="doc-scanner__title">
            <span class="material-symbols-outlined">document_scanner</span>
            ${t.chat.liveTranslator}
          </div>
          <p style="font-size:0.78rem; opacity:0.9; margin-bottom:12px;">${t.chat.translatorDesc}</p>
          <div class="doc-scanner__drop" id="docScannerBtn" role="button" tabindex="0" aria-label="Drop documents here">
            <span class="material-symbols-outlined">upload_file</span>
            <span class="label">${t.chat.dragDrop}</span>
          </div>
        </div>

        <!-- Trending Services -->
        <div class="trending-services">
          <p class="trending-services__title">${t.chat.trendingServices}</p>
          <div class="trending-item" role="button" tabindex="0" data-starter="Tell me about Solar Subsidy">
            <div class="trending-item__info">
              <span class="material-symbols-outlined">energy_savings_leaf</span>
              <span class="trending-item__name">${t.chat.solarSubsidy}</span>
            </div>
            <span class="material-symbols-outlined arrow">arrow_forward</span>
          </div>
          <div class="trending-item" role="button" tabindex="0" data-starter="Tell me about Post-Matric Scholarship">
            <div class="trending-item__info">
              <span class="material-symbols-outlined">school</span>
              <span class="trending-item__name">${t.chat.scholarship}</span>
            </div>
            <span class="material-symbols-outlined arrow">arrow_forward</span>
          </div>
          <div class="trending-item" role="button" tabindex="0" data-starter="How can I get an Ayushman Card?">
            <div class="trending-item__info">
              <span class="material-symbols-outlined">health_and_safety</span>
              <span class="trending-item__name">${t.chat.ayushman}</span>
            </div>
            <span class="material-symbols-outlined arrow">arrow_forward</span>
          </div>
        </div>

        <!-- Alert -->
        <div class="context-alert">
          <div class="context-alert__header">
            <span class="material-symbols-outlined" style="font-size:18px;">campaign</span>
            ${t.chat.alertTitle}
          </div>
          <p>${t.chat.alertDesc}</p>
        </div>
      </aside>
    </div>
  `;

  const messagesEl  = container.querySelector("#chatMessages");
  const formEl      = container.querySelector("#chatForm");
  const inputEl     = container.querySelector("#chatInput");
  const sendBtn     = container.querySelector("#chatSendBtn");
  const demoBtn     = container.querySelector("#chatDemoBtn");
  const voiceBtn    = container.querySelector("#chatVoiceBtn");
  const startersEl  = container.querySelector("#chatStarters");
  const charCountEl = container.querySelector("#chatCharCount");

  renderMessageList(messagesEl, getChatHistory(), t);

  // Character counter
  if (charCountEl) {
    inputEl.addEventListener("input", () => {
      const len = inputEl.value.length;
      charCountEl.textContent = len > MAX_CHAT_INPUT_LENGTH * 0.8
        ? `${len}/${MAX_CHAT_INPUT_LENGTH}`
        : "";
      charCountEl.style.color = len >= MAX_CHAT_INPUT_LENGTH ? "var(--error)" : "var(--on-surface-variant)";
    });
  }

  // Handle hero search query
  if (heroQuery) {
    inputEl.value = heroQuery;
    setTimeout(() => formEl.requestSubmit(), 100);
  }

  container.querySelectorAll("[data-starter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      inputEl.value = chip.dataset.starter;
      formEl.requestSubmit();
    });
  });

  const docScannerBtn = container.querySelector("#docScannerBtn");
  if (docScannerBtn) {
    docScannerBtn.addEventListener("click", () => {
      showToast(t.chat.comingSoon, "info");
    });
    docScannerBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showToast(t.chat.comingSoon, "info");
      }
    });
  }

  demoBtn.addEventListener("click", () => {
    inputEl.value =
      language === "hi"
        ? "मेरी गली की स्ट्रीटलाइट दो हफ्तों से खराब है। मुझे क्या करना चाहिए?"
        : "My streetlight has been broken for two weeks. What should I do?";
    formEl.requestSubmit();
  });

  setupVoiceInput(voiceBtn, inputEl, language, t);

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = inputEl.value.trim();
    if (!question) return;

    // Input length validation
    if (question.length > MAX_CHAT_INPUT_LENGTH) {
      showToast(`Message too long. Please keep it under ${MAX_CHAT_INPUT_LENGTH} characters.`, "warning");
      return;
    }

    inputEl.value = "";
    if (charCountEl) charCountEl.textContent = "";
    inputEl.disabled = true;
    sendBtn.disabled = true;
    sendBtn.setAttribute("aria-busy", "true");

    const history = getChatHistory();
    history.push({ role: "user", text: question, timestamp: Date.now() });
    saveChatHistory(history);
    renderMessageList(messagesEl, history, t);

    const loadingId = appendLoadingBubble(messagesEl, t);

    try {
      const systemPrompt = buildSystemPrompt(language);
      const conversationPrompt = buildConversationPrompt(history);
      const replyText = await callAI(conversationPrompt, systemPrompt);

      const updatedHistory = getChatHistory();
      updatedHistory.push({ role: "assistant", text: replyText, timestamp: Date.now() });
      saveChatHistory(updatedHistory);
      removeLoadingBubble(messagesEl, loadingId);
      renderMessageList(messagesEl, updatedHistory, t);
    } catch (error) {
      const updatedHistory = getChatHistory();
      updatedHistory.push({
        role: "assistant",
        text: getFallbackChatReply(question, language),
        timestamp: Date.now(),
        isFallback: true,
      });
      saveChatHistory(updatedHistory);
      removeLoadingBubble(messagesEl, loadingId);
      renderMessageList(messagesEl, updatedHistory, t);
    } finally {
      inputEl.disabled = false;
      sendBtn.disabled = false;
      sendBtn.removeAttribute("aria-busy");
      inputEl.focus();
    }
  });
}

function renderMessageList(messagesEl, history, t) {
  if (history.length === 0) {
    // Show AI welcome message when no history
    messagesEl.innerHTML = `
      <div class="chat-bubble chat-bubble--assistant">
        <div class="chat-bubble__sender">
          <span class="material-symbols-outlined" style="font-size:14px; font-variation-settings:'FILL' 1;">auto_awesome</span>
          ${t.chat.aiName}
        </div>
        <div class="chat-bubble__content">
          <p>${t.chat.welcomeMsg}</p>
          <ul style="list-style:none; padding:0; margin: 8px 0; display:flex; flex-direction:column; gap:6px;">
            <li style="display:flex; align-items:center; gap:8px; font-size:0.875rem; color:var(--on-surface-variant);">
              <span class="material-symbols-outlined" style="color:var(--tertiary); font-size:18px;">how_to_reg</span> ${t.chat.feat1}
            </li>
            <li style="display:flex; align-items:center; gap:8px; font-size:0.875rem; color:var(--on-surface-variant);">
              <span class="material-symbols-outlined" style="color:var(--tertiary); font-size:18px;">translate</span> ${t.chat.feat2}
            </li>
            <li style="display:flex; align-items:center; gap:8px; font-size:0.875rem; color:var(--on-surface-variant);">
              <span class="material-symbols-outlined" style="color:var(--tertiary); font-size:18px;">help_center</span> ${t.chat.feat3}
            </li>
          </ul>
          <p>${t.chat.howCanIHelp}</p>
        </div>
        <span class="chat-bubble__time">${t.chat.justNow}</span>
      </div>
    `;
    return;
  }

  messagesEl.innerHTML = history
    .map((message) => {
      const timeStr = new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (message.role === "user") {
        return `
          <div class="chat-bubble chat-bubble--user">
            <div class="chat-bubble__content">
              ${formatMessageText(message.text)}
            </div>
            <span class="chat-bubble__time">${timeStr}</span>
          </div>
        `;
      } else {
        return `
          <div class="chat-bubble chat-bubble--assistant">
            <div class="chat-bubble__sender">
              <span class="material-symbols-outlined" style="font-size:14px; font-variation-settings:'FILL' 1;">auto_awesome</span>
              ${t.chat.aiName}
            </div>
            ${message.isFallback ? `<span class="fallback-label">${t.common.demoSafe}</span>` : ""}
            <div class="chat-bubble__content">
              ${formatMessageText(message.text)}
            </div>
            <span class="chat-bubble__time">${timeStr}</span>
          </div>
        `;
      }
    })
    .join("");

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function appendLoadingBubble(messagesEl, t) {
  const id = `loading-${Date.now()}`;
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble chat-bubble--assistant chat-bubble--loading";
  bubble.id = id;
  bubble.innerHTML = `
    <div class="chat-bubble__sender">
      <span class="material-symbols-outlined" style="font-size:14px; font-variation-settings:'FILL' 1;">auto_awesome</span>
      ${t.chat.aiName}
    </div>
    <div class="chat-bubble__content" style="display:flex; align-items:center; gap:10px;">
      ${spinnerSvg()}
      <span style="font-size:0.875rem; color:var(--on-surface-variant);">${t.chat.thinking}</span>
    </div>
  `;
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return id;
}

function removeLoadingBubble(messagesEl, id) {
  const bubble = messagesEl.querySelector(`#${id}`);
  if (bubble) bubble.remove();
}

function formatMessageText(text) {
  const escaped = escapeHtml(text);
  return escaped
    .split("\n")
    .map((line) => `<p>${line}</p>`)
    .join("");
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function setupVoiceInput(button, inputEl, language, t) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    button.disabled = true;
    button.title = t.chat.voiceUnsupported;
    return;
  }

  button.addEventListener("click", () => {
    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    button.classList.add("btn--listening");
    recognition.start();

    recognition.onresult = (event) => {
      inputEl.value = event.results[0][0].transcript;
      inputEl.focus();
    };
    recognition.onend = () => button.classList.remove("btn--listening");
    recognition.onerror = () => button.classList.remove("btn--listening");
  });
}

function spinnerSvg() {
  return `
    <svg class="wheel-spinner" viewBox="0 0 40 40" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width="2.4"/>
      ${Array.from({ length: 12 })
        .map((_, index) => {
          const angle = (index * 360) / 12;
          return `<line x1="20" y1="20" x2="20" y2="5" stroke="currentColor" stroke-width="1.6" transform="rotate(${angle} 20 20)"/>`;
        })
        .join("")}
    </svg>
  `;
}
