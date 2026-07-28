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

One idea carries the drawing: what you pass through is enclosed, what surrounds it
is open. The control band is the only closed shape here, because it is the only
thing every material action must go through. Discover and the evidence band are
held by rules alone.

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
TOP = 30
B1_H, ROW_H, B3_H = 100, 152, 102
GAP = 22
Y1 = TOP
Y2 = Y1 + B1_H + GAP
Y3 = Y2 + ROW_H + GAP
H = Y3 + B3_H + 12

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


def outcome(x, y, pre):
    """Name, then its role beneath — the shape the page uses for the six."""
    f.text(x, y, names[pre], NAME, C["ink"], "700", tag=f"n{pre}")
    f.text(x, y + 26, ROLE[pre], DESC, C["soft"], tag=f"g{pre}")


def band_label(x, y, s, tag):
    f.text(x, y, s.upper(), LABEL, C["soft"], "400", True, 0.12, tag=tag)


# ── envelope · open ───────────────────────────────────────────────────────────
f.rule(Y1, 0, R, C["rule"])
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
f.rule(Y3, 0, R, C["hair"])
band_label(0, Y3 + 24, "Maintain evidence and containment", "l3")
outcome(0, Y3 + 58, "OBS")
outcome(GATE_L + 24, Y3 + 58, "RES")
f.rule(Y3 + B3_H, 0, R, C["rule"])

f.write("figure-1")
