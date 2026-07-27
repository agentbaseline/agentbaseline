#!/usr/bin/env python3
"""
Figure 1 — where the six outcomes operate.

Generated from controls.yaml. The figure carries identifier ranges, so it must
never be hand-drawn: the v0.2 draft's figure claimed DIS-01-03 where the controls
held seven.

This figure deliberately does NOT restate the three questions. The page already
lists those, and a figure that repeats the text beside it is decoration. Its job
is the thing a list cannot show: the six operate at three different scopes and
three different moments. Discover is a standing inventory maintained before
anything runs. Authorize, Constrain and Validate are gates in the path of a
single action. Observe and Respond span every run, during and after. Each gate
is labelled with the decision it actually makes.

Every text run is measured and registered; bin/check-figure fails on overlaps,
text escaping the canvas, cells without clearance, and stale identifier ranges.
"""
import re, sys, pathlib, json

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = pathlib.Path(__file__).parent / "figure-1.svg"
BOXES = pathlib.Path(__file__).parent / ".figure-1.boxes.json"

src = (ROOT / "controls.yaml").read_text(encoding="utf-8")
hi, names = {}, {}
for m in re.finditer(r"^  - prefix: (\w+)\n    name: (.+)$", src, re.M):
    names[m.group(1)] = m.group(2).strip()
for m in re.finditer(r"^  - id: (\w+)-(\d+)$", src, re.M):
    hi[m.group(1)] = max(hi.get(m.group(1), 0), int(m.group(2)))
if not names or not hi:
    sys.exit("could not parse controls.yaml")

def ids(p): return f"{p}-01…{hi[p]:02d}"

# ── grid ──────────────────────────────────────────────────────────────────────
W = 960
M = 40
SCOPE_W = 200                 # left rail: wide enough for the scope label
BX = M + SCOPE_W              # bands start after the rail
BR = W - M
TOP = 92
H1, H2, H3 = 96, 132, 112     # band heights; 2 and 3 carry a gloss line
GAP = 26
Y1 = TOP
Y2 = Y1 + H1 + GAP
Y3 = Y2 + H2 + GAP
H = Y3 + H3 + 34

C = {"ink": "#1A1C1A", "soft": "#5A5E5A", "faint": "#6E726E", "hair": "#DCDDD9",
     "plate": "#FCFCFA", "rail": "#8A8E8A",
     "env": "#4A3FB0", "env_bg": "#F1EFFC",
     "act": "#12457F", "act_bg": "#E9F0FA",
     "evi": "#1F5F3B", "evi_bg": "#E8F3EC",
     "serif": "Charter,'Iowan Old Style',Georgia,serif",
     "mono": "ui-monospace,'SF Mono',Menlo,Consolas,monospace"}

boxes = []
def adv(size, mono): return size * (0.601 if mono else 0.503)
def esc(s): return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def t(x, y, s, size=13, fill=None, w="400", mono=False, ls=0.0, anchor="start", tag=""):
    width = len(s) * adv(size, mono) + len(s) * ls * size
    bx = x - width if anchor == "end" else x
    boxes.append({"tag": tag or s[:20], "x": bx, "y": y - size * 0.78,
                  "w": width, "h": size * 1.02, "text": s})
    sp = f' letter-spacing="{ls}em"' if ls else ""
    a = f' text-anchor="{anchor}"' if anchor != "start" else ""
    return (f'<text x="{x}" y="{y}" font-family="{C["mono"] if mono else C["serif"]}" '
            f'font-size="{size}" fill="{fill or C["ink"]}" font-weight="{w}"{sp}{a}>'
            f'{esc(s)}</text>')

def rect(x, y, w, h, fill, stroke, sw=1.2, rx=8, cls=""):
    c = f' class="{cls}"' if cls else ""
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" '
            f'stroke="{stroke}" stroke-width="{sw}"{c}/>')

