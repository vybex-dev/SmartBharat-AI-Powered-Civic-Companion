// ============================================================
// TOAST NOTIFICATION SYSTEM
// Replaces all alert() calls in Smart Bharat with a polished,
// accessible, non-blocking toast notification UI.
// Import showToast wherever you need to notify the user.
// ============================================================

let toastContainer = null;

function ensureContainer() {
  if (toastContainer) return toastContainer;
  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.setAttribute('aria-live', 'polite');
  toastContainer.setAttribute('aria-atomic', 'false');
  toastContainer.setAttribute('role', 'status');
  toastContainer.style.cssText = `
    position: fixed;
    bottom: 88px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 360px;
    pointer-events: none;
  `;
  document.body.appendChild(toastContainer);
  return toastContainer;
}

const TOAST_ICONS = {
  info:    'info',
  success: 'check_circle',
  warning: 'warning',
  error:   'error',
};

const TOAST_COLORS = {
  info:    { bg: 'var(--primary)',    text: '#fff' },
  success: { bg: '#16a34a',          text: '#fff' },
  warning: { bg: '#d97706',          text: '#fff' },
  error:   { bg: 'var(--error, #dc2626)', text: '#fff' },
};

/**
 * Shows a non-blocking toast notification.
 * @param {string} message   - Text to display.
 * @param {'info'|'success'|'warning'|'error'} [type='info']
 * @param {number} [duration=4000]  - Auto-dismiss delay in ms (0 = never).
 */
export function showToast(message, type = 'info', duration = 4000) {
  const container = ensureContainer();
  const icon = TOAST_ICONS[type] || TOAST_ICONS.info;
  const colors = TOAST_COLORS[type] || TOAST_COLORS.info;

  const toast = document.createElement('div');
  toast.setAttribute('role', 'alert');
  toast.style.cssText = `
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 18px;
    border-radius: 12px;
    background: ${colors.bg};
    color: ${colors.text};
    font-size: 0.875rem;
    font-family: inherit;
    font-weight: 500;
    line-height: 1.45;
    box-shadow: 0 8px 30px rgba(0,0,0,0.22);
    pointer-events: all;
    cursor: pointer;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.25s ease, transform 0.25s ease;
    max-width: 360px;
    word-break: break-word;
  `;
  toast.innerHTML = `
    <span class="material-symbols-outlined" aria-hidden="true" style="font-size:20px; flex-shrink:0; margin-top:1px; font-variation-settings:'FILL' 1;">${icon}</span>
    <span>${message}</span>
  `;

  // Dismiss on click
  toast.addEventListener('click', () => dismissToast(toast));

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
  });

  // Auto-dismiss
  if (duration > 0) {
    setTimeout(() => dismissToast(toast), duration);
  }

  return toast;
}

function dismissToast(toast) {
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(12px)';
  setTimeout(() => toast.remove(), 300);
}
