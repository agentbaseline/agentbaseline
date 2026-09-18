/* The wordmark's right-click menu. Deferred, not synchronous in <head> like
   theme.js: nothing here has to beat first paint. An external file because the
   deployment CSP allows script-src 'self' and nothing inline.

   The menu itself is markup already in the page (partials/logo-menu.html), so
   this file positions and opens it and never assembles it. Right-click is a
   pointer affordance and a progressive enhancement: the h1 is not focusable,
   and every asset it offers is also in the Artifacts dropdown, which is the
   keyboard and screen-reader route. If this script never runs, nothing is
   lost. */
(function () {
  var title = document.querySelector('.titleblock h1');
  var menu = document.getElementById('logomenu');
  if (!title || !menu) return;

  /* The rows come from a partial shared with the Artifacts dropdown, which is
     an ordinary list and cannot carry menu roles. Assign them here so the ARIA
     is right whatever that partial emits, rather than duplicating the rows to
     get the attributes. */
  var items = [];
  Array.prototype.forEach.call(menu.children, function (li) {
    var act = li.querySelector('a, button');
    li.setAttribute('role', 'none');
    if (act) {
      act.setAttribute('role', 'menuitem');
      act.tabIndex = -1;
      items.push(act);
    }
  });
  if (!items.length) return;

  /* Offer the copy row only where it can work. navigator.clipboard is absent
     outside a secure context, and a row that silently does nothing is worse
     than a row that was never there. */
  var copyBtn = menu.querySelector('[data-copy]');
  if (copyBtn && !(navigator.clipboard && navigator.clipboard.writeText)) {
    var host = copyBtn.parentNode;
    host.parentNode.removeChild(host);
    items.splice(items.indexOf(copyBtn), 1);
    copyBtn = null;
  }

  var open = false;
  var copyTimer = null;

  function show(pageX, pageY) {
    /* Measured while shown but still off-screen: a display:none element has no
       box, so clamping has to happen after the class goes on. */
    menu.setAttribute('data-open', '');
    menu.style.left = '0px';
    menu.style.top = '0px';
    var w = menu.offsetWidth, h = menu.offsetHeight;
    var maxX = window.pageXOffset + document.documentElement.clientWidth - w - 8;
    var maxY = window.pageYOffset + document.documentElement.clientHeight - h - 8;
    menu.style.left = Math.max(window.pageXOffset + 8, Math.min(pageX, maxX)) + 'px';
    menu.style.top = Math.max(window.pageYOffset + 8, Math.min(pageY, maxY)) + 'px';
    open = true;
  }

  function hide() {
    if (!open) return;
    menu.removeAttribute('data-open');
    open = false;
    if (copyBtn) {
      copyBtn.removeAttribute('data-done');
      if (copyTimer) { clearTimeout(copyTimer); copyTimer = null; }
    }
  }

  /* First right-click opens this menu; a second one, or shift held, falls
     through to the browser's own. Without an escape hatch the page would have
     taken away view-source, inspect and save-image on its own title. */
  title.addEventListener('contextmenu', function (e) {
    if (e.shiftKey || open) { hide(); return; }
    e.preventDefault();
    show(e.pageX, e.pageY);
    items[0].focus();
  });

  function focusAt(i) {
    var n = items.length;
    items[((i % n) + n) % n].focus();
  }

  menu.addEventListener('keydown', function (e) {
    var at = items.indexOf(document.activeElement);
    if (e.key === 'Escape') { hide(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); focusAt(at + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); focusAt(at - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusAt(0); }
    else if (e.key === 'End') { e.preventDefault(); focusAt(items.length - 1); }
    else if (e.key === 'Tab') { hide(); }
  });

  /* A download leaves the menu standing open over the page it was opened on,
     so close on any activation. The copy row closes on its own timer instead —
     it has something to report first. */
  menu.addEventListener('click', function (e) {
    var act = e.target.closest ? e.target.closest('a, button') : null;
    if (!act) return;
    if (act !== copyBtn) { hide(); return; }

    fetch(act.getAttribute('data-copy'))
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then(function (svg) { return navigator.clipboard.writeText(svg); })
      .then(function () {
        act.setAttribute('data-done', '');
        copyTimer = setTimeout(hide, 1100);
      })
      .catch(function () { hide(); });
  });

  addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hide();
  });
  addEventListener('pointerdown', function (e) {
    if (open && !menu.contains(e.target)) hide();
  });
  /* Absolutely positioned against the document, so a scroll does not move it
     out from under the cursor — but it does leave it detached from the gesture
     that opened it, which reads as debris. */
  addEventListener('scroll', hide, { passive: true });
  addEventListener('resize', hide);
  addEventListener('blur', hide);
})();
