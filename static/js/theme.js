/* Theme choice and header menu behaviour. Loaded synchronously in <head> so a
   stored theme applies before first paint; an external file (not inline)
   because the deployment CSP allows script-src 'self' and nothing inline. */
(function () {
  var r = document.documentElement, s;
  try { s = localStorage.getItem('ab-theme'); } catch (e) {}
  if (s === 'light' || s === 'dark') r.dataset.theme = s;

  function toggle() {
    var dark = r.dataset.theme
      ? r.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    r.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('ab-theme', r.dataset.theme); } catch (e) {}
  }

  /* Delegated, so the listener can bind before the body exists. Keyboard
     activation of the button arrives here as a click event. */
  /* Event strip: dismissed per event id, so a new event shows again to someone
     who dismissed the last one. Hidden before paint when already dismissed. */
  function bar() { return document.getElementById('eventbar'); }
  try {
    var b = bar();
    if (b && localStorage.getItem('ab-eventbar-' + b.dataset.event) === 'off') b.hidden = true;
  } catch (e) {}

  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.themebtn')) toggle();
    var x = e.target.closest && e.target.closest('[data-eventbar-close]');
    if (x) {
      var b = bar();
      if (b) {
        b.hidden = true;
        try { localStorage.setItem('ab-eventbar-' + b.dataset.event, 'off'); } catch (e2) {}
      }
    }
    document.querySelectorAll('details.menu[open]').forEach(function (d) {
      if (!d.contains(e.target)) d.removeAttribute('open');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('details.menu[open]').forEach(function (d) {
      d.removeAttribute('open');
    });
  });

  /* On pages with a .home-mast in the bar, the title steps into the sticky
     header once its big form scrolls away. */
  document.addEventListener('DOMContentLoaded', function () {
    var bar = document.querySelector('.utility');
    var h1 = document.querySelector('main h1');
    if (!bar || !h1 || !bar.querySelector('.home-mast')) return;
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      bar.classList.toggle('mast-on',
        !e.isIntersecting && e.boundingClientRect.top < 0);
    }, { rootMargin: '-56px 0px 0px 0px' }).observe(h1);
  });
})();
