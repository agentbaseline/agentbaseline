# Changelog

Every change to a control is recorded here, dated and attributed. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Identifier rules are in [VERSIONING.md](VERSIONING.md): superseded, never renumbered,
never reused.

## [Unreleased]

### Added
- The brand assets are downloadable from the site — the wordmark as SVG and PNG, each for
  light and for dark grounds, the icon, and the animated wordmark for dark grounds. They are listed under Artifacts on every page, and on the
  homepage the wordmark's own right-click menu offers the same set plus copy-as-SVG. They
  are served under an `agent-baseline-` prefix, which is also what they save as: Vercel
  names a same-origin download after the served file, not the `download` attribute.
  `bin/build-brand` now writes the wordmark as real outlines, so it no longer needs the
  Figtree face to render. *(2026-09-18)*

### Changed
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
