#!/usr/bin/env python3
"""
Figure 1 — the six outcomes as the test a CISO can apply.

Generated from controls.yaml. The figure carries identifier ranges, so it must
never be hand-drawn: the v0.2 draft's figure claimed DIS-01-03 where the controls
held seven, and that is exactly the drift this script exists to prevent.

Composition: three questions, two outcomes each. This is deliberately not a flow
diagram — the page's argument is that the six are a test you can carry into a
vendor conversation, and a test reads as a list of questions, not as a pipeline.
The 2/2/2 split is also structurally sound where the old 1/3/2 was not.

Every text run is measured and registered, and bin/check-figure fails the build
on any overlap. Earlier revisions shipped colliding labels twice.
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
    # highest identifier in force, never a count — withdrawn controls leave gaps
    hi[m.group(1)] = max(hi.get(m.group(1), 0), int(m.group(2)))
if not names or not hi:
    sys.exit("could not parse controls.yaml")

def ids(p): return f"{p}-01…{hi[p]:02d}"

# ── geometry ──────────────────────────────────────────────────────────────────
W = 960
M = 40                      # margin
QW = 296                    # question column
CX = M + QW + 30            # outcome cells start
PAD = 18                    # inner padding at the band's right edge
CW = (W - M - PAD - CX - 20) // 2   # two cells per row
ROW_H, ROW_GAP = 104, 14
TOP = 96

C = {"ink": "#1A1C1A", "soft": "#5A5E5A", "faint": "#6E726E", "hair": "#DCDDD9",
     "plate": "#FCFCFA",
     "serif": "Charter,'Iowan Old Style',Georgia,serif",
     "mono": "ui-monospace,'SF Mono',Menlo,Consolas,monospace"}

BANDS = [
    ("What is operating, and under whose authority?", ["DIS", "AUT"], "#4A3FB0", "#F1EFFC"),
    ("Is it staying inside approved boundaries?",     ["CON", "VAL"], "#12457F", "#E9F0FA"),
    ("Can you prove what happened — and stop it?",    ["OBS", "RES"], "#1F5F3B", "#E8F3EC"),
]

boxes = []   # every text run, for the overlap checker
def adv(size, mono):
    return size * (0.601 if mono else 0.503)   # measured mean advance

def esc(s): return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def t(x, y, s, size=13, fill=None, w="400", mono=False, ls=0.0, tag=""):
    width = len(s) * adv(size, mono) + len(s) * ls * size
    boxes.append({"tag": tag or s[:22], "x": x, "y": y - size * 0.78,
                  "w": width, "h": size * 1.02, "text": s})
    sp = f' letter-spacing="{ls}em"' if ls else ""
    return (f'<text x="{x}" y="{y}" font-family="{C["mono"] if mono else C["serif"]}" '
            f'font-size="{size}" fill="{fill or C["ink"]}" font-weight="{w}"{sp}>'
            f'{esc(s)}</text>')

def wrap(s, size, width, mono=False):
    out, line = [], ""
    for word in s.split():
        trial = (line + " " + word).strip()
        if len(trial) * adv(size, mono) > width and line:
            out.append(line); line = word
        else:
            line = trial
    if line: out.append(line)
    return out

H = TOP + len(BANDS) * ROW_H + (len(BANDS) - 1) * ROW_GAP + 30

p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" '
     f'height="{H}" role="img" aria-labelledby="f1t f1d">',
     '<title id="f1t">Three questions, six outcomes</title>',
     '<desc id="f1d">The six outcomes answer three questions. What is operating and '
     'under whose authority: Discover and Authorize. Is it staying inside approved '
     'boundaries: Constrain and Validate. Can you prove what happened and stop it: '
     'Observe and Respond.</desc>',
     f'<rect width="{W}" height="{H}" fill="{C["plate"]}"/>']

p.append(t(M, 44, "Three questions, six outcomes", 22, C["ink"], "700", tag="title"))
p.append(t(M, 66, "No single enforcement point delivers all six", 13, C["soft"], tag="sub"))

for i, (question, prefixes, accent, tint) in enumerate(BANDS):
    y = TOP + i * (ROW_H + ROW_GAP)
    p.append(f'<rect x="{M}" y="{y}" width="{W-2*M}" height="{ROW_H}" rx="8" '
             f'fill="{tint}" stroke="{accent}" stroke-width="1.2" class="band band-{i+1}"/>')
    p.append(t(M + 20, y + 26, str(i + 1), 11.5, accent, "700", mono=True, ls=0.06,
               tag=f"num{i}"))

    lines = wrap(question, 17, QW - 40)
    for j, line in enumerate(lines):
        p.append(t(M + 20, y + 52 + j * 22, line, 17, C["ink"], "700", tag=f"q{i}.{j}"))

    for k, pre in enumerate(prefixes):
        x = CX + k * (CW + 20)
        p.append(f'<rect x="{x}" y="{y+18}" width="{CW}" height="{ROW_H-36}" rx="6" '
                 f'fill="#FFFFFF" stroke="{C["hair"]}" stroke-width="1.1" '
                 f'class="cell cell-{pre.lower()}"/>')
        p.append(t(x + 18, y + 48, names[pre], 20, C["ink"], "700", tag=f"n{pre}"))
        p.append(t(x + 18, y + 68, ids(pre), 11.5, accent, "700", mono=True, ls=0.03,
                   tag=f"i{pre}"))

p.append("</svg>")

OUT.write_text("\n  ".join(p) + "\n", encoding="utf-8")
BOXES.write_text(json.dumps(boxes, indent=1), encoding="utf-8")
print(f"wrote figure-1.svg  {W}×{H}  ({len(boxes)} text runs registered)")
