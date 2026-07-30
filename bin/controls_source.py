"""One reader for whitepaper/controls.yaml, shared by every script that reads it.

These scripts deliberately do not depend on a YAML library — the repository has
no Python dependencies and the gates have to run anywhere. That is fine, but it
meant four scripts each carried their own regex for the same file, and they did
not agree with each other.

The reader they carried had two faults, both invisible while `requirement:` is
the last key in every control record:

  * The continuation group `((?:[ ]+\\S.*\\n?)+)` matched ANY indented line,
    including the next sibling key. Add a `mapping:` key after `requirement:`
    and Appendix A typesets `…deployment. mapping: nist: CM-8` — the key and its
    value folded into the requirement sentence. The same shape had already
    pulled `evidence:` into six `detail:` values on the homepage.
  * Only `>-` was recognised. `>`, `|`, `|-`, `>+` and `|+` are legal YAML and
    mean the same thing to every consumer here, because every consumer collapses
    whitespace. They read back as the literal indicator string, so changing
    `requirement: >-` to `requirement: |-` gives all 35 controls the requirement
    `"|-"`, which build-pdf would typeset into the published appendix.

Both are fixed by reading the block scalar the way YAML defines it — by
indentation — instead of by pattern. A block scalar's content is the run of
lines indented further than its key; the first line at or below the key's own
column ends it, whatever it contains. Prose is not mistaken for a key, and a key
is not mistaken for prose.

Folded (`>`) versus literal (`|`) makes no difference to any caller: all of them
collapse runs of whitespace to single spaces, so the two fold identically here.
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[1]
CATALOGUE = ROOT / "whitepaper" / "controls.yaml"

# `>-`, `>`, `>+`, `|`, `|-`, `|+`, with an optional explicit indentation digit
# in either order. The digit is accepted and ignored: the indentation is taken
# from the content, which is what YAML does when the indicator is absent and
# what every block in this file relies on.
_BLOCK_HEADER = re.compile(r"[|>][+-]?\d*|[|>]\d*[+-]?")

# `[ \t-]*` and not `\s+`: the first field of a list entry carries the dash —
# `  - id: DIS-01` — and an anchor that only allows whitespace matches every
# field except the one that identifies the record. The lead's width is the key's
# column, which is what the block scalar's extent is measured against.
def _key_line(name):
    return re.compile(rf"^(?P<lead>[ \t-]*){re.escape(name)}:[ \t]*(?P<rest>.*?)[ \t]*$")


def field(block, name):
    """The value of `name` in `block`, or None if the key is absent.

    Whitespace is collapsed and surrounding quotes stripped, so callers get the
    same string whether the value was plain, quoted, folded or literal.
    """
    lines = block.split("\n")
    key = _key_line(name)
    for i, line in enumerate(lines):
        m = key.match(line)
        if not m:
            continue
        rest, column = m.group("rest"), len(m.group("lead"))
        if not _BLOCK_HEADER.fullmatch(rest):
            return _clean(rest) if rest else None
        body = []
        for nxt in lines[i + 1:]:
            if not nxt.strip():
                body.append("")
                continue
            if len(nxt) - len(nxt.lstrip(" \t")) <= column:
                break            # a line at or left of the key ends the scalar
            body.append(nxt)
        return _clean("\n".join(body))
    return None


def _clean(value):
    return " ".join(value.split()).strip().strip('"')


def load(text=None):
    """(outcomes, controls) as lists of dicts, in file order."""
    t = CATALOGUE.read_text(encoding="utf-8") if text is None else text
    outcomes, controls = [], []
    for blk in re.split(r"\n(?=  - )", t):
        if not blk.lstrip().startswith("- "):
            continue
        if field(blk, "prefix"):
            outcomes.append({k: field(blk, k) for k in
                             ("prefix", "name", "requirement", "detail", "evidence")})
        elif field(blk, "id"):
            controls.append({k: field(blk, k) for k in
                             ("id", "outcome", "title", "type", "status", "requirement")})
    return outcomes, controls
