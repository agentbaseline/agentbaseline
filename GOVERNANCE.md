# Governance

> ⟡ **Working draft.** This describes how we intend to run the project. It will get more
> specific as it meets real contributions.

## Who wrote this

The paper was drafted collaboratively by engineers at Keycard, Docker and Snyk, working in a
shared document before it was moved here. Sections are attributed to their authors in the paper
itself, and contributors are credited as **individuals with their affiliations**, not as company
logos. ⟡ *(`MAINTAINERS.md` to be added, listing each person, their employer, and the sections
and outcomes they own.)*

Keycard convened the work and coordinates the release. Every convening organization's commercial
interest is disclosed in [PROVENANCE.md](PROVENANCE.md).

## Who decides

Maintainers review and merge. Maintainership is held by individuals, named with their employer.

Each convening organization holds maintainers from the first public release, with write access
matching the sections they authored — an author should be able to fix their own section without
asking another company's permission.

## How changes happen

1. **Comment.** Open an issue against a specific control identifier. Disagreement is the point
   of a public draft.
2. **Discuss.** Substantive changes are discussed in the open before a pull request.
3. **Propose.** A pull request against `whitepaper/controls.yaml` and the prose that renders
   from it.
4. **Decide.** A maintainer reviews and merges. Rejections are explained in the thread, not
   in private.
5. **Record.** Every accepted change lands in `CHANGELOG.md`, dated and attributed. Identifier
   changes follow [VERSIONING.md](VERSIONING.md) — superseded, never renumbered.

⟡ A semi-formal accepted-change process is being written and will replace this summary.

## Joining

Anyone may contribute, and maintainership is earned through sustained contribution —
crosswalks, test methods, control proposals, review of others' work. There is no fee, no
sponsorship tier, and no form. It is not something we sell, and not something a competitor has
to ask permission for.

⟡ We have not yet had to apply this to an outside claimant. The first time we do, the decision
and its reasoning will be public.

## Conflicts of interest

The convening organizations sell products in the area this catalogue describes. Those interests
are named in [PROVENANCE.md](PROVENANCE.md), maintainers' employers are disclosed, and reviews
happen in public. A maintainer reviewing a change that materially advantages their employer
should say so in the thread.

## Where this is going

**This work is intended for donation to a community body as it matures.** Stated early so it
can be held against us. The path:

1. **v1.0** — identifiers freeze
2. **Crosswalks and test methods** — mappings to established frameworks; ways to check a claim
3. **Implementation patterns** — vendor-agnostic guidance, from *what must be true* to *how
   teams build it*
4. **Donation** — transfer to a community body ⟡ *(target not yet named)*

Control identifiers carry no project name precisely so this transfer costs nothing and breaks no
existing citation. See [ADR-0001](docs/decisions/0001-prefix-free-control-ids.md).

## What this property will not do

- **No demand generation.** No gated downloads, no lead capture, no contact forms. Nothing here
  is a funnel.
- **No product placement.** No vendor's product is named as an implementation of a control here.
  Where a convening organization writes about how its own products relate to this catalogue,
  that lives on that company's property, clearly labelled, and does not share this one's visual
  identity.
