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
     "serif": "Charter,'Iowan Old Style',Georgia,serif",
     "mono": "ui-monospace,'SF Mono',Menlo,Consolas,monospace"}


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
        self.parts.append(
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}" role="img" aria-labelledby="ft fd">')
        self.parts.append(f'<title id="ft">{title}</title>')
        self.parts.append(f'<desc id="fd">{desc}</desc>')
        self.parts.append(f'<rect width="{w}" height="{h}" fill="{C["plate"]}"/>')

    @staticmethod
    def _adv(size, mono, weight="400"):
        """Mean advance per character.

        Mono is near-exact. The serif figure is deliberately pessimistic: the
        measured Charter mean is ~0.503, but bold runs are ~4% wider, caps and
        em dashes are far wider, and on Linux the fallback resolves to DejaVu
        Serif at ~0.55. Under-measuring makes a real collision read as
        clearance, so the constant errs high.
        """
        if mono:
            return size * 0.601
        return size * (0.575 if weight == "700" else 0.548)

    @staticmethod
    def _esc(s):
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    def text(self, x, y, s, size=13, fill=None, weight="400", mono=False,
             ls=0.0, tag=""):
        width = len(s) * self._adv(size, mono, weight) + len(s) * ls * size
        self.boxes.append({"tag": tag or s[:20], "x": x, "y": y - size * 0.78,
                           "w": width, "h": size * 1.02, "text": s})
        sp = f' letter-spacing="{ls}em"' if ls else ""
        self.parts.append(
            f'<text x="{x}" y="{y}" font-family="{C["mono"] if mono else C["serif"]}" '
            f'font-size="{size}" fill="{fill or C["ink"]}" font-weight="{weight}"{sp}>'
            f'{self._esc(s)}</text>')
        return width

    def label(self, x, y, s, tag=""):
        return self.text(x, y, s.upper(), 11, C["soft"], "400", True, 0.12, tag=tag)

    def outcome(self, x, y, pre, gloss, names, hi, tag=None):
        """Name, identifier range, one-line gloss. No box."""
        tag = tag or pre
        self.text(x, y, names[pre], 21, C["ink"], "700", tag=f"n{tag}")
        self.text(x, y + 21, f"{pre}-01…{hi[pre]:02d}", 12, C["accent"], "700",
                  True, 0.03, tag=f"i{tag}")
        if gloss:
            self.text(x, y + 46, gloss, 15, C["soft"], tag=f"g{tag}")

    def rule(self, y, x1, x2, colour=None):
        self.parts.append(f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" '
                          f'stroke="{colour or C["hair"]}" stroke-width="1"/>')

    def vrule(self, x, y1, y2, colour=None):
        self.parts.append(f'<line x1="{x}" y1="{y1}" x2="{x}" y2="{y2}" '
                          f'stroke="{colour or C["hair"]}" stroke-width="1"/>')

    def arrow(self, x1, y1, x2, y2):
        if "marker" not in "".join(self.parts[:5]):
            self.parts.insert(4,
                f'<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" '
                f'markerWidth="6" markerHeight="6" orient="auto-start-reverse">'
                f'<path d="M0 0 L10 5 L0 10 z" fill="{C["faint"]}"/></marker></defs>')
        self.parts.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
                          f'stroke="{C["faint"]}" stroke-width="1.1" '
                          f'marker-end="url(#ar)"/>')

    def write(self, name):
        self.parts.append("</svg>")
        out = pathlib.Path(__file__).parent / f"{name}.svg"
        out.write_text("\n  ".join(self.parts) + "\n", encoding="utf-8")
        (pathlib.Path(__file__).parent / f".{name}.boxes.json").write_text(
            json.dumps(self.boxes, indent=1), encoding="utf-8")
        print(f"wrote {name}.svg  {self.W}×{self.H}  ({len(self.boxes)} text runs)")