def scope(y, h, line1, line2):
    """Left rail: when this band operates."""
    out = [f'<line x1="{M}" y1="{y+4}" x2="{M}" y2="{y+h-4}" stroke="{C["hair"]}" stroke-width="2"/>']
    out.append(t(M + 14, y + 22, line1.upper(), 9.5, C["rail"], "600", True, 0.11,
                 tag=f"s{y}a"))
    out.append(t(M + 14, y + 40, line2, 12.5, C["soft"], tag=f"s{y}b"))
    return "\n  ".join(out)

def outcome(x, y, w, h, pre, gloss, accent, tag):
    out = [rect(x, y, w, h, "#FFFFFF", C["hair"], 1.1, 6, f"cell cell-{pre.lower()}")]
    out.append(t(x + 16, y + 30, names[pre], 19, C["ink"], "700", tag=f"n{tag}"))
    out.append(t(x + 16, y + 49, ids(pre), 11, accent, "700", True, 0.03, tag=f"i{tag}"))
    if gloss:
        out.append(t(x + 16, y + 72, gloss, 12.5, C["soft"], tag=f"g{tag}"))
    return "\n  ".join(out)

p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" '
     f'height="{H}" role="img" aria-labelledby="f1t f1d">',
     '<title id="f1t">Where the six outcomes operate</title>',
     '<desc id="f1d">The six operate at three scopes. Discover is a standing inventory '
     'of the whole estate, maintained before anything runs. Authorize, Constrain and '
     'Validate are gates in the path of a single action: they decide whether this actor '
     'may act, with what reach, and whether the result is sound. Observe and Respond span '
     'every run, holding the record during and after.</desc>',
     f'<rect width="{W}" height="{H}" fill="{C["plate"]}"/>']

p.append(t(M, 42, "Where the six operate", 22, C["ink"], "700", tag="title"))
p.append(t(M, 64, "Three scopes: the estate, a single action, and every run",
           13, C["soft"], tag="sub"))

# ── 1 · the estate, standing ──────────────────────────────────────────────────
p.append(scope(Y1, H1, "Before any run", "the whole estate"))
p.append(rect(BX, Y1, BR - BX, H1, C["env_bg"], C["env"], cls="band band-1"))
p.append(outcome(BX + 16, Y1 + 14, 300, H1 - 28, "DIS",
                 "", C["env"], "dis"))
p.append(t(BX + 336, Y1 + 40, "What exists, who owns it, what it can reach —",
           13, C["soft"], tag="e1"))
p.append(t(BX + 336, Y1 + 60, "reconciled against what is actually running.",
           13, C["soft"], tag="e2"))

# ── 2 · one action, gated ─────────────────────────────────────────────────────
p.append(scope(Y2, H2, "Per action", "in-line, every time"))
p.append(rect(BX, Y2, BR - BX, H2, C["act_bg"], C["act"], cls="band band-2"))
gw = (BR - BX - 32 - 2 * 14) // 3
for i, (pre, gloss) in enumerate([
        ("AUT", "May this actor act?"),
        ("CON", "With what reach?"),
        ("VAL", "Is the result sound?")]):
    p.append(outcome(BX + 16 + i * (gw + 14), Y2 + 14, gw, H2 - 28, pre, gloss,
                     C["act"], pre.lower()))

# ── 3 · every run, during and after ───────────────────────────────────────────
p.append(scope(Y3, H3, "Every run", "during and after"))
p.append(rect(BX, Y3, BR - BX, H3, C["evi_bg"], C["evi"], cls="band band-3"))
ew = (BR - BX - 32 - 14) // 2
for i, (pre, gloss) in enumerate([("OBS", "Prove what happened"),
                                  ("RES", "Stop it, and scope the damage")]):
    p.append(outcome(BX + 16 + i * (ew + 14), Y3 + 14, ew, H3 - 28, pre, gloss,
                     C["evi"], pre.lower()))

p.append("</svg>")

OUT.write_text("\n  ".join(p) + "\n", encoding="utf-8")
BOXES.write_text(json.dumps(boxes, indent=1), encoding="utf-8")
print(f"wrote figure-1.svg  {W}×{H}  ({len(boxes)} text runs)")
