/* ============================================
   PFA STUDY PLATFORM — main.js
   Thin initialization wrapper
   ============================================ */

/* ---- THEMES ---- */
const themes = {
  "forest-dark": {
    name: "Forest Dark",
    bg: "#0a0f0a",
    primary: "#00c853",
    accent: "#69f0ae",
    card: "rgba(0,200,83,0.05)",
    border: "rgba(0,200,83,0.2)",
    text: "#f8fafc",
    muted: "#94a3b8"
  },
  "midnight-blue": {
    name: "Midnight Blue",
    bg: "#0a0e1a",
    primary: "#1565c0",
    accent: "#5c9af5",
    card: "rgba(21,101,192,0.08)",
    border: "rgba(21,101,192,0.3)",
    text: "#f8fafc",
    muted: "#90a4ae"
  },
  "sunset": {
    name: "Sunset",
    bg: "#0f0a08",
    primary: "#ff6b35",
    accent: "#ffa726",
    card: "rgba(255,107,53,0.05)",
    border: "rgba(255,107,53,0.2)",
    text: "#f8fafc",
    muted: "#bcaaa4"
  },
  "arctic": {
    name: "Arctic",
    bg: "#f0f4f8",
    primary: "#0288d1",
    accent: "#00bcd4",
    card: "rgba(2,136,209,0.07)",
    border: "rgba(2,136,209,0.2)",
    text: "#0a0a0f",
    muted: "#546e7a"
  },
  "blood-red": {
    name: "Blood Red",
    bg: "#0f0a0a",
    primary: "#c62828",
    accent: "#ef5350",
    card: "rgba(198,40,40,0.06)",
    border: "rgba(198,40,40,0.2)",
    text: "#f8fafc",
    muted: "#bcaaa4"
  },
  "golden": {
    name: "Golden",
    bg: "#0a0900",
    primary: "#f9a825",
    accent: "#ffd54f",
    card: "rgba(249,168,37,0.05)",
    border: "rgba(249,168,37,0.2)",
    text: "#f8fafc",
    muted: "#a1887f"
  },
  "rose-dark": {
    name: "Rose Dark",
    bg: "#0f0a0d",
    primary: "#e91e8c",
    accent: "#f48fb1",
    card: "rgba(233,30,140,0.05)",
    border: "rgba(233,30,140,0.2)",
    text: "#f8fafc",
    muted: "#ce93d8"
  },
  "matrix": {
    name: "Matrix",
    bg: "#000000",
    primary: "#00ff41",
    accent: "#00cc33",
    card: "rgba(0,255,65,0.04)",
    border: "rgba(0,255,65,0.15)",
    text: "#00ff41",
    muted: "#00aa2b"
  },
  "dark-cyber": {
    name: "Dark Cyber",
    bg: "#0a0a0f",
    primary: "#00bcd4",
    accent: "#00e5ff",
    card: "rgba(0,188,212,0.04)",
    border: "rgba(0,188,212,0.2)",
    text: "#f8fafc",
    muted: "#80deea"
  },
  "dracula": {
    name: "Dracula",
    bg: "#1e1e2e",
    primary: "#bd93f9",
    accent: "#caa9fa",
    card: "rgba(189,147,249,0.06)",
    border: "rgba(189,147,249,0.2)",
    text: "#f8f8f2",
    muted: "#6272a4"
  }
};

// ---- APPLY THEME ----
function applyTheme(themeKey) {
  const t = themes[themeKey];
  if (!t) return;

  const root = document.documentElement;
  root.style.setProperty("--bg", t.bg);
  root.style.setProperty("--primary", t.primary);
  root.style.setProperty("--accent", t.accent);
  root.style.setProperty("--card", t.card);
  root.style.setProperty("--border", t.border);
  root.style.setProperty("--text", t.text);
  root.style.setProperty("--muted", t.muted);

  localStorage.setItem("pfa-theme", themeKey);

  // Update active state in popup
  document.querySelectorAll(".theme-card").forEach(card => {
    card.classList.toggle("active", card.dataset.theme === themeKey);
  });
}

// ---- BUILD THEME POPUP ----
function buildThemePopup() {
  const overlay = document.createElement("div");
  overlay.className = "theme-overlay";
  overlay.id = "themeOverlay";

  const popup = document.createElement("div");
  popup.className = "theme-popup";

  popup.innerHTML = `
    <button class="theme-popup-close" id="themeClose">&times;</button>
    <h2>🎨 Choose Theme</h2>
    <div class="theme-grid" id="themeGrid"></div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  const grid = document.getElementById("themeGrid");
  const currentTheme = localStorage.getItem("pfa-theme") || "dark-cyber";

  Object.keys(themes).forEach(key => {
    const t = themes[key];
    const card = document.createElement("div");
    card.className = "theme-card" + (key === currentTheme ? " active" : "");
    card.dataset.theme = key;

    card.innerHTML = `
      <div class="theme-card-name">
        <span>${t.name}</span>
        <span class="check">✓</span>
      </div>
      <div class="theme-color-bar">
        <span style="background:${t.bg}; border:1px solid ${t.border}"></span>
        <span style="background:${t.primary}"></span>
        <span style="background:${t.accent}"></span>
      </div>
    `;

    card.addEventListener("click", () => applyTheme(key));
    grid.appendChild(card);
  });

  document.getElementById("themeClose").addEventListener("click", () => {
    overlay.classList.remove("active");
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("active");
  });
}

// ---- BUILD TOGGLE BUTTON ----
function buildThemeButton() {
  const btn = document.createElement("button");
  btn.className = "theme-toggle-btn";
  btn.innerHTML = `<span class="icon">🎨</span> Theme`;

  btn.addEventListener("click", () => {
    document.getElementById("themeOverlay").classList.add("active");
  });

  document.body.appendChild(btn);
}

// ---- INIT ----
document.addEventListener("DOMContentLoaded", async () => {
  // Apply saved theme
  const saved = localStorage.getItem("pfa-theme") || "dark-cyber";
  applyTheme(saved);

  // Build theme UI
  buildThemeButton();
  buildThemePopup();

  // Initialize the platform engine
  if (window.PFA && window.PFA.autoInit) {
    await window.PFA.autoInit();
  }

  // Initialize components (for chapter pages)
  if (window.PFA && window.PFA.Components) {
    window.PFA.Components.init();
    if (window.PFA.Components.renderPYQs) window.PFA.Components.renderPYQs();
    if (window.PFA.Components.initPracticeTest) window.PFA.Components.initPracticeTest();
  }

  // Build search index
  if (window.PFA && window.PFA.Search) {
    window.PFA.Search.buildIndex();
    // Index current page content if on a chapter page
    if (document.body.dataset.pfaPage === 'chapter') {
      window.PFA.Search.indexCurrentPage();
    }
  }

  // Entrance fade
  const main = document.querySelector(".fade-in");
  if (main) main.style.opacity = "1";
});

// ---- SERVICE WORKER ----
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use PFA's computed base path for correct SW registration
    const base = (window.PFA && window.PFA.config) ? window.PFA.config.basePath : '/';
    const swPath = base + 'sw.js';
    navigator.serviceWorker
      .register(swPath)
      .then(reg => console.log('SW registered'))
      .catch(err => console.log('SW error:', err));
  });
}