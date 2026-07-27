# ADR-0001 — Control IDs are prefix-free

- **Status:** Accepted
- **Date:** 2026-07-27
- **Deciders:** Taishō (Creager), on the tōryō's recommendation
- **Supersedes:** the `ACP-` prefix used throughout the v0.2 draft
- **Related:** D0 (name + org), D4a (mechanical ID consistency), D10 (Figure 1 redraw)

## Context

Every control in the v0.2 draft is written as `ACP-DIS-01` — an `ACP-` prefix derived from
"Agentic Control Plane," the working name of the property.

Three facts collided:

1. **"ACP" is burned.** The GitHub org `agentcontrolplane` and the domain
   `agentcontrolplane.org` are both already taken, on top of three protocol collisions and an
   occupied category term. The property will not be called ACP.
2. **The name was therefore blocking the catalogue.** Because the name was baked into the
   identifier, we could not freeze the control IDs (D4a) until we had chosen a name (D0),
   and we could not redraw Figure 1 (D10) until the IDs were frozen. A three-deep dependency
   chain with three days of runway.
3. **The stated destination is donation** to a community body. A donated catalogue carrying a
   dead sponsor-era acronym forces a renumbering at exactly the moment the artifact is meant
   to gain independence.

The binding constraint is our own promise in `VERSIONING.md`: **superseded, never renumbered.**
Freezing IDs under a prefix we then abandon would break that promise in week one, on the
artifact whose entire value is citability.

## Decision

**The canonical identifier is the bare form: `DIS-01`, `AUT-03`, `RES-04`.**

- `controls.yaml` uses bare IDs as keys. They are the stable, permanent identifiers.
- No project name, acronym, or organization appears inside an identifier — ever.
- Where a prefix is wanted for display, it is applied **at render time** from `controls.yaml`,
  and it is presentation, not identity.
- Where disambiguation is genuinely required — a crosswalk table sitting alongside NIST and
  ISO identifiers, say — **qualify by namespace, never by mutating the ID**:
  `DIS-01 (agentcontrols.org)` or `agentcontrols.org/DIS-01`. The identifier stays byte-stable;
  the namespace is metadata that can change without breaking a citation.

The mock landing page already does exactly this. This decision makes it the rule.

## Consequences

**Good**

- **The D0 → D4a → D10 chain is broken.** ID reconciliation and the Figure 1 redraw can both
  proceed before the name is chosen. This removes the single worst scheduling risk in the launch.
- A future rename costs nothing. So does donation, so does a fourth or fifth vendor joining.
- The IDs read as neutral. `DIS-01` belongs to whoever cites it; `ACP-DIS-01` belongs to a
  project. For an artifact whose whole claim is structural neutrality, the identifier should
  not carry a brand.
- It matches the precedent we are explicitly following. CIS writes `4.1`. NIST writes `AC-2`.
  Neither embeds the publisher in the identifier.

**Costs and risks**

- **Bare IDs are generic.** `DIS-01` is a plausible identifier in someone else's framework.
  Mitigated by the namespace-qualification rule above, and by the reality that citations
  appear in context.
- **Every existing asset must be swept.** The v0.2 paper, Appendix A, Figure 1, the slides in
  progress, and any partner draft using `ACP-` need updating. This is find-and-replace, but it
  must happen before the content lock (Tue 7/28 EOD), not after.
- **Docs must say this out loud.** `VERSIONING.md` has to state that the identifier is the bare
  form and that no prefix is ever part of identity — otherwise a well-meaning contributor
  reintroduces one.

## Actions

- [ ] Sweep `ACP-` out of `whitepaper.md` and Appendix A — before Tue 7/28 EOD content lock
- [ ] Author `controls.yaml` with bare keys
- [ ] `VERSIONING.md`: state the bare-identifier rule and the namespace-qualification rule
- [ ] Figure 1 (D10) drawn with bare IDs
- [ ] `check-control-ids` fails the build on any `ACP-`-style prefix inside an identifier
- [ ] Tell partners before they draft blogs — a partner citing `ACP-AUT-01` on launch day is
      a broken citation on someone else's property, which we cannot fix
