# Changelog

Every change to a control is recorded here, dated and attributed. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Identifier rules are in [VERSIONING.md](VERSIONING.md): superseded, never renumbered,
never reused.

## [Unreleased]

### Changed
- Control identifiers are now **prefix-free** — `DIS-01`, not `ACP-DIS-01`. No project name
  appears inside an identifier. See [ADR-0001](docs/decisions/0001-prefix-free-control-ids.md).
  *(2026-07-27)*

### Known issues
- ⟡ The body of the paper and Appendix A do not yet agree on the contents of the `CON`, `VAL`
  and `OBS` families. Reconciliation is tracked publicly — see the issues. `DIS`, `AUT` and
  `RES` agree. **Until this closes, treat the affected identifiers as unstable.**
