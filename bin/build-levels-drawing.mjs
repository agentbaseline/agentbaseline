// node bin/build-levels-drawing.mjs
// Writes layouts/partials/sf-level-N.svg (wide) and sf-level-N-narrow.svg for N = 1…3:
// the three levels of autonomy as /reference-architecture draws them, one drawing per
// level on one skeleton, so what changes from level to level is what the eye finds.
// The page's own drawings, not the paper's figures: the paper's Figures 3 to 5 stay in
// software-factory/figures/ and the PDF, and each drawing links to its figure there. These
// are drawn in the figures' voices and with the paper's words, but they say less: a box
// is its name and nothing else, a wire a verb or two set on the line itself, and what
// each part does is in its tooltip (static/js/tips.js reads each part's <desc>), which is
// also its accessible description.
//
// One skeleton, in groups. Whoever chooses the next step sits top left with what feeds
// it, and it changes: the developer, a workflow, an orchestrator agent. Beneath it the
// durable execution layer from Level 2; beside that, the runtime authorization service.
// Then three frames: where agents run (the sandbox with the agent and its inner loop, the
// egress proxy beside it, monitoring at Level 3, the tamper-evident record under them);
// behind the proxy (the supply chain firewall, the model gateway, downstream); and along
// the foot, the output. From there the outer loop runs left and up, back to whoever
// chooses the next step, with its label on the line.
//
// Colour says three things and nothing else. The accent (olive) marks what is enforced
// outside the agent's loop: each boundary's enforcement point wears a pill with the
// boundary's number and name, numbered as the paper numbers them (boundaryNumbers), and
// the authorization decision is drawn in it. The page's mark (terracotta) marks whoever
// chooses the next step and the outer loop it drives, the one thing that changes between
// levels. The wash marks agent execution. Everything else is ink on the page. Colours
// come from classes the page styles with its own tokens (.sfl-* in
// layouts/partials/software-factory-levels.html), so the drawings follow the theme.
//
// Sizes. The wide drawing is 1000 units and shown up to 1000px; below 960px the narrow
// composition takes over. Its smallest text is 11.5 units (the pills), 10.2px in the
// 888px slot a 960px screen gives it. The narrow drawing is 356 units, shown up to 440px
// and as small as 304px, where its smallest text (10.5 units) is 9px and, on a 375px
// phone, 10.6px.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Text and attribute values: escape what XML needs, and set a straight apostrophe curly.
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
  .replace(/'/g, '’');
const f1 = n => +(+n).toFixed(1);

// A boundary's number is its place among the "## Name: ..." sections under "# The four
// security boundaries" in the paper, so reordering the paper renumbers these drawings on
// their next build, as it does the figures and the page's list of boundaries.
const BOUNDARIES = { sandbox: 'Sandbox', network: 'Network', supply: 'Supply chain',
  identity: 'Identity and access' };
function boundaryNumbers() {
  const file = `${REPO}/software-factory/software-factory.md`;
  const sec = fs.readFileSync(file, 'utf8').split(/^# /m)
    .find(s => s.startsWith('The four security boundaries\n'));
  const order = sec ? [...sec.matchAll(/^## ([^:\n]+):/gm)].map(m => m[1].trim()) : [];
  const want = Object.values(BOUNDARIES);
  if (order.length !== want.length || want.some(b => !order.includes(b))) {
    console.error(`${path.relative(REPO, file)}: "The four security boundaries" has the sections `
      + `${JSON.stringify(order)}; the drawing numbers ${JSON.stringify(want)}`);
    process.exit(1);
  }
  return Object.fromEntries(Object.entries(BOUNDARIES).map(([k, b]) => [k, order.indexOf(b) + 1]));
}
const N = boundaryNumbers();
// The paper's figure of each level, from software-factory/levels.yaml (bin/check-copy holds
// its numbers to the paper), so each drawing can send the reader to the paper's own.
const FIGURE = Object.fromEntries([...fs.readFileSync(`${REPO}/software-factory/levels.yaml`, 'utf8')
  .matchAll(/^  - name: .+\n    lead: .+\n    figure: (\d+)$/gm)].map((m, i) => [i + 1, +m[1]]));
if (Object.keys(FIGURE).length !== 3) {
  console.error('software-factory/levels.yaml: expected three levels, each with a figure');
  process.exit(1);
}
const BY_NUMBER = Object.keys(BOUNDARIES).sort((a, b) => N[a] - N[b]);

// ── what each part says, per level, in the paper's words ─────────────────────
// Each entry is [name, description]; where a level differs it has its own. The
// description is the part's tooltip and its accessible description.
const SAME = {
  auth: ['Runtime authorization service', 'Decides what access each task gets, within the '
    + 'agent’s profile, any delegation and the organization’s policy. It records every grant and '
    + 'can revoke it. Part of the identity and access boundary.'],
  inner: ['Inner loop', 'Assemble, build and verify, repeated until the work passes. The agent '
    + 'makes its own decisions inside this loop.'],
  behind: ['Behind the proxy', 'What the agent reaches, and only through the proxy, with only '
    + 'the operations the service authorized.'],
  firewall: ['Supply chain firewall', 'A dedicated admission point that serves only approved, '
    + 'scanned components and blocks compromised or disallowed ones. New versions wait out a '
    + 'cooldown.'],
  gateway: ['Model gateway', 'The enforcement point for inference. It routes model calls to '
    + 'approved models and applies rate limits, token and spend budgets and data-handling '
    + 'rules. It serves the supply chain and network boundaries without being one itself.'],
  downstream: ['Downstream', 'Source control, APIs and MCP servers.'],
  output: ['Output', 'What leaves the factory, and the review and approval it passes on the '
    + 'way.'],
  approval: ['Approval', 'Automatic or by a person, under the organization’s approval policy: by '
    + 'the change’s kind, risk, blast radius and reversibility, and the verification it has '
    + 'passed. Automatic approval is an option, never a requirement.'],
  authorized: ['authorized scope', 'The service’s decision, which the proxy enforces: it '
    + 'blocks what the service hasn’t authorized. Only a new decision can widen a task.'],
  opens: ['opens', 'The agent opens its pull request in source control, through the proxy.'],
  starts: ['starts the agent', 'The execution layer starts the agent in a fresh sandbox with its '
    + 'profile and only its authorized scope, and won’t start it if a required enforcement point '
    + 'is down.'],
};
const LEVEL = {
  1: {
    orch: ['Developer', 'Chooses the next step. The developer kicks off each run, reviews the '
      + 'result instead of approving each command, and drives the outer loop.'],
    zone: ['Developer’s machine', 'Or a remote environment. The sandbox keeps writes to the task '
      + 'workspace and gives no access to the host filesystem.'],
    sandbox: ['Sandbox', 'Where the agent’s code runs. It can reach the working repository, '
      + 'approved registries and the services the task needs, without inheriting everything '
      + 'the developer can access.'],
    harness: ['Agent harness', 'The runtime that runs the coding agent and loads the skills, '
      + 'tools, hooks and context files from its profile. The agent is untrusted and holds no '
      + 'credentials.'],
    proxy: ['Egress proxy', 'Default-deny. All of the sandbox’s traffic passes through it, in '
      + 'both directions. It blocks what the authorization service hasn’t authorized and attaches '
      + 'credentials, so the agent never holds them.'],
    record: ['Tamper-evident record', 'Harness logs plus identity and proxy records, reviewed by '
      + 'the developer. Every run leaves a record out of any agent’s reach, or fails closed.'],
    pr: ['Pull request', 'Reviewed by the developer, who drives the next run.'],
    kicks: ['kicks off each run', 'The developer starts each run through the agent harness, '
      + 'which is the execution layer at Level 1.'],
    proposes: ['proposes scope', 'The agent proposes the scope its task needs. It can propose; '
      + 'it can’t grant.'],
    loop: ['Outer loop', 'Review, evals and production feedback flow back to design. At Level 1 '
      + 'the developer drives it: the pull request comes back to them, and they start the next '
      + 'run and update the configuration.'],
    loopGloss: ['the developer', 'drives the next run'],
  },
  2: {
    input: ['Request', 'A request, event, schedule or ticket starts a workflow.'],
    orch: ['Workflow', 'A predefined workflow chooses the next step. It turns requests and '
      + 'tickets into runs, acts for the requester, and makes the factory a shared service.'],
    exec: ['Durable execution layer', 'A durable system such as a CI/CD pipeline, a step runner '
      + 'or a durable execution engine. It starts each run’s agent with its profile and only the '
      + 'access the service granted, retries failures and can stop any run.'],
    zone: ['The factory', 'A shared service with its own identity, not reachable from outside. '
      + 'Improvements to it reach everyone using it.'],
    sandbox: ['Sandbox', 'A fresh sandbox for every run, on shared infrastructure, started from '
      + 'an approved image and destroyed when the run ends.'],
    harness: ['Agent harness', 'The same harness as at Level 1, configured by its profile: the '
      + 'agent is untrusted and holds no credentials.'],
    proxy: ['Egress proxy', 'Default-deny, one per agent, with rules from its profile. It blocks '
      + 'what the authorization service hasn’t authorized and attaches credentials, so the agent '
      + 'never holds them.'],
    record: ['Tamper-evident record', 'Records from all four boundaries, collected in one place '
      + 'and linked by run, out of any agent’s reach. Evals track output quality across runs.'],
    pr: ['Pull request', 'Reviewed until ready. Review feedback drives the next run.'],
    merge: ['Merge', 'Approved changes merge. Evals and run metrics across many runs show where '
      + 'the factory needs to improve.'],
    schedules: ['schedules runs', 'The workflow schedules each run on the execution layer. It '
      + 'never starts agents itself.'],
    proposes: ['proposes scope', 'The agent proposes the scope its task needs. It can propose; '
      + 'it can’t grant.'],
    loop: ['Outer loop', 'Review, evals and production feedback flow back to design. At Level 2 '
      + 'teams drive it with review and evals: feedback drives the next run until the pull '
      + 'request is ready.'],
    loopGloss: ['review feedback', 'drives the next run'],
  },
  3: {
    input: ['Requests', 'Work people file, and tickets.'],
    context: ['Context', 'What the orchestrator gathers in preflight: tickets, code and '
      + 'conversations.'],
    signals: ['Signals', 'Events that start work without a person filing it: production '
      + 'incidents, scanner findings, eval results, tickets agents create. Signals are untrusted '
      + 'inputs.'],
    orch: ['Orchestrator agent', 'An agent chooses the next step. It takes work from requests and '
      + 'signals, runs preflight to propose a profile and scope for each task, and divides the '
      + 'work across agents. Nothing it decides authorizes itself.'],
    exec: ['Durable execution layer', 'The same durable system as at Level 2, starting each '
      + 'task’s agent only with its authorized scope. Only the execution layer starts agents; the '
      + 'orchestrator never does.'],
    zone: ['The factory', 'Proactive and always on. Each task’s agent runs only for its task, in '
      + 'its own sandbox behind its own proxy, with its own identity and scope.'],
    sandbox: ['Sandbox', 'Each agent in a run gets its own sandbox, configured from the profile '
      + 'for its kind of agent. Monitoring that watches from outside can tighten or stop it '
      + 'mid-run.'],
    harness: ['Coding agent', 'The agent doing one task, with its own identity, profile and task '
      + 'scope. Only a new decision by the authorization service can widen its task.'],
    proxy: ['Egress proxy', 'Default-deny, one per task, with its own egress rules and task '
      + 'scope. Traffic between agents passes through the same enforcement as any other traffic.'],
    monitor: ['Monitoring agent', 'Watches signals and work in progress, from outside the agents '
      + 'it watches, for thrash and drift. Like the orchestrator, it can flag and request but '
      + 'never grant or approve.'],
    record: ['Tamper-evident record', 'Telemetry and evals across runs, and monitoring of '
      + 'running agents, out of any agent’s reach. Agents that drift or become ineffective are '
      + 'stopped.'],
    pr: ['Pull request', 'Reviewed until ready, then approved like any other change.'],
    deploy: ['Deploy', 'Merged changes deploy under the same approval rules as any high-impact '
      + 'action, and can be rolled back.'],
    production: ['Production', 'Emits incidents and metrics, which come back as signals that '
      + 'start new work.'],
    schedules: ['schedules tasks', 'The orchestrator schedules each task on the execution layer, '
      + 'a separate system. It never starts agents itself.'],
    proposes: ['proposes profile and scope', 'In preflight the orchestrator proposes a profile '
      + 'and task scope for each piece of work. It proposes; the service alone decides.'],
    watches: ['watches', 'From outside the sandbox, for thrash and drift.'],
    loop: ['Outer loop', 'Review, evals and production feedback flow back to design. At Level 3 '
      + 'signals drive it too: incidents, findings and evals come back as work, and the '
      + 'orchestrator can propose changes to the factory that it can’t approve.'],
    loopGloss: ['signals start', 'new work'],
  },
};
const says = (n, k) => LEVEL[n][k] || SAME[k];

const ALT = {
  1: 'A developer chooses the next step: they kick off each run of one coding agent, in a '
    + 'sandbox on their machine or a remote environment, and the pull request comes back to them '
    + 'for review, which is the outer loop. The agent proposes the scope it needs, the runtime '
    + 'authorization service decides, and a default-deny egress proxy enforces that decision on '
    + 'every request to the supply chain firewall, the model gateway and downstream.',
  2: 'A predefined workflow chooses the next step: a request, event, schedule or ticket starts '
    + 'it, it schedules each run on a durable execution layer, and that starts the agent in a '
    + 'fresh sandbox behind its own proxy. The pull request goes through approval to merge, and '
    + 'review feedback drives the next run, which is the outer loop. The authorization service, '
    + 'firewall, gateway and downstream are as at Level 1.',
  3: 'An orchestrator agent chooses the next step: it takes in requests, context and signals, '
    + 'proposes each task’s profile and scope to the authorization service, which alone grants '
    + 'access, and schedules the tasks on the execution layer, which starts each agent in its '
    + 'own sandbox behind its own proxy. Monitoring agents watch from outside. Changes go through '
    + 'approval and deploy to production, and incidents, findings and evals come back as signals '
    + 'that start new work, which is the outer loop.',
};
const keyNote = ' Pills name the boundaries as the paper numbers them: '
  + BY_NUMBER.map(k => `${N[k]} ${BOUNDARIES[k].toLowerCase()}`).join(', ') + '.';

// ── drawing kit ──────────────────────────────────────────────────────────────
function kit(id, T) {
  // T: { title, lab, cap, pill, pad, mk }. Names in Figtree, verbs on the wires and the
  // pills in Plex Mono, frames' captions in Chakra Petch caps.
  const r = b => b.x + b.w, btm = b => b.y + b.h, cx = b => b.x + b.w / 2, cy = b => b.y + b.h / 2;
  // pessimistic advances, as whitepaper/figures/figkit.py measures the same faces
  const width = (s, kind) => s.length * (kind === 'title' ? T.title * 0.56
    : kind === 'cap' ? T.cap * 0.74 : kind === 'pill' ? T.pill * 0.645 : T.lab * 0.601);
  let n = 0;
  // a part the reader can ask about: its name is its accessible name, its description its
  // tooltip; focusable, so a keyboard reaches every part
  // o.b names the boundary a card enforces, for a sheet that colours boundaries apart
  const node = (key, [name, desc], body, cls = '', b = '') => {
    const d = `${id}-${key}-${++n}`;
    return `<g class="sfl-node${cls ? ' ' + cls : ''}"${b ? ` data-b="${b}"` : ''} data-part="${key}" tabindex="0" role="img" aria-label="${esc(name)}" aria-describedby="${d}">`
      + `<desc id="${d}">${esc(desc)}</desc>${body}</g>`;
  };
  const rect = (b, cls, rx = 6) => `<rect class="${cls}" x="${b.x + .5}" y="${b.y + .5}" width="${b.w - 1}" height="${b.h - 1}" rx="${rx}"/>`;
  const title = (b, t) => {
    if (width(t, 'title') > b.w - 2 * T.pad) throw new Error(`${id}: "${t}" overflows its ${b.w}-unit card`);
    return `<text class="sfl-t" x="${f1(b.x + T.pad)}" y="${f1(cy(b) + T.title * 0.36)}" font-size="${T.title}">${esc(t)}</text>`;
  };
  // a boundary's pill: its number and name in the accent, worn on the top left edge of the
  // part that enforces it
  const PH = T.pill + 8;
  const pill = (x, y, k) => {
    const t = `${N[k]} ${BOUNDARIES[k].toUpperCase()}`, w = width(t, 'pill') + 16, cy_ = y - 2;
    return `<g class="sfl-pill" data-b="${k}" aria-hidden="true"><rect x="${f1(x)}" y="${f1(cy_ - PH / 2)}" width="${f1(w)}" height="${PH}" rx="${PH / 2}"/>`
      + `<text x="${f1(x + 8)}" y="${f1(cy_ + T.pill * 0.36)}" font-size="${T.pill}">${esc(t)}</text></g>`;
  };
  // a card: its name, and the pill of the boundary it enforces (o.k) on its top edge
  const card = (key, say, b, o = {}) => node(key, say,
    (o.ghosts ? ghosts(b, o.cls || 'sfl-box') : '') + rect(b, o.cls || 'sfl-box') + title(b, say[0])
    + (o.k ? pill(b.x + 10, b.y, o.k) : ''), '', o.k || '');
  // one of many: two outlines behind a card, offset down and right
  const ghosts = (b, cls) => [12, 6].map(d =>
    `<rect class="${cls} sfl-ghost" x="${b.x + d + .5}" y="${b.y + d + .5}" width="${b.w - 1}" height="${b.h - 1}" rx="6"/>`).join('');
  const capt = (x, y, t) => `<text class="sfl-cap" x="${f1(x)}" y="${f1(y)}" font-size="${T.cap}">${esc(t)}</text>`;
  // a frame: a hairline, and its caption inside the top left, which is what the reader
  // hovers (the frame's whole area would steal every hover inside it)
  const zone = (key, say, b) => `<g data-frame="${key}" data-zone="${esc(say[0])}">${rect(b, 'sfl-zone', 8)}`
    + node(key, say, `<rect class="sfl-hit" x="${b.x + 4}" y="${b.y + 4}" width="${f1(width(say[0], 'cap') + T.pad + 8)}" height="${T.cap + 14}"/>`
      + capt(b.x + T.pad, b.y + T.cap * 0.72 + 10, say[0].toUpperCase())) + '</g>';
  // the sandbox: the frame where untrusted agent code runs, washed, wearing the sandbox
  // boundary's pill, which is the hover target; o.right sets the pill on the right corner,
  // where a wire lands on the left one
  const sandbox = (key, say, b, o = {}) => `<g data-frame="${key}">` + (o.ghosts ? ghosts(b, 'sfl-sb') : '') + rect(b, 'sfl-sb', 8)
    + node(key, say, pill(o.right ? r(b) - 10 - width(`${N.sandbox} ${BOUNDARIES.sandbox.toUpperCase()}`, 'pill') - 16 : b.x + 10, b.y, 'sandbox')) + '</g>';
  const d = pts => `M${pts.map(p => p.map(f1).join(' ')).join(' L')}`;
  // a wire. kind: flow (ink), main (the agent's requests, heavier), grant (the decision,
  // accent, dashed), loop (the outer loop, the mark, dashed). o.head false: no arrowhead.
  const WIRE = { flow: ['sfl-wire', 'a'], main: ['sfl-wire sfl-main', 'm'], grant: ['sfl-wire sfl-grant', 'g'], loop: ['sfl-wire sfl-loop', 'o'] };
  const wire = (pts, kind = 'flow', o = {}) => {
    const [cls, m] = WIRE[kind];
    return `<path class="${cls}" d="${d(pts)}"${o.head === false ? '' : ` marker-end="url(#${id}-${m})"`}/>`;
  };
  // a verb set on its line: the text on a plate that interrupts the wire, centred on the
  // point given, or on the midpoint of the wire's longest segment
  const onLine = (t, x, y, cls = 'sfl-l') => {
    const w = width(t, 'lab') + 10, h = T.lab + 6;
    return `<rect class="sfl-plate" x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${h}"/>`
      + `<text class="${cls}" x="${f1(x)}" y="${f1(y + T.lab * 0.36)}" font-size="${T.lab}" text-anchor="middle">${esc(t)}</text>`;
  };
  const midOf = pts => {
    let best = null;
    for (let i = 1; i < pts.length; i++) {
      const len = Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]);
      if (!best || len > best.len) best = { len, x: (pts[i][0] + pts[i - 1][0]) / 2, y: (pts[i][1] + pts[i - 1][1]) / 2 };
    }
    return best;
  };
  // a wire with a verb on it, which the reader can ask about: the label and the line
  // highlight together, and a wide invisible stroke makes the thin line easy to hover.
  // o.at: [x, y] for the label, else the longest segment's midpoint; o.beside: set the
  // label beside the line instead (end-anchored at o.at), where a plate would not fit
  const edge = (key, say, pts, kind, o = {}) => {
    const at = o.at || (m => [m.x, m.y])(midOf(pts));
    const label = o.beside
      ? `<text class="sfl-l" x="${f1(at[0])}" y="${f1(at[1] + T.lab * 0.36)}" font-size="${T.lab}" text-anchor="end">${esc(say[0])}</text>`
      : onLine(say[0], at[0], at[1]);
    return node(key, say, `<path class="sfl-hit" d="${d(pts)}"/>` + wire(pts, kind, o) + label, 'sfl-edge');
  };
  const lbl = (x, y, t) => `<text class="sfl-l" x="${f1(x)}" y="${f1(y)}" font-size="${T.lab}">${esc(t)}</text>`;
  // a loop as a mark: an open circle that comes back round on itself, its head along the
  // arc's tangent, as the paper's figures draw the inner loop
  const loopGlyph = (cx_, cy_, rad, cls = 'sfl-glyph') => {
    const a0 = -40 * Math.PI / 180, a1 = 250 * Math.PI / 180;
    const x0 = cx_ + rad * Math.cos(a0), y0 = cy_ + rad * Math.sin(a0);
    const x1 = cx_ + rad * Math.cos(a1), y1 = cy_ + rad * Math.sin(a1);
    const tx = -Math.sin(a1), ty = Math.cos(a1), nx = -ty, ny = tx, s = rad * 0.55, w = rad * 0.4;
    return `<path class="${cls}" d="M${f1(x0)} ${f1(y0)} A${rad} ${rad} 0 1 1 ${f1(x1)} ${f1(y1)}" fill="none"/>`
      + `<path class="${cls} sfl-glyph-head" d="M${f1(x1 + tx * s)} ${f1(y1 + ty * s)} L${f1(x1 + nx * w)} ${f1(y1 + ny * w)} L${f1(x1 - nx * w)} ${f1(y1 - ny * w)} z"/>`;
  };
  // the inner loop, inside the sandbox: the mark and its name
  const inner = (x, y) => node('inner', SAME.inner,
    `<rect class="sfl-hit" x="${x - 10}" y="${y - 10}" width="${f1(width('inner loop', 'lab') + 32)}" height="20"/>`
    + loopGlyph(x, y, T.lab * 0.45) + lbl(x + T.lab * 0.45 + 8, y + T.lab * 0.36, 'inner loop'));
  // the outer loop's label, on the line: its mark, its name and two short lines saying
  // what drives it at this level, on a plate that interrupts the wire
  const loopLabel = (n_, x, y) => {
    const say = says(n_, 'loop'), gloss = LEVEL[n_].loopGloss;
    const w = Math.max(width(say[0].toUpperCase(), 'cap'), ...gloss.map(g => width(g, 'lab'))) + 16;
    const lh = T.lab * 1.4, g = T.cap * 0.9, h = g * 2 + 8 + T.cap + gloss.length * lh + 6;
    const top = y - h / 2, by = top + g * 2 + 8 + T.cap * 0.72;
    return node('loop', say,
      `<rect class="sfl-plate" x="${f1(x - w / 2)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}"/>`
      + loopGlyph(x, top + g + 2, g * 0.85, 'sfl-glyph sfl-glyph-o')
      + `<text class="sfl-cap sfl-cap-o" x="${f1(x)}" y="${f1(by)}" font-size="${T.cap}" text-anchor="middle">${esc(say[0].toUpperCase())}</text>`
      + gloss.map((t, i) => `<text class="sfl-l" x="${f1(x)}" y="${f1(by + (i + 1) * lh)}" font-size="${T.lab}" text-anchor="middle">${esc(t)}</text>`).join(''));
  };
  // the key: the two colours the pills don't explain
  const key = (x, y) => {
    let out = '', cx_ = x;
    const S = T.lab + 2;
    for (const [cls, text] of [['sfl-sw-o', 'chooses the next step'], ['sfl-sw-w', 'agent execution']]) {
      out += `<rect class="sfl-sw ${cls}" x="${cx_}" y="${f1(y - S / 2)}" width="${S}" height="${S}" rx="3"/>`
        + lbl(cx_ + S + 7, y + T.lab * 0.36, text);
      cx_ += S + 7 + width(text, 'lab') + 24;
    }
    return `<g class="sfl-key" aria-hidden="true">${out}</g>`;
  };
  // the paper's own figure of this level, linked, end-anchored at x
  const paperLink = (n_, x, y) => `<a class="sfl-link" href="/software-factory.pdf"><text class="sfl-l" x="${f1(x)}" y="${f1(y + T.lab * 0.36)}" font-size="${T.lab}" text-anchor="end">Figure ${FIGURE[n_]} in the paper</text></a>`;
  const mk = (k, cls, s) => `<marker id="${id}-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="${s}" markerHeight="${s}" orient="auto-start-reverse"><path class="${cls}" d="M0 0 L10 5 L0 10 z"/></marker>`;
  const defs = `<defs>${mk('a', 'sfl-mk', T.mk)}${mk('m', 'sfl-mk sfl-mk-main', f1(T.mk * 0.82))}${mk('g', 'sfl-mk sfl-mk-g', T.mk)}${mk('o', 'sfl-mk sfl-mk-o', T.mk)}</defs>`;
  return { r, btm, cx, cy, width, node, rect, card, pill, zone, sandbox, wire, edge, lbl, inner, loopLabel, key, paperLink, defs };
}

const svgOf = (n, W, H, L, defs) =>
  `<svg xmlns="http://www.w3.org/2000/svg" class="sfl-d" viewBox="0 0 ${W} ${H}" role="group" aria-label="${esc(ALT[n] + keyNote)}">`
  + `\n${defs}\n${L.flat().join('\n')}\n</svg>`;

// ── wide: one skeleton, 1000 units ───────────────────────────────────────────
function wide(n) {
  const W = 1000, T = { title: 15.5, lab: 12.5, cap: 12, pill: 11.5, pad: 12, mk: 6.5 };
  const K = kit(`sfl${n}w`, T);
  const L = [[], [], [], [], []]; // frames · plain wires · edges · cards · labels, key
  const CH = 40;                   // every card's height
  const LX = 82;                   // the outer loop's vertical, through the left column
  const IN = { x: 16, y: 16, w: 132, h: CH };
  const ORCH = { x: 180, y: 16, w: 320, h: CH };
  const CTX = { x: 556, y: 16, w: 148, h: CH };
  const EXEC = { x: 180, y: 88, w: 320, h: CH };
  const AUTH = { x: 596, y: 88, w: 388, h: CH };
  const ZT = 168;                  // the frames' top
  const SB = { x: 180, y: 204, w: 360, h: 112 };
  const HAR = { x: 194, y: 232, w: 332, h: CH };
  const RY = K.cy(HAR);
  const PX = { x: 588, y: RY - CH / 2, w: 136, h: CH };
  const MON = { x: 180, y: 348, w: 360, h: CH };
  const REC = { x: 180, y: n === 3 ? 404 : 344, w: 524, h: CH };
  const ZONE = { x: 164, y: ZT, w: 572, h: K.btm(REC) + 16 - ZT };
  const RF = { x: 752, y: ZT, w: 232, h: 204 };
  const FW = { x: 764, y: 204, w: 208, h: CH }, GW = { ...FW, y: 260 }, DN = { ...FW, y: 316 };
  const TRUNK = 744;
  const OF = { x: n === 1 ? 752 : n === 2 ? 388 : 164, y: K.btm(ZONE) + 40, w: 0, h: 84 };
  OF.w = 984 - OF.x;
  const OY = OF.y + 32;
  const PR = { x: 764, y: OY, w: 208, h: CH };
  const APR = { x: 588, y: OY, w: 160, h: CH };
  const MRG = { x: 404, y: OY, w: 160, h: CH };
  const PROD = { x: 180, y: OY, w: 192, h: CH };
  const SIG = { x: 16, y: OY, w: 132, h: CH };
  const RY2 = K.cy(PR);
  const STARTX = K.cx(ORCH), PROPX = 520, GRANTX = 690, LOOPY = 68, LOOPIN = 200, ROW = 152;

  // frames
  L[0].push(K.zone('zone', says(n, 'zone'), ZONE));
  L[0].push(K.sandbox('sandbox', says(n, 'sandbox'), SB, { ghosts: n > 1 }));
  L[0].push(K.zone('behind', SAME.behind, RF));
  L[0].push(K.zone('output', SAME.output, OF));
  // whoever chooses the next step, and what feeds it
  L[3].push(K.card('orch', says(n, 'orch'), ORCH, { cls: n === 3 ? 'sfl-box sfl-agent sfl-o' : 'sfl-box sfl-o' }));
  if (n > 1) {
    L[3].push(K.card('input', says(n, 'input'), IN));
    L[1].push(K.wire([[K.r(IN), K.cy(IN)], [ORCH.x, K.cy(IN)]]));
  }
  if (n === 3) {
    L[3].push(K.card('context', says(n, 'context'), CTX));
    L[1].push(K.wire([[CTX.x, K.cy(CTX)], [K.r(ORCH), K.cy(CTX)]]));
  }
  // down to the work: the developer kicks off each run; a workflow or an orchestrator
  // schedules it on the execution layer, which starts the agent
  if (n === 1) {
    L[2].push(K.edge('kicks', says(1, 'kicks'), [[STARTX, K.btm(ORCH)], [STARTX, SB.y]], 'flow', { at: [STARTX, ROW] }));
  } else {
    L[3].push(K.card('exec', says(n, 'exec'), EXEC));
    L[2].push(K.edge('schedules', says(n, 'schedules'), [[STARTX, K.btm(ORCH)], [STARTX, EXEC.y]], 'flow'));
    L[2].push(K.edge('starts', says(n, 'starts'), [[STARTX, K.btm(EXEC)], [STARTX, SB.y]], 'flow', { at: [STARTX, ROW] }));
  }
  // the agent, its inner loop, and its requests to the proxy
  L[3].push(K.card('harness', says(n, 'harness'), HAR, { cls: 'sfl-box sfl-plate' }));
  L[3].push(K.inner(SB.x + 22, K.btm(SB) - 20));
  L[3].push(K.card('proxy', says(n, 'proxy'), PX, { cls: 'sfl-box sfl-b', k: 'network', ghosts: n > 1 }));
  L[1].push(K.wire([[K.r(HAR), RY], [PX.x, RY]], 'main'));
  // the decision: what is proposed to it, and the scope it authorizes, down to the proxy
  L[3].push(K.card('auth', SAME.auth, AUTH, { cls: 'sfl-box sfl-b', k: 'identity' }));
  if (n === 3) {
    L[2].push(K.edge('proposes', says(3, 'proposes'), [[480, K.btm(ORCH)], [480, LOOPY], [790, LOOPY], [790, AUTH.y]], 'flow'));
  } else {
    L[2].push(K.edge('proposes', says(n, 'proposes'), [[PROPX, SB.y], [PROPX, K.cy(AUTH)], [AUTH.x, K.cy(AUTH)]], 'flow', { at: [PROPX, ROW] }));
  }
  L[2].push(K.edge('authorized', SAME.authorized, [[GRANTX, K.btm(AUTH)], [GRANTX, PX.y]], 'grant', { at: [GRANTX, ROW] }));
  // what the proxy lets through, down a trunk into the frame behind it
  L[1].push(K.wire([[K.r(PX), RY], [TRUNK, RY]], 'flow', { head: false }));
  L[1].push(`<path class="sfl-wire" d="M${TRUNK} ${K.cy(FW)} V${K.cy(DN)}"/>`);
  L[1].push(K.wire([[TRUNK, K.cy(FW)], [FW.x, K.cy(FW)]]), K.wire([[TRUNK, K.cy(GW)], [GW.x, K.cy(GW)]]), K.wire([[TRUNK, K.cy(DN)], [DN.x, K.cy(DN)]]));
  L[3].push(K.card('firewall', SAME.firewall, FW, { cls: 'sfl-box sfl-b', k: 'supply' }));
  L[3].push(K.card('gateway', SAME.gateway, GW), K.card('downstream', SAME.downstream, DN));
  // monitoring, at Level 3, and the record
  if (n === 3) {
    L[3].push(K.card('monitor', says(3, 'monitor'), MON, { cls: 'sfl-box sfl-agent' }));
    L[2].push(K.edge('watches', says(3, 'watches'), [[300, MON.y], [300, K.btm(SB)]], 'flow'));
  }
  L[3].push(K.card('record', says(n, 'record'), REC, { cls: 'sfl-rec' }));
  // what comes out, right to left along the foot, and the outer loop back
  L[2].push(K.edge('opens', SAME.opens, [[K.cx(DN), K.btm(DN)], [K.cx(DN), PR.y]], 'flow'));
  L[3].push(K.card('pr', says(n, 'pr'), PR));
  let loopFrom = PR.x;
  if (n > 1) {
    L[3].push(K.card('approval', SAME.approval, APR), K.card(n === 2 ? 'merge' : 'deploy', says(n, n === 2 ? 'merge' : 'deploy'), MRG));
    L[1].push(K.wire([[PR.x, RY2], [K.r(APR), RY2]]), K.wire([[APR.x, RY2], [K.r(MRG), RY2]]));
    loopFrom = MRG.x;
  }
  if (n === 3) {
    L[3].push(K.card('production', says(3, 'production'), PROD), K.card('signals', says(3, 'signals'), SIG));
    L[1].push(K.wire([[MRG.x, RY2], [K.r(PROD), RY2]]), K.wire([[PROD.x, RY2], [K.r(SIG), RY2]]));
    loopFrom = null;
  }
  const loopPts = loopFrom === null
    ? [[LX, SIG.y], [LX, LOOPY], [LOOPIN, LOOPY], [LOOPIN, K.btm(ORCH)]]
    : [[loopFrom, RY2], [LX, RY2], [LX, LOOPY], [LOOPIN, LOOPY], [LOOPIN, K.btm(ORCH)]];
  L[1].push(K.wire(loopPts, 'loop'));
  L[4].push(K.loopLabel(n, LX, (ZT + K.btm(ZONE)) / 2));
  // the key and the paper's figure, at the foot
  const KY = K.btm(OF) + 32;
  L[4].push(K.key(16, KY), K.paperLink(n, W - 16, KY));
  const H = Math.ceil(KY + 16);
  return { W, H, svg: svgOf(n, W, H, L, K.defs) };
}

// ── narrow: the same parts in one column, for phones ─────────────────────────
function narrow(n) {
  const W = 356, T = { title: 13, lab: 11, cap: 10.5, pill: 10.5, pad: 10, mk: 6 };
  const K = kit(`sfl${n}n`, T);
  const L = [[], [], [], [], []];
  const CH = 36, LX = 14, RX = 348, CL = 40, CR = 340, FL = 28, FR = 334;
  let y = 8;
  // what feeds whoever chooses the next step, then it
  const inputs = [];
  if (n === 2) inputs.push(['input', { x: CL, y, w: CR - CL, h: CH }]);
  if (n === 3) inputs.push(['input', { x: CL, y, w: 146, h: CH }], ['context', { x: 194, y, w: CR - 194, h: CH }]);
  if (inputs.length) y += CH + 24;
  const ORCH = { x: CL, y, w: CR - CL, h: CH };
  for (const [k, b] of inputs) {
    L[3].push(K.card(k, says(n, k), b));
    L[1].push(K.wire([[K.cx(b), K.btm(b)], [K.cx(b), ORCH.y]]));
  }
  L[3].push(K.card('orch', says(n, 'orch'), ORCH, { cls: n === 3 ? 'sfl-box sfl-agent sfl-o' : 'sfl-box sfl-o' }));
  y = K.btm(ORCH) + 32;
  const STARTX = 56;
  let EXEC = null;
  if (n > 1) {
    EXEC = { x: CL, y, w: CR - CL, h: CH };
    L[3].push(K.card('exec', says(n, 'exec'), EXEC));
    L[2].push(K.edge('schedules', says(n, 'schedules'), [[STARTX, K.btm(ORCH)], [STARTX, EXEC.y]], 'flow', { at: [STARTX + 44, K.btm(ORCH) + 16] }));
    y = K.btm(EXEC) + 32;
  }
  // the decision, narrower than the column so the start wire passes beside it
  const AUTH = { x: 92, y, w: CR - 92, h: CH };
  L[3].push(K.card('auth', SAME.auth, AUTH, { cls: 'sfl-box sfl-b', k: 'identity' }));
  if (n === 3) {
    L[2].push(K.edge('proposes', says(3, 'proposes'), [[K.r(ORCH), K.cy(ORCH) + 8], [RX, K.cy(ORCH) + 8], [RX, K.cy(AUTH)], [K.r(AUTH), K.cy(AUTH)]], 'flow', { beside: 1, at: [RX - 6, K.btm(ORCH) + 16] }));
  }
  y = K.btm(AUTH) + 36;
  // the frame where agents run
  const ZT = y;
  const SB = { x: CL, y: ZT + 36, w: 174, h: 96 };
  const HAR = { x: SB.x + 12, y: SB.y + 24, w: SB.w - 24, h: CH };
  const RY = K.cy(HAR);
  const PX = { x: 232, y: RY - CH / 2, w: 108, h: CH };
  const MON = { x: CL, y: K.btm(SB) + 36, w: 174, h: CH };
  const REC = { x: CL, y: (n === 3 ? K.btm(MON) : K.btm(SB) + (n > 1 ? 12 : 0)) + 20, w: CR - CL - 4, h: CH };
  const ZONE = { x: FL, y: ZT, w: FR - FL, h: K.btm(REC) + 12 - ZT };
  const from = EXEC || ORCH;
  L[2].push(K.edge(n === 1 ? 'kicks' : 'starts', says(n, n === 1 ? 'kicks' : 'starts'), [[STARTX, K.btm(from)], [STARTX, SB.y]], 'flow', { at: [STARTX + 48, K.btm(from) + 16] }));
  L[0].push(K.zone('zone', says(n, 'zone'), ZONE));
  L[0].push(K.sandbox('sandbox', says(n, 'sandbox'), SB, { ghosts: n > 1, right: 1 }));
  L[3].push(K.card('harness', says(n, 'harness'), HAR, { cls: 'sfl-box sfl-plate' }));
  L[3].push(K.inner(SB.x + 20, K.btm(SB) - 16));
  const GRANTX = 326, PROPX = 156;
  L[3].push(K.card('proxy', says(n, 'proxy'), PX, { cls: 'sfl-box sfl-b', k: 'network', ghosts: n > 1 }));
  L[1].push(K.wire([[K.r(HAR), RY], [PX.x, RY]], 'main'));
  if (n < 3) {
    L[2].push(K.edge('proposes', says(n, 'proposes'), [[PROPX, SB.y], [PROPX, K.btm(AUTH)]], 'flow', { at: [PROPX, K.btm(AUTH) + 18] }));
  }
  L[2].push(K.edge('authorized', SAME.authorized, [[GRANTX, K.btm(AUTH)], [GRANTX, PX.y]], 'grant', { beside: 1, at: [GRANTX - 6, K.btm(AUTH) + 18] }));
  if (n === 3) {
    L[3].push(K.card('monitor', says(3, 'monitor'), MON, { cls: 'sfl-box sfl-agent' }));
    L[2].push(K.edge('watches', says(3, 'watches'), [[80, MON.y], [80, K.btm(SB)]], 'flow'));
  }
  L[3].push(K.card('record', says(n, 'record'), REC, { cls: 'sfl-rec' }));
  y = K.btm(ZONE) + 32;
  // behind the proxy: a frame, its cards fed from a trunk down the right edge
  const CW = 300 - CL;
  const RF = { x: FL, y, w: FR - FL, h: 36 + 3 * CH + 2 * 16 + 12 };
  const FW = { x: CL, y: y + 36, w: CW, h: CH }, GW = { ...FW, y: FW.y + CH + 16 }, DN = { ...FW, y: FW.y + 2 * (CH + 16) };
  L[0].push(K.zone('behind', SAME.behind, RF));
  L[1].push(`<path class="sfl-wire" d="M${K.r(PX)} ${RY} H${RX} V${K.cy(DN)}"/>`);
  L[1].push(K.wire([[RX, K.cy(FW)], [K.r(FW), K.cy(FW)]]), K.wire([[RX, K.cy(GW)], [K.r(GW), K.cy(GW)]]), K.wire([[RX, K.cy(DN)], [K.r(DN), K.cy(DN)]]));
  L[3].push(K.card('firewall', SAME.firewall, FW, { cls: 'sfl-box sfl-b', k: 'supply' }));
  L[3].push(K.card('gateway', SAME.gateway, GW), K.card('downstream', SAME.downstream, DN));
  y = K.btm(RF) + 32;
  // the output, down the column, and the outer loop back up the left edge
  const outs = [['pr', { x: CL, y: y + 32, w: CW, h: CH }]];
  const step = CH + 24;
  if (n > 1) outs.push(['approval', { x: CL, y: y + 32 + step, w: CW, h: CH }], [n === 2 ? 'merge' : 'deploy', { x: CL, y: y + 32 + 2 * step, w: CW, h: CH }]);
  if (n === 3) outs.push(['production', { x: CL, y: y + 32 + 3 * step, w: CW, h: CH }], ['signals', { x: CL, y: y + 32 + 4 * step, w: CW, h: CH }]);
  const last = outs[outs.length - 1][1];
  const OF = { x: FL, y, w: FR - FL, h: K.btm(last) + 12 - y };
  L[0].push(K.zone('output', SAME.output, OF));
  const OX = K.cx(outs[0][1]);
  L[2].push(K.edge('opens', SAME.opens, [[OX, K.btm(DN)], [OX, outs[0][1].y]], 'flow'));
  outs.forEach(([k, b], i) => {
    L[3].push(K.card(k, says(n, k), b));
    if (i) L[1].push(K.wire([[OX, K.btm(outs[i - 1][1])], [OX, b.y]]));
  });
  const LY = K.btm(OF) + 16;
  L[1].push(K.wire([[OX, K.btm(last)], [OX, LY], [LX, LY], [LX, K.cy(ORCH)], [ORCH.x, K.cy(ORCH)]], 'loop'));
  L[4].push(K.loopLabel(n, 110, LY + 44));
  const KY = LY + 100;
  L[4].push(K.key(CL, KY), K.paperLink(n, CR, KY + T.lab * 2));
  const H = Math.ceil(KY + T.lab * 2 + 12);
  return { W, H, svg: svgOf(n, W, H, L, K.defs) };
}

for (const n of [1, 2, 3]) {
  for (const [name, fn] of [[`sf-level-${n}`, wide], [`sf-level-${n}-narrow`, narrow]]) {
    const { W, H, svg } = fn(n);
    fs.writeFileSync(`${REPO}/layouts/partials/${name}.svg`, svg + '\n');
    console.log(`wrote layouts/partials/${name}.svg ${W}×${H}`);
  }
}
