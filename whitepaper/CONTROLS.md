# Controls

<!-- GENERATED FROM controls.yaml BY bin/render-controls — DO NOT EDIT -->

`1.0-draft` · 35 controls across 6 outcomes.
Identifiers are bare and permanent — superseded, never renumbered, never reused.
See [VERSIONING.md](../VERSIONING.md).

## Contents

- [Discover](#discover) · `DIS-01`–`DIS-07`
- [Constrain](#constrain) · `CON-01`–`CON-04`
- [Authorize](#authorize) · `AUT-01`–`AUT-09`
- [Observe](#observe) · `OBS-01`–`OBS-06`
- [Validate](#validate) · `VAL-01`–`VAL-04`
- [Respond](#respond) · `RES-01`–`RES-05`

## Discover

*Discover every agent and its dependencies.*

#### `DIS-01` — Authoritative agent registry

Maintains a stable identifier and authoritative record for each in-scope agent definition or deployment.

#### `DIS-02` — Ownership and risk context

Records each agent's business purpose, accountable business and technical owners, and risk classification, which selects the applicable assurance profile.

#### `DIS-03` — Status and decision history

Records current operating, approval and exception status, including the accountable exception owner and expiry date, while retaining previous approved versions and retired agents.

#### `DIS-04` — Authoritative component registry

Inventories agentic components discovered or made available for corporate use, including models, instructions, MCP servers, skills, plugins and tools, together with source, owner, version.

#### `DIS-05` — Agent composition mapping

Maps each agent to its approved and observed components and downstream agents, including runtime-resolved versions, and identifies affected agents or runs when a component is vulnerable or compromised.

#### `DIS-06` — Effective-access mapping

Maps each agent to the identities and credentials it may use and the data, systems and actions those identities permit, including access obtained through components. Material runs also record the authority actually delegated.

#### `DIS-07` — Automated discovery and reconciliation

Compares the agent and component registries with evidence from source, cloud, endpoint, identity, SaaS, gateway, network and runtime systems and identifies discrepancies for reconciliation.

## Constrain

*Limit components, runtime, data and reach.*

#### `CON-01` — Admission enforcement

Blocks deployment of an agent or individual agentic component unless it is registered, risk-classified and approved; the exact release has validation evidence; and the approved configuration and runtime boundaries will be enforced.

#### `CON-02` — Toxic capability combinations

Identifies dangerous combinations of capabilities, such as “lethal trifecta”. Detects both known toxic combinations and emergent ones by modelling how agent inputs, tools, permissions and actions connect as they evolve, and removes or constrains those combinations.

#### `CON-03` — Isolated and confined execution

Runs agent-controlled code and tools inside a risk-appropriate boundary separated from the host, unrelated projects, credentials and workloads, and scopes filesystem, network, credential delivery, compute, duration, process count, persistence and retained state to least privilege.

#### `CON-04` — Use-case-scoped capability profiles

Runtime scope (filesystem, network destinations, credential delivery, compute and duration) shall be granted through centrally governed capability profiles bound to a team or use case. Profiles shall be bounded, versioned and assigned through an auditable process.

## Authorize

*Bind identity, task, target and authority.*

#### `AUT-01` — Distinct identity and action attribution

Associates each consequential action with the relevant agent identity, initiating principal or approved autonomous purpose, deployment, run, task, target and time.

#### `AUT-02` — Purpose and task-bound authority

Determines the authority available for an action or bounded class of actions according to purpose, task, target resource, action, data scope, limits, jurisdiction, approval conditions and validity period.

#### `AUT-03` — Delegation attenuation

Prevents a downstream agent from receiving more authority than its caller holds, preserves the originating context and records each delegation hop.

#### `AUT-04` — Just-in-time credentialing

Issues short-lived, resource-scoped credentials or action permits after authorization and keeps them outside model context, memory and agent-accessible files.

#### `AUT-05` — Independent approval

Routes actions that are within the agent's granted authority but above its approved autonomy or impact threshold to a person or deterministic decision point independent of the requesting agent, which must approve the specific action before execution.

#### `AUT-06` — Fail-closed authorization and circuit breaking

Denies or halts material actions when required identity, policy, context, evidence, approval or target-state information cannot be verified.

#### `AUT-07` — Step-up verification

Requires the initiating principal to re-verify, re-authentication, a stronger factor or renewed consent, before an action within the agent's authority and autonomy boundary proceeds, when the action's risk exceeds the assurance of the current session or delegation context.

#### `AUT-08` — Just-in-time authority elevation

Provides a governed request path for actions the agent's current grant does not cover, issuing a temporary scope- and time-bounded elevation that expires automatically and is recorded with requester, justification and approver; granting may itself invoke independent approval or step-up verification.

#### `AUT-09` — Proof-of-possession credential binding

Binds issued credentials and action permits to the authorized holder through sender-constrained mechanisms, so that possession of an exfiltrated credential is insufficient to act with it.

## Observe

*Correlate activity and prove what happened.*

#### `OBS-01` — Agent-native telemetry

Records the initiating principal, agent, deployment, run, effective runtime composition, task, model, tool invocation, target, policy decision, requested action, executed action, result and outcome.

#### `OBS-02` — End-to-end correlation

Uses stable run or trace identifiers to link events across agents, models, MCP servers, tools, policy and enforcement points and target systems.

#### `OBS-03` — Behaviour and drift monitoring

Detects unexpected changes in data access, tool use, destinations, token or resource consumption and other behaviour relative to the agent's approved purpose and established baseline.

#### `OBS-04` — Unintended action detection

Detects harmful actions that are technically permitted but clearly inconsistent with the intended task, such as committing credentials alongside code to an approved repository.

#### `OBS-05` — Intent-to-outcome evidence

Links every material outcome to business intent, identities, composition, delegated authority, policy, approvals, actions, validation and target-system results.

#### `OBS-06` — Evidence integrity, completeness and protection

Provides consistent timestamps, integrity protection, completeness checks, access control, redaction, encryption, retention, deletion and legal-hold handling for agentic evidence.

## Validate

*Admit the system and verify outcomes.*

#### `VAL-01` — Agent-specific security testing

Tests each agent in its intended configuration and operating context against adversarial scenarios derived from its tools, data access and action boundaries, using defined expected outcomes and acceptable failure thresholds. Repeats testing after deployment when the agent or its operating context materially changes.

#### `VAL-02` — First-party agentic components testing

Tests each releasable version of an internally developed agentic component using security checks appropriate to its type and abuse scenarios derived from its inputs, privileges, data access and outputs, with defined pass criteria.

#### `VAL-03` — Agent-generated artifact testing

Tests code, configuration and other artifacts created or modified by agents against the security, quality and licensing requirements applicable to equivalent human-produced artifacts.

#### `VAL-04` — Agent outcome validation

Validates the business outcomes and outputs of agent actions after completion using automated checks or human review. For high-impact or irreversible actions, also validates the proposed outcome before it is finalized.

## Respond

*Stop, revoke, quarantine and scope impact.*

#### `RES-01` — Immediate stop and authority revocation

Stops an agent, prevents new work and revokes active credentials, permits, delegated grants and sessions within a response period appropriate to the potential impact.

#### `RES-02` — Version and component quarantine

Blocks affected agent versions, models, tools, skills, plugins, MCP servers and other components from further use.

#### `RES-03` — Impact scoping and evidence preservation

Preserves relevant evidence and identifies affected resources, records, customers, transactions, agent versions and dependencies.

#### `RES-04` — Safe failure and non-agent fallback

Denies unverified high-impact actions and provides an approved non-agent fallback for essential workflows where continuity requires one.

#### `RES-05` — Agentic component rug-pull protection

Blocks rug-pull changes to agentic components, including unapproved changes to their code, instructions, tool definitions, requested permissions or integrity references.
