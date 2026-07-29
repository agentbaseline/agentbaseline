"""Shared drawing primitives for the figures.

Both variants read controls.yaml, register every text run for bin/check-figure,
and share one restrained palette. Structure comes from position, whitespace and
hairlines; colour encodes exactly one thing — the identifier.
"""
import re, sys, pathlib, json

ROOT = pathlib.Path(__file__).resolve().parents[1]

C = {"ink": "#1A1C1A", "soft": "#5A5E5A", "faint": "#797D79",
     "hair": "#E4E5E1", "rule": "#CBCDC8", "accent": "#1A4D8F",
     "plate": "#FFFFFF",
     # The page's own voices (see layouts/index.html): heads, prose, labels,
     # data. A figure set in the page's type reads as part of the document.
     "serif": "'IBM Plex Serif',Charter,Georgia,serif",
     "head": "Figtree,'Avenir Next','Helvetica Neue',sans-serif",
     "label": "'Chakra Petch','Avenir Next',sans-serif",
     "mono": "'IBM Plex Mono',ui-monospace,'SF Mono',Menlo,Consolas,monospace"}


def catalogue():
    """(names, highest-identifier) from the source of truth."""
    src = (ROOT / "controls.yaml").read_text(encoding="utf-8")
    hi, names = {}, {}
    for m in re.finditer(r"^  - prefix: (\w+)\n    name: (.+)$", src, re.M):
        names[m.group(1)] = m.group(2).strip()
    for m in re.finditer(r"^  - id: (\w+)-(\d+)$", src, re.M):
        # highest in force, never a count — withdrawn controls leave gaps
        hi[m.group(1)] = max(hi.get(m.group(1), 0), int(m.group(2)))
    if not names or not hi:
        sys.exit("could not parse controls.yaml")
    return names, hi


