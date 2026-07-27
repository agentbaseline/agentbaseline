# Agent Baseline

**A baseline of security outcomes for running AI agents in the enterprise.**
A draft for public comment, versioned in the open, and intended for donation to a
community body as it matures.

> ⟡ **Working draft.** Names, scope and identifiers on this page are not yet final. See
> [VERSIONING.md](VERSIONING.md) for what is and is not safe to cite today.

Enterprises are provisioning a programmable actor, not fixed-function software. An agent's
effective behaviour is not fully defined before deployment: an end user can reprogram it at
runtime in natural language, changing what it does and how it uses approved tools and data.
Existing controls still matter, but they were not built for that combination of runtime
programmability, access and autonomy.

The baseline defines the security outcomes an enterprise must achieve, by outcome rather
than by product category.

## The six outcomes

| | Outcome | Requirement |
|---|---|---|
| **DIS** | Discover | Discover every agent and its dependencies |
| **AUT** | Authorize | Bind identity, task, target and authority |
| **CON** | Constrain | Limit components, runtime, data and reach |
| **VAL** | Validate | Admit the system and verify outcomes |
| **OBS** | Observe | Correlate activity and prove what happened |
| **RES** | Respond | Stop, revoke, quarantine, scope impact |

The six are the **minimum category test**. A product may implement one or more; end-to-end
control requires all six through an integrated architecture. By the baseline's own test, no single
vendor is a complete implementation — including the ones who wrote it.

## What's here

| Path | |
|---|---|
| [`whitepaper/`](whitepaper/) | The paper, the controls (`controls.yaml`), and figures |
| [`crosswalks/`](crosswalks/) | Mappings to NIST, ISO and OWASP ⟡ *committed, not yet written* |
| [`docs/decisions/`](docs/decisions/) | Architecture decision records |

## Scope and non-goals

**In scope:** agents that can affect enterprise resources or business outcomes — accessing
sensitive data, invoking an internal API, updating a system of record.

**Not in scope:** a generic AI ethics framework, a model-development standard, or a product
comparison. The baseline does not prescribe how a model reasons. It governs the conditions
under which an agent and each material action may proceed.

## How to cite

Cite the bare identifier and the release tag:

> `DIS-01` (agentbaseline.org, v1.0-draft)

Identifiers are **superseded, never renumbered, and never reused**. They carry no project name
so that a rename — or a donation to a community body — never breaks a citation you have
already published. Read [VERSIONING.md](VERSIONING.md) before citing.

## Contributing

Read → comment → contribute. Open an issue against a specific control identifier, or a pull
request for a crosswalk, a test method, or a correction. See
[CONTRIBUTING.md](CONTRIBUTING.md) and [GOVERNANCE.md](GOVERNANCE.md).

**Public comment is open until ⟡ (date).** Working-group membership is earned through sustained
contribution, not a form.

## Provenance

This work was convened by commercially interested parties. Who they are, what they sell, and
which outcomes they sell into is disclosed in [PROVENANCE.md](PROVENANCE.md) — read it before
you weigh anything here.

## License

Prose and figures: [CC BY 4.0](LICENSE). Schemas and `controls.yaml`:
[Apache-2.0](LICENSE-schemas). ⟡ pending legal confirmation.
