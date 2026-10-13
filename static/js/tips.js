/* Tooltips for the levels' drawings on /reference-architecture. Deferred and
   external, like tabs.js: the deployment CSP allows script-src 'self' and
   nothing inline.

   A progressive enhancement. Every part of a drawing (bin/build-levels-drawing.mjs)
   is a focusable group with its name as aria-label and its description in a
   <desc> it is described by, so a screen reader has both without this script.
   This script shows the same description to a sighted reader, in one tooltip
   element the page shares, when a part is hovered, focused or tapped. The
   tooltip is aria-hidden: the description is already in the part itself, and
   announcing it twice would be noise.

   Hover shows and leaving hides, as a native tooltip does; focus shows and
   blur hides, so the keyboard sees what the pointer sees; on a touch screen a
   tap shows and a tap anywhere else, or Escape, hides. The tooltip sits above
   the part, centred, or below it when the top of the screen is too close, and
   stays inside the viewport's sides. */
(function () {
  var parts = document.querySelectorAll('.sfl .sfl-node');
  if (!parts.length) return;
  var tip = document.createElement('div');
  tip.className = 'sfl-tip';
  tip.setAttribute('aria-hidden', 'true');
  tip.hidden = true;
  var name = document.createElement('b'), text = document.createElement('span');
  tip.appendChild(name);
  tip.appendChild(text);
  document.body.appendChild(tip);
  var shown = null;

  function show(part) {
    var desc = part.querySelector('desc');
    if (!desc) return;
    name.textContent = part.getAttribute('aria-label') || '';
    text.textContent = desc.textContent;
    shown = part;
    part.classList.add('is-told');
    tip.hidden = false;
    tip.classList.remove('below');
    var r = part.getBoundingClientRect();
    var w = tip.offsetWidth, h = tip.offsetHeight, gap = 10;
    var x = r.left + r.width / 2 - w / 2;
    var vw = document.documentElement.clientWidth;
    x = Math.max(8, Math.min(x, vw - w - 8));
    var y = r.top - h - gap;
    if (y < 8) { y = r.bottom + gap; tip.classList.add('below'); }
    tip.style.left = Math.round(x + window.pageXOffset) + 'px';
    tip.style.top = Math.round(y + window.pageYOffset) + 'px';
  }
  function hide() {
    if (!shown) return;
    shown.classList.remove('is-told');
    shown = null;
    tip.hidden = true;
  }

  Array.prototype.forEach.call(parts, function (part) {
    part.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'touch') return;
      show(part);
    });
    part.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'touch') return;
      if (shown === part && document.activeElement !== part) hide();
    });
    part.addEventListener('focus', function () { show(part); });
    part.addEventListener('blur', function () { if (shown === part) hide(); });
    part.addEventListener('click', function (e) {
      e.stopPropagation();
      if (shown === part && e.pointerType === 'touch') hide(); else show(part);
    });
  });
  document.addEventListener('click', hide);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hide();
  });
  /* The page's tabs hide a level, part and all; the tooltip must not outlive
     the part it describes. */
  window.addEventListener('resize', hide);
  document.addEventListener('scroll', function () {
    if (shown && shown.matches(':hover')) return;
    if (shown && document.activeElement === shown) return;
    hide();
  }, { passive: true });
})();
