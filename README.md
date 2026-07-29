# Agent Baseline

**Six security outcomes an enterprise must achieve to run AI agents, and the 33 controls
that evidence them.**

A draft for public comment, versioned in the open, and intended for donation to a community
body as it matures.

| | |
|---|---|
| **Status** | `v1.0-draft` — not a standard, no conformance programme |
| **Identifiers** | not yet frozen; they freeze at `v1.0`. See [VERSIONING.md](VERSIONING.md) before citing |
| **Comment closes** | 30 September 2026 |
| **Source of truth** | [`whitepaper/controls.yaml`](whitepaper/controls.yaml) |

An agent's behaviour is not settled before it ships: an end user reprograms it at runtime,
in natural language. This baseline defines what has to be true to run one safely, by outcome
rather than by product category.

**The argument, in full: [agentbaseline.org](https://enterprise-control-plane-mock.vercel.app)**
— why product categories do not map to the problem, and the three questions the six answer.

## The six outcomes

| | Outcome | Requirement | Controls |
|---|---|---|---|
| **DIS** | Discover | Discover every agent and its dependencies | `DIS-01`–`DIS-07` |
| **CON** | Constrain | Limit components, runtime, data and reach | `CON-01`–`CON-07` |
| **AUT** | Authorize | Bind identity, task, target and authority | `AUT-01`–`AUT-06` |
| **VAL** | Validate | Admit the system and verify outcomes | `VAL-01`–`VAL-05` |
| **OBS** | Observe | Correlate activity and prove what happened | `OBS-01`–`OBS-04` |
| **RES** | Respond | Stop, revoke, quarantine, scope impact | `RES-01`–`RES-04` |

A **category test, not a certification scheme** — and by it, none of the three organizations
that convened this is a complete implementation.

Full text: [`whitepaper/CONTROLS.md`](whitepaper/CONTROLS.md) ·
machine-readable: [`whitepaper/controls.yaml`](whitepaper/controls.yaml)

## Using it

**Reference a control** in an audit finding, a policy document or an RFP response:

```
DIS-01 (Agent Baseline v1.0-draft)
```

Identifiers are bare and permanent: **superseded, never renumbered, never reused.** Where one
could be ambiguous, qualify by namespace rather than mutating it — `DIS-01 (agentbaseline.org)`.
[VERSIONING.md](VERSIONING.md) has the full contract, including what changes force a new
identifier.

**Consume the controls.** One file, one shape:

```yaml
version: "1.0-draft"
outcomes:
  - prefix: DIS
    name: Discover
    requirement: "Discover every agent and its dependencies."
controls:
  - id: DIS-01              # bare, permanent, never reused
    outcome: DIS            # matches an outcomes[].prefix
    title: "Authoritative agent registry"
    status: draft           # draft | stable | superseded | withdrawn
    requirement: >-
      The organization shall maintain an authoritative record with a stable
      identifier for every agent proposed for corporate use…
```

A withdrawn control stays in the file forever, marked, because somebody's audit report cites
it and they have to be able to resolve what it meant.

⟡ **Not yet in the schema:** an `evidence` line per control, and crosswalk references.
[CONTRIBUTING.md](CONTRIBUTING.md) requires evidence of every contributor, and the founding
authors have not yet met their own rule. Tracked as issue #1.

## What's here

| Path | |
|---|---|
| [`whitepaper/`](whitepaper/) | The paper, the controls, and the figure |
| [`crosswalks/`](crosswalks/) | Mappings to NIST, ISO, OWASP and CIS — wanted, and better written from outside |
| [`docs/decisions/`](docs/decisions/) | Decision records, including why identifiers carry no prefix |
| [`bin/`](bin/) | Generators, and the checks that keep them honest |
| `layouts/`, `content/` | The site, which renders from `controls.yaml` |

## Working on this

Everything a reader sees is generated. Edit `controls.yaml`; never edit a derived file.

```sh
python3 whitepaper/figures/build-figure-1.py   # the figure, from controls.yaml
python3 bin/sync-figure-partial                # theme-aware copy for the site
python3 bin/render-controls                    # CONTROLS.md
hugo --gc --minify                             # the site, into public/
python3 bin/build-pdf                          # the PDF, via pandoc and Chrome
python3 bin/build-social                       # the 1200x630 card
```

Three checks run in CI and are worth running before you push. Each one exists because
something broke and nothing caught it:

```sh
python3 bin/check-controls   # identifiers, required fields, paper/controls agreement
python3 bin/check-figure     # figure geometry: overlaps, containment, arrows, stale ranges
python3 bin/check-copy       # repeated phrasing, dead titles, self-contradictions
```

`bin/snapshot <n> "<label>"` freezes a build into `docs/passes/`, so a visual regression is
visible rather than inferred.

## Scope and non-goals

**In scope:** agents that can affect enterprise resources or business outcomes — accessing
sensitive data, invoking an internal API, updating a system of record.

**Not in scope:** a generic AI ethics framework, a model-development standard, or a product
comparison.

## Contributing

What is wanted most is a crosswalk to a framework you already run: a mapping written from
outside carries more weight than another control written from inside.

[CONTRIBUTING.md](CONTRIBUTING.md) has the format and how to file. [GOVERNANCE.md](GOVERNANCE.md)
has who decides, and how you become one of them.

## Provenance

Convened by Docker, Keycard and Snyk, all of which sell into the area this document describes.
[PROVENANCE.md](PROVENANCE.md) discloses the commercial interests; [MAINTAINERS.md](MAINTAINERS.md)
names the authors individually.

## License

Prose and figures: [CC BY 4.0](LICENSE). Schemas and `controls.yaml`:
[Apache-2.0](LICENSE-schemas).

⟡ Pending legal confirmation. If this is donated to CNCF, its charter requires the Community
Specification License for a specification not tied to an implementation — worth settling
before publication rather than retro-licensing across three legal teams.
