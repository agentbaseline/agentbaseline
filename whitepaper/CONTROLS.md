# Controls

<!-- GENERATED FROM controls.yaml BY bin/render-controls — DO NOT EDIT -->

`1.0-draft` · 33 controls across 6 outcomes.
Identifiers are bare and permanent — superseded, never renumbered, never reused.
See [VERSIONING.md](../VERSIONING.md).

## Contents

- [Discover](#discover) · `DIS-01`–`DIS-07`
- [Constrain](#constrain) · `CON-01`–`CON-07`
- [Authorize](#authorize) · `AUT-01`–`AUT-06`
- [Validate](#validate) · `VAL-01`–`VAL-05`
- [Observe](#observe) · `OBS-01`–`OBS-04`
- [Respond](#respond) · `RES-01`–`RES-04`

## Discover

*Discover every agent and its dependencies.*

#### `DIS-01` — Authoritative agent registry

The organization shall maintain an authoritative record with a stable identifier for every agent proposed for corporate use or given access to corporate data or systems.

#### `DIS-02` — Authoritative component registry

The organization shall maintain an inventory of agentic components discovered or made available for corporate use, including models, instructions, MCP servers, skills, plugins and tools with documented record of source, accountable owner, version and approval status.

#### `DIS-03` — Ownership and risk context

Every registered agent shall have a documented business purpose, accountable business and technical owners, and risk classification.

#### `DIS-04` — Status and decision history

Every registered agent shall record its current operating status and approval or exception status. Exceptions shall have an accountable risk owner and expiry date. Records for retired agents and previous approved versions shall be retained.

#### `DIS-05` — Automated discovery and reconciliation

The organization shall compare agent and component registries against evidence from source, cloud, endpoint, identity, SaaS, gateway, and runtime systems.

#### `DIS-06` — Agent composition mapping

Every registered agent shall be linked to the components and other agents it uses, including deployed versions where available. The organization shall be able to identify every agent affected by a vulnerable or compromised component.

#### `DIS-07` — Effective-access mapping

Every registered agent shall be mapped to the identities and credentials it uses and the data, systems and actions those identities permit, including access obtained through its components.

## Constrain

*Limit components, runtime, data and reach.*

#### `CON-01` — Agentic System Manifest

Every production agent shall have a versioned manifest covering models, instructions, tools, agents, data, memory, dependencies, runtime, providers, approvals and tests.

#### `CON-02` — Toxic-flow analysis

The organization shall identify and break dangerous paths among untrusted inputs, sensitive data, external communication and destructive capabilities.

#### `CON-03` — Component least privilege and trust boundaries

Each component shall receive only the identity, permissions, data and communication paths required for its function, with controls at external or lower-trust boundaries.

#### `CON-04` — Isolated execution

Agent-controlled code and tools shall execute within a risk-appropriate process or workload boundary separated from unrelated hosts, projects, credentials and workloads.

#### `CON-05` — Filesystem, network and resource confinement

Runtime policy shall restrict filesystem access, network destinations, credential delivery, compute, duration, process count, persistence and retained state.

#### `CON-06` — Approved and verified components

Agents shall use only registered and policy-approved models, packages, tools, APIs, MCP servers, skills, plugins and downstream agents that pass required provenance, integrity, vulnerability, malware, licence and compliance checks.

#### `CON-07` — Runtime component and generated-artifact policy

Runtime enforcement shall prevent component substitution or drift and shall test and scan material generated artifacts before release.

## Authorize

*Bind identity, task, target and authority.*

#### `AUT-01` — Distinct identity and action attribution

Every consequential action shall be attributable to a distinct agent and deployment identity, the initiating principal or approved autonomous purpose, the run, task, target and time.

#### `AUT-02` — Purpose- and task-bound authority

Authority shall be limited by purpose, task, target resource, action, data scope, limits, jurisdiction, approval conditions and validity period.

#### `AUT-03` — Delegation attenuation

A downstream agent shall receive no more authority than its caller holds, and every delegation hop shall preserve the origin context and be recorded.

#### `AUT-04` — Just-in-time credentialing

Short-lived, resource-scoped credentials or action permits shall be issued only after authorization and shall not be stored in model context, memory or agent-accessible files.

#### `AUT-05` — Independent approval

Actions outside the approved autonomy or impact boundary shall require approval by a person or deterministic control independent of the requesting agent.

#### `AUT-06` — Fail-closed authorization and circuit breaking

Material actions shall be denied or halted when identity, policy, context, evidence, approval or target-state requirements cannot be verified. Constrain

## Validate

*Admit the system and verify outcomes.*

#### `VAL-01` — Deployment admission

An agent shall not be deployed unless its identity, manifest, purpose, risk profile, policy, runtime profile and validation evidence are present, approved and current.

#### `VAL-02` — Agent-specific security testing

Agents shall be tested for prompt injection, jailbreaking, tool misuse, data exfiltration, boundary bypass, unsafe autonomy and other relevant abuse cases before deployment and after material change.

#### `VAL-03` — Third-party assurance

Third-party agents and components shall be assessed for data handling, provenance, providers, administration, auditability, autonomous capabilities, subcontractors, vulnerabilities, compliance and exit options.

#### `VAL-04` — Independent outcome validation

Material decisions, communications, generated artifacts and transactions shall be checked against source data, business rules, policy and expected effect before release or completion.

#### `VAL-05` — Material-change revalidation

Changes to models, instructions, tools, data, permissions, runtime, providers, purpose or behavior shall trigger reassessment and re-admission when they may invalidate the approved state.

## Observe

*Correlate activity and prove what happened.*

#### `OBS-01` — Agent-native telemetry

The organization shall record the initiating principal, agent, deployment, run, task, model, tool invocation, target, policy decision, requested action, executed action, result and outcome.

#### `OBS-02` — End-to-end correlation and behavior monitoring

Correlation identifiers shall propagate across models, agents, MCP servers, tools and target systems, and monitoring shall detect anomalous access, tool use, destinations, resource consumption and drift.

#### `OBS-03` — Intent-to-outcome evidence

Every material outcome shall be traceable to business intent, identities, composition, delegated authority, policy, approvals, actions, validation and target-system results.

#### `OBS-04` — Evidence integrity, completeness and protection

Evidence shall use consistent timestamps, appropriate integrity protection, completeness checks, access control, redaction, encryption, retention, deletion and legal-hold rules.

## Respond

*Stop, revoke, quarantine and scope impact.*

#### `RES-01` — Immediate stop and authority revocation

The organization shall be able to stop an agent, prevent new work and revoke active credentials, permits, delegated grants and sessions within a period appropriate to maximum impact.

#### `RES-02` — Version and component quarantine

The organization shall be able to block affected agent versions, models, tools, skills, plugins, MCP servers and other components from further use.

#### `RES-03` — Impact scoping and evidence preservation

The organization shall preserve relevant evidence and identify affected resources, records, customers, transactions, agent versions and dependencies.

#### `RES-04` — Safe failure and non-agent fallback

Unverified high-impact actions shall fail closed, and essential workflows shall provide an approved non-agent fallback where continuity requires one.
