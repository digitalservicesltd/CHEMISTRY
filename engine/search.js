/* ============================================
   PFA STUDY PLATFORM — search.js
   Client-side search engine
   ============================================ */

(function () {
  const Search = {};
  window.PFA = window.PFA || {};
  window.PFA.Search = Search;

  let _index = [];
  let _initialized = false;

  /* ---- BUILD INDEX ---- */

  /**
   * Build search index from manifest
   */
  Search.buildIndex = function () {
    const manifest = window.PFA.manifest;
    if (!manifest) return;

    _index = [];

    for (const subjectKey of Object.keys(manifest.subjects)) {
      const subj = manifest.subjects[subjectKey];
      const meta = window.PFA.getSubjectMeta(subjectKey);

      for (const cls of Object.keys(subj.classes || {})) {
        const chapters = subj.classes[cls].chapters || [];
        chapters.forEach(ch => {
          // Index chapter itself
          _index.push({
            type: 'chapter',
            subject: subjectKey,
            subjectName: meta.name,
            class: cls,
            chapter: ch.chapter,
            title: ch.title,
            file: ch.file,
            text: `${meta.name} Class ${cls} Chapter ${ch.chapter} ${ch.title}`.toLowerCase(),
            display: `Ch ${ch.chapter} — ${ch.title}`,
            badge: `${meta.emoji} ${meta.name} · Class ${cls}th`
          });

          // Index searchable content from chapter metadata if available
          if (ch.searchTerms) {
            ch.searchTerms.forEach(term => {
              _index.push({
                type: term.type || 'topic',
                subject: subjectKey,
                subjectName: meta.name,
                class: cls,
                chapter: ch.chapter,
                title: term.text,
                file: ch.file,
                text: `${term.text} ${meta.name} ${ch.title}`.toLowerCase(),
                display: term.text,
                badge: `${_typeEmoji(term.type)} ${term.type} · Ch ${ch.chapter}`
              });
            });
          }
        });
      }
    }

    _initialized = true;
  };

  function _typeEmoji(type) {
    const map = {
      formula: '🔢', pyq: '📄', mcq: '🎯', definition: '📖',
      reaction: '⚗️', numerical: '🔢', concept: '💡', topic: '📝'
    };
    return map[type] || '📝';
  }

  /* ---- SEARCH ---- */

  /**
   * Search the index
   * @param {string} query
   * @param {number} [limit=20]
   * @returns {Array} Search results
   */
  Search.search = function (query, limit) {
    if (!_initialized) Search.buildIndex();
    if (!query || query.trim().length === 0) return [];

    limit = limit || 20;
    const terms = query.toLowerCase().trim().split(/\s+/);

    const scored = [];
    _index.forEach(entry => {
      let score = 0;
      let allMatch = true;

      terms.forEach(term => {
        if (entry.text.includes(term)) {
          score += 1;
          // Boost for title match
          if (entry.title.toLowerCase().includes(term)) score += 2;
          // Boost for exact word match
          if (entry.text.split(/\s+/).some(w => w === term)) score += 1;
        } else {
          allMatch = false;
        }
      });

      if (allMatch && score > 0) {
        // Boost chapters over sub-items
        if (entry.type === 'chapter') score += 1;
        scored.push({ ...entry, score });
      }
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  };

  /* ---- SEARCH UI ---- */

  /**
   * Initialize global search on a page
   */
  Search.initGlobalSearch = function (inputId, resultsId) {
    const input = document.getElementById(inputId);
    const resultsContainer = document.getElementById(resultsId);
    if (!input || !resultsContainer) return;

    let debounceTimer;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = input.value.trim();
        if (query.length < 2) {
          resultsContainer.style.display = 'none';
          resultsContainer.innerHTML = '';
          return;
        }

        const results = Search.search(query);
        if (results.length === 0) {
          resultsContainer.innerHTML = '<div class="search-empty">No results found</div>';
          resultsContainer.style.display = 'block';
          return;
        }

        let html = '';
        results.forEach(r => {
          const url = window.PFA.resolveChapterURL(r.file);
          html += `
            <a href="${url}" class="search-result-item">
              <div class="search-result-title">${_highlight(r.display, query)}</div>
              <div class="search-result-badge">${r.badge}</div>
            </a>
          `;
        });

        resultsContainer.innerHTML = html;
        resultsContainer.style.display = 'block';
      }, 200);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.global-search')) {
        resultsContainer.style.display = 'none';
      }
    });

    // Ctrl+K shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        input.focus();
        input.select();
      }
      if (e.key === 'Escape') {
        resultsContainer.style.display = 'none';
        input.blur();
      }
    });

    // Focus shows results if query exists
    input.addEventListener('focus', () => {
      if (input.value.trim().length >= 2 && resultsContainer.innerHTML) {
        resultsContainer.style.display = 'block';
      }
    });
  };

  function _highlight(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /* ---- INDEX CHAPTER CONTENT ---- */

  /**
   * Index content from the current chapter page DOM
   * Call this on chapter pages after content loads
   */
  Search.indexCurrentPage = function () {
    const metaEl = document.getElementById('chapter-meta');
    if (!metaEl) return;

    let meta;
    try {
      meta = JSON.parse(metaEl.textContent);
    } catch {
      return;
    }

    // Index formulas
    document.querySelectorAll('.pfa-formula').forEach(el => {
      const name = el.dataset.name || el.querySelector('.f-name')?.textContent || '';
      const formula = el.dataset.formula || el.querySelector('.f-value')?.textContent || '';
      if (name || formula) {
        _index.push({
          type: 'formula',
          subject: meta.subject.toLowerCase(),
          subjectName: meta.subject,
          class: String(meta.class),
          chapter: meta.chapter,
          title: `${name}: ${formula}`,
          file: `${meta.subject.toLowerCase()}/${meta.class}th/chapters/ch${meta.chapter}.html`,
          text: `${name} ${formula} ${meta.title}`.toLowerCase(),
          display: `${name} — ${formula}`,
          badge: `🔢 Formula · Ch ${meta.chapter}`
        });
      }
    });

    // Index reactions
    document.querySelectorAll('.pfa-reaction').forEach(el => {
      const text = el.textContent.trim();
      if (text) {
        _index.push({
          type: 'reaction',
          subject: meta.subject.toLowerCase(),
          subjectName: meta.subject,
          class: String(meta.class),
          chapter: meta.chapter,
          title: text.substring(0, 80),
          file: `${meta.subject.toLowerCase()}/${meta.class}th/chapters/ch${meta.chapter}.html`,
          text: `${text} ${meta.title}`.toLowerCase(),
          display: text.substring(0, 60) + (text.length > 60 ? '...' : ''),
          badge: `⚗️ Reaction · Ch ${meta.chapter}`
        });
      }
    });
  };
})();
