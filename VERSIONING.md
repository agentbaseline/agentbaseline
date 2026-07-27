# Versioning and identifier stability

This document is the promise that makes these controls citable. If we break it, the controls
is worth nothing, because a citation that can silently change meaning is not a citation.

## The identifier

**A control's canonical identifier is the bare form: `DIS-01`, `AUT-03`, `RES-04`.**

- Six families, one per outcome: `DIS` (Discover), `AUT` (Authorize), `CON` (Constrain),
  `VAL` (Validate), `OBS` (Observe), `RES` (Respond).
- **No project name, acronym, or organization ever appears inside an identifier.** Not now,
  not after a rename, not after this work is donated to a community body. See
  [ADR-0001](docs/decisions/0001-prefix-free-control-ids.md).
- `controls.yaml` is the source of truth. The prose renders from it; where they disagree,
  `controls.yaml` wins and the prose is a bug.

### Qualifying an identifier

Where a bare identifier could be ambiguous — a crosswalk table sitting alongside NIST or ISO
identifiers, for example — **qualify by namespace, never by mutating the identifier**:

```
DIS-01 (agentbaseline.org)
agentbaseline.org/DIS-01
```

The identifier stays byte-stable. The namespace is metadata and may change; a citation written
against the bare identifier survives that change.

## The stability promise

**Identifiers are superseded, never renumbered, and never reused.**

Concretely, once a control appears in a tagged release:

| Change | Allowed? | How it works |
|---|---|---|
| Fix a typo, clarify wording | ✅ | Same identifier. Recorded in `CHANGELOG.md`. |
| Materially change what a control requires | ⚠️ | **New identifier.** The old one is marked `superseded` and points at the replacement. |
| Remove a control | ✅ | Marked `withdrawn`, with a reason. It stays in `controls.yaml` forever. |
| Renumber a control | ❌ | **Never.** |
| Reuse a withdrawn or superseded identifier | ❌ | **Never.** The number is burned. |
| Add a control | ✅ | Next unused number in that family. Gaps are expected and fine. |
| Add a new outcome family | ✅ | New three-letter prefix. Existing families are untouched. |

A withdrawn or superseded control is never deleted from `controls.yaml`. Someone's audit report
cites it. They must be able to resolve what it meant.

## Status values

Every control carries one:

- `draft` — under public comment, may change materially without supersession
- `stable` — frozen; material change requires a new identifier
- `superseded` — replaced; carries `superseded_by`
- `withdrawn` — removed; carries a reason, never reused

Until the v1.0 freeze, controls are `draft`. **That is the current state — this is a draft for
public comment, and the identifiers are not yet frozen.** We are telling you that plainly so
you can decide whether to cite yet.

## Releases

- Versions are `MAJOR.MINOR`, with a `-draft` suffix before the freeze — e.g. `v1.0-draft`.
- Every release is a git tag and a GitHub release.
- **`v1.0` is the freeze.** At `v1.0`, every control moves from `draft` to `stable` and the
  supersession rules above become binding.
- `CHANGELOG.md` records every change to any control, dated and attributed.

## Change process

Changes arrive as issues and pull requests against this repository. The accepted-change process
is described in [GOVERNANCE.md](GOVERNANCE.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## Machine-readable

Consume `whitepaper/controls.yaml`. It carries identifier, title, requirement, evidence of
achievement, status, and supersession links. Do not scrape the prose or the figures — they
render from the controls and are not the source of truth.

## If this repository moves

This work is intended for donation to a community body as it matures. **Identifiers do not
change when that happens.** That is the reason they carry no project name. A new steward
inherits the controls, the numbering and this promise intact.
