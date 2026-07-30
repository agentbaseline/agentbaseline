/* Print a local HTML file to PDF, waiting for Paged.js to finish first.
 *
 * Chrome's `--print-to-pdf` flag prints on the load event. Paged.js does its
 * work after that — it measures, breaks and reflows the whole document into
 * page boxes — so the flag captures an unpaginated document and writes a
 * one-page PDF. `--virtual-time-budget` does not help: it fast-forwards timers
 * rather than waiting for layout to settle.
 *
 * The flag also cannot print backgrounds, so every washed panel, rule and
 * accent fill would come out white.
 *
 * So we drive the browser over DevTools: navigate, run Paged.js ourselves and
 * await its promise, then ask for the PDF. Node's built-in WebSocket means no
 * dependency for any of it.
 *
 *   node bin/print-page.mjs <input.html> <output.pdf>
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: print-page.mjs <input.html> <output.pdf>");
  process.exit(2);
}

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333 + (process.pid % 500);

/* Two builds of identical source produced PDFs differing in 32 bytes, so the
 * committed static/whitepaper.pdf showed as modified on every rebuild. On a 1MB
 * binary that diff is unreadable, which means review cannot tell "rebuilt" from
 * "the text changed" — the same blindness that let a missing sentence publish.
 *
 * Only two things vary, and neither is content:
 *
 *   /CreationDate and /ModDate — wall-clock, straight from Skia.
 *   node00000534 → node00000532 — Chrome names tagged-PDF structure nodes from a
 *     counter that is not document-relative, so the base shifts between browser
 *     launches. 26 bytes across 22 objects, all inside the /O /Table structures.
 *
 * Both are rewritten here. Every substitution is LENGTH-PRESERVING and that is
 * not a stylistic choice: a PDF's xref table stores absolute byte offsets, so a
 * replacement one byte shorter silently corrupts every object after it. The
 * helper refuses any edit that would change the length, and the whole function
 * refuses to return a buffer whose size has moved.
 *
 * Dates come from SOURCE_DATE_EPOCH (the reproducible-builds convention);
 * bin/build-pdf sets it from the paper's own published date, so the PDF is
 * stamped with the date of the document rather than the date of the build. With
 * the variable unset the dates are left alone — a standalone invocation is not
 * expected to be reproducible, and inventing a 1970 timestamp would be worse. */
function sameLength(replacement, original) {
  if (replacement.length !== original.length) {
    throw new Error(
      `refusing a normalisation that changes length (${original.length} -> ` +
      `${replacement.length}); it would invalidate every xref offset after it`
    );
  }
  return replacement;
}

