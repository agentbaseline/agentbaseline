#!/usr/bin/env python3
"""Figure 1 — the six outcomes as one control system.

Faithful to the paper's own Figure 1: Discover sets the operating envelope above
the action path; business intent passes through Authorize, Constrain and Validate
to become an enterprise action; Observe and Respond hold evidence and containment
below. The paper's caption verbatim: "The six required outcomes operate as one
control system across enterprise intent, action, evidence and containment."

Refined from the v1 composition, which had something a later revision lost — you
can see the path. Everything that made v1 loud is gone: no fills, no nested boxes,
page ink, hairlines at the prose's own weight.

Every mark is meant to assert something true.

The action path is the only sequence, so it is the only thing drawn with arrows.
The three gates are the only thing an action must pass through, so they are the
only closed shape.

Nothing separates Discover, or Observe and Respond, from the path. A rule between
them would say "this section ends here", which is sequence — and that is wrong:
Discover runs before deployment *and continuously*, and Observe and Respond span
every run, during and after. Brackets were tried and are too faint to read at this
width. So the honest mark is no mark: whitespace groups them and the labels name
them, and nothing on the drawing claims a sequence that does not exist.

Type is taken from the page rather than approximated — 21px names, 16px
descriptions, 12px mono labels — because close-but-not-equal type is what makes a
figure read as an embedded object instead of part of the document. Same reason the
one radius here is 3px, matching the outcome chips.

Identifier ranges are omitted deliberately: they live on /controls/, and carrying
them here cost the room this composition needs.

Generated from controls.yaml. Geometry-checked by bin/check-figure.
"""
from figkit import Fig, C, catalogue

names, _ = catalogue()

# ── grid ──────────────────────────────────────────────────────────────────────
W = 880
R = W
TOP = 8
B1_H, ROW_H, B3_H = 106, 158, 102
GAP = 22
Y1 = TOP
Y2 = Y1 + B1_H + GAP
Y3 = Y2 + ROW_H + GAP
H = Y3 + B3_H + 4

TERM = 168                  # intent / action columns
GATE_L, GATE_R = 196, 656   # the enclosure

NAME, DESC, LABEL, TERM_N = 21, 16, 12, 16   # the page's own values

f = Fig(W, H, "The six outcomes as one control system",
        "Discover establishes the operating envelope above the action path. Business "
        "intent passes through Authorize, Constrain and Validate — the only enclosed "
        "stage, because every material action must go through it — and becomes an "
        "enterprise action. Observe and Respond hold evidence and containment beneath.")


# Two or three words each: the role in the flow, not the requirement. The roster
# above carries the requirement in full; these give each name weight and say what
# the outcome does at this point in the path.
ROLE = {"DIS": "find what exists",   "AUT": "bind authority",
        "CON": "limit reach",        "VAL": "verify outcomes",
        "OBS": "prove what happened", "RES": "stop and contain"}


def anchor(pre):
    """Every outcome name links to its controls. /controls uses the lowercase
    outcome name as its anchor, the same target the roster chips point at."""
    return f"/controls#{names[pre].lower()}"


def outcome(x, y, pre):
    """Name, then its role beneath — the shape the page uses for the six."""
    f.text(x, y, names[pre], NAME, C["ink"], "700", tag=f"n{pre}", href=anchor(pre))
    f.text(x, y + 26, ROLE[pre], DESC, C["soft"], tag=f"g{pre}")


def band_label(x, y, s, tag):
    f.text(x, y, s.upper(), LABEL, C["soft"], "400", True, 0.12, tag=tag)


# ── envelope · open ───────────────────────────────────────────────────────────
band_label(0, Y1 + 24, "Establish the operating envelope", "l1")
outcome(0, Y1 + 58, "DIS")

# ── the action path · one enclosure ───────────────────────────────────────────
SY = Y2 + ROW_H / 2

f.text(0, SY - 6, "Business intent", TERM_N, C["ink"], "700", tag="bi")
f.text(0, SY + 16, "a person, service", DESC, C["soft"], tag="bi2")
f.text(0, SY + 37, "or business event", DESC, C["soft"], tag="bi3")
f.arrow(150, SY, GATE_L - 14, SY)

f.parts.append(f'<rect x="{GATE_L}" y="{Y2}" width="{GATE_R - GATE_L}" height="{ROW_H}" '
               f'rx="3" fill="none" stroke="{C["hair"]}" stroke-width="1"/>')
band_label(GATE_L + 24, Y2 + 30, "Control each material action", "l2")
gw = (GATE_R - GATE_L - 48) // 3
for i, pre in enumerate(["AUT", "CON", "VAL"]):
    outcome(GATE_L + 24 + i * gw, Y2 + 78, pre)

