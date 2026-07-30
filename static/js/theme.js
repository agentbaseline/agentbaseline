/* Theme choice and header menu behaviour. Loaded synchronously in <head> so a
   stored theme applies before first paint; an external file (not inline)
   because the deployment CSP allows script-src 'self' and nothing inline. */
(function () {
  /* Vercel Web Analytics queue shim. The documented snippet puts this inline,
     which our CSP refuses; here it is external and allowed. It only buffers
     calls made before the deferred script arrives. */
  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };

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

  /* Outbound and artifact clicks, by delegation rather than per-link handlers —
     a new link is counted without anyone remembering to instrument it, and
     nothing drifts when the markup moves.

     One property per event: the Pro plan allows two, and one is enough to say
     which artifact. Nothing here identifies a person; it records which of the
     four things on the page a reader actually went to. */
  function tracked(a) {
    var h = a.getAttribute('href') || '';
    if (/\.pdf($|[?#])/.test(h)) return ['download', { file: 'whitepaper.pdf' }];
    if (h.indexOf('luma.com') > -1) {
      var b = document.getElementById('eventbar');
      return ['rsvp', { event: (b && b.dataset.event) || 'event' }];
    }
    if (h.indexOf('github.com/') > -1) {
      var seg = h.replace(/[?#].*$/, '').split('/').filter(Boolean);
      var last = seg[seg.length - 1] || '';
      var what = /\.(ya?ml|md)$/.test(last) ? last
               : last === 'issues' ? 'issues'
               : 'repository';
      return ['source', { path: what }];
    }
    return null;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var t = tracked(a);
    if (t && typeof va === 'function') va('event', { name: t[0], data: t[1] });
  });

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
