/* ==========================================
   PFA CHEMISTRY PORTAL - MAIN JAVASCRIPT
   ========================================== */

// GSAP Animations
function initAnimations() {
    if (typeof gsap === 'undefined') return;

    // Main Portal
    if (document.querySelector('.main-portal')) {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.from('.logo-wrapper', {
            scale: 0,
            rotation: -180,
            duration: 1.2,
            ease: 'back.out(1.7)'
        });

        tl.from('.title-accent', {
            y: 40,
            opacity: 0,
            duration: 0.6
        }, '-=0.5');

        tl.from('.title-main', {
            y: 20,
            opacity: 0,
            duration: 0.5
        }, '-=0.3');

        tl.from('.tagline', {
            y: 20,
            opacity: 0,
            duration: 0.5
        }, '-=0.2');

        tl.from('.brand-badges', {
            opacity: 0,
            duration: 0.5
        }, '-=0.2');

        tl.from('.class-card', {
            y: 60,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15
        }, '-=0.3');

        tl.from('.portal-footer', {
            y: 20,
            opacity: 0,
            duration: 0.5
        }, '-=0.2');
    }

    // Chapter List
    if (document.querySelector('.chapter-list-page')) {
        const cards = document.querySelectorAll('.chapter-card');
        
        cards.forEach((card, index) => {
            gsap.to(card, {
                y: 0,
                opacity: 1,
                duration: 0.5,
                delay: index * 0.05,
                ease: 'power2.out'
            });
        });
    }
}

// Tab System
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length === 0) return;

    const lastActiveTab = localStorage.getItem('pfa-active-tab');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });

            localStorage.setItem('pfa-active-tab', targetTab);
        });
    });

    if (lastActiveTab) {
        const lastButton = document.querySelector(`[data-tab="${lastActiveTab}"]`);
        const lastContent = document.getElementById(lastActiveTab);
        
        if (lastButton && lastContent) {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            lastButton.classList.add('active');
            lastContent.classList.add('active');
        }
    }
}

// Search
function initSearch() {
    const searchInput = document.getElementById('chapterSearch');
    const chapterCards = document.querySelectorAll('.chapter-card');
    const chapterGrid = document.querySelector('.chapter-grid');

    if (!searchInput || chapterCards.length === 0) return;

    let noResultsEl = document.querySelector('.no-results');
    if (!noResultsEl) {
        noResultsEl = document.createElement('div');
        noResultsEl.className = 'no-results';
        noResultsEl.innerHTML = `
            <div class="no-results-icon">🔍</div>
            <p>No chapters found</p>
        `;
    }

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        let visibleCount = 0;

        chapterCards.forEach(card => {
            const chapterName = card.querySelector('.chapter-name').textContent.toLowerCase();
            const chapterNumber = card.querySelector('.chapter-number').textContent;
            
            const isMatch = chapterName.includes(searchTerm) || 
                           chapterNumber.includes(searchTerm);

            if (isMatch || searchTerm === '') {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (visibleCount === 0) {
            chapterGrid.appendChild(noResultsEl);
            noResultsEl.style.display = 'block';
        } else {
            noResultsEl.style.display = 'none';
        }
    });
}

// Coming Soon Handler
function initComingSoonHandler() {
    const comingSoonCards = document.querySelectorAll('.chapter-card.coming-soon');
    
    comingSoonCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Content coming soon! 🔜');
        });
    });
}

// Toast
function showToast(message, duration = 3000) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Print Button
function initPrintButton() {
    const printBtn = document.querySelector('.print-btn');
    if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
    }
}

// Chapter Nav
function initChapterNav() {
    const prevBtn = document.querySelector('.nav-btn.prev');
    const nextBtn = document.querySelector('.nav-btn.next');

    if (!prevBtn && !nextBtn) return;

    const currentPath = window.location.pathname;
    const match = currentPath.match(/ch(\d+)\.html$/);
    
    if (!match) return;
    
    const currentChapter = parseInt(match[1]);
    const is11th = currentPath.includes('/11th/');
    const maxChapters = is11th ? 10 : 16;

    if (prevBtn) {
        if (currentChapter > 1) {
            prevBtn.href = `ch${currentChapter - 1}.html`;
        } else {
            prevBtn.disabled = true;
        }
    }

    if (nextBtn) {
        if (currentChapter < maxChapters) {
            nextBtn.href = `ch${currentChapter + 1}.html`;
        } else {
            nextBtn.disabled = true;
        }
    }
}

// Keyboard Nav
function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        if (document.querySelector('.chapter-page')) {
            if (e.key === 'ArrowLeft') {
                const prevBtn = document.querySelector('.nav-btn.prev');
                if (prevBtn && !prevBtn.disabled) prevBtn.click();
            } else if (e.key === 'ArrowRight') {
                const nextBtn = document.querySelector('.nav-btn.next');
                if (nextBtn && !nextBtn.disabled) nextBtn.click();
            }
        }
    });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    initAnimations();
    initTabs();
    initSearch();
    initComingSoonHandler();
    initPrintButton();
    initChapterNav();
    initKeyboardNav();
});

window.PFA = { showToast };