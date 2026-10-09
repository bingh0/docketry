// Steps particular to features/rendering-and-formatting.feature. Shared vocabulary lives in common.ts.
// Skeletons rendered from the tree (D42, D75, D84, D121, D160), the fence and
// design destinations (D77), canonical form and its hashes (D40, D185), and the
// two writers: the formatter, and render's new directory (D82).
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintFeature } from 'gherkin-node-test';
import { main } from '../../dist/cli.js';
import { formatDocket, lintDocket, parseDocket, renderDocket, reportMachine, SLOT_KEYWORDS } from '../../dist/index.js';
import type { DocketTree, Entry, Rendered } from '../../dist/index.js';
import type { Table } from './bind.ts';
import { builder, SCRATCH, type World } from './world.ts';

const DIST = fileURLToPath(new URL('../../dist', import.meta.url));

/** What a rendering scenario carries between its steps; the World is common property. */
interface Bench {
  out: Rendered | null;
  /** the skeleton the last "contains a scenario …" step named */
  skeleton: Skeleton | null;
  /** the directory the scenario said already holds a deliverable, and that file's digest */
  corpus: string | null;
  deliverable: string | null;
  before: string | null;
  /** the docket on disk, and its digest when the scenario recorded one */
  file: string | null;
  digest: string | null;
  /** what the command line wrote to standard output */
  stdout: string;
  /** the formatter's successive outputs */
  runs: string[];
  /** the entry, and the ledger row, a Then step last named */
  entry: string | null;
  row: string | null;
  /** the trees of the parse-format-parse scenarios */
  parses: DocketTree[];
  /** what the four in-process calls returned, and the machine report beside them */
  calls: unknown[];
  machine: Record<string, unknown> | null;
}

const BENCH = new WeakMap<World, Bench>();

function bench(w: World): Bench {
  const seen = BENCH.get(w);
  if (seen) return seen;
  const fresh: Bench = {
    out: null, skeleton: null, corpus: null, deliverable: null, before: null, file: null,
    digest: null, stdout: '', runs: [], entry: null, row: null, parses: [], calls: [], machine: null,
  };
  BENCH.set(w, fresh);
  return fresh;
}

