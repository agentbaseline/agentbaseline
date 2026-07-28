#!/usr/bin/env python3
"""Figure 1 — the six outcomes as one control system.

Faithful to the paper's own Figure 1: Discover sets the operating envelope
above the action path; business intent passes through Authorize, Constrain and
Validate to become an enterprise action; Observe and Respond hold evidence and
containment below. The paper's caption verbatim: "The six required outcomes
operate as one control system across enterprise intent, action, evidence and
containment."

Only the drawing is changed: no fills, no nested boxes, one accent, structure
from position and hairlines. A scope-based alternative was drawn and rejected —
see launch/docs/figure-options.html for the comparison.

Generated from controls.yaml so the identifier ranges cannot drift, and
geometry-checked by bin/check-figure.
"""
from figkit import Fig, C, catalogue
names, hi = catalogue()

W, M = 900, 0
R = W - M
TOP = 34
BAND_H, ROW_H, EV_H = 104, 126, 128
GAP = 22
Y1 = TOP
Y2 = Y1 + BAND_H + GAP
Y3 = Y2 + ROW_H + GAP
H = Y3 + EV_H + 16

f = Fig(W, H, "The six outcomes as one control system",
        "Discover establishes the operating envelope. Business intent passes through "
        "Authorize, Constrain and Validate to become an enterprise action. Observe and "
        "Respond maintain evidence and containment across every run.")

# envelope
f.rule(Y1, M, R, C["rule"])
f.label(M, Y1 + 22, "Establish the operating envelope", tag="l1")
f.outcome(M, Y1 + 52, "DIS", "", names, hi)
f.text(M + 320, Y1 + 52, "Every agent and component, its owner, and what it can reach —",
       12.5, C["soft"], tag="e1")
f.text(M + 320, Y1 + 74, "reconciled continuously against what is actually running.",
       12.5, C["soft"], tag="e2")

# the action path
f.rule(Y2, M, R, C["hair"])
f.label(M, Y2 + 22, "Control each material action", tag="l2")
f.text(M, Y2 + 50, "Business intent", 15, C["ink"], "700", tag="bi")
f.text(M, Y2 + 70, "a person, service", 13, C["soft"], tag="bi2")
f.text(M, Y2 + 88, "or business event", 13, C["soft"], tag="bi3")
f.arrow(M + 138, Y2 + 64, M + 174, Y2 + 64)

gx, gw = M + 190, 168
for i, (pre, gloss) in enumerate([("AUT", "may this actor act?"),
                                  ("CON", "with what reach?"),
                                  ("VAL", "is the result sound?")]):
    f.outcome(gx + i * gw, Y2 + 48, pre, gloss, names, hi)

f.arrow(R - 204, Y2 + 66, R - 172, Y2 + 66)
f.text(R - 158, Y2 + 50, "Enterprise action", 15, C["ink"], "700", tag="ea")
f.text(R - 158, Y2 + 70, "a tool, API, record", 13, C["soft"], tag="ea2")
f.text(R - 158, Y2 + 88, "or transaction", 13, C["soft"], tag="ea3")

# evidence and containment
f.rule(Y3, M, R, C["hair"])
f.label(M, Y3 + 22, "Maintain evidence and containment", tag="l3")
for i, (pre, gloss) in enumerate([("OBS", "prove what happened"),
                                  ("RES", "stop it, scope the damage")]):
    f.outcome(M + i * 320, Y3 + 52, pre, gloss, names, hi)
f.text(M + 660, Y3 + 52, "Across every run, including", 12.5, C["soft"], tag="v1")
f.text(M + 660, Y3 + 74, "delegated work downstream.", 12.5, C["soft"], tag="v2")

f.rule(Y3 + EV_H, M, R, C["rule"])
f.write("figure-1")