function normalise(buf) {
  // latin1 is a byte-for-byte round trip, so string length is byte length.
  const before = buf.length;
  let s = buf.toString("latin1");

  const epoch = process.env.SOURCE_DATE_EPOCH;
  if (epoch && /^\d+$/.test(epoch)) {
    const d = new Date(Number(epoch) * 1000);
    const p = (n, w = 2) => String(n).padStart(w, "0");
    const stamp = `D:${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
                  `${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}+00'00'`;
    s = s.replace(/\/(CreationDate|ModDate) \(D:[^)]*\)/g, (m, key) =>
      sameLength(`/${key} (${stamp})`, m));
  }

  // Renumber the structure-tree nodes from 1, in their existing order. The names
  // are opaque identifiers referenced from /ID, /Headers, /Limits and /Names; a
  // consistent rename keeps every reference intact. Sorting the originals and
  // assigning sequentially also preserves the ordering the /Names tree requires,
  // because the only difference between builds is a constant offset.
  const names = [...new Set(s.match(/node\d{8}/g) ?? [])].sort();
  if (names.length && names.length < 1e8) {
    const map = new Map(names.map((n, i) => [n, `node${String(i + 1).padStart(8, "0")}`]));
    s = s.replace(/node\d{8}/g, (n) => sameLength(map.get(n) ?? n, n));
  }

  const outBuf = Buffer.from(s, "latin1");
  if (outBuf.length !== before) {
    throw new Error(`normalisation changed the file size (${before} -> ${outBuf.length})`);
  }
  return outBuf;
}

const chrome = spawn(CHROME, [
  "--headless", "--disable-gpu", "--no-sandbox",
  "--allow-file-access-from-files",
  "--font-render-hinting=none",
  `--remote-debugging-port=${PORT}`,
  "about:blank",
], { stdio: ["ignore", "ignore", "ignore"] });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function endpoint() {
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const tabs = await r.json();
      const page = tabs.find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(100);
  }
  throw new Error("Chrome did not expose a DevTools endpoint");
}

let id = 0;
const pending = new Map();
const waiters = [];

function send(ws, method, params = {}) {
  const msg = { id: ++id, method, params };
  return new Promise((resolve, reject) => {
    pending.set(msg.id, { resolve, reject });
    ws.send(JSON.stringify(msg));
  });
}

function waitFor(method) {
  return new Promise((resolve) => waiters.push({ method, resolve }));
}

const ws = new WebSocket(await endpoint());
await new Promise((r) => (ws.onopen = r));

ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(m.error.message)) : resolve(m.result);
  } else if (m.method) {
    for (let i = waiters.length - 1; i >= 0; i--) {
      if (waiters[i].method === m.method) { waiters[i].resolve(m.params); waiters.splice(i, 1); }
    }
  }
};

try {
  await send(ws, "Page.enable");
  await send(ws, "Runtime.enable");

  const loaded = waitFor("Page.loadEventFired");
  await send(ws, "Page.navigate", { url: pathToFileURL(input).href });
  await loaded;

  // Paged.js is configured with auto:false in the document, so nothing has run
  // yet and we own the timing. preview() resolves once every page box exists.
  const res = await send(ws, "Runtime.evaluate", {
    expression: `(async () => {
      if (!window.PagedPolyfill) return { ok: false, why: "Paged.js did not load" };
      await document.fonts.ready;
      const r = await window.PagedPolyfill.preview();
      return { ok: true, pages: r.total };
    })()`,
    awaitPromise: true, returnByValue: true,
  });
  const out = res.result?.value;
  if (!out?.ok) throw new Error(out?.why || "pagination failed");

  /* Paged.js finds page breaks by letting content spill into a second CSS column
   * that it pushes about 1200px to the right, off the sheet, where
   * `.pagedjs_sheet { overflow: hidden }` clips it away. Content the fragmenter
   * fails to carry onto the next page stays laid out in that column: present in
   * the DOM, absent from the paint, invisible in the PDF. Nothing failed, nothing
   * warned, the page count did not change, and the file published missing 92
   * characters of the Discover section — the sentences establishing that
   * observation is universal while registration is threshold-based, so the
   * paragraph that follows no longer parsed.
   *
   * pdftotext is the only reason anyone found it. So check it here, while the
   * laid-out document still exists: anything to the right of its own page's
   * content box is stranded and will not be printed. Fail the build rather than
   * write a PDF that is quietly missing a sentence. */
  const stranded = await send(ws, "Runtime.evaluate", {
    expression: `(() => {
      const found = [];
      for (const [i, page] of [...document.querySelectorAll(".pagedjs_page")].entries()) {
        const content = page.querySelector(".pagedjs_page_content");
        if (!content) continue;
        const edge = content.getBoundingClientRect().right;
        const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          if (!(node.textContent || "").trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          // 1px of tolerance, for sub-pixel rounding on a line that does fit.
          const off = [...range.getClientRects()].some((r) => r.width > 0 && r.left > edge + 1);
          if (off) {
            found.push({ page: i + 1, text: (node.textContent || "").trim().slice(-90) });
            break; // one report per page is enough to locate it
          }
        }
      }
      return found;
    })()`,
    returnByValue: true,
  });
  const orphans = stranded.result?.value || [];
  if (orphans.length) {
    throw new Error(
      `pagination stranded text off-sheet on ${orphans.length} page(s); it would be ` +
      `missing from the PDF:\n` +
      orphans.map((o) => `  page ${o.page}: …${o.text}`).join("\n") +
      `\nThe fragmenter put a break in the wrong place. Changing where the lines ` +
      `fall — hyphenation, the measure, the page margins — moves the boundary and ` +
      `hides this again; it does not fix it. Do not publish the PDF until it is clean.`
    );
  }

  const { data } = await send(ws, "Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: true,
    marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
    displayHeaderFooter: false,
  });
  writeFileSync(output, normalise(Buffer.from(data, "base64")));
  console.log(`paginated ${out.pages} page(s)`);
} finally {
  ws.close();
  chrome.kill();
}
