# Contributing

This is a draft for public comment. **Disagreement is the point.** The most useful thing you
can do is tell us where a control is wrong, unimplementable, or missing.

## Read this first

- [VERSIONING.md](VERSIONING.md) — what an identifier means and what is safe to cite
- [GOVERNANCE.md](GOVERNANCE.md) — who decides, and how you become one of them
- [PROVENANCE.md](PROVENANCE.md) — who wrote this and what they sell

## Ways to contribute

**Comment** — open an issue against a specific control identifier (`DIS-01`, `AUT-03`). Say
what's wrong and, where you can, what would make it right. "This is not implementable in a
regulated environment" is a good issue. So is "this reads like a vendor datasheet."

**File a crosswalk** — map these controls to a framework you already run: NIST AI RMF, ISO
42001, OWASP, CIS, SOC 2. One pull request per framework, into `crosswalks/`. This is the
single most valuable contribution, and the one we most need from outside the founding group.

**Propose a test method** — a way to check whether a control is actually met. A control nobody
can verify is an opinion.

**Propose a control** — open an issue before a pull request. Say which outcome it belongs to,
what it requires, and what evidence would prove it was achieved.

**Correct a fact** — product descriptions, framework mappings, dates and citations. If we have
described someone's product wrongly, that is a defect and we want it filed.

## How to write a control

Every control has four parts, and all four are required:

| | |
|---|---|
| **Identifier** | Bare, family-prefixed: `DIS-01`. Never invent a project prefix. |
| **Title** | A short noun phrase — what the control is. |
| **Requirement** | What must be true. Testable. Not a recommendation. |
| **Evidence of achievement** | What an auditor would look at to confirm it. |

If you cannot write the evidence line, the control is not ready. That rule applies to the
founding maintainers too.

## Pull requests

1. Edit `whitepaper/controls.yaml` — it is the source of truth. Prose and figures render from
   it; editing prose alone will fail CI.
2. Never renumber an existing identifier. See [VERSIONING.md](VERSIONING.md).
3. Add a `CHANGELOG.md` entry.
4. Sign off with your name and affiliation. Contributors are credited as individuals with
   affiliations disclosed — not as company logos.

## What gets rejected

- Naming a specific product as the implementation of a control. This property does not do
  product placement — see [GOVERNANCE.md](GOVERNANCE.md).
- Marketing language, or a requirement written so that only one product can satisfy it.
- Renumbering identifiers.
- A requirement with no evidence line.

If you think a rejection is self-serving, say so publicly — that is a legitimate use
of this repository.

## Working-group membership

Earned through sustained contribution, not a form. See [GOVERNANCE.md](GOVERNANCE.md).
