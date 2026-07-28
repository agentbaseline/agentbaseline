#!/usr/bin/env python3
"""Figure 0 — the visibility gap. PROPOSAL, not wired into the site.

SLSA's landing page opens with a threat diagram: a green pipeline with red
warning markers at every stage. The figure is the problem statement, and it makes
an argument prose cannot — you count the attack points and see the threat surface
is larger than the thing you control.

Our page has the opposite balance: a strong problem in prose and a figure that
shows only the solution. This is the missing half.

The argument is Kamil's, from the partner channel: "The IdP does not have the
concept of agent identity. And therefore it creates a massive visibility gap...
it gives the users a repudiation opportunity. People can start claiming that they
did not authorize the specific action the agents took which led to the loss."

So the figure shows what happened above the line, and what the log recorded below
it. The gap between them is the whole point, and it is drawn as absence rather
than as a marker — the row of dashes is what your IdP does not know.
"""
from figkit import Fig, C

W = 880
M = 0
ROW = 116
TOP = 30
LOG_Y = TOP + ROW + 84
H = LOG_Y + 128

GAP = "#A3401E"      # one accent for the thing that is missing

f = Fig(W, H, "The visibility gap",
        "A person asks an agent to do something. The agent uses a model, instructions and "
        "tools, and acts on a system of record. The identity provider records only that a "
        "service account called an API: no agent, no task, no delegation, and no way to tie "
        "the action back to the person who asked for it.")

def node(x, y, title, sub, tag):
    f.text(x, y, title, 17, C["ink"], "700", tag=f"n{tag}")
    f.text(x, y + 22, sub, 15, C["soft"], tag=f"s{tag}")

# ── what actually happened ────────────────────────────────────────────────────
f.text(M, TOP, "WHAT HAPPENED", 12, C["soft"], "400", True, 0.12, tag="l1")
y = TOP + 42
node(M, y, "A person", "asks for something", "p")
f.arrow(150, y - 4, 196, y - 4)
node(216, y, "An agent", "model, instructions, tools", "a")
f.arrow(470, y - 4, 516, y - 4)
node(536, y, "A system of record", "money, data, production", "r")

# ── what the log knows ────────────────────────────────────────────────────────
f.rule(LOG_Y - 34, M, W, C["rule"])
f.text(M, LOG_Y - 12, "WHAT YOUR IDENTITY PROVIDER RECORDED", 12, C["soft"], "400",
       True, 0.12, tag="l2")

f.text(M, LOG_Y + 26, "svc-automation-07 called POST /transfers", 16, C["ink"], "700",
       True, 0.02, tag="log")

MISSING = ["which agent", "which task", "who asked", "under what authority"]
for i, m in enumerate(MISSING):
    x = M + i * 220
    f.parts.append(f'<path d="M{x} {LOG_Y + 52} L{x + 168} {LOG_Y + 52}" '
                   f'stroke="{GAP}" stroke-width="1" stroke-dasharray="3 4"/>')
    f.text(x, LOG_Y + 76, m, 15, GAP, "400", tag=f"m{i}")

f.text(M, LOG_Y + 110,
       "The person can deny they authorised it, and nothing in the record contradicts them.",
       16, C["ink"], "700", tag="pay")

f.write("figure-0-gap")