class Fig:
    def __init__(self, w, h, title, desc):
        self.W, self.H = w, h
        self.boxes, self.parts = [], []
        self._defs = {}
        self.parts.append(
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}" role="img" aria-labelledby="ft fd">')
        self.parts.append(f'<title id="ft">{title}</title>')
        self.parts.append(f'<desc id="fd">{desc}</desc>')
        self.parts.append(f'<rect width="{w}" height="{h}" fill="{C["plate"]}"/>')

    @staticmethod
    def _adv(size, mono, weight="400", face=None):
        """Mean advance per character, pessimistic per face.

        Under-measuring makes a real collision read as clearance, so every
        constant errs high: Figtree at 600 measures ~0.55, Chakra Petch caps
        ~0.62 before tracking, Plex Serif ~0.55, Plex Mono exactly 0.6.
        """
        if face == "head":
            return size * (0.585 if weight in ("600", "700") else 0.56)
        if face == "label":
            return size * 0.66
        if mono:
            return size * 0.601
        return size * (0.60 if weight == "700" else 0.575)

    @staticmethod
    def _esc(s):
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    def text(self, x, y, s, size=13, fill=None, weight="400", mono=False,
             ls=0.0, tag="", href="", face=None):
        """Draw one run. `href` wraps it in a link.

        A figure whose parts are links is navigation rather than illustration —
        the reader who wants the controls behind an outcome clicks the outcome
        instead of scrolling back to find the roster. The style stays quiet: no
        link colour, only an underline on hover, because six accented names
        would make the drawing louder than the prose around it.
        """
        width = len(s) * self._adv(size, mono, weight, face) + len(s) * ls * size
        self.boxes.append({"tag": tag or s[:20], "x": x, "y": y - size * 0.78,
                           "w": width, "h": size * 1.02, "text": s})
        sp = f' letter-spacing="{ls}em"' if ls else ""
        fam = C[face] if face else (C["mono"] if mono else C["serif"])
        run = (f'<text x="{x}" y="{y}" font-family="{fam}" '
               f'font-size="{size}" fill="{fill or C["ink"]}" font-weight="{weight}"{sp}>'
               f'{self._esc(s)}</text>')
        if href:
            run = f'<a href="{self._esc(href)}">{run}</a>'
        self.parts.append(run)
        return width

    def label(self, x, y, s, tag=""):
        return self.text(x, y, s.upper(), 11, C["soft"], "500", False, 0.1,
                         tag=tag, face="label")

    def card(self, x, y, w, h):
        """The page's card: hairline, 4px radius, no fill — the tenet block."""
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" '
                          f'rx="4" fill="none" stroke="{C["hair"]}" '
                          f'stroke-width="1"/>')

    def outcome(self, x, y, pre, gloss, names, hi, tag=None):
        """Name, identifier range, one-line gloss. No box."""
        tag = tag or pre
        self.text(x, y, names[pre], 21, C["ink"], "700", tag=f"n{tag}")
        self.text(x, y + 21, f"{pre}-01…{hi[pre]:02d}", 12, C["accent"], "700",
                  True, 0.03, tag=f"i{tag}")
        if gloss:
            self.text(x, y + 46, gloss, 15, C["soft"], tag=f"g{tag}")

    def _def(self, key, markup):
        self._defs.setdefault(key, markup)

    def rule(self, y, x1, x2, colour=None):
        """A horizontal rule that dissolves at both ends.

        Solid across the content and fading toward the margins, matching the
        hairline under the page's title. A rule that stops dead at the measure
        is one of the things that made the figure read as a separate object.
        """
        c = colour or C["hair"]
        # userSpaceOnUse is required: a horizontal line has a zero-height bounding
        # box, so an objectBoundingBox gradient is undefined and the stroke
        # disappears entirely. Keyed by colour and span so each run gets its own.
        key = f'fade{c.lstrip("#")}{int(x1)}x{int(x2)}'
        self._def(key, f'<linearGradient id="{key}" gradientUnits="userSpaceOnUse" '
                       f'x1="{x1}" y1="0" x2="{x2}" y2="0">'
                       f'<stop offset="0" stop-color="{c}" stop-opacity="0"/>'
                       f'<stop offset="0.06" stop-color="{c}" stop-opacity="1"/>'
                       f'<stop offset="0.82" stop-color="{c}" stop-opacity="1"/>'
                       f'<stop offset="1" stop-color="{c}" stop-opacity="0"/>'
                       f'</linearGradient>')
        self.parts.append(f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" '
                          f'stroke="url(#{key})" stroke-width="1"/>')

    def bracket(self, y, x1, x2, depth=7, down=True, colour=None):
        """A span marker: a rule with a return at each end.

        A plain rule between two groups says "this section ends here", which is
        sequence. A bracket says "this covers all of that", which is span — and
        span is what Discover, Observe and Respond actually do relative to the
        action path.
        """
        c = colour or C["hair"]
        d = depth if down else -depth
        self.parts.append(f'<path d="M{x1} {y + d} L{x1} {y} L{x2} {y} L{x2} {y + d}" '
                          f'fill="none" stroke="{c}" stroke-width="1"/>')

    def vrule(self, x, y1, y2, colour=None):
        self.parts.append(f'<line x1="{x}" y1="{y1}" x2="{x}" y2="{y2}" '
                          f'stroke="{colour or C["hair"]}" stroke-width="1"/>')

    def arrow(self, x1, y1, x2, y2):
        self._def("ar", f'<marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" '
                        f'markerWidth="6" markerHeight="6" orient="auto-start-reverse">'
                        f'<path d="M0 0 L10 5 L0 10 z" fill="{C["faint"]}"/></marker>')
        self.parts.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
                          f'stroke="{C["faint"]}" stroke-width="1.1" '
                          f'marker-end="url(#ar)"/>')

    def write(self, name):
        if self._defs:
            self.parts.insert(4, "<defs>" + "".join(self._defs.values()) + "</defs>")
        self.parts.append("</svg>")
        out = pathlib.Path(__file__).parent / f"{name}.svg"
        out.write_text("\n  ".join(self.parts) + "\n", encoding="utf-8")
        (pathlib.Path(__file__).parent / f".{name}.boxes.json").write_text(
            json.dumps(self.boxes, indent=1), encoding="utf-8")
        print(f"wrote {name}.svg  {self.W}×{self.H}  ({len(self.boxes)} text runs)")
