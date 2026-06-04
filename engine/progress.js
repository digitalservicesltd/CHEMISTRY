/* ============================================
   PFA STUDY PLATFORM — progress.js
   localStorage-based progress tracking
   ============================================ */

(function () {
  const STORAGE_KEY = 'pfa-progress';
  const LAST_VISITED_KEY = 'pfa-last-visited';

  const Progress = {};
  window.PFA = window.PFA || {};
  window.PFA.Progress = Progress;

  /* ---- INTERNAL HELPERS ---- */

  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function _save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[PFA Progress] Could not save:', e);
    }
  }

  function _key(subject, cls, chapter) {
    return `${subject}|${cls}|${chapter}`;
  }

  /* ---- PUBLIC API ---- */

  /**
   * Mark a chapter as completed
   */
  Progress.markComplete = function (subject, cls, chapter) {
    const data = _load();
    const key = _key(subject, cls, chapter);
    data[key] = {
      subject,
      class: cls,
      chapter,
      completedAt: new Date().toISOString()
    };
    _save(data);
  };

  /**
   * Mark a chapter as incomplete
   */
  Progress.markIncomplete = function (subject, cls, chapter) {
    const data = _load();
    const key = _key(subject, cls, chapter);
    delete data[key];
    _save(data);
  };

  /**
   * Check if a chapter is completed
   */
  Progress.isCompleted = function (subject, cls, chapter) {
    const data = _load();
    return !!data[_key(subject, cls, chapter)];
  };

  /**
   * Get progress for a subject (across all classes)
   * @returns {{ completed: number, total: number, percent: number }}
   */
  Progress.getSubjectProgress = function (subject) {
    const data = _load();
    const manifest = window.PFA.manifest;
    if (!manifest || !manifest.subjects[subject]) return { completed: 0, total: 0, percent: 0 };

    const subj = manifest.subjects[subject];
    let total = 0;
    let completed = 0;

    for (const cls of Object.keys(subj.classes || {})) {
      const chapters = subj.classes[cls].chapters || [];
      total += chapters.length;
      chapters.forEach(ch => {
        if (data[_key(subject, cls, ch.chapter)]) completed++;
      });
    }

    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  /**
   * Get progress for a specific class within a subject
   * @returns {{ completed: number, total: number, percent: number }}
   */
  Progress.getClassProgress = function (subject, cls) {
    const data = _load();
    const manifest = window.PFA.manifest;
    if (!manifest || !manifest.subjects[subject]) return { completed: 0, total: 0, percent: 0 };

    const subj = manifest.subjects[subject];
    const clsData = subj.classes ? subj.classes[cls] : null;
    if (!clsData) return { completed: 0, total: 0, percent: 0 };

    const chapters = clsData.chapters || [];
    let completed = 0;
    chapters.forEach(ch => {
      if (data[_key(subject, cls, ch.chapter)]) completed++;
    });

    return {
      completed,
      total: chapters.length,
      percent: chapters.length > 0 ? Math.round((completed / chapters.length) * 100) : 0
    };
  };

  /**
   * Get overall progress across all subjects
   * @returns {{ completed: number, total: number, percent: number, subjects: Object }}
   */
  Progress.getOverallProgress = function () {
    const manifest = window.PFA.manifest;
    if (!manifest) return { completed: 0, total: 0, percent: 0, subjects: {} };

    let totalCompleted = 0;
    let totalChapters = 0;
    const subjects = {};

    for (const subjectKey of Object.keys(manifest.subjects)) {
      const subjectProgress = Progress.getSubjectProgress(subjectKey);
      subjects[subjectKey] = subjectProgress;
      totalCompleted += subjectProgress.completed;
      totalChapters += subjectProgress.total;
    }

    return {
      completed: totalCompleted,
      total: totalChapters,
      percent: totalChapters > 0 ? Math.round((totalCompleted / totalChapters) * 100) : 0,
      subjects
    };
  };

  /**
   * Get all completed chapters as an array
   */
  Progress.getAllCompleted = function () {
    const data = _load();
    return Object.values(data);
  };

  /**
   * Set the last visited chapter
   */
  Progress.setLastVisited = function (chapterInfo) {
    try {
      localStorage.setItem(LAST_VISITED_KEY, JSON.stringify({
        ...chapterInfo,
        visitedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.warn('[PFA Progress] Could not save last visited:', e);
    }
  };

  /**
   * Get the last visited chapter
   */
  Progress.getLastVisited = function () {
    try {
      const raw = localStorage.getItem(LAST_VISITED_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  /**
   * Reset all progress
   */
  Progress.resetAll = function () {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_VISITED_KEY);
  };
})();
