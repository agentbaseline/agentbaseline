/* Theme choice and header menu behaviour. Loaded synchronously in <head> so a
   stored theme applies before first paint; an external file (not inline)
   because the deployment CSP allows script-src 'self' and nothing inline. */
(function () {
  /* Read depth. A page view says the page was opened; this says how far down a
     1,100-word argument a reader actually got. Fires at most once per section
     per page view, and only if IntersectionObserver exists — no polyfill, the
     measurement is not worth bytes on old browsers. */
  addEventListener('DOMContentLoaded', function () {
    /* Landing directly on a control means someone was sent it, or cited it —
       the behaviour the whole versioning promise exists to support, and
       invisible in page views because the hash never reaches the server.

       What this cannot see: a textual citation. The page's own prescribed form
       is `DIS-01 (Agent Baseline v1.x)`, and a reader who meets that in an RFP
       response has no link to follow — they search, land on /controls with no
       hash, and this event does not fire even though the citation worked
       perfectly. `arrival` counts linked citations only. A low number is not
       evidence of low reach, in the same way `rsvp` reading zero would not have
       been evidence nobody wanted to come. Read it as a floor.

       It is also a floor that can be crossed by accident: this matches the hash
       without checking that an element with that id exists, so a link to a
       control that is not on the page still counts as an arrival. `copy` below
       is the leading indicator worth watching instead — it fires only when an
       address actually reached someone's clipboard. */
    var hash = (location.hash || '').slice(1);
    if (/^(?:DIS|CON|AUT|VAL|OBS|RES)-\d{2}$/.test(hash) && typeof va === 'function') {
      va('event', { name: 'arrival', data: { at: hash } });
    }
    if (!('IntersectionObserver' in window)) return;
    var marks = document.querySelectorAll('[data-depth]');
    if (!marks.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        if (typeof va === 'function') {
          va('event', { name: 'depth', data: { reached: en.target.dataset.depth } });
        }
      });
    }, { threshold: 0.4 });
    marks.forEach(function (m) { io.observe(m); });

    /* Opening the artifacts menu is intent even when nothing is clicked. */
    var d = document.querySelector('details.menu');
    if (d) d.addEventListener('toggle', function () {
      if (d.open && typeof va === 'function') {
        va('event', { name: 'artifacts', data: { action: 'open' } });
      }
    });
  });

  /* Vercel Web Analytics queue shim. The documented snippet puts this inline,
     which our CSP refuses; here it is external and allowed. It only buffers
     calls made before the deferred script arrives. */
  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };

  var r = document.documentElement, s;
  try { s = localStorage.getItem('ab-theme'); } catch (e) {}
  if (s === 'light' || s === 'dark') r.dataset.theme = s;

  /* The stored choice wins; with none stored the system preference is the
     state. One definition of it, because the button now has to report the
     state as well as flip it. */
  var dm = matchMedia('(prefers-color-scheme: dark)');
  function isDark() {
    return r.dataset.theme ? r.dataset.theme === 'dark' : dm.matches;
  }

  /* The button is a toggle, so it has to say which state it is in; a static
     label alone leaves a screen reader with no way to know which theme is on.
     The button does not exist while this file runs in <head>, so the markup
     ships aria-pressed="false" and the first sync happens the moment the body
     is parsed. After that every flip updates it — and so does a change of
     system preference, which is the state whenever nothing is stored. */
  function press() {
    var on = isDark() ? 'true' : 'false';
    document.querySelectorAll('.themebtn').forEach(function (b) {
      b.setAttribute('aria-pressed', on);
    });
  }
  addEventListener('DOMContentLoaded', press);
  if (dm.addEventListener) dm.addEventListener('change', press);

  function toggle() {
    r.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('ab-theme', r.dataset.theme); } catch (e) {}
    press();
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
      /* Two links now point at the same event: the strip above the masthead and
         the block that closes the page. Without `from` they collapse into one
         number, and the only question worth asking — does anyone reach the
         bottom, or does the ticker do all the work — becomes unanswerable.

         Both links open in a new tab, which is not only kinder to a reader
         mid-document: a same-tab navigation can cancel the beacon still in
         flight, and `rsvp` would read zero for a reason unrelated to whether
         anyone clicked. */
      var b = document.getElementById('eventbar');
      return ['rsvp', { event: (b && b.dataset.event) || 'event',
                        from: a.dataset.rsvp || 'other' }];
    }
    var oc = h.match(/^(?:\/controls)?#(discover|constrain|authorize|validate|observe|respond)$/);
    if (oc) {
      /* Which of the six a reader goes to is the most interesting thing the page
         can tell us, and it is invisible in page views — every one of these
         resolves to a single /controls hit. `from` separates the questions band
         from the roster, which also says which framing did the work. */
      return ['outcome', {
        name: oc[1],
        from: a.closest('ol.questions') ? 'questions'
            : a.closest('ol.factors')   ? 'roster'
            : a.closest('nav.toc')      ? 'contents'
            : a.closest('nav.sidenav')  ? 'rail' : 'other'
      }];
    }
    var cid = h.match(/^#((?:DIS|CON|AUT|VAL|OBS|RES)-\d{2})$/);
    if (cid) {
      return ['control', {
        id: cid[1],
        from: a.classList.contains('cid') ? 'permalink'
            : a.closest('nav.sidenav')    ? 'rail' : 'other'
      }];
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

  /* Copying the permalink, not merely navigating to it.

     The identifier beside each control is an anchor to itself, so clicking it
     moves the page a few pixels and leaves the reader to go to the address bar
     for anything they can paste. RFC, WHATWG and W3C pages put the absolute
     address on the clipboard instead, and that is the step between reading a
     control and citing one. A copy emits its own event below, because otherwise
     this would be the same shape of blind spot as `arrival` at the top of the
     file: the behaviour named as the motivation, going unmeasured.

     Layered on the anchor rather than replacing it: no preventDefault, so
     ⌘-click, middle-click (which fires auxclick, never seen here) and keyboard
     activation all still navigate, and the link works with this file blocked.
     Keyboard activation also copies — it arrives here as a click. Modified
     clicks are skipped entirely: someone opening a control in a new tab did not
     ask for a clipboard write.

     The address is the one the document declares as its own canonical, rather
     than the origin it happens to be served from. That is the published address
     exactly as long as the build's `baseURL` is the published one, which
     bin/check-controls asserts the shape of — it is not a guarantee this
     function can make on its own, and an earlier version of this comment
     claimed it was.

     Assembled through URL rather than by trimming the string: stripping a
     trailing slash off a root canonical also strips the path, which turned
     `https://agentbaseline.org/` into a citation pointing at the homepage with
     a fragment that does not exist there. Unreachable while .cid renders only
     on this page, which is exactly why it would have gone unnoticed. */
  function citation(id) {
    var c = document.querySelector('link[rel="canonical"]');
    var u;
    try { u = new URL((c && c.getAttribute('href')) || '', location.href); }
    catch (e) { u = new URL(location.href); }
    u.search = '';
    u.hash = id;
    return u.href;
  }

  /* The confirmation chip is aria-hidden, so a screen reader is told here
     instead. The region is rendered empty in the template rather than built on
     first use: created and populated ~60ms apart, the first announcement of a
     session is the one an assistive technology is least likely to pick up, and
     an empty div costs nothing to ship. */
  function liveRegion() { return document.getElementById('copystatus'); }
  var announceTimer;
  function announce(msg) {
    var live = liveRegion();
    if (!live) return;
    clearTimeout(announceTimer);
    live.textContent = '';
    /* Same string twice running is not re-announced; clearing first, on a
       separate task, is what makes a second copy of the same control audible. */
    announceTimer = setTimeout(function () { live.textContent = msg; }, 60);
  }

  /* Two clicks in quick succession must not leave the chip naming a control that
     is not the one on the clipboard — on the page whose whole subject is citing
     the right one.

     A token alone does not achieve that, and it is worth recording why, because
     the first attempt here used one. A clipboard write crosses a process
     boundary, so concurrent writes can land in any order: delay the first and
     the second lands, then the first overwrites it. The clipboard then holds the
     *older* control while a newest-click-wins token reports the newer one —
     mislabelled, in the opposite direction from the race the token was guarding.

     So the writes are serialised as well. Chained, the last write initiated is
     also the last to land, which is the condition that makes the token correct.
     A slow write delays the next one; that is the price, and it is invisible at
     the speed a clipboard normally settles. */
  var chain = Promise.resolve();
  var seq = 0, flashed, flashTimer;
  function report(a, id, mine) {
    if (mine !== seq) return;
    clearTimeout(flashTimer);
    if (flashed) flashed.classList.remove('copied');
    var cell = a.closest('.cidcell') || a;
    flashed = cell;
    cell.classList.add('copied');
    announce(id + ' address copied');
    flashTimer = setTimeout(function () {
      cell.classList.remove('copied');
      if (flashed === cell) flashed = null;
      /* The chip clears itself; the region has to be cleared with it, or a
         reader who later browses to the end of the document meets a stale
         "copied" as page content. */
      var live = liveRegion();
      if (live) live.textContent = '';
    }, 1600);
  }

  document.addEventListener('click', function (e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a.cid[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!/^(?:DIS|CON|AUT|VAL|OBS|RES)-\d{2}$/.test(id)) return;
    if (!navigator.clipboard || !navigator.clipboard.writeText) return;
    var mine = ++seq;
    chain = chain.then(function () {
      return navigator.clipboard.writeText(citation(id));
    }).then(function () {
      report(a, id, mine);
      /* Distinct from `control`, which fires on the click whether or not the
         write succeeded. This one means an address actually reached a clipboard,
         which is the closest thing to citation intent the page can observe. */
      if (mine === seq && typeof va === 'function') {
        va('event', { name: 'copy', data: { id: id } });
      }
    }, function () {
      /* Denied, or an insecure context — a plain-http mirror or a saved copy.
         The navigation already happened, so the reader is no worse off than
         before, and nothing claims a copy that did not occur. Said out loud
         because the page invites the click and silence here is indistinguishable
         from success to anyone who cannot see the missing chip.

         Returning nothing here keeps the chain alive: a rejection that is not
         absorbed would poison every later click in the session. */
      if (mine === seq) announce(id + ' could not be copied');
    });
  });

  /* Delegated, so the listener can bind before the body exists. Keyboard
     activation of the button arrives here as a click event. */
  /* Event strip: dismissed per event id, so a new event shows again to someone
     who dismissed the last one. Hidden before paint when already dismissed. */
  function bar() { return document.getElementById('eventbar'); }
  /* This runs in <head>, so the body does not exist and getElementById is always
     null — the previous version of this check silently never fired and a
     dismissed strip came back on every reload. The event id rides on <html>
     instead, and a class on the root hides the strip before it paints. */
  try {
    var ev = r.dataset.event;
    if (ev && localStorage.getItem('ab-eventbar-' + ev) === 'off') r.classList.add('eb-off');
  } catch (e) {}

  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.themebtn')) toggle();
    var x = e.target.closest && e.target.closest('[data-eventbar-close]');
    if (x) {
      var b = bar();
      if (b) {
        /* Focus is inside the strip at this point. Hiding its ancestor drops
           the active element to <body>, so a keyboard user loses their place
           entirely and nothing is announced. Hand focus to the masthead first,
           which is the next thing in the document. */
        if (b.contains(document.activeElement)) {
          var nxt = document.querySelector('.skip, .utility a, main');
          if (nxt) {
            if (!nxt.hasAttribute('tabindex') && nxt.tagName === 'MAIN') {
              nxt.setAttribute('tabindex', '-1');
            }
            try { nxt.focus(); } catch (e3) {}
          }
        }
        b.hidden = true;
        try { localStorage.setItem('ab-eventbar-' + b.dataset.event, 'off'); } catch (e2) {}
        if (typeof va === 'function') {
          va('event', { name: 'dismiss', data: { what: 'eventbar' } });
        }
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
