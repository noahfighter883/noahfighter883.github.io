(function () {
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var stored = localStorage.getItem('theme');

  var svgOpen = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">';
  var ICONS = {
    moon: svgOpen + '<path d="M17 12.5A7 7 0 1 1 7.5 3a5.5 5.5 0 0 0 9.5 9.5Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    sun: svgOpen + '<circle cx="10" cy="10" r="3.5" stroke="currentColor" stroke-width="1.6"/><path d="M10 2v2M10 16v2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M2 10h2M16 10h2M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    menu: svgOpen + '<path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    close: svgOpen + '<path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };

  function popIcon(el) {
    el.classList.remove('icon-pop');
    void el.offsetWidth;
    el.classList.add('icon-pop');
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    toggle.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
  }

  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(stored || (prefersDark ? 'dark' : 'light'));

  toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    popIcon(toggle);
    localStorage.setItem('theme', next);
  });

  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');

  function closeNav() {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.innerHTML = ICONS.menu;
    popIcon(navToggle);
  }

  function openNav() {
    nav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.innerHTML = ICONS.close;
    popIcon(navToggle);
  }

  navToggle.innerHTML = ICONS.menu;

  navToggle.addEventListener('click', function () {
    if (nav.classList.contains('is-open')) closeNav();
    else openNav();
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeNav();
  });

  document.addEventListener('click', function (e) {
    if (!nav.classList.contains('is-open')) return;
    if (nav.contains(e.target) || navToggle.contains(e.target)) return;
    closeNav();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  var reduceMotion = !window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  var cards = document.querySelectorAll('.project-card');

  if (!reduceMotion && 'IntersectionObserver' in window && cards.length) {
    cards.forEach(function (card) { card.classList.add('js-reveal'); });

    var clearDelayOnEnd = function (card) {
      card.addEventListener('transitionend', function handler(e) {
        if (e.propertyName !== 'opacity') return;
        card.style.transitionDelay = '';
        card.removeEventListener('transitionend', handler);
      });
    };

    var observer = new IntersectionObserver(
      function (entries, obs) {
        var justEntered = entries.filter(function (entry) { return entry.isIntersecting; });
        justEntered.forEach(function (entry, i) {
          var card = entry.target;
          card.style.transitionDelay = i * 0.08 + 's';
          card.classList.add('in-view');
          clearDelayOnEnd(card);
          obs.unobserve(card);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    cards.forEach(function (card) { observer.observe(card); });
  }

  if (!reduceMotion) {
    var lazyImages = document.querySelectorAll('.project-media img[loading="lazy"]');
    lazyImages.forEach(function (img) {
      img.classList.add('img-fade');
      if (img.complete) {
        img.classList.add('is-loaded');
        return;
      }
      var reveal = function () { img.classList.add('is-loaded'); };
      img.addEventListener('load', reveal, { once: true });
      img.addEventListener('error', reveal, { once: true });
    });
  }
})();
