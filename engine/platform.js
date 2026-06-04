/* ============================================
   PFA STUDY PLATFORM ENGINE — platform.js
   Core engine: manifest, dashboard, navigation
   ============================================ */

const PFA = window.PFA || {};
window.PFA = PFA;

/* ---- CONFIGURATION ---- */
PFA.config = {
  // Auto-detect base path from current URL
  // On GitHub Pages: /CHEMISTRY/  On local dev: /
  // Uses the platform.js script src to reliably compute the base
  basePath: (function () {
    // Find the script tag that loaded platform.js
    const scripts = document.querySelectorAll('script[src*="platform.js"]');
    if (scripts.length > 0) {
      const src = scripts[0].getAttribute('src');
      // src is like "../../../engine/platform.js" or "engine/platform.js"
      // Resolve it against the current page URL to get the absolute path
      const scriptURL = new URL(src, window.location.href);
      // engine/platform.js is always at {basePath}engine/platform.js
      const scriptPath = scriptURL.pathname;
      const engineIdx = scriptPath.indexOf('/engine/platform.js');
      if (engineIdx !== -1) {
        return scriptPath.substring(0, engineIdx + 1); // includes trailing /
      }
    }
    // Fallback: check if first segment looks like a GitHub Pages repo
    const path = window.location.pathname;
    const match = path.match(/^(\/[^/]+\/)/);
    // Known content directories that should NOT be treated as base path
    const contentDirs = ['chemistry', 'physics', 'maths', 'biology', '11th', '12th'];
    if (match && !contentDirs.includes(match[1].replace(/\//g, ''))) {
      return match[1];
    }
    return '/';
  })(),
  manifestFile: 'chapters.json',
  subjectMeta: {
    chemistry: { name: 'Chemistry', emoji: '⚗️', color: '#00bcd4', icon: '🧪' },
    physics: { name: 'Physics', emoji: '⚡', color: '#ff9800', icon: '🔭' },
    maths: { name: 'Mathematics', emoji: '📐', color: '#ab47bc', icon: '📊' },
    biology: { name: 'Biology', emoji: '🧬', color: '#66bb6a', icon: '🔬' }
  },
  sectionLabels: {
    overview: '📋 Overview',
    notes: '📝 Notes',
    concepts: '💡 Concepts',
    theory: '📖 NCERT Theory',
    formulas: '🔢 Formulas',
    reactions: '⚗️ Reactions',
    'ncert-solved': '✅ NCERT Solved',
    'ncert-back': '📘 Back Exercise',
    pyq: '📄 PYQs',
    mcq: '🎯 MCQs',
    assertion: '⚖️ Assertion-Reason',
    numerical: '🔢 Numericals',
    revision: '🔄 Quick Revision',
    mistakes: '⚠️ Common Mistakes',
    summary: '📊 Summary',
    practice: '📝 Practice Test'
  }
};

/* ---- MANIFEST STORE ---- */
PFA.manifest = null;

/**
 * Load the chapters.json manifest
 * @returns {Promise<Object>} The manifest data
 */
PFA.loadManifest = async function () {
  if (PFA.manifest) return PFA.manifest;
  try {
    const url = PFA.config.basePath + PFA.config.manifestFile;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Manifest fetch failed: ' + resp.status);
    PFA.manifest = await resp.json();
    return PFA.manifest;
  } catch (err) {
    console.warn('[PFA] Could not load manifest:', err.message);
    PFA.manifest = { subjects: {} };
    return PFA.manifest;
  }
};

/* ---- UTILITY HELPERS ---- */

/**
 * Get subject metadata (name, emoji, color) with fallback
 */
PFA.getSubjectMeta = function (subjectKey) {
  const defaults = { name: subjectKey, emoji: '📚', color: '#78909c', icon: '📚' };
  return { ...defaults, ...(PFA.config.subjectMeta[subjectKey] || {}) };
};

/**
 * Get all subjects from manifest
 */
PFA.getSubjects = function () {
  if (!PFA.manifest) return [];
  return Object.keys(PFA.manifest.subjects);
};

/**
 * Get all chapters for a subject + class
 */
PFA.getChapters = function (subject, cls) {
  if (!PFA.manifest) return [];
  const subj = PFA.manifest.subjects[subject];
  if (!subj || !subj.classes || !subj.classes[cls]) return [];
  return subj.classes[cls].chapters || [];
};

/**
 * Get total chapter count for a subject
 */
PFA.getSubjectChapterCount = function (subject) {
  if (!PFA.manifest) return 0;
  const subj = PFA.manifest.subjects[subject];
  if (!subj || !subj.classes) return 0;
  let count = 0;
  for (const cls of Object.keys(subj.classes)) {
    count += (subj.classes[cls].chapters || []).length;
  }
  return count;
};

/**
 * Find a chapter's position in the ordered list for prev/next navigation
 */
PFA.getChapterNav = function (subject, cls, chapterNum) {
  const chapters = PFA.getChapters(subject, cls);
  const idx = chapters.findIndex(ch => ch.chapter === chapterNum);
  if (idx === -1) return { prev: null, next: null, current: null };

  return {
    prev: idx > 0 ? chapters[idx - 1] : null,
    next: idx < chapters.length - 1 ? chapters[idx + 1] : null,
    current: chapters[idx]
  };
};

/**
 * Resolve a chapter file path to an absolute URL
 */
PFA.resolveChapterURL = function (filePath) {
  return PFA.config.basePath + filePath;
};

/* ============================================
   DASHBOARD RENDERERS
   ============================================ */

/**
 * Render the MAIN PORTAL dashboard (index.html)
 * Shows all subjects with progress
 */
PFA.renderMainDashboard = async function (containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  await PFA.loadManifest();
  const subjects = PFA.getSubjects();

  // Stats
  let totalChapters = 0;
  let totalCompleted = 0;
  subjects.forEach(s => {
    const count = PFA.getSubjectChapterCount(s);
    totalChapters += count;
    totalCompleted += PFA.Progress ? PFA.Progress.getSubjectProgress(s).completed : 0;
  });

  const lastVisited = PFA.Progress ? PFA.Progress.getLastVisited() : null;

  let html = '';

  // Hero
  html += `
    <div class="portal-hero">
      <span class="emoji">📚</span>
      <h1>PFA <span>Study Portal</span></h1>
      <p class="tagline">Your Personal NCERT Study Workspace</p>
    </div>
  `;

  // Global search
  html += `
    <div class="search-wrapper global-search" id="globalSearchWrapper">
      <span class="search-icon">🔍</span>
      <input type="text" class="search-input" id="globalSearch"
             placeholder="Search chapters, formulas, topics... (Ctrl+K)" />
      <div class="search-results" id="searchResults" style="display:none;"></div>
    </div>
  `;

  // Overall stats
  html += `
    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-value">${subjects.length}</div>
        <div class="stat-label">Subjects</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalChapters}</div>
        <div class="stat-label">Total Chapters</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalCompleted}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalChapters > 0 ? Math.round((totalCompleted / totalChapters) * 100) : 0}%</div>
        <div class="stat-label">Progress</div>
      </div>
    </div>
  `;

  // Continue studying
  if (lastVisited) {
    html += `
      <div class="continue-card">
        <div class="continue-label">📖 Continue Studying</div>
        <a href="${PFA.resolveChapterURL(lastVisited.file)}" class="continue-link">
          <span class="continue-subject">${lastVisited.subject}</span>
          <span class="continue-title">Chapter ${lastVisited.chapter} — ${lastVisited.title}</span>
          <span class="continue-arrow">→</span>
        </a>
      </div>
    `;
  }

  // Subject cards
  html += '<div class="subject-cards">';
  subjects.forEach(subjectKey => {
    const meta = PFA.getSubjectMeta(subjectKey);
    const subj = PFA.manifest.subjects[subjectKey];
    const classes = subj.classes ? Object.keys(subj.classes) : [];
    const chapterCount = PFA.getSubjectChapterCount(subjectKey);
    const progress = PFA.Progress ? PFA.Progress.getSubjectProgress(subjectKey) : { completed: 0, percent: 0 };

    html += `
      <a href="${PFA.config.basePath}${subjectKey}/index.html" class="subject-card" style="--subject-color: ${meta.color}">
        <div class="subject-card-header">
          <span class="subject-emoji">${meta.emoji}</span>
          <span class="subject-badge">${classes.length} Class${classes.length !== 1 ? 'es' : ''}</span>
        </div>
        <h2 class="subject-name">${meta.name}</h2>
        <p class="subject-chapters">${chapterCount} Chapter${chapterCount !== 1 ? 's' : ''}</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress.percent}%; background: ${meta.color};"></div>
        </div>
        <span class="progress-label">${progress.percent}% complete</span>
      </a>
    `;
  });
  html += '</div>';

  container.innerHTML = html;

  // Init search on dashboard
  if (PFA.Search) {
    PFA.Search.initGlobalSearch('globalSearch', 'searchResults');
  }
};

/**
 * Render a SUBJECT DASHBOARD (e.g., chemistry/index.html)
 */
PFA.renderSubjectDashboard = async function (containerId, subjectKey) {
  const container = document.getElementById(containerId);
  if (!container) return;

  await PFA.loadManifest();
  const meta = PFA.getSubjectMeta(subjectKey);
  const subj = PFA.manifest.subjects[subjectKey];
  if (!subj) {
    container.innerHTML = `<div class="empty-state"><span class="empty-icon">📭</span><p>No content found for ${meta.name}. Add chapters and rebuild the manifest.</p></div>`;
    return;
  }

  const classes = subj.classes ? Object.keys(subj.classes).sort() : [];

  let html = '';

  // Header
  html += `
    <div class="page-header">
      <a href="${PFA.config.basePath}" class="back-link">← Back to Portal</a>
      <h1>${meta.emoji} <span>${meta.name}</span></h1>
    </div>
  `;

  // Search
  html += `
    <div class="search-wrapper">
      <span class="search-icon">🔍</span>
      <input type="text" class="search-input" id="subjectSearch"
             placeholder="Search ${meta.name} chapters..." />
    </div>
  `;

  // Class cards
  html += '<div class="class-cards">';
  const classEmojis = { '11': '📗', '12': '📘' };
  classes.forEach(cls => {
    const chapters = PFA.getChapters(subjectKey, cls);
    const progress = PFA.Progress ? PFA.Progress.getClassProgress(subjectKey, cls) : { completed: 0, total: chapters.length, percent: 0 };

    html += `
      <a href="${PFA.config.basePath}${subjectKey}/${cls}th/index.html" class="class-card" style="--subject-color: ${meta.color}">
        <span class="card-emoji">${classEmojis[cls] || '📚'}</span>
        <h2>Class ${cls}th</h2>
        <p>${chapters.length} Chapter${chapters.length !== 1 ? 's' : ''}</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress.percent}%; background: ${meta.color};"></div>
        </div>
        <span class="progress-label">${progress.completed}/${progress.total} completed</span>
      </a>
    `;
  });
  html += '</div>';

  container.innerHTML = html;
};

/**
 * Render a CLASS CHAPTER LIST (e.g., chemistry/11th/index.html)
 */
PFA.renderClassDashboard = async function (containerId, subjectKey, cls) {
  const container = document.getElementById(containerId);
  if (!container) return;

  await PFA.loadManifest();
  const meta = PFA.getSubjectMeta(subjectKey);
  const chapters = PFA.getChapters(subjectKey, cls);

  let html = '';

  // Header
  html += `
    <div class="page-header">
      <a href="${PFA.config.basePath}${subjectKey}/index.html" class="back-link">← Back to ${meta.name}</a>
      <h1>Class ${cls}th <span>${meta.name}</span></h1>
    </div>
  `;

  // Search
  html += `
    <div class="search-wrapper">
      <span class="search-icon">🔍</span>
      <input type="text" class="search-input" id="chapterSearch"
             placeholder="Search chapters..." />
    </div>
  `;

  // Chapter list
  html += '<div class="chapter-list">';
  if (chapters.length === 0) {
    html += `<div class="empty-state"><span class="empty-icon">📭</span><p>No chapters added yet. Use the chapter template to add content.</p></div>`;
  } else {
    chapters.forEach(ch => {
      const isCompleted = PFA.Progress ? PFA.Progress.isCompleted(subjectKey, cls, ch.chapter) : false;
      const chapterURL = PFA.resolveChapterURL(ch.file);

      html += `
        <a href="${chapterURL}" class="chapter-card ${isCompleted ? 'completed' : ''}" data-searchable>
          <div class="chapter-num">${String(ch.chapter).padStart(2, '0')}</div>
          <div class="chapter-info">
            <h3>${ch.title}</h3>
            <div class="chapter-badges">
              <span class="badge">📝 Notes</span>
              <span class="badge">❓ Questions</span>
              <span class="badge">📄 PYQ</span>
              <span class="badge">🔢 Formulas</span>
            </div>
          </div>
          <div class="chapter-status">
            ${isCompleted
          ? '<span class="status-complete">✓</span>'
          : '<span class="status-pending">○</span>'}
          </div>
        </a>
      `;
    });
  }
  html += '</div>';

  container.innerHTML = html;

  // Chapter search filter
  const searchInput = document.getElementById('chapterSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      container.querySelectorAll('.chapter-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }
};

/* ============================================
   CHAPTER PAGE INITIALIZER
   ============================================ */

/**
 * Initialize a chapter page — reads metadata, builds header, tabs, nav
 */
PFA.initChapterPage = async function () {
  // Read metadata
  const metaEl = document.getElementById('chapter-meta');
  if (!metaEl) return;

  let chapterMeta;
  try {
    chapterMeta = JSON.parse(metaEl.textContent);
  } catch (e) {
    console.error('[PFA] Invalid chapter metadata:', e);
    return;
  }

  const { subject, class: cls, chapter, title } = chapterMeta;
  const subjectKey = subject.toLowerCase();
  const meta = PFA.getSubjectMeta(subjectKey);

  // Load manifest for nav
  await PFA.loadManifest();

  // Set page title
  document.title = `Ch ${chapter} — ${title} | PFA ${meta.name}`;

  // Set subject color
  document.documentElement.style.setProperty('--subject-color', meta.color);

  // Build header (breadcrumb + title + completion toggle)
  const headerEl = document.getElementById('pfa-header');
  if (headerEl) {
    const isCompleted = PFA.Progress ? PFA.Progress.isCompleted(subjectKey, cls, chapter) : false;
    headerEl.innerHTML = `
      <div class="breadcrumb">
        <a href="${PFA.config.basePath}">Home</a>
        <span class="sep">→</span>
        <a href="${PFA.config.basePath}${subjectKey}/index.html">${meta.name}</a>
        <span class="sep">→</span>
        <a href="${PFA.config.basePath}${subjectKey}/${cls}th/index.html">Class ${cls}th</a>
        <span class="sep">→</span>
        Chapter ${chapter}
      </div>
      <div class="chapter-header-row">
        <h1 class="chapter-title"><span>Chapter ${chapter}</span> — ${title}</h1>
        <button class="completion-toggle ${isCompleted ? 'completed' : ''}" id="completionToggle"
                title="Mark as ${isCompleted ? 'incomplete' : 'complete'}">
          ${isCompleted ? '✅ Completed' : '☐ Mark Complete'}
        </button>
      </div>
    `;

    // Completion toggle handler
    const toggleBtn = document.getElementById('completionToggle');
    if (toggleBtn && PFA.Progress) {
      toggleBtn.addEventListener('click', () => {
        const completed = PFA.Progress.isCompleted(subjectKey, cls, chapter);
        if (completed) {
          PFA.Progress.markIncomplete(subjectKey, cls, chapter);
          toggleBtn.className = 'completion-toggle';
          toggleBtn.textContent = '☐ Mark Complete';
          toggleBtn.title = 'Mark as complete';
        } else {
          PFA.Progress.markComplete(subjectKey, cls, chapter);
          toggleBtn.className = 'completion-toggle completed';
          toggleBtn.textContent = '✅ Completed';
          toggleBtn.title = 'Mark as incomplete';
        }
      });
    }
  }

  // Build tab navigation from .pfa-section elements
  const tabsEl = document.getElementById('pfa-tabs');
  const sections = document.querySelectorAll('.pfa-section');

  if (tabsEl && sections.length > 0) {
    // Filter out empty sections
    const activeSections = [];
    sections.forEach(sec => {
      const hasContent = sec.innerHTML.trim().length > 0 &&
        !sec.innerHTML.trim().startsWith('<!--') || sec.querySelector('[data-name], [data-year], [data-correct], .pfa-formula, .pfa-mcq, .pfa-pyq, .pfa-numerical, .pfa-warning, .pfa-revision, .pfa-summary, .pfa-reaction, .pfa-assertion, h2, h3, p, ul, ol, table');
      if (hasContent) {
        activeSections.push(sec);
      }
    });

    // Use all sections if content detection is unreliable, or active ones
    const displaySections = activeSections.length > 0 ? activeSections : Array.from(sections);

    let tabHtml = '<div class="tab-nav">';
    displaySections.forEach((sec, idx) => {
      const sectionId = sec.dataset.section;
      const label = sec.dataset.label || PFA.config.sectionLabels[sectionId] || sectionId;
      tabHtml += `<button class="tab-btn ${idx === 0 ? 'active' : ''}" data-tab="section-${sectionId}">${label}</button>`;
      sec.id = `section-${sectionId}`;
      sec.classList.add('tab-panel');
      if (idx === 0) sec.classList.add('active');
    });
    tabHtml += '</div>';
    tabsEl.innerHTML = tabHtml;

    // Tab click handlers
    tabsEl.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Deactivate all
        tabsEl.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        displaySections.forEach(s => s.classList.remove('active'));
        // Activate selected
        btn.classList.add('active');
        const targetId = btn.dataset.tab;
        const target = document.getElementById(targetId);
        if (target) target.classList.add('active');
        // Save tab preference
        localStorage.setItem('pfa-tab-' + subjectKey + '-' + cls + '-' + chapter, targetId);
      });
    });

    // Restore saved tab
    const savedTab = localStorage.getItem('pfa-tab-' + subjectKey + '-' + cls + '-' + chapter);
    if (savedTab) {
      const savedBtn = tabsEl.querySelector(`[data-tab="${savedTab}"]`);
      if (savedBtn) savedBtn.click();
    }
  }

  // Build bottom navigation (prev/next)
  const navEl = document.getElementById('pfa-nav');
  if (navEl) {
    const nav = PFA.getChapterNav(subjectKey, cls, chapter);
    let navHtml = '<div class="bottom-nav">';

    if (nav.prev) {
      const prevURL = PFA.resolveChapterURL(nav.prev.file);
      navHtml += `<a href="${prevURL}" class="nav-prev">← Ch ${nav.prev.chapter} — ${nav.prev.title}</a>`;
    } else {
      navHtml += `<span class="nav-disabled">— First Chapter</span>`;
    }

    if (nav.next) {
      const nextURL = PFA.resolveChapterURL(nav.next.file);
      navHtml += `<a href="${nextURL}" class="nav-next">Ch ${nav.next.chapter} — ${nav.next.title} →</a>`;
    } else {
      navHtml += `<span class="nav-disabled">Last Chapter —</span>`;
    }

    navHtml += '</div>';
    navEl.innerHTML = navHtml;
  }

  // Build footer
  const footerEl = document.getElementById('pfa-footer');
  if (footerEl) {
    footerEl.innerHTML = `<div class="portal-footer">PFA Study Portal — ${meta.name} · Class ${cls}th · Chapter ${chapter}</div>`;
  }

  // Track last visited
  if (PFA.Progress) {
    PFA.Progress.setLastVisited({
      subject: meta.name,
      subjectKey,
      class: cls,
      chapter,
      title,
      file: `${subjectKey}/${cls}th/chapters/ch${chapter}.html`
    });
  }
};

/* ---- AUTO-DETECT PAGE TYPE AND INITIALIZE ---- */
PFA.autoInit = async function () {
  const page = document.body.dataset.pfaPage;
  if (!page) return;

  switch (page) {
    case 'main-dashboard':
      await PFA.renderMainDashboard('pfa-dashboard');
      break;
    case 'subject-dashboard':
      await PFA.renderSubjectDashboard('pfa-dashboard', document.body.dataset.subject);
      break;
    case 'class-dashboard':
      await PFA.renderClassDashboard('pfa-dashboard', document.body.dataset.subject, document.body.dataset.class);
      break;
    case 'chapter':
      await PFA.initChapterPage();
      break;
  }
};
