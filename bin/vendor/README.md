# Vendored build dependencies

## paged.polyfill.js — Paged.js v0.4.3, MIT

<https://pagedjs.org> · <https://gitlab.coko.foundation/pagedjs/pagedjs>

Chrome's print engine implements almost none of CSS Paged Media. It cannot
place a page number in a margin box, cannot carry a running header, and cannot
resolve `target-counter()` — which is what turns a contents entry into a page
reference rather than a dead link. `bin/build-pdf` needs all three, so the
document is paginated by Paged.js in the browser before Chrome prints it.

Vendored rather than fetched at build time so the paper can be rebuilt from a
clean checkout with no network, and so the bytes that produced a published PDF
are the bytes in the tree. MIT licence text ships inside the file's header.

Nothing here is served to the web: `bin/` is outside Hugo's mounts, and this
file is only ever loaded from `file://` by the local print run.
