#!/usr/bin/env python3
"""Figure 1 — the six outcomes as one control system.

Faithful to the paper's own Figure 1: Discover sets the operating envelope above
the action path; business intent passes through Authorize, Constrain and Validate
to become an enterprise action; Observe and Respond hold evidence and containment
below. The paper's caption verbatim: "The six required outcomes operate as one
control system across enterprise intent, action, evidence and containment."

Each outcome is a card — the same hairline block the page uses for the four
tenets — so the six read as concrete stations rather than floating names. The
action path is the only sequence, so it is the only thing drawn with arrows:
into the gate group and out of it, never between the three gate cards, because
adjacency says "together" where an arrow would claim an order the controls do
not impose. Nothing separates Discover, or Observe and Respond, from the path:
Discover runs before deployment *and continuously*, and Observe and Respond span
every run. Whitespace groups them and the labels name them.

Type is taken from the page rather than approximated — Figtree 600 names,
Plex Serif roles, Chakra Petch band labels — because close-but-not-equal type
is what makes a figure read as an embedded object instead of part of the
document. Same reason the card radius here is 4px, matching the tenet blocks.

Identifier ranges are omitted deliberately: they live on /controls/, and
carrying them here cost the room this composition needs.

Generated from controls.yaml. Geometry-checked by bin/check-figure.
"""
from figkit import Fig, C, catalogue

names, _ = catalogue()

# ── grid ──────────────────────────────────────────────────────────────────────
W = 880
R = W
TOP = 8
GAP1, GAP2 = 22, 26
CARD_H = 74
B1_H = 36 + CARD_H            # label, then the Discover card
ROW_H = 32 + CARD_H           # label, then the gate cards
B3_H = 36 + CARD_H
Y1 = TOP
Y2 = Y1 + B1_H + GAP1
Y3 = Y2 + ROW_H + GAP2
H = Y3 + B3_H + 8

TERM = 168                    # intent / action columns
GATE_L = 184                  # where the gate group begins
GW, GGAP = 152, 10            # gate card width and gap
GATE_R = GATE_L + 3 * GW + 2 * GGAP

NAME, ROLE_S, LABEL, TERM_N = 20, 15, 12, 16   # the page's own values

f = Fig(W, H, "The six outcomes as one control system",
        "Discover establishes the operating envelope above the action path. Business "
        "intent passes through Authorize, Constrain and Validate — grouped, because "
        "every material action must go through them — and becomes an enterprise "
        "action. Observe and Respond hold evidence and containment beneath.")


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


def card(x, y, w, pre):
    """One outcome as the page's card: hairline block, name, role beneath."""
    f.card(x, y, w, CARD_H)
    f.text(x + 16, y + 30, names[pre], NAME, C["ink"], "600",
           tag=f"n{pre}", href=anchor(pre), face="head")
    f.text(x + 16, y + 54, ROLE[pre], ROLE_S, C["soft"], tag=f"g{pre}")


def band_label(x, y, s, tag):
    f.text(x, y, s.upper(), LABEL, C["soft"], "500", False, 0.1,
           tag=tag, face="label")


# ── envelope · open ───────────────────────────────────────────────────────────
card(0, Y1 + 36, 176, "DIS")

# ── the action path · the gate group ─────────────────────────────────────────
SY = Y2 + 32 + CARD_H / 2

f.text(0, SY - 6, "Business intent", TERM_N, C["ink"], "600", tag="bi", face="head")
f.text(0, SY + 16, "a person, service", ROLE_S, C["soft"], tag="bi2")
f.text(0, SY + 37, "or business event", ROLE_S, C["soft"], tag="bi3")
f.arrow(150, SY, GATE_L - 12, SY)

band_label(GATE_L, Y2 + 18, "Control each material action", "l2")
for i, pre in enumerate(["CON", "AUT", "VAL"]):
    card(GATE_L + i * (GW + GGAP), Y2 + 32, GW, pre)

