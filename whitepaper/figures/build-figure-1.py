#!/usr/bin/env python3
"""
Generate Figure 1 — "One control system across intent, action, evidence and containment"
from whitepaper/controls.yaml.

The figure carries control identifiers. It MUST be generated from the catalogue,
never hand-drawn, or it becomes another disagreeing source of IDs — which is
exactly the defect this project found in the v0.2 draft (the original figure said
ACP-DIS-01-03 where the catalogue had seven Discover controls).

Static-first: the output is complete and legible with zero motion. Animation is a
separate layer applied over this same source. See ADR-0003.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
CAT = ROOT / "controls.yaml"
OUT = pathlib.Path(__file__).parent / "figure-1.svg"

# --- minimal YAML read (no dependency; we only need id/outcome/name) ----------
text = CAT.read_text()
counts, names, reqs, order = {}, {}, {}, []
for m in re.finditer(r"^  - prefix: (\w+)\n    name: (.+)$", text, re.M):
    order.append(m.group(1)); names[m.group(1)] = m.group(2).strip()
for m in re.finditer(r"^  - id: (\w+)-(\d+)$", text, re.M):
    counts[m.group(1)] = counts.get(m.group(1), 0) + 1
if not order or not counts:
    sys.exit("could not parse controls.yaml")

def ids(p): return f"{p}-01…{counts[p]:02d}"

# --- geometry -----------------------------------------------------------------
W, H = 940, 552
S = {  # design tokens mirror the site
    "ink": "#222422", "soft": "#5C605C", "faint": "#909490", "line": "#D8DAD6",
    "envelope": "#5B4FB8", "envelope_bg": "#F2F1FC",
    "control": "#1F4E8C", "control_bg": "#EDF3FB",
    "evidence": "#2C6B45", "evidence_bg": "#ECF5EF",
    "neutral_bg": "#F7F7F5",
    "serif": "Charter,'Iowan Old Style',Georgia,serif",
    "mono": "ui-monospace,'SF Mono',Menlo,Consolas,monospace",
}

def esc(s): return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def box(x, y, w, h, stroke, fill, rx=7, sw=1.4, cls=""):
    c = f' class="{cls}"' if cls else ""
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{c}/>')

def text(x, y, s, size=13, fill=S["ink"], weight="400", anchor="start",
         family=None, spacing=None, cls=""):
    f = family or S["serif"]
    ls = f' letter-spacing="{spacing}"' if spacing else ""
    c = f' class="{cls}"' if cls else ""
    return (f'<text x="{x}" y="{y}" font-family="{f}" font-size="{size}" '
            f'fill="{fill}" font-weight="{weight}" text-anchor="{anchor}"{ls}{c}>'
            f'{esc(s)}</text>')

def label(x, y, s, fill=None):
    return text(x, y, s.upper(), 10.5, fill or S["faint"], "400", "start",
                S["mono"], "0.09em")

def outcome(x, y, w, h, prefix, desc, accent, cls="", wide=False):
    """One outcome cell.

    wide=True  → name + identifier range on the left, description on the right,
                 vertically centred. Used for the full-width bands.
    wide=False → stacked. Used for the three narrow cells on the action path.
    """
    g = [box(x, y, w, h, S["line"], "#FFFFFF", 6, 1.1, cls)]
    if wide:
        mid = y + h / 2
        dx = 178 if w > 600 else 130
        g += [text(x + 16, mid - 2, names[prefix], 17, S["ink"], "700"),
              text(x + 16, mid + 16, ids(prefix), 11.5, accent, "700",
                   "start", S["mono"], "0.04em"),
              text(x + dx, mid + 7, desc, 12.5, S["soft"])]
        return "\n  ".join(g)

    g += [text(x + 16, y + 26, names[prefix], 17, S["ink"], "700"),
          text(x + 16, y + 44, ids(prefix), 11.5, accent, "700", "start",
               S["mono"], "0.04em")]
    words, line, ly = desc.split(), "", y + 48
    for word in words:
        if len(line) + len(word) + 1 > 26:
            g.append(text(x + 16, ly + 16, line, 12.5, S["soft"])); ly += 15; line = ""
        line += (" " if line else "") + word
    if line: g.append(text(x + 16, ly + 16, line, 12.5, S["soft"]))
    return "\n  ".join(g)


def arrow(x1, y1, x2, y2, note=""):
    g = [f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{S["soft"]}" '
         f'stroke-width="1.3" marker-end="url(#tip)"/>']
    if note:
        g.append(text((x1 + x2) / 2 + 12, (y1 + y2) / 2 + 4, note, 11,
                      S["faint"], "400", "start", S["mono"]))
    return "\n  ".join(g)

p = []
p.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
         f'width="{W}" height="{H}" role="img" '
         f'aria-labelledby="fig1-title fig1-desc">')
p.append('<title id="fig1-title">The six outcomes as one control system</title>')
p.append(f'<desc id="fig1-desc">Discover establishes the operating envelope. '
         f'Business intent passes through Authorize, Constrain and Validate, which '
         f'control each material action, producing an enterprise action. Observe and '
         f'Respond maintain evidence and containment across every run.</desc>')
p.append(f'''<defs>
  <marker id="tip" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7"
          markerHeight="7" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="{S['soft']}"/>
  </marker>
</defs>''')
p.append(f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>')

# title
p.append(text(W / 2, 34, "The six outcomes as one control system", 20, S["ink"], "700", "middle"))
p.append(text(W / 2, 55, "across enterprise intent, action, evidence and containment",
              13.5, S["soft"], "400", "middle"))

# ── band 1: envelope ──────────────────────────────────────────────────────────
p.append(box(24, 76, W - 48, 104, S["envelope"], S["envelope_bg"], 9, 1.5, "band band-envelope"))
p.append(label(44, 98, "Establish the operating envelope", S["envelope"]))
p.append(text(44, 116, "Before deployment, and continuously as agents, components, "
                       "permissions and business context change", 12, S["soft"]))
p.append(outcome(44, 124, W - 88, 44, "DIS",
                 "Find agents and components; record purpose, assurance and effective access",
                 S["envelope"], "cell cell-dis", wide=True))

p.append(arrow(W / 2, 180, W / 2, 206, "sets the permitted envelope"))

# ── band 2: control the action path ───────────────────────────────────────────
p.append(box(24, 212, 168, 150, S["line"], S["neutral_bg"], 9, 1.2, "node node-intent"))
p.append(text(108, 250, "Business intent", 15, S["ink"], "700", "middle"))
p.append(text(108, 272, "Human, service or", 12, S["soft"], "400", "middle"))
p.append(text(108, 288, "business event", 12, S["soft"], "400", "middle"))
p.append(text(108, 316, "Initiating principal", 12, S["soft"], "400", "middle"))
p.append(text(108, 332, "or approved purpose", 12, S["soft"], "400", "middle"))

p.append(box(216, 212, 508, 150, S["control"], S["control_bg"], 9, 1.5, "band band-control"))
p.append(label(236, 234, "Control each material action", S["control"]))
p.append(text(236, 252, "Identity, authority, capability and outcome checks remain "
                        "outside model reasoning", 12, S["soft"]))
for i, (pre, desc) in enumerate([
        ("AUT", "Bind identity, task, target and authority"),
        ("CON", "Limit components, runtime, data and reach"),
        ("VAL", "Admit the system and verify outcomes")]):
    p.append(outcome(236 + i * 164, 258, 152, 94, pre, desc, S["control"],
                     f"cell cell-{pre.lower()}"))

p.append(box(748, 212, 168, 150, S["line"], S["neutral_bg"], 9, 1.2, "node node-action"))
p.append(text(832, 250, "Enterprise action", 15, S["ink"], "700", "middle"))
p.append(text(832, 272, "Tool, API, record,", 12, S["soft"], "400", "middle"))
p.append(text(832, 288, "message or transaction", 12, S["soft"], "400", "middle"))
p.append(text(832, 316, "Protected resource", 12, S["soft"], "400", "middle"))
p.append(text(832, 332, "and business outcome", 12, S["soft"], "400", "middle"))

p.append(arrow(192, 287, 214, 287))
p.append(arrow(726, 287, 746, 287))
p.append(arrow(W / 2, 362, W / 2, 396, "emits correlated decisions, actions and outcomes"))

# ── band 3: evidence and containment ──────────────────────────────────────────
p.append(box(24, 402, W - 48, 126, S["evidence"], S["evidence_bg"], 9, 1.5, "band band-evidence"))
p.append(label(44, 424, "Maintain evidence and containment", S["evidence"]))
p.append(text(44, 442, "Across every run and action, including delegated work and "
                       "downstream effects", 12, S["soft"]))
p.append(outcome(44, 452, 424, 56, "OBS", "Correlate activity and prove what happened",
                 S["evidence"], "cell cell-obs", wide=True))
p.append(outcome(492, 452, 424, 56, "RES", "Stop, revoke, quarantine and scope impact",
                 S["evidence"], "cell cell-res", wide=True))

p.append(f'<text x="{W-24}" y="{H-8}" font-family="{S["mono"]}" font-size="9.5" '
         f'fill="{S["faint"]}" text-anchor="end">generated from controls.yaml · '
         f'{sum(counts.values())} controls</text>')
p.append("</svg>")

OUT.write_text("\n  ".join(p) + "\n")
print(f"wrote {OUT.relative_to(ROOT.parent)}  "
      f"({', '.join(f'{k} {counts[k]}' for k in order)})")
