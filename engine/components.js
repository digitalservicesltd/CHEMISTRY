/* ============================================
   PFA STUDY PLATFORM — components.js
   Reusable UI components for chapter pages
   ============================================ */

(function () {
  const Components = {};
  window.PFA = window.PFA || {};
  window.PFA.Components = Components;

  /**
   * Initialize all components on the page
   */
  Components.init = function () {
    Components.renderFormulas();
    Components.renderMCQs();
    Components.renderNumericals();
    Components.renderAssertions();
    Components.renderCollapseToggles();
    Components.initPrintButton();
  };

  /* ============================================
     FORMULA BOX
     Usage: <div class="pfa-formula" data-name="Molarity" data-formula="M = mol / V(L)"></div>
     Or inline:
     <div class="pfa-formula">
       <div class="f-name">Molarity</div>
       <div class="f-value">M = mol / V(L)</div>
     </div>
   ============================================ */
  Components.renderFormulas = function () {
    document.querySelectorAll('.pfa-formula[data-name]').forEach(el => {
      if (el.dataset.rendered) return;
      const name = el.dataset.name;
      const formula = el.dataset.formula;
      el.innerHTML = `
        <div class="f-name">${name}</div>
        <div class="f-value">${formula}</div>
      `;
      el.dataset.rendered = 'true';
    });
  };

  /* ============================================
     MCQ BOX — Interactive with instant feedback
     Usage:
     <div class="pfa-mcq" data-correct="b">
       <div class="mcq-question">What is the SI unit of amount of substance?</div>
       <div class="pfa-option" data-key="a">Kilogram</div>
       <div class="pfa-option" data-key="b">Mole</div>
       <div class="pfa-option" data-key="c">Candela</div>
       <div class="pfa-option" data-key="d">Ampere</div>
       <div class="mcq-explanation">The mole is the SI unit for amount of substance.</div>
     </div>
   ============================================ */
  Components.renderMCQs = function () {
    document.querySelectorAll('.pfa-mcq').forEach(mcq => {
      if (mcq.dataset.rendered) return;

      const correctKey = mcq.dataset.correct;
      const options = mcq.querySelectorAll('.pfa-option');
      const explanation = mcq.querySelector('.mcq-explanation');
      let answered = false;

      if (explanation) {
        explanation.style.display = 'none';
      }

      options.forEach(opt => {
        opt.classList.add('mcq-option');
        const key = opt.dataset.key;

        // Add option letter prefix
        const text = opt.innerHTML;
        opt.innerHTML = `<span class="option-key">${key.toUpperCase()}</span><span class="option-text">${text}</span>`;

        opt.addEventListener('click', () => {
          if (answered) return;
          answered = true;

          options.forEach(o => {
            o.classList.remove('selected');
            if (o.dataset.key === correctKey) {
              o.classList.add('correct');
            } else if (o.dataset.key === key && key !== correctKey) {
              o.classList.add('incorrect');
            }
            o.style.pointerEvents = 'none';
          });

          opt.classList.add('selected');

          if (explanation) {
            explanation.style.display = 'block';
            explanation.classList.add('fade-in');
          }
        });
      });

      mcq.dataset.rendered = 'true';
    });
  };

  /* ============================================
     NUMERICAL BOX — Problem with show/hide answer
     Usage:
     <div class="pfa-numerical">
       <div class="numerical-question">Calculate the number of moles in 46g of Na.</div>
       <div class="numerical-answer">
         n = mass/molar mass = 46/23 = 2 moles
       </div>
     </div>
   ============================================ */
  Components.renderNumericals = function () {
    document.querySelectorAll('.pfa-numerical').forEach(num => {
      if (num.dataset.rendered) return;

      const answer = num.querySelector('.numerical-answer');
      if (answer) {
        answer.style.display = 'none';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'numerical-toggle';
        toggleBtn.textContent = '👁️ Show Solution';
        toggleBtn.addEventListener('click', () => {
          const isVisible = answer.style.display !== 'none';
          answer.style.display = isVisible ? 'none' : 'block';
          toggleBtn.textContent = isVisible ? '👁️ Show Solution' : '🙈 Hide Solution';
          if (!isVisible) answer.classList.add('fade-in');
        });

        answer.parentNode.insertBefore(toggleBtn, answer);
      }

      num.dataset.rendered = 'true';
    });
  };

  /* ============================================
     ASSERTION-REASON BOX
     Usage:
     <div class="pfa-assertion" data-correct="a">
       <div class="assertion-text"><strong>Assertion:</strong> Diamond is a covalent solid.</div>
       <div class="reason-text"><strong>Reason:</strong> Diamond has sp3 hybridised carbon atoms.</div>
       <div class="pfa-option" data-key="a">Both A and R are true and R is the correct explanation of A</div>
       <div class="pfa-option" data-key="b">Both A and R are true but R is NOT the correct explanation of A</div>
       <div class="pfa-option" data-key="c">A is true but R is false</div>
       <div class="pfa-option" data-key="d">A is false but R is true</div>
       <div class="mcq-explanation">...</div>
     </div>
   ============================================ */
  Components.renderAssertions = function () {
    // Assertions use the same MCQ logic
    document.querySelectorAll('.pfa-assertion').forEach(assertion => {
      if (assertion.dataset.rendered) return;
      // Treat as MCQ
      assertion.classList.add('pfa-mcq');
      assertion.dataset.rendered = 'true';
    });
    // Re-run MCQ rendering for assertions
    Components.renderMCQs();
  };

  /* ============================================
     COLLAPSE TOGGLES
     Any element with class "pfa-collapsible" gets a toggle
     Usage:
     <div class="pfa-collapsible" data-title="Show Detailed Solution">
       <p>Content here...</p>
     </div>
   ============================================ */
  Components.renderCollapseToggles = function () {
    document.querySelectorAll('.pfa-collapsible').forEach(el => {
      if (el.dataset.rendered) return;

      const title = el.dataset.title || 'Show More';
      const content = el.innerHTML;

      el.innerHTML = `
        <button class="collapsible-toggle">${title} <span class="toggle-icon">▼</span></button>
        <div class="collapsible-content" style="display:none;">${content}</div>
      `;

      const toggle = el.querySelector('.collapsible-toggle');
      const contentDiv = el.querySelector('.collapsible-content');
      const icon = el.querySelector('.toggle-icon');

      toggle.addEventListener('click', () => {
        const isVisible = contentDiv.style.display !== 'none';
        contentDiv.style.display = isVisible ? 'none' : 'block';
        icon.textContent = isVisible ? '▼' : '▲';
        if (!isVisible) contentDiv.classList.add('fade-in');
      });

      el.dataset.rendered = 'true';
    });
  };

  /* ============================================
     PRINT BUTTON
   ============================================ */
  Components.initPrintButton = function () {
    document.querySelectorAll('.print-btn').forEach(btn => {
      btn.addEventListener('click', () => window.print());
    });
  };

  /* ============================================
     PYQ BOX — Pure HTML component (no JS needed)
     Usage:
     <div class="pfa-pyq" data-year="2023" data-marks="3">
       <p>Question text here...</p>
     </div>

     Renders with year badge and marks badge via CSS only.
     If JS enhancement needed, call this:
   ============================================ */
  Components.renderPYQs = function () {
    document.querySelectorAll('.pfa-pyq[data-year]').forEach(el => {
      if (el.dataset.rendered) return;

      const year = el.dataset.year;
      const marks = el.dataset.marks;
      const content = el.innerHTML;

      el.innerHTML = `
        <div class="pyq-header">
          <span class="pyq-year">${year}</span>
          ${marks ? `<span class="pyq-marks">${marks} Mark${marks !== '1' ? 's' : ''}</span>` : ''}
        </div>
        <div class="pyq-content">${content}</div>
      `;

      el.dataset.rendered = 'true';
    });
  };

  /* ============================================
     PRACTICE TEST — Timer-based MCQ test
     Usage:
     <div class="pfa-practice-test" data-time="30">
       <!-- pfa-mcq items inside -->
     </div>
   ============================================ */
  Components.initPracticeTest = function () {
    document.querySelectorAll('.pfa-practice-test').forEach(test => {
      if (test.dataset.rendered) return;

      const timeMinutes = parseInt(test.dataset.time) || 30;
      const mcqs = test.querySelectorAll('.pfa-mcq');

      // Add timer header
      const timerEl = document.createElement('div');
      timerEl.className = 'practice-timer';
      timerEl.innerHTML = `
        <span class="timer-icon">⏱️</span>
        <span class="timer-display" id="practiceTimer">${timeMinutes}:00</span>
        <button class="timer-start" id="startTest">Start Test</button>
        <span class="timer-questions">${mcqs.length} Questions</span>
      `;
      test.insertBefore(timerEl, test.firstChild);

      const startBtn = timerEl.querySelector('#startTest');
      const timerDisplay = timerEl.querySelector('#practiceTimer');

      startBtn.addEventListener('click', () => {
        let seconds = timeMinutes * 60;
        startBtn.style.display = 'none';

        const interval = setInterval(() => {
          seconds--;
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          timerDisplay.textContent = `${mins}:${String(secs).padStart(2, '0')}`;

          if (seconds <= 0) {
            clearInterval(interval);
            timerDisplay.textContent = "Time's up!";
            timerDisplay.classList.add('times-up');
          }
        }, 1000);
      });

      test.dataset.rendered = 'true';
    });
  };
})();
