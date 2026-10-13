# Changelog

Every change to a control is recorded here, dated and attributed. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Identifier rules are in [VERSIONING.md](VERSIONING.md): superseded, never renumbered,
never reused.

## [Unreleased]

### Added
- *The Secure Software Factory: A Reference Architecture*, version 1 (13 October 2026), a
  second paper that applies the baseline to AI agents that write and ship code. Its source is
  `software-factory/software-factory.md`; its PDF is `/software-factory.pdf`, listed under
  Artifacts after the baseline's. Its page, `/reference-architecture`, shows the paper's four
  security boundaries in a drawing of its own, its three levels of autonomy with the paper's
  Figures 3 to 5, and its eight authors. Every page's utility bar links it, marked New until
  27 October; the homepage names it under the tenets and again in a section after the white
  paper. Comments go through an issue form that applies the
  `software-factory` label; CONTRIBUTING says how. *(2026-10-13, Matthew Creager, Keycard)*
- Both papers and the controls are published as Markdown for agents, at `/whitepaper.md`,
  `/software-factory.md` and `/controls.md`, with each paper's figures beside it at
  `/figures/` and `/software-factory/figures/`. Hugo builds them from `whitepaper.md` and
  `software-factory.md`, the files the PDFs are built from, and from `CONTROLS.md`, and each
  opens with a short header naming its page, its own version and date, and its licence. Each
  page links its Markdown in the head, a request that asks for `text/markdown` is redirected
  to it, and `/llms.txt` and `/llms-full.txt` list and carry all three. The pages describe the
  papers, the catalogue and the site in JSON-LD, each paper with its own version, date and
  authors. Nothing a person sees has changed. `bin/check-seo` holds the build to all of it,
  and Lighthouse scores the pages in CI. *(2026-10-13)*
- The catalogue is served as data, at `/controls.yaml`, mounted from `whitepaper/` so there
  is still one copy of it. `/llms.txt`, the header of `/controls.md` and the controls page's
  JSON-LD point there for it. *(2026-10-13, Nick Tassone, Keycard)*
- The community Slack is linked from the utility bar on every page and, on the homepage,
  from the review section, with the invite address in one place in `hugo.toml`.
  CONTRIBUTING and GOVERNANCE say what belongs in Slack and what belongs in an issue, and
  the vendored Phosphor icons carry their MIT notice. *(2026-09-21)*
- The brand assets are downloadable from the site — the wordmark as SVG and PNG, each for
  light and for dark grounds, the icon, and the animated wordmark for dark grounds. They are listed under Artifacts on every page, and on the
  homepage the wordmark's own right-click menu offers the same set plus copy-as-SVG. They
  are served under an `agent-baseline-` prefix, which is also what they save as: Vercel
  names a same-origin download after the served file, not the `download` attribute.
  `bin/build-brand` now writes the wordmark as real outlines, so it no longer needs the
  Figtree face to render. *(2026-09-18)*

### Changed
- Comment on v1.0-draft closed on 30 September 2026, so the bar no longer shows a deadline,
  the pages' descriptions no longer ask for comment, and the homepage's review section says
  where the comments went: the issues. *(2026-10-13, Matthew Creager, Keycard)*
- The catalogue is rebuilt from Appendix A of the paper as it landed in this repository —
  the appendix declares itself the canonical naming and requirement set, and the body prose
  now agrees with it. 35 controls across the six outcomes: `CON` narrows to 4 controls,
  `AUT` grows to 9, `OBS` to 6, `VAL` becomes 4, and `RES` gains rug-pull protection
  (`RES-05`). Several identifiers were realigned in the process, which is permitted while
  every control is `draft`; the never-renumber promise binds at the v1.0 freeze. This closes
  the paper/Appendix A divergence previously listed under Known issues. *(2026-07-30)*
- Control identifiers are now **prefix-free** — `DIS-01`, not `ACP-DIS-01`. No project name
  appears inside an identifier. See [ADR-0001](docs/decisions/0001-prefix-free-control-ids.md).
  *(2026-07-27)*
