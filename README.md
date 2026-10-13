# Agent Baseline

**Six security outcomes an enterprise must achieve to run AI agents, and the 35 controls
that evidence them.**

A working draft for community review, versioned in the open, and intended for donation to a
community body as it matures.

| | |
|---|---|
| **Status** | `v1.0-draft` — not a standard, no conformance programme |
| **Identifiers** | not yet frozen; they freeze at `v1.0`. See [VERSIONING.md](VERSIONING.md) before citing |
| **Comment** | closed 30 September 2026 |
| **Source of truth** | [`whitepaper/controls.yaml`](whitepaper/controls.yaml) |

An agent's behaviour is not settled before it ships: an end user reprograms it at runtime,
in natural language. This baseline defines what has to be true to run one safely, by outcome
rather than by product category.

**The argument, in full: [agentbaseline.org](https://agentbaseline.org)**
— why product categories do not map to the problem, and the three questions the six answer.

Built on the baseline: [The Secure Software Factory: A Reference
Architecture](https://agentbaseline.org/reference-architecture), version 1 (13 October 2026).
It applies the baseline to AI agents that write and ship code: four security boundaries that
hold at three levels of autonomy. Source in [`software-factory/`](software-factory/).

## The six outcomes

| | Outcome | Requirement | Controls |
|---|---|---|---|
| **DIS** | Discover | Discover every agent and its dependencies | `DIS-01`–`DIS-07` |
| **CON** | Constrain | Limit components, runtime, data and reach | `CON-01`–`CON-04` |
| **AUT** | Authorize | Bind identity, task, target and authority | `AUT-01`–`AUT-09` |
| **OBS** | Observe | Correlate activity and prove what happened | `OBS-01`–`OBS-06` |
| **VAL** | Validate | Admit the system and verify outcomes | `VAL-01`–`VAL-04` |
| **RES** | Respond | Stop, revoke, quarantine and scope impact | `RES-01`–`RES-05` |

A **category test, not a certification scheme** — and by it, none of the three organizations
that convened this is a complete implementation.

Full text: [`whitepaper/CONTROLS.md`](whitepaper/CONTROLS.md) ·
machine-readable: [`whitepaper/controls.yaml`](whitepaper/controls.yaml)

**For agents:** the site serves both papers and the controls as Markdown, at
[`/whitepaper.md`](https://agentbaseline.org/whitepaper.md),
[`/software-factory.md`](https://agentbaseline.org/software-factory.md) and
[`/controls.md`](https://agentbaseline.org/controls.md), serves the catalogue itself at
[`/controls.yaml`](https://agentbaseline.org/controls.yaml), and lists them all in
[`/llms.txt`](https://agentbaseline.org/llms.txt). The Markdown is built from the same
files as the PDFs, so the text an agent quotes is the text a reader prints.

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
    type: Record            # Record | Detection | Enforcement | Decision | Evidence | Assurance | Response
    status: draft           # draft | stable | superseded | withdrawn
    requirement: >-
      Maintains a stable identifier and authoritative record for each in-scope
      agent definition or deployment.
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
| [`software-factory/`](software-factory/) | The Secure Software Factory, the second paper, built on the baseline |
| [`crosswalks/`](crosswalks/) | Mappings to NIST, ISO, OWASP and CIS — wanted, and better written from outside |
| [`docs/decisions/`](docs/decisions/) | Decision records, including why identifiers carry no prefix |
| [`bin/`](bin/) | Generators, and the checks that keep them honest |
| `layouts/`, `content/` | The site, which renders from `controls.yaml` and `software-factory/` |

## Working on this

Everything a reader sees is generated. Edit `controls.yaml`; never edit a derived file.

```sh
python3 whitepaper/figures/build-figure-1.py      # the white paper's Figure 1, from controls.yaml
python3 software-factory/figures/build-figures.py # the reference architecture's figures
python3 bin/sync-figure-partial                   # theme-aware copies for the site, both papers
node bin/build-architecture-drawing.mjs           # the reference architecture page's own drawing
python3 bin/render-controls                       # CONTROLS.md
hugo --gc --minify                                # the site, into public/
python3 bin/build-pdf                             # the white paper's PDF, via pandoc and Chrome
python3 bin/build-pdf --paper software-factory    # the reference architecture's PDF
python3 bin/build-social                          # the white paper's 1200x630 card
python3 bin/build-social --paper software-factory # the reference architecture's card
```

These checks run in CI and are worth running before you push. Each one exists because
something broke and nothing caught it:

```sh
python3 bin/check-controls      # identifiers, required fields, paper/controls agreement
python3 bin/check-figure        # figure geometry: overlaps, containment, arrows, stale ranges
for f in software-factory/figures/figure-*.svg; do python3 bin/check-figure "$f"; done
                                # the same, for each of the reference architecture's figures
python3 bin/check-copy          # repeated phrasing, dead titles, self-contradictions
python3 bin/check-appendix      # Appendix A still agrees with the catalogue
python3 bin/check-bindings      # templates only read fields the catalogue has
python3 bin/check-js            # scripts parse, source and minified
python3 bin/check-pdf-current   # each committed PDF is the one its source builds
python3 bin/check-seo           # what crawlers and agents are told: meta, JSON-LD, llms.txt
```

`check-seo` reads `public/`, so it runs after `hugo`. Lighthouse runs in CI as its own job;
to score the build locally, `npx --yes @lhci/cli@0.15.1 autorun` (thresholds in
`lighthouserc.cjs`).

`check-pdf-current` needs nothing but Python. It compares the tree against
`whitepaper/pdf.provenance.json`, which `bin/build-pdf` writes as it renders — the digest
of every file the render read, and of the PDF it produced. **Edit the paper and you must
rebuild: commit `static/whitepaper.pdf` and `whitepaper/pdf.provenance.json` together.**
The reference architecture is the same with `--paper software-factory`, committing
`static/software-factory.pdf` and `software-factory/pdf.provenance.json`. Its build refuses a
missing figure, and alt text that is empty or a TODO unless `--draft`, which stamps every
page and cannot write the tracked PDF.

`bin/build-pdf` drives the browser named by `CHROME=` (by default
`/Applications/Google Chrome.app`), and the committed bytes depend on its exact build. Both
PDFs were built on Chrome for Testing on macOS: the white paper on 150.0.7871.124, the
reference architecture on 154.0.8037.57. Each manifest's `built_by` names it
(`HeadlessChrome/150`, `HeadlessChrome/154`); rebuild a paper on that browser, or its bytes
change. CI installs Chrome for Testing with `npx @puppeteer/browsers install chrome@<version>`;
point `CHROME=` at the binary it prints.

```sh
python3 bin/check-pdf-reproducible   # two builds of this source produce the same bytes
```

That one drives Chrome, so it only answers on the machine that built the artifact. The
committed PDF carries the browser build and the operating system that made it, and the
same source on another platform comes out a different size — so it will tell you it
cannot judge rather than blame the paper. CI asks the determinism question the portable
way instead, building twice on a pinned browser and comparing those two builds.

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
[Apache-2.0](LICENSE-schemas). Icons: [Phosphor](https://phosphoricons.com), vendored under
`layouts/partials/icons`, [MIT](LICENSE-icons).

⟡ Pending legal confirmation. If this is donated to CNCF, its charter requires the Community
Specification License for a specification not tied to an implementation — worth settling
before publication rather than retro-licensing across three legal teams.
