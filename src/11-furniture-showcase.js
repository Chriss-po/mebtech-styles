/* MebTech · Furniture Showcase · v1.0
   Reuses existing DS furniture-showcase / trust-benefits / slick-dots CSS.
   Load globally once (defer); HTML blocks contain markup only.
*/
(() => {
  'use strict';

  const SELECTOR = '.furniture-showcase';
  const DELAY = 9000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const instances = new Map();

  function init(root) {
    if (instances.has(root)) return;

    const media = root.querySelector('.furniture-showcase__media');
    const slider = root.querySelector('.furniture-showcase__slider');
    const slides = [...root.querySelectorAll('.furniture-showcase__slide')];
    if (!media || !slider || !slides.length) return;

    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', 'карусель');
    if (!root.hasAttribute('aria-label')) {
      root.setAttribute('aria-label', 'Реалізовані меблеві проєкти');
    }
    slider.setAttribute('aria-live', 'off');

    // Reuse existing DS pagination. Legacy static dots are replaced.
    let dots = media.querySelector('.furniture-showcase__dots');
    if (!dots) {
      dots = document.createElement('ul');
      dots.className = 'slick-dots furniture-showcase__dots';
      media.appendChild(dots);
    }
    dots.classList.add('slick-dots', 'furniture-showcase__dots');
    dots.setAttribute('aria-label', 'Навігація по проєктах');
    const buttons = slides.map((_, index) => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', 'Проєкт ' + (index + 1) + ' із ' + slides.length);
      li.appendChild(button);
      return { li, button };
    });
    dots.replaceChildren(...buttons.map(entry => entry.li));
    if (slides.length < 2) dots.style.setProperty('display', 'none', 'important');
    else dots.style.removeProperty('display');

    let current = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));
    let timer = null;
    let hovered = false;
    let focused = false;
    let inView = true;
    let touchStart = null;
    const events = new AbortController();

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.inert = !active;
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'слайд');
        slide.setAttribute('aria-label', 'Проєкт ' + (i + 1) + ' із ' + slides.length);
      });
      buttons.forEach(({ li, button }, i) => {
        const active = i === current;
        li.classList.toggle('slick-active', active);
        if (active) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      });
    }

    function stop() {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
    }

    function syncAutoplay() {
      stop();
      if (slides.length < 2 || hovered || focused || !inView ||
          document.hidden || reducedMotion.matches || !root.isConnected) return;
      timer = window.setInterval(() => show(current + 1), DELAY);
    }

    function activate(index) {
      show(index);
      syncAutoplay();
    }

    buttons.forEach(({ button }, index) => {
      button.addEventListener('click', () => activate(index), { signal: events.signal });
      button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % slides.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + slides.length) % slides.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = slides.length - 1;
        else return;
        event.preventDefault();
        activate(next);
        buttons[next].button.focus();
      }, { signal: events.signal });
    });

    root.addEventListener('mouseenter', () => { hovered = true; syncAutoplay(); }, { signal: events.signal });
    root.addEventListener('mouseleave', () => { hovered = false; syncAutoplay(); }, { signal: events.signal });
    root.addEventListener('focusin', () => { focused = true; syncAutoplay(); }, { signal: events.signal });
    root.addEventListener('focusout', event => {
      if (!root.contains(event.relatedTarget)) { focused = false; syncAutoplay(); }
    }, { signal: events.signal });
    document.addEventListener('visibilitychange', syncAutoplay, { signal: events.signal });
    if (reducedMotion.addEventListener) {
      reducedMotion.addEventListener('change', syncAutoplay, { signal: events.signal });
    }

    // Mobile-only swipe. Passive events preserve vertical page scrolling.
    const mobileSwipe = window.matchMedia('(max-width: 767px)');
    slider.addEventListener('touchstart', event => {
      if (!mobileSwipe.matches) { touchStart = null; return; }
      if (event.touches.length !== 1) { touchStart = null; return; }
      touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true, signal: events.signal });
    slider.addEventListener('touchend', event => {
      if (!mobileSwipe.matches) { touchStart = null; return; }
      if (!touchStart || event.changedTouches.length !== 1) return;
      const dx = event.changedTouches[0].clientX - touchStart.x;
      const dy = event.changedTouches[0].clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.35) {
        activate(current + (dx < 0 ? 1 : -1));
      }
    }, { passive: true, signal: events.signal });
    slider.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true, signal: events.signal });

    let visibilityObserver = null;
    if ('IntersectionObserver' in window) {
      visibilityObserver = new IntersectionObserver(entries => {
        inView = entries[0]?.isIntersecting ?? true;
        syncAutoplay();
      }, { threshold: 0.15 });
      visibilityObserver.observe(root);
    }

    show(current);
    syncAutoplay();
    instances.set(root, () => {
      stop();
      events.abort();
      if (visibilityObserver) visibilityObserver.disconnect();
    });
  }

  function scan(scope) {
    if (scope.nodeType !== 1 && scope.nodeType !== 9) return;
    if (scope.matches?.(SELECTOR)) init(scope);
    scope.querySelectorAll?.(SELECTOR).forEach(init);
  }

  function boot() {
    scan(document);
    // IQIT/Elementor may inject or replace HTML asynchronously.
    const observer = new MutationObserver(records => {
      let hasNewContent = false;
      let removedContent = false;
      for (const record of records) {
        if (record.removedNodes.length) removedContent = true;
        for (const node of record.addedNodes) {
          if (node.nodeType !== 1) continue;
          // Ignore navigation nodes generated by this controller.
          if (node.matches?.(SELECTOR) || node.querySelector?.(SELECTOR)) {
            scan(node);
            hasNewContent = true;
          }
        }
      }
      if (hasNewContent || removedContent) {
        for (const [root, destroy] of instances) {
          if (!root.isConnected) { destroy(); instances.delete(root); }
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else boot();
})();
