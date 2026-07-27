#!/usr/bin/env python3
"""Variant B — the shift we are proposing.

Same six outcomes, reorganised by the thing a list cannot show: they operate at
three scopes and three moments. Discover is a standing inventory of the estate.
Authorize, Constrain and Validate are gates in the path of one action. Observe
and Respond span every run.

Rationale for the shift: the page already lists the three questions the six
answer, so a figure restating them is decoration. Scope is additive, and it is
the fact that most often surprises a reader — that one of the six is an estate
programme and three are synchronous gates.
"""
from figkit import Fig, C, catalogue
names, hi = catalogue()

W, M = 900, 32
RAIL, R = 180, W - 32
COL = M + RAIL
ROW_H, TOP = 112, 38
H = TOP + 3 * ROW_H + 22

f = Fig(W, H, "Where the six outcomes operate",
        "The six operate at three scopes. Discover is a standing inventory of the whole "
        "estate. Authorize, Constrain and Validate are gates in the path of a single "
        "action. Observe and Respond span every run, during and after.")

ROWS = [("Before any run", "the whole estate",
         [("DIS", "what exists, who owns it, what it reaches")]),
        ("Per action", "in-line, every time",
         [("AUT", "may this actor act?"), ("CON", "with what reach?"),
          ("VAL", "is the result sound?")]),
        ("Every run", "during and after",
         [("OBS", "prove what happened"), ("RES", "stop it, scope the damage")])]

for i, (a, b, items) in enumerate(ROWS):
    y = TOP + i * ROW_H
    f.rule(y, M, R, C["rule"] if i == 0 else C["hair"])
    f.label(M, y + 32, a, tag=f"sa{i}")
    f.text(M, y + 52, b, 12.5, C["soft"], tag=f"sb{i}")
    cw = (R - COL) // len(items)
    for k, (pre, gloss) in enumerate(items):
        f.outcome(COL + k * cw, y + 36, pre, gloss, names, hi)

f.rule(TOP + 3 * ROW_H, M, R, C["rule"])
f.write("figure-1b-scope")
