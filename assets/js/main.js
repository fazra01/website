document.addEventListener('DOMContentLoaded', () => {
  // mobile sidebar toggle
  const btn = document.querySelector('.side-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (btn && sidebar) btn.addEventListener('click', () => sidebar.classList.toggle('open'));

  // active link highlighter
  const here = location.pathname.replace(/\/index\.html$/, '/');
  document.querySelectorAll('.side-nav a').forEach(a => {
    const url = new URL(a.getAttribute('href'), location.origin + location.pathname);
    const path = url.pathname.replace(/\/index\.html$/, '/');
    if (path === here) a.classList.add('active');
  });
});
document.addEventListener('DOMContentLoaded', () => {
  // Collapsible side nav with different timings for open/close
  document.querySelectorAll('.nav-head[type="button"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const li = btn.closest('.has-children');
      const sub = li.querySelector('.subnav');

      // OPEN
      if (!li.classList.contains('open')) {
        li.classList.remove('closing');
        li.classList.add('opening');
        // ensure CSS picks up the new transition before changing state
        void sub.offsetHeight;
        li.classList.add('open');

        const onEndOpen = (e) => {
          if (e.propertyName === 'max-height') {
            li.classList.remove('opening');
            sub.removeEventListener('transitionend', onEndOpen);
          }
        };
        sub.addEventListener('transitionend', onEndOpen);
      }
      // CLOSE
      else {
        li.classList.remove('opening');
        li.classList.add('closing');
        // ensure CSS picks up the fast close timings
        void sub.offsetHeight;
        li.classList.remove('open');

        const onEndClose = (e) => {
          if (e.propertyName === 'max-height') {
            li.classList.remove('closing');
            sub.removeEventListener('transitionend', onEndClose);
          }
        };
        sub.addEventListener('transitionend', onEndClose);
      }
    });
  });
});
document.addEventListener('DOMContentLoaded', () => {
  // start hidden only if JS is working
  document.body.classList.add('fade-enter');
  // let the browser paint once, then trigger transition
  requestAnimationFrame(() => {
    document.body.classList.add('fade-enter-active');
    document.body.classList.remove('fade-enter');
  });
});