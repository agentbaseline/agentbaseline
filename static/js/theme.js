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
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.themebtn')) toggle();
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
})();
