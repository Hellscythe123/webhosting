// Theme mode: light / dark only (no auto). Stored in localStorage "theme", default light.
// Replaces the old three-state toggle; keeps the same global names the pages already call.
(function () {
  const KEY = 'theme';
  const getMode = () => (localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light');
  const LABEL = { light: 'สว่าง', dark: 'มืด' };

  function paint(mode) {
    const html = document.documentElement;
    html.setAttribute('data-bs-theme', mode);
    html.setAttribute('data-theme-mode', mode);
    html.classList.toggle('dark-style', mode === 'dark');
    html.classList.toggle('light-style', mode !== 'dark');
    document.querySelectorAll('[data-theme-mode-option]').forEach(b => {
      const on = b.dataset.themeModeOption === mode;
      b.classList.toggle('active', on);
      b.setAttribute('aria-checked', on);
    });
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
      btn.setAttribute('aria-label', 'ธีมการแสดงผล: ' + LABEL[mode] + ' (กดเพื่อสลับ)');
      btn.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
      btn.setAttribute('title', mode === 'dark' ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด');
    }
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: mode, mode } }));
  }

  function setMode(mode) {
    localStorage.setItem(KEY, mode === 'dark' ? 'dark' : 'light');
    paint(getMode());
  }

  // old API used by inline scripts on every page
  window.getStoredTheme = getMode;
  window.applyTheme = m => paint(m === 'dark' ? 'dark' : 'light');
  window.toggleTheme = () => setMode(getMode() === 'dark' ? 'light' : 'dark');
  window.setThemeMode = setMode;

  document.addEventListener('click', e => {
    const opt = e.target.closest('[data-theme-mode-option]');
    if (opt) { setMode(opt.dataset.themeModeOption); return; }
    // one-click switch: no dropdown, the button just flips the mode
    if (e.target.closest('#themeToggleBtn')) setMode(getMode() === 'dark' ? 'light' : 'dark');
  });

  paint(getMode());
  document.addEventListener('DOMContentLoaded', () => paint(getMode()));
})();
