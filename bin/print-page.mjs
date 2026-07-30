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
 * Driving a browser we spawned means we own its lifetime, and every way out of
 * this script — success, a failed command, a browser that never came up,
 * Ctrl-C — has to end with that browser dead. The guards below are for the
 * ways out that are not the happy one.
 *
 *   node bin/print-page.mjs <input.html> <output.pdf>
 */
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: print-page.mjs <input.html> <output.pdf>");
  process.exit(2);
}

// Overridable so the failure paths below can be exercised against a stub
// browser. The default is the only one this script is expected to drive.
const CHROME = process.env.CHROME ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Every wait has a ceiling. An unbounded wait on a browser that has stopped
// answering does not fail, it hangs — and a hung build never reaches the
// cleanup that kills the browser.
const OPEN_MS = 20_000;      // launch to a usable DevTools socket
const CMD_MS = 30_000;       // an ordinary DevTools command
const PAGINATE_MS = 180_000; // Paged.js laying out the whole paper
const PRINT_MS = 120_000;    // printToPDF over 27 pages of embedded fonts

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// A profile directory of our own. Chrome writes DevToolsActivePort into it,
// which is how the port is learned below; because the directory was created a
// moment ago, the browser answering there is provably the child we spawned.
// It is also ours to delete — Chrome removes the temporary profile it would
// otherwise choose for itself only when it exits cleanly, and the shutdown
// path below is willing to SIGKILL.
const profile = mkdtempSync(join(tmpdir(), "print-page-"));

const chrome = spawn(CHROME, [
  "--headless", "--disable-gpu", "--no-sandbox",
  "--allow-file-access-from-files",
  "--font-render-hinting=none",
  `--user-data-dir=${profile}`,
  // A profile this new otherwise sends Chrome through its first-run work,
  // which is time spent not listening on the debug port.
  "--no-first-run", "--no-default-browser-check",
  // Port 0 asks the OS for a free one. The port used to be derived from this
  // process's pid, which collides between runs: a browser left behind by an
  // earlier failure could still hold it, and this script would then drive
  // *that* browser and kill its own, unrelated, child.
  "--remote-debugging-port=0",
  "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });

// Chrome explains its own startup failures on stderr. Discarding it left
// bin/build-pdf reporting "PDF FAILED" with two blank lines under it, which is
// the state this script is most likely to be read in.
let chromeErr = "";
chrome.stderr.setEncoding("utf8");
chrome.stderr.on("data", (d) => { chromeErr = (chromeErr + d).slice(-4000); });

// One rejection standing for every way the browser can stop answering: the
// socket closing, an error on it, or the child exiting. Without it a command
// in flight when the browser dies never settles at all — the process hangs
// with the browser still running, and nothing after the await ever executes.
let abort;
const gone = new Promise((_, reject) => { abort = reject; });
gone.catch(() => {}); // always raced against, never awaited alone

let chromeGone = null;
chrome.on("exit", (code, signal) => {
  chromeGone ??= new Error(`Chrome exited (${signal ? `signal ${signal}` : `code ${code}`})`);
  abort(chromeGone);
});
chrome.on("error", (e) => {
  chromeGone ??= new Error(`could not start Chrome at ${CHROME}: ${e.message}`);
  abort(chromeGone);
});

function deadline(promise, ms, what) {
  let timer;
  const expiry = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${what} (waited ${ms}ms)`)), ms);
  });
  return Promise.race([promise, gone, expiry]).finally(() => clearTimeout(timer));
}

const ACTIVE_PORT = join(profile, "DevToolsActivePort");

async function endpoint() {
  const until = Date.now() + OPEN_MS;
  while (Date.now() < until) {
    // Re-checked every pass rather than waited out: a browser that has already
    // exited is never going to write the file, and there is no reason to spend
    // the whole timeout discovering that.
    if (chromeGone) throw chromeGone;
    let port = null;
    try {
      // Chrome writes the port, then the browser target path. One line means
      // the file was caught half-written.
      const lines = readFileSync(ACTIVE_PORT, "utf8").split("\n");
      if (lines.length >= 2 && /^\d+$/.test(lines[0])) port = Number(lines[0]);
    } catch { /* not written yet */ }
    if (port) {
      try {
        const r = await fetch(`http://127.0.0.1:${port}/json/list`,
                              { signal: AbortSignal.timeout(2000) });
        const tabs = await r.json();
        const page = tabs.find((t) => t.type === "page");
        if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
      } catch { /* listening, no page target yet */ }
    }
    await sleep(100);
  }
  throw new Error("Chrome did not expose a DevTools endpoint");
}

let id = 0;
const pending = new Map();
const waiters = [];

function send(ws, method, params = {}, ms = CMD_MS) {
  const msg = { id: ++id, method, params };
  const reply = new Promise((resolve, reject) => {
    pending.set(msg.id, { resolve, reject });
    ws.send(JSON.stringify(msg));
  });
  return deadline(reply, ms, `${method} did not answer`)
    .finally(() => pending.delete(msg.id));
}

function waitFor(method, ms = CMD_MS) {
  const entry = { method };
  const event = new Promise((resolve) => { entry.resolve = resolve; waiters.push(entry); });
  return deadline(event, ms, `${method} never fired`).finally(() => {
    const i = waiters.indexOf(entry);
    if (i >= 0) waiters.splice(i, 1);
  });
}

async function shutdown() {
  if (chrome.exitCode !== null || chrome.signalCode !== null) return;
  chrome.kill("SIGTERM");
  // SIGTERM lets Chrome flush and release its own locks. A browser wedged
  // badly enough to be the reason we are unwinding may not answer it, and a
  // browser left running is the whole defect this function exists to close,
  // so give it a moment and then stop asking.
  const exited = await Promise.race([once(chrome, "exit").then(() => true), sleep(3000)]);
  if (exited !== true) chrome.kill("SIGKILL");
}

// Ctrl-C during a build is the same leak by another route: without this the
// script dies and the browser it spawned does not.
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.once(sig, async () => {
    await shutdown();
    rmSync(profile, { recursive: true, force: true });
    process.exit(130);
  });
}

let ws = null;
// Finding the endpoint and opening the socket are inside the try now. They
// used to sit above it, so a browser that started and never opened a debug
// port was left running: the block that owns chrome.kill() had not been
// entered yet when the wait gave up.
try {
  ws = new WebSocket(await endpoint());
  // Registered before the open is awaited, so a connection that fails while it
  // is still being established rejects instead of waiting.
  ws.onclose = () => abort(chromeGone ?? new Error("DevTools socket closed"));
  // e.message is routinely the empty string on a transport-level failure, and
  // an error whose text is blank is no better than the discarded stderr above.
  ws.onerror = (e) => abort(chromeGone ??
    new Error(`DevTools socket failed: ${e.error?.message || e.message || "connection lost"}`));
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
  await deadline(new Promise((r) => (ws.onopen = r)), OPEN_MS,
                 "DevTools socket did not open");

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
  }, PAGINATE_MS);
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
  }, PRINT_MS);
  writeFileSync(output, Buffer.from(data, "base64"));
  console.log(`paginated ${out.pages} page(s)`);
} catch (err) {
  // Caught rather than left to propagate: an uncaught rejection out of a
  // top-level await ends the process without running the cleanup below.
  console.error(`print-page: ${err.message}`);
  if (chromeErr.trim()) console.error(`chrome said:\n${chromeErr.trim()}`);
  process.exitCode = 1;
} finally {
  try { ws?.close(); } catch { /* already gone */ }
  await shutdown();
  rmSync(profile, { recursive: true, force: true, maxRetries: 3 });
}
