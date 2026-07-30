(function () {
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var stored = localStorage.getItem('theme');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(stored || (prefersDark ? 'dark' : 'light'));

  toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');

  function closeNav() {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.textContent = '☰';
  }

  function openNav() {
    nav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.textContent = '✕';
  }

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
})();