f.arrow(GATE_R + 14, SY, R - TERM - 12, SY)
f.text(R - TERM, SY - 6, "Enterprise action", TERM_N, C["ink"], "700", tag="ea")
f.text(R - TERM, SY + 16, "a tool, API,", DESC, C["soft"], tag="ea2")
f.text(R - TERM, SY + 37, "record or message", DESC, C["soft"], tag="ea3")

# ── evidence · open ───────────────────────────────────────────────────────────
band_label(0, Y3 + 28, "Maintain evidence and containment", "l3")
outcome(0, Y3 + 62, "OBS")
outcome(GATE_L + 24, Y3 + 62, "RES")

f.write("figure-1")


# ── narrow variant ────────────────────────────────────────────────────────────
# Not the desktop drawing scaled down — at 342px wide every label in it is
# microscopic. This is a vertical composition of the same relationships, built
# from the same names and roles so the two cannot say different things.

NW = 360
STEP, GAP_A = 54, 26
ny = 26
n = Fig(NW, 640, "The six outcomes as one control system",
        "Discover establishes the operating envelope. Business intent passes through "
        "Authorize, Constrain and Validate to become an enterprise action. Observe and "
        "Respond hold evidence and containment across every run.")

n._def("ar", f'<marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" '
              f'markerWidth="6" markerHeight="6" orient="auto-start-reverse">'
              f'<path d="M0 0 L10 5 L0 10 z" fill="{C["faint"]}"/></marker>')


def stack(y, label, pre, big=True):
    if label:
        n.text(0, y, label.upper(), 11, C["soft"], "400", True, 0.12, tag=f"nl{pre}")
        y += 22
    n.text(0, y, names[pre] if pre in names else pre, 21 if big else 16,
           C["ink"], "700", tag=f"nn{pre}",
           href=anchor(pre) if pre in names else "")
    n.text(0, y + 24, ROLE.get(pre, ""), 15, C["soft"], tag=f"ng{pre}")
    return y + 24

def down(y):
    n.arrow_v(14, y + 12, y + 34) if hasattr(n, "arrow_v") else None
    return y + 40

ny = stack(ny, "Establish the operating envelope", "DIS") + 40
n.parts.append(f'<path d="M8 {ny-24} L8 {ny+2}" stroke="{C["faint"]}" stroke-width="1.1" '
               f'marker-end="url(#ar)"/>')
n.text(0, ny + 14, "Business intent", 16, C["ink"], "700", tag="nbi")
n.text(0, ny + 36, "a person, service or business event", 15, C["soft"], tag="nbi2")
ny += 60
n.parts.append(f'<path d="M8 {ny-6} L8 {ny+22}" stroke="{C["faint"]}" stroke-width="1.1" '
               f'marker-end="url(#ar)"/>')
ny += 40

gate_top = ny
ny += 18
n.text(18, ny, "CONTROL EACH MATERIAL ACTION", 11, C["soft"], "400", True, 0.12, tag="nl2")
ny += 26
for pre in ["AUT", "CON", "VAL"]:
    n.text(18, ny + 14, names[pre], 19, C["ink"], "700", tag=f"nn{pre}",
           href=anchor(pre))
    n.text(18, ny + 36, ROLE[pre], 15, C["soft"], tag=f"ng{pre}")
    ny += 54
ny += 8
n.parts.insert(5, f'<rect x="0" y="{gate_top}" width="{NW}" height="{ny-gate_top}" rx="3" '
                  f'fill="none" stroke="{C["hair"]}" stroke-width="1"/>')
n.parts.append(f'<path d="M8 {ny+2} L8 {ny+28}" stroke="{C["faint"]}" stroke-width="1.1" '
               f'marker-end="url(#ar)"/>')
ny += 46
n.text(0, ny + 14, "Enterprise action", 16, C["ink"], "700", tag="nea")
n.text(0, ny + 36, "a tool, API, record or message", 15, C["soft"], tag="nea2")
ny += 74

n.text(0, ny, "MAINTAIN EVIDENCE AND CONTAINMENT", 11, C["soft"], "400", True, 0.12, tag="nl3")
ny += 26
for i, pre in enumerate(["OBS", "RES"]):
    n.text(i * 180, ny + 14, names[pre], 19, C["ink"], "700", tag=f"nn{pre}",
           href=anchor(pre))
    n.text(i * 180, ny + 36, ROLE[pre], 15, C["soft"], tag=f"ng{pre}")
ny += 46

n.H = ny
n.parts[0] = n.parts[0].replace('viewBox="0 0 360 640"', f'viewBox="-2 0 {NW+4} {ny}"')
n.parts[0] = n.parts[0].replace('height="640"', f'height="{ny}"')
n.write("figure-1-narrow")