/** A directory of this scenario's own, swept when it ends. */
function scratch(w: World): string {
  const dir = join(SCRATCH, `render-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  w.defer(() => { rmSync(dir, { recursive: true, force: true }); });
  return dir;
}

const digestOf = (file: string): string => createHash('sha256').update(readFileSync(file)).digest('hex');

/** Write the builder's docket where the command line can read it. */
function onDisk(w: World): string {
  const file = join(scratch(w), 'DOCKET.md');
  writeFileSync(file, builder(w).saved(), 'utf8');
  bench(w).file = file;
  return file;
}

/** Run a CLI command, keeping what it wrote to standard output. */
function capture(fn: () => number): { code: number; out: string } {
  const chunks: string[] = [];
  const original = process.stdout.write;
  process.stdout.write = ((chunk: unknown): boolean => { chunks.push(String(chunk)); return true; }) as typeof process.stdout.write;
  try {
    return { code: fn(), out: chunks.join('') };
  } finally {
    process.stdout.write = original;
  }
}

// ── reading the rendered deliverables ────────────────────────────────────────
interface Skeleton { tags: string[]; outline: boolean; title: string; steps: string[]; rows: string[][] }

/** The scenario blocks of the rendered feature file: tags, steps, and Examples rows. */
function skeletons(text: string): Skeleton[] {
  const out: Skeleton[] = [];
  let cur: Skeleton | null = null;
  let examples = false;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('@')) { cur = { tags: line.split(/\s+/u), outline: false, title: '', steps: [], rows: [] }; examples = false; continue; }
    if (cur === null) continue;
    const head = /^(Scenario Outline|Scenario): (.*)$/u.exec(line);
    if (head) { cur.outline = head[1] === 'Scenario Outline'; cur.title = head[2] ?? ''; out.push(cur); continue; }
    if (line === 'Examples:') { examples = true; continue; }
    if (line.startsWith('|')) { if (examples) cur.rows.push(line.split('|').slice(1, -1).map((c) => c.trim())); continue; }
    if (line !== '') cur.steps.push(line);
  }
  return out;
}

const rendered = (w: World): Rendered => {
  const out = bench(w).out;
  if (!out) throw new Error('the docket was never rendered');
  return out;
};

/** The one skeleton a step names; two would be as wrong as none. */
function named(w: World, what: string, pick: (s: Skeleton) => boolean): void {
  const all = skeletons(rendered(w).scenarios);
  const hits = all.filter((s) => pick(s));
  assert.equal(hits.length, 1, `${what}: ${all.map((s) => `${s.tags.join(' ')} ${s.outline ? 'Outline' : 'Scenario'} "${s.title}"`).join(' | ')}`);
  bench(w).skeleton = hits[0] as Skeleton;
}

const skeleton = (w: World): Skeleton => {
  const s = bench(w).skeleton;
  if (!s) throw new Error('no skeleton was named by an earlier step');
  return s;
};

/** The lines under a `## ` heading of a rendered markdown deliverable. */
function section(md: string, heading: string): string[] {
  const lines = md.split('\n');
  const at = lines.findIndex((l) => l.trim() === `## ${heading}`);
  assert.ok(at >= 0, `no "## ${heading}" heading in:\n${md}`);
  const out: string[] = [];
  for (let i = at + 1; i < lines.length; i++) {
    const ln = lines[i] ?? '';
    if (ln.startsWith('## ')) break;
    out.push(ln);
  }
  return out;
}

const bullets = (lines: string[]): string[] => lines.filter((l) => l.startsWith('- '));

// ── reading a docket back ────────────────────────────────────────────────────
const KEYWORD_LINE = /^ {2}([a-z]+):( *)/u;

/** The indented lines of one entry, as the file now holds them. */
function entryBlock(text: string, id: string): string[] {
  const lines = text.split('\n');
  const at = lines.findIndex((l) => l.startsWith(`${id} `));
  assert.ok(at >= 0, `no entry ${id} in:\n${text}`);
  const out: string[] = [];
  for (let i = at + 1; i < lines.length; i++) {
    const ln = lines[i] ?? '';
    if (ln.trim() === '' || !ln.startsWith(' ')) break;
    out.push(ln);
  }
  return out;
}

const lastRun = (w: World): string => {
  const runs = bench(w).runs;
  if (runs.length === 0) throw new Error('the docket was never formatted');
  return runs.at(-1) as string;
};

const entryOf = (t: DocketTree, id: string): Entry => {
  const e = t.entries.find((x) => x.id === id);
  if (!e) throw new Error(`no node ${id} in the parse`);
  return e;
};

/** Every field but the ones that only say where a thing sat: line numbers and the source lines. */
const withoutPosition = (e: Entry): unknown =>
  JSON.parse(JSON.stringify(e, (k: string, v: unknown) => (k === 'line' || k === 'raw' ? undefined : v))) as unknown;

const bothParses = (w: World): [DocketTree, DocketTree] => {
  const p = bench(w).parses;
  assert.equal(p.length, 2, 'the docket was not parsed twice');
  return [p[0] as DocketTree, p[1] as DocketTree];
};

// ── steps ────────────────────────────────────────────────────────────────────
export const renderSteps: Table = [
  // ── the dockets these scenarios describe
  [/^a docket whose entry ([A-Z]\d+) has pre "([^"]*)", trig "([^"]*)", and resp "([^"]*)"$/u, (w, id, pre, trig, resp) => {
    const b = builder(w);
    b.slot(id, 'pre').text = pre;
    b.slot(id, 'trig').text = trig;
    b.slot(id, 'resp').text = resp;
  }],
  [/^a docket whose entry ([A-Z]\d+) response contains the quantity \{([^}]*)\}$/u, (w, id, quantity) => {
    builder(w).slot(id, 'resp').text = `the listing appears within {${quantity}}`;
  }],
  [/^a docket whose entry ([A-Z]\d+) response contains the list \{([^}]*)\}$/u, (w, id, members) => {
    builder(w).slot(id, 'resp').text = `the readiness face is {${members}}`;
  }],
  [/^([A-Z]\d+) has the line "([^"]*)"$/u, (w, id, raw) => { builder(w).setLine(id, raw); }],
  [/^a docket whose entries ([A-Z]\d+) and ([A-Z]\d+) both have the trigger "([^"]*)"$/u, (w, first, second, text) => {
    const b = builder(w);
    b.slot(first, 'trig').text = text;
    b.slot(second, 'trig').text = text;
  }],
  [/^a docket whose entry ([A-Z]\d+) is a need for (\S+) with weight (\d+) reading "([^"]*)"$/u, (w, id, who, weight, text) => {
    const b = builder(w);
    const d = b.ensure(id);
    assert.equal(d.ekind, 'need', `${id} is not a need id`);
    d.beneficiary = who;
    d.weight = weight;
    b.slot(id, 'need').text = text;
  }],
  [/^a docket whose entry ([A-Z]\d+) has the trigger "([^"]*)" and resolves to (\S+)$/u, (w, id, text, kind) => {
    const b = builder(w);
    b.slot(id, 'trig').text = text;
    b.setRaw(id, 'res', `  -> ${kind}`);
  }],
  [/^a docket whose entry ([A-Z]\d+) dated (\d{4}-\d{2}-\d{2}) resolves to (\S+)$/u, (w, id, date, kind) => {
    const b = builder(w);
    b.ensure(id).date = date;
    b.setLine(id, `-> ${kind}`);
  }],
  [/^a docket whose entry ([A-Z]\d+) resolves to (\S+)$/u, (w, id, kind) => { builder(w).setLine(id, `-> ${kind}`); }],
  [/^a corpus directory already containing "([^"]*)"$/u, (w, name) => {
    const s = bench(w);
    const dir = scratch(w);
    writeFileSync(join(dir, name), 'Feature: archive\n\n  @R12\n  Scenario: a file is stored\n    Given a thing\n', 'utf8');
    s.corpus = dir;
    s.deliverable = name;
    s.before = digestOf(join(dir, name));
  }],
  [/^a docket whose entry ([A-Z]\d+) has one space after "pre:" and its slots in the order ([a-z, ]+)$/u, (w, id, order) => {
    const b = builder(w);
    b.slot(id, 'pre').gap = ' ';
    b.orderSlots(id, order.split(/,\s*/u));
  }],
  [/^a docket whose entry ([A-Z]\d+) has one space after "pre:" and its slots out of order$/u, (w, id) => {
    const b = builder(w);
    b.slot(id, 'pre').gap = ' ';
    b.orderSlots(id, ['resp', 'trig', 'pre']);
  }],
  [/^a docket already in canonical form$/u, (w) => {
    const b = builder(w);
    b.ensureAny();
    assert.equal(formatDocket(b.saved()), b.saved(), 'the docket this scenario starts from is not canonical');
  }],
  [/^a docket with recorded checksums$/u, (w) => { bench(w).digest = digestOf(onDisk(w)); }],
  [/^a script that imports the package$/u, (w) => {
    builder(w).ensureAny();
    // the four are imported at the head of this file: one package, no shell, no child
    assert.deepEqual([parseDocket, lintDocket, formatDocket, renderDocket].map((f) => typeof f), ['function', 'function', 'function', 'function']);
  }],

  // ── the runs
  [/^the docket is rendered$/u, (w) => {
    const text = builder(w).saved();
    w.text = text;
    const p = parseDocket(text);
    assert.ok(p.ok, `the docket was refused: ${p.ok ? '' : p.refusals.map((r) => r.message).join('; ')}`);
    w.parsed = p;
    bench(w).out = renderDocket(p.tree);
  }],
  [/^the docket is rendered to that directory$/u, (w) => {
    const s = bench(w);
    const file = onDisk(w);
    const run = capture(() => main(['render', file, '--out', s.corpus ?? '']));
    assert.equal(run.code, 0, run.out);
    s.stdout = run.out;
  }],
  [/^the docket is formatted$/u, (w) => { bench(w).runs = [formatDocket(builder(w).saved())]; }],
  [/^the docket is formatted twice$/u, (w) => {
    const first = formatDocket(builder(w).saved());
    bench(w).runs = [first, formatDocket(first)];
  }],
  [/^the docket is linted, parsed, and rendered to standard output$/u, (w) => {
    const s = bench(w);
    const file = s.file ?? '';
    const run = capture(() => {
      for (const cmd of ['lint', 'parse', 'render']) assert.equal(main([cmd, file]), 0, `${cmd} could not run`);
      return 0;
    });
    s.stdout = run.out;
    assert.ok(run.out.length > 0, 'the three commands wrote nothing to standard output');
  }],
  [/^the script calls parseDocket, lintDocket, formatDocket, and renderDocket on a docket$/u, (w) => {
    const s = bench(w);
    const text = builder(w).saved();
    assert.equal(readFileSync(onDisk(w), 'utf8'), text);
    const parsed = parseDocket(text);
    assert.ok(parsed.ok, 'the docket was refused');
    const linted = lintDocket(text);
    assert.ok(linted.ok, 'the docket was refused');
    s.calls = [parsed, linted, formatDocket(text), renderDocket(parsed.tree)];
    s.machine = reportMachine(linted.report);
  }],
  [/^the docket is parsed, formatted, and parsed again$/u, (w) => {
    const s = bench(w);
    const text = builder(w).saved();
    const first = parseDocket(text);
    assert.ok(first.ok, `the docket was refused: ${first.ok ? '' : first.refusals.map((r) => r.message).join('; ')}`);
    const formatted = formatDocket(text);
    const second = parseDocket(formatted);
    assert.ok(second.ok, `the formatted docket was refused: ${second.ok ? '' : second.refusals.map((r) => r.message).join('; ')}`);
    s.runs = [formatted];
    s.parses = [first.tree, second.tree];
  }],

  // ── the scenario output
  [/^the scenario output contains a scenario tagged @([A-Z]\d+)$/u, (w, id) => {
    named(w, `no one scenario tagged @${id}`, (s) => !s.outline && s.tags.includes(`@${id}`));
  }],
  [/^the scenario output contains a scenario titled "([^"]*)" tagged @([A-Z]\d+)$/u, (w, title, id) => {
    named(w, `no one scenario "${title}" tagged @${id}`, (s) => !s.outline && s.title === title && s.tags.includes(`@${id}`));
  }],
  [/^the scenario output contains a scenario outline titled "([^"]*)" tagged @([A-Z]\d+)$/u, (w, title, id) => {
    named(w, `no one outline "${title}" tagged @${id}`, (s) => s.outline && s.title === title && s.tags.includes(`@${id}`));
  }],
  [/^that scenario's steps read "([^"]*)", "([^"]*)", "([^"]*)"$/u, (w, given, when, then) => {
    assert.deepEqual(skeleton(w).steps, [given, when, then]);
  }],
  [/^that outline has an Examples table with (\d+) columns? and (\d+) placeholder rows?$/u, (w, columns, rows) => {
    const table = skeleton(w).rows;
    assert.equal(table.length, Number(rows) + 1, `the Examples table has ${table.length} rows counting its header`);
    assert.equal((table[0] ?? []).length, Number(columns), `header: ${(table[0] ?? []).join(' | ')}`);
    for (const row of table.slice(1)) for (const cell of row) assert.match(cell, /^<.+>$/u);
  }],
  [/^that outline has an Examples table with (\d+) rows reading (.+)$/u, (w, rows, reading) => {
    const want = reading.split(/,\s*/u);
    assert.equal(want.length, Number(rows), `the scenario names ${want.length} members`);
    assert.deepEqual(skeleton(w).rows.slice(1).map((r) => r.join(' | ')), want);
  }],
  [/^the rendered file is scope-clean under the dialect's strict lint$/u, (w) => {
    const findings = lintFeature(rendered(w).scenarios, 'docket-skeletons.feature', { strict: true });
    assert.deepEqual(findings, [], `the rendered feature is not scope-clean:\n${rendered(w).scenarios}`);
  }],

  // ── the ledger, the fence, the design document
  [/^the ledger output contains the row "([^"]*)"$/u, (w, row) => {
    const rows = bullets(rendered(w).ledger.split('\n'));
    const hit = rows.find((l) => l.startsWith(`- ${row}`));
    assert.ok(hit !== undefined, `no ledger row reads "${row}": ${rows.join(' | ')}`);
    bench(w).row = hit;
  }],
  [/^that row's coverage status is blank$/u, (w) => {
    const row = bench(w).row ?? '';
    assert.match(row, /Coverage: *$/u, row);
  }],
  [/^the fence output's (\S+) entry for ([A-Z]\d+) contains "([^"]*)"$/u, (w, heading, id, text) => {
    const entries = bullets(section(rendered(w).fence, heading)).filter((l) => l.includes(`(${id},`));
    assert.equal(entries.length, 1, `no one ${heading} entry for ${id}`);
    const entry = entries[0] ?? '';
    assert.ok(entry.includes(text), entry);
  }],
  [/^the fence output contains an entry under (\S+) ending "([^"]*)"$/u, (w, heading, tail) => {
    const entries = bullets(section(rendered(w).fence, heading));
    assert.ok(entries.some((l) => l.trimEnd().endsWith(tail)), `no ${heading} entry ends "${tail}": ${entries.join(' | ')}`);
  }],
  [/^the design output contains a constraint line ending "([^"]*)"$/u, (w, tail) => {
    const lines = bullets(section(rendered(w).design, 'Constraints'));
    assert.ok(lines.some((l) => l.trimEnd().endsWith(tail)), `no constraint line ends "${tail}": ${lines.join(' | ')}`);
  }],
  [/^the design output contains a constraint line containing "([^"]*)"$/u, (w, text) => {
    const lines = bullets(section(rendered(w).design, 'Constraints'));
    assert.ok(lines.some((l) => l.includes(text)), `no constraint line contains "${text}": ${lines.join(' | ')}`);
  }],
  [/^the design output contains a Changelog heading with (\d+) lines?$/u, (w, n) => {
    const lines = section(rendered(w).design, 'Changelog').filter((l) => l.trim() !== '');
    assert.equal(lines.length, Number(n), lines.join(' | '));
  }],

  // ── render writes under a new path and over nothing (D82, D29)
  [/^"([^"]*)" is byte-identical to before$/u, (w, name) => {
    const s = bench(w);
    assert.equal(digestOf(join(s.corpus ?? '', name)), s.before, `${name} was rewritten`);
  }],
  [/^the rendered skeletons are written under a new path the output names$/u, (w) => {
    const s = bench(w);
    const dir = /rendered into (.+)/u.exec(s.stdout)?.[1]?.trim();
    assert.ok(dir !== undefined, `the render named no path: ${JSON.stringify(s.stdout)}`);
    assert.notEqual(dir, s.corpus, 'render wrote into the directory it was given');
    assert.equal(dir, join(s.corpus ?? '', 'docketry-render'));
    assert.deepEqual(readdirSync(s.corpus ?? '').toSorted(), [s.deliverable ?? '', 'docketry-render'].toSorted());
    assert.ok(readdirSync(dir).includes('docket-skeletons.feature'), readdirSync(dir).join(', '));
  }],

  // ── the formatter, the one deliberate writer (D40, D30)
  [/^the entry ([A-Z]\d+) has its slot text beginning at the tenth column$/u, (w, id) => {
    bench(w).entry = id;
    const lines = entryBlock(lastRun(w), id).filter((l) => KEYWORD_LINE.test(l));
    assert.ok(lines.length > 0, `entry ${id} has no keyword line`);
    for (const line of lines) {
      const m = KEYWORD_LINE.exec(line);
      const word = m?.[1] ?? '';
      const expectedGap = `${word}:`.length >= 7 ? ' ' : ' '.repeat(7 - `${word}:`.length);
      assert.equal(m?.[2] ?? '', expectedGap, `slot text is not aligned to the tenth column (D196): ${JSON.stringify(line)}`);
    }
  }],
  [/^its slots are in the order ([a-z, ]+)$/u, (w, order) => {
    const id = bench(w).entry ?? builder(w).subject;
    const words = entryBlock(lastRun(w), id)
      .map((l) => KEYWORD_LINE.exec(l)?.[1] ?? '')
      .filter((word) => (SLOT_KEYWORDS as readonly string[]).includes(word));
    assert.deepEqual(words, order.split(/,\s*/u));
  }],
  [/^the file is byte-identical after each run$/u, (w) => {
    const before = builder(w).saved();
    for (const [i, out] of bench(w).runs.entries()) assert.equal(out, before, `run ${i + 1} rewrote the file`);
  }],
  [/^the docket's checksum is unchanged$/u, (w) => {
    const s = bench(w);
    assert.equal(digestOf(s.file ?? ''), s.digest);
  }],

  // ── hashes and trees across the formatter (D185)
  [/^the hash of ([A-Z]\d+) is the same in both parses$/u, (w, id) => {
    const [first, second] = bothParses(w);
    assert.equal(entryOf(first, id).hash, entryOf(second, id).hash);
  }],
  [/^the chain hash is the same in both parses$/u, (w) => {
    const [first, second] = bothParses(w);
    assert.equal(first.chainHash, second.chainHash);
  }],
  [/^the two trees agree on every field of ([A-Z]\d+) except line$/u, (w, id) => {
    const [first, second] = bothParses(w);
    assert.deepEqual(withoutPosition(entryOf(first, id)), withoutPosition(entryOf(second, id)));
  }],

  // ── in-process, and the same findings the command line reports (D42)
  [/^each call returns without spawning a child process$/u, (w) => {
    const s = bench(w);
    assert.equal(s.calls.length, 4, 'the four functions were not all called');
    for (const [i, value] of s.calls.entries()) {
      assert.ok(value !== null && value !== undefined, `call ${i + 1} returned nothing`);
      assert.ok(!(value instanceof Promise), `call ${i + 1} returned a promise, not a value`);
    }
    const shells = readdirSync(DIST, { recursive: true, encoding: 'utf8' })
      .filter((f) => f.endsWith('.js'))
      .filter((f) => /child_process|\bspawn|\bexecFile|\bexecSync/u.test(readFileSync(join(DIST, f), 'utf8')));
    assert.deepEqual(shells, [], 'the package reaches for a child process');
  }],
  [/^lintDocket's result carries the same findings the command line reports$/u, (w) => {
    const s = bench(w);
    const run = capture(() => main(['lint', s.file ?? '', '--json']));
    assert.equal(run.code, 0, run.out);
    const cli = JSON.parse(run.out) as Record<string, unknown>;
    const inProcess = JSON.parse(JSON.stringify(s.machine)) as Record<string, unknown>;
    assert.deepEqual(inProcess.findings, cli.findings);
    assert.deepEqual(inProcess, cli);
  }],
];