f.arrow(GATE_R + 12, SY, R - TERM - 12, SY)
f.text(R - TERM, SY - 6, "Enterprise action", TERM_N, C["ink"], "600",
       tag="ea", face="head")
f.text(R - TERM, SY + 16, "a tool, API,", ROLE_S, C["soft"], tag="ea2")
f.text(R - TERM, SY + 37, "record or message", ROLE_S, C["soft"], tag="ea3")

# ── evidence · open ───────────────────────────────────────────────────────────
band_label(0, Y3 + 24, "Maintain evidence and containment", "l3")
card(0, Y3 + 36, 196, "OBS")
card(220, Y3 + 36, 176, "RES")

f.write("figure-1")


# ── narrow variant ────────────────────────────────────────────────────────────
# Not the desktop drawing scaled down — at 342px wide every label in it is
# microscopic. This is a vertical composition of the same relationships, built
# from the same names and roles so the two cannot say different things.

NW = 360
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
        n.text(0, y, label.upper(), 11, C["soft"], "500", False, 0.1,
               tag=f"nl{pre}", face="label")
        y += 22
    n.text(0, y, names[pre] if pre in names else pre, 20 if big else 16,
           C["ink"], "600", tag=f"nn{pre}",
           href=anchor(pre) if pre in names else "", face="head")
    n.text(0, y + 24, ROLE.get(pre, ""), 15, C["soft"], tag=f"ng{pre}")
    return y + 24

ny = stack(ny, "", "DIS") + 40
n.parts.append(f'<path d="M8 {ny-24} L8 {ny+2}" stroke="{C["faint"]}" stroke-width="1.1" '
               f'marker-end="url(#ar)"/>')
n.text(0, ny + 14, "Business intent", 16, C["ink"], "600", tag="nbi", face="head")
n.text(0, ny + 36, "a person, service or business event", 15, C["soft"], tag="nbi2")
ny += 60
n.parts.append(f'<path d="M8 {ny-6} L8 {ny+22}" stroke="{C["faint"]}" stroke-width="1.1" '
               f'marker-end="url(#ar)"/>')
ny += 40

gate_top = ny
ny += 18
n.text(18, ny, "CONTROL EACH MATERIAL ACTION", 11, C["soft"], "500", False, 0.1,
       tag="nl2", face="label")
ny += 26
for pre in ["CON", "AUT", "VAL"]:
    n.text(18, ny + 14, names[pre], 18, C["ink"], "600", tag=f"nn{pre}",
           href=anchor(pre), face="head")
    n.text(18, ny + 36, ROLE[pre], 15, C["soft"], tag=f"ng{pre}")
    ny += 54
ny += 8
n.parts.insert(5, f'<rect x="0" y="{gate_top}" width="{NW}" height="{ny-gate_top}" rx="4" '
                  f'fill="none" stroke="{C["hair"]}" stroke-width="1"/>')
n.parts.append(f'<path d="M8 {ny+2} L8 {ny+28}" stroke="{C["faint"]}" stroke-width="1.1" '
               f'marker-end="url(#ar)"/>')
ny += 46
n.text(0, ny + 14, "Enterprise action", 16, C["ink"], "600", tag="nea", face="head")
n.text(0, ny + 36, "a tool, API, record or message", 15, C["soft"], tag="nea2")
ny += 74

n.text(0, ny, "MAINTAIN EVIDENCE AND CONTAINMENT", 11, C["soft"], "500", False, 0.1,
       tag="nl3", face="label")
ny += 26
for i, pre in enumerate(["OBS", "RES"]):
    n.text(i * 180, ny + 14, names[pre], 18, C["ink"], "600", tag=f"nn{pre}",
           href=anchor(pre), face="head")
    n.text(i * 180, ny + 36, ROLE[pre], 15, C["soft"], tag=f"ng{pre}")
ny += 46

n.H = ny
n.parts[0] = n.parts[0].replace('viewBox="0 0 360 640"', f'viewBox="-2 0 {NW+4} {ny}"')
n.parts[0] = n.parts[0].replace('height="640"', f'height="{ny}"')
n.write("figure-1-narrow")
