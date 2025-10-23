/* =========================================================
   FADI AZRA — MAIN.JS
   - Sidebar open/close with gentle timing
   - Page fade-in on load (no fade-out)
   - Remember open groups (localStorage)
   - Collapse all when clicking the logo
   - Highlight only the current page link; open just its parent group
   ========================================================= */

(function () {
  // ---------- Utilities ----------
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Persist which groups are open (by their data-target)
  const STORAGE_KEY = 'sidebarOpenGroups_v1';
  const VISITED_KEY = 'hasVisited_v1';        // <-- NEW: track first visit
  const SESSION_COLLAPSE = 'collapseSidebar'; // <-- NEW: session flag

  const getSaved = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  };
  const saveOpenTargets = () => {
    const openTargets = [...document.querySelectorAll('.has-children.open > .nav-head[data-target]')]
      .map(h => h.getAttribute('data-target'));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(openTargets));
  };

  // ---------- Sidebar: collapsible groups ----------
  // accept a flag to skip restoring saved groups (used on first visit / after logo click)
  function setupSidebarToggles(skipRestore = false) {
    const heads = document.querySelectorAll('.nav-head[data-target]');
    const saved = new Set(getSaved());

    heads.forEach((btn) => {
      const targetSel = btn.getAttribute('data-target');
      const item = btn.closest('.has-children');
      if (!item || !targetSel) return;

      // Restore previously open groups WITHOUT animation
      if (!skipRestore && saved.has(targetSel)) {
        item.classList.add('open');
        item.classList.remove('opening', 'closing');
      }

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        if (isOpen) {
          closeGroup(item);
        } else {
          openGroup(item);
        }
        saveOpenTargets(); // persist after each toggle
      });
    });
  }

  // Open with slower animation (matches CSS .opening timing)
  function openGroup(el) {
    el.classList.remove('closing');
    el.classList.add('opening', 'open');
    if (prefersReduced) {
      el.classList.remove('opening');
      saveOpenTargets();
      return;
    }
    window.setTimeout(() => {
      el.classList.remove('opening');
      saveOpenTargets();
    }, 650); // keep in sync with CSS
  }

  // Close with faster animation (matches CSS base/closing timing)
  function closeGroup(el) {
    el.classList.remove('opening');
    el.classList.add('closing');
    if (prefersReduced) {
      el.classList.remove('closing', 'open');
      saveOpenTargets();
      return;
    }
    window.setTimeout(() => {
      el.classList.remove('closing', 'open');
      saveOpenTargets();
    }, 220); // keep in sync with CSS
  }

  // Close ALL groups
  function collapseAll() {
    document.querySelectorAll('.has-children')
      .forEach(g => g.classList.remove('open','opening','closing'));
    saveOpenTargets();
  }

  // ---------- Current page highlighting ----------
  // Mark the current link and open JUST its parent group (if any).
  function markActiveAndOpen() {
    const here = location.pathname.split('/').pop();
    document.querySelectorAll('.side-nav a.active').forEach(a => a.classList.remove('active'));

    let matched = null;
    document.querySelectorAll('.side-nav a').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.endsWith(here)) {
        link.classList.add('active');
        matched = link;
      }
    });

    const group = matched && matched.closest('.has-children');
    if (group) {
      group.classList.add('open');
      group.classList.remove('opening','closing');
      saveOpenTargets();
    }
  }

  // ---------- Micro "reveal" on scroll (safe) ----------
  function setupRevealOnScroll() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

      els.forEach((el) => io.observe(el));
    } else {
      els.forEach((el) => el.classList.add('in'));
    }
  }

  // ---------- Page fade-in on load (no fade-out) ----------
  function fadeInOnLoad() {
    const b = document.body;
    b.style.removeProperty('opacity');
    b.style.removeProperty('transition');
    if (prefersReduced) return;
    b.style.opacity = '0';
    b.style.transition = 'opacity 0.45s ease';
    requestAnimationFrame(() => { b.style.opacity = '1'; });
  }

  // ---------- Init ----------
  function init() {
    // Decide whether to suppress opening anything:
    // - first visit ever (no VISITED_KEY)
    // - OR coming from a logo click (SESSION_COLLAPSE set)
    const firstVisit = !localStorage.getItem(VISITED_KEY);
    const collapseFromLogo = sessionStorage.getItem(SESSION_COLLAPSE) === '1';
    const suppressOpen = firstVisit || collapseFromLogo;

    // Setup toggles; skip restoring saved groups when suppressing
    setupSidebarToggles(/* skipRestore */ suppressOpen);

    setupRevealOnScroll();
    fadeInOnLoad();

    if (suppressOpen) {
      // keep everything closed on first load and after logo click
      collapseAll();
      sessionStorage.removeItem(SESSION_COLLAPSE);
    } else {
      // normal behavior: open the parent group of the active page
      markActiveAndOpen();
    }

    // Clicking the logo: collapse now and also on the next page load
    const logo = document.querySelector('.site-logo');
    if (logo) {
      logo.addEventListener('click', () => {
        collapseAll();
        sessionStorage.setItem(SESSION_COLLAPSE, '1');
      });
    }

    // Mark that the user has visited at least once
    localStorage.setItem(VISITED_KEY, '1');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
(function(){
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuToggle');
  const overlay = document.querySelector('.site-overlay');

  if(!sidebar || !menuBtn || !overlay) return;

const openMenu = () => {
  sidebar.classList.add('open');
  body.classList.add('menu-open');
  menuBtn.setAttribute('aria-expanded', 'true');
  overlay.classList.add('is-visible');     // ← show with class
};

const closeMenu = () => {
  sidebar.classList.remove('open');
  body.classList.remove('menu-open');
  menuBtn.setAttribute('aria-expanded', 'false');
  overlay.classList.remove('is-visible');  // ← hide with class
};

  const toggleMenu = () => (sidebar.classList.contains('open') ? closeMenu() : openMenu());

menuBtn.addEventListener('click', () => {
  if (sidebar.classList.contains('open')) { closeMenu(); }
  else { openMenu(); }
});

// attach ONCE, outside the click handler
overlay.addEventListener('click', closeMenu);

  // Close after tapping any sidebar link (good mobile UX)
  sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setTimeout(closeMenu, 0)));

  // Ensure closed on first load
  closeMenu();
})();