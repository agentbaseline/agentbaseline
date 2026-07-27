#!/usr/bin/env python3
"""
Generate Figure 1 — the six outcomes as one control system — from controls.yaml.

The figure carries control identifiers, so it MUST be generated from the catalogue
rather than hand-drawn. That is precisely the defect found in the v0.2 draft, whose
figure claimed ACP-DIS-01-03 where the catalogue held seven Discover controls.

Composition: the action path is the spine — intent enters on the left, passes through
the three gating outcomes, and leaves as an enterprise action. Discover brackets the
spine from above (it sets the envelope before anything runs); Observe and Respond
bracket it from below (they hold evidence and containment across every run). Outcome
names carry the weight; prose lives on the page, not in the figure.

Static-first: complete and legible with zero motion. Animation is a separate layer
over this same source.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = pathlib.Path(__file__).parent / "figure-1.svg"

text_src = (ROOT / "controls.yaml").read_text(encoding="utf-8")
counts, names, order = {}, {}, []
for m in re.finditer(r"^  - prefix: (\w+)\n    name: (.+)$", text_src, re.M):
    order.append(m.group(1)); names[m.group(1)] = m.group(2).strip()
for m in re.finditer(r"^  - id: (\w+)-(\d+)$", text_src, re.M):
    fam, num = m.group(1), int(m.group(2))
    # highest identifier, NOT the count: withdrawn controls leave gaps and the
    # published range must stay true across them.
    counts[fam] = max(counts.get(fam, 0), num)
if not order or not counts:
    sys.exit("could not parse controls.yaml")

def ids(p): return f"{p}-01…{counts[p]:02d}"

W, H = 960, 470
C = {
    "ink": "#1A1C1A", "soft": "#5C605C", "faint": "#8E928E", "hair": "#DFE0DC",
    "env": "#4A3FB0", "env_bg": "#EEECFB",
    "act": "#12457F", "act_bg": "#E8F0FA",
    "evi": "#1F5F3B", "evi_bg": "#E7F2EB",
    "spine": "#2B2E2B", "plate": "#FCFCFB",
    "serif": "Charter,'Iowan Old Style',Georgia,serif",
    "mono": "ui-monospace,'SF Mono',Menlo,Consolas,monospace",
}
def esc(s): return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def t(x, y, s, size=13, fill=C["ink"], w="400", a="start", fam=None, ls=None):
    f = fam or C["serif"]
    sp = f' letter-spacing="{ls}"' if ls else ""
    return (f'<text x="{x}" y="{y}" font-family="{f}" font-size="{size}" fill="{fill}" '
            f'font-weight="{w}" text-anchor="{a}"{sp}>{esc(s)}</text>')

def band_label(x, y, s, fill):
    return t(x, y, s.upper(), 10, fill, "500", "start", C["mono"], "0.11em")

p = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" '
     f'height="{H}" role="img" aria-labelledby="f1t f1d">',
     '<title id="f1t">The six outcomes as one control system</title>',
     '<desc id="f1d">Business intent enters from the left and passes through three '
     'gating outcomes — Authorize, Constrain and Validate — before becoming an '
     'enterprise action. Discover brackets that path from above, setting the operating '
     'envelope before anything runs. Observe and Respond bracket it from below, holding '
     'evidence and containment across every run.</desc>',
     f'''<defs>
  <marker id="a" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5"
          markerHeight="6.5" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" fill="{C['spine']}"/>
  </marker>
  <marker id="b" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5.5"
          markerHeight="5.5" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" fill="{C['faint']}"/>
  </marker>
</defs>''',
     f'<rect width="{W}" height="{H}" fill="{C["plate"]}"/>']

# ── header ────────────────────────────────────────────────────────────────────
p.append(t(40, 44, "One control system", 23, C["ink"], "700"))
p.append(t(40, 66, "across enterprise intent, action, evidence and containment",
           13.5, C["soft"]))
p.append(f'<line x1="40" y1="84" x2="{W-40}" y2="84" stroke="{C["hair"]}" stroke-width="1"/>')

# ── ENVELOPE — brackets the path from above ───────────────────────────────────
EY = 104
p.append(f'<rect x="248" y="{EY}" width="{W-288}" height="62" rx="8" '
         f'fill="{C["env_bg"]}" stroke="{C["env"]}" stroke-width="1.4" class="band band-env"/>')
p.append(band_label(268, EY + 21, "Establish the operating envelope", C["env"]))
p.append(t(268, EY + 48, names["DIS"], 22, C["ink"], "700"))
p.append(t(268 + 108, EY + 48, ids("DIS"), 12, C["env"], "700", "start", C["mono"], "0.03em"))
p.append(t(W - 60, EY + 42, "before anything runs, and continuously", 12, C["soft"], "400", "end"))
p.append(t(W - 60, EY + 25, "as agents, permissions and context change", 11.5, C["faint"], "400", "end"))

# ── SPINE — intent → gates → action ───────────────────────────────────────────
SY = 208          # spine centreline
GY, GH = 182, 96  # gate row

p.append(f'<line x1="128" y1="{SY}" x2="{W-108}" y2="{SY}" stroke="{C["spine"]}" '
         f'stroke-width="2" marker-end="url(#a)" class="spine"/>')

# intent + action terminals
for cx, title, l1, l2, anchor in [
        (40, "Business intent", "human, service", "or business event", "start"),
        (W - 40, "Enterprise action", "tool, API, record", "or transaction", "end")]:
    p.append(t(cx, SY - 8, title, 15, C["ink"], "700", anchor))
    p.append(t(cx, SY + 10, l1, 11.5, C["soft"], "400", anchor))
    p.append(t(cx, SY + 25, l2, 11.5, C["soft"], "400", anchor))

# three gates sitting ON the spine
p.append(f'<rect x="252" y="{GY}" width="{W-360}" height="{GH}" rx="8" fill="none" '
         f'stroke="{C["act"]}" stroke-width="1.4" stroke-dasharray="0" class="band band-act"/>')
p.append(f'<rect x="252" y="{GY}" width="{W-360}" height="20" rx="8" fill="{C["act_bg"]}"/>')
p.append(f'<rect x="252" y="{GY+12}" width="{W-360}" height="8" fill="{C["act_bg"]}"/>')
p.append(band_label(268, GY + 14, "Control each material action", C["act"]))

gw, gap = 168, 20
gx0 = 268
for i, pre in enumerate(["AUT", "CON", "VAL"]):
    gx = gx0 + i * (gw + gap)
    p.append(f'<rect x="{gx}" y="{GY+32}" width="{gw}" height="{GH-48}" rx="6" '
             f'fill="#FFFFFF" stroke="{C["hair"]}" stroke-width="1.2" class="cell cell-{pre.lower()}"/>')
    p.append(t(gx + 16, GY + 62, names[pre], 20, C["ink"], "700"))
    p.append(t(gx + 16, GY + 80, ids(pre), 11.5, C["act"], "700", "start", C["mono"], "0.03em"))

p.append(t(W / 2, GY - 10, "checks stay outside model reasoning", 11.5, C["faint"], "400", "middle"))

# ── EVIDENCE — brackets the path from below ───────────────────────────────────
VY = 318
p.append(f'<rect x="248" y="{VY}" width="{W-288}" height="76" rx="8" '
         f'fill="{C["evi_bg"]}" stroke="{C["evi"]}" stroke-width="1.4" class="band band-evi"/>')
p.append(band_label(268, VY + 21, "Maintain evidence and containment", C["evi"]))
for i, pre in enumerate(["OBS", "RES"]):
    ex = 268 + i * 300
    p.append(t(ex, VY + 52, names[pre], 20, C["ink"], "700"))
    p.append(t(ex + (94 if pre == "OBS" else 96), VY + 52, ids(pre), 12, C["evi"],
               "700", "start", C["mono"], "0.03em"))
p.append(t(W - 60, VY + 52, "across every run, including delegated work",
           11.5, C["faint"], "400", "end"))

# connectors between the bands and the spine
p.append(f'<line x1="{W/2}" y1="{EY+62}" x2="{W/2}" y2="{GY-26}" stroke="{C["faint"]}" '
         f'stroke-width="1.2" marker-end="url(#b)"/>')
p.append(f'<line x1="{W/2}" y1="{GY+GH}" x2="{W/2}" y2="{VY-8}" stroke="{C["faint"]}" '
         f'stroke-width="1.2" marker-end="url(#b)"/>')
p.append(t(W / 2 + 12, EY + 82, "sets the permitted envelope", 11, C["faint"], "400",
           "start", C["mono"]))
p.append(t(W / 2 + 12, GY + GH + 18, "emits correlated decisions and outcomes", 11,
           C["faint"], "400", "start", C["mono"]))

p.append(f'<line x1="40" y1="{H-42}" x2="{W-40}" y2="{H-42}" stroke="{C["hair"]}" stroke-width="1"/>')
p.append(t(40, H - 22, f"{sum(counts.values())} controls · six outcomes · "
           f"end-to-end control requires all six", 11.5, C["faint"], "400", "start", C["mono"]))
p.append("</svg>")

OUT.write_text("\n  ".join(p) + "\n", encoding="utf-8")
print(f"wrote figure-1.svg  ({', '.join(f'{k} {counts[k]}' for k in order)})")
