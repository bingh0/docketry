// Steps particular to features/the-report-and-its-exits.feature: the two
// modes, the three exit codes, the machine form, and the lines the report is
// specified by (D10, D22, D26, D27, D29, D33, D38, D79, D183).
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GRAMMAR_VERSION, LAYERS, lintDocket, LINT_VERSION, loadGnt, parseDocket, reportMachine, reportText, RULE_WORDS } from '../../dist/index.js';
import type { Finding, LintOptions, LintResult, Report } from '../../dist/index.js';
import type { Table } from './bind.ts';
import { builder, report, reportLine, SCRATCH, type World } from './world.ts';

const BIN = fileURLToPath(new URL('../../bin/docketry.js', import.meta.url));
const GRAMMAR_MD = fileURLToPath(new URL('../../GRAMMAR.md', import.meta.url));

/** what the corpus directory holds, when a scenario asks for one */
type Corpus = 'none' | 'bare' | 'untagged' | 'full';

interface Scene {
  /** the docket this feature cannot state through the builder (D26) */
  state: 'empty' | 'comments only' | 'a path that is missing' | null;
  corpus: Corpus;
  /** the report text of each run, for the twice-in-a-row comparison */
  texts: string[];
  machine: Record<string, unknown> | null;
  sums: Map<string, string>;
}

const scenes = new WeakMap<World, Scene>();
const scene = (w: World): Scene => {
  const seen = scenes.get(w);
  if (seen) return seen;
  const made: Scene = { state: null, corpus: 'none', texts: [], machine: null, sums: new Map() };
  scenes.set(w, made);
  return made;
};

const show = (list: readonly Finding[]): string => list.map((f) => `${f.key} [${f.rule}] ${f.message}`).join(' | ');
const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

// ── the corpus a report scenario asks for ────────────────────────────────────
const UNTAGGED_FEATURE = 'Feature: archive\n\n  Scenario: a folder is renamed\n    Given a thing\n';
const TAGGED_FEATURE = 'Feature: archive\n\n  @R13\n  Scenario: a dropped file is listed\n    Given a thing\n';
const FENCE = '# Out of scope\n\n## Declined\n\n- **A road closed.** The prose of the entry. (R99, 2026-09-05)\n';
const LEDGER = '# User needs\n\n- **N9** (visionary, wt 5) — *the need as the ledger states it.* Evidence: the interview itself.\n';
const DESIGN = '# DESIGN\n\n- the constraint the ruling fixes. [ruled: E1]\n';

function writeCorpus(dir: string, kind: Corpus): void {
  if (kind === 'untagged') writeFileSync(join(dir, 'archive.feature'), UNTAGGED_FEATURE, 'utf8');
  if (kind === 'full') {
    writeFileSync(join(dir, 'archive.feature'), TAGGED_FEATURE, 'utf8');
    writeFileSync(join(dir, 'OUT-OF-SCOPE.md'), FENCE, 'utf8');
    writeFileSync(join(dir, 'USER-NEEDS.md'), LEDGER, 'utf8');
    writeFileSync(join(dir, 'DESIGN.md'), DESIGN, 'utf8');
  }
}

/** the docket, and the deliverables beside it, on disk under the scratchpad */
function prepare(w: World, kind: Corpus): { dir: string; text: string } {
  const b = builder(w);
  const text = b.saved();
  const dir = join(SCRATCH, `docketry-report-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  w.defer(() => { rmSync(dir, { recursive: true, force: true }); });
  writeFileSync(join(dir, 'DOCKET.md'), text, 'utf8');
  writeCorpus(dir, kind);
  w.dir = dir;
  w.text = text;
  return { dir, text };
}

const checksums = (dir: string): Map<string, string> =>
  new Map(readdirSync(dir).toSorted().map((f) => [f, sha(readFileSync(join(dir, f), 'utf8'))]));

// ── running ─────────────────────────────────────────────────────────────────
/** the library run: the docket as the builder states it, with or without a corpus */
function runLint(w: World, opts: LintOptions & { corpus?: string | undefined } = {}, kind: Corpus = 'none'): Report | null {
  const b = builder(w);
  b.ensureAny();
  const { dir, text } = prepare(w, kind);
  const full: LintOptions = { ...opts };
  if (kind !== 'none' && opts.corpus === undefined) full.corpus = dir;
  if (b.strict) full.strict = true;
  if (scene(w).sums.size === 0 && kind === 'full') scene(w).sums = checksums(dir);
  w.parsed = parseDocket(text);
  const linted = lintDocket(text, full);
  w.linted = linted;
  w.exit = linted.ok ? linted.report.exitCode : 2;
  if (linted.ok) scene(w).texts.push(reportText(linted.report));
  return linted.ok ? linted.report : null;
}

/**
 * The CLI run: only the CLI can be handed a docket that is empty, comments
 * only, or a path that is not there, so the three causes of exit two are
 * asserted against the tool the operator runs (D26).
 */
function runCli(w: World, state: NonNullable<Scene['state']>, strict: boolean): void {
  const dir = join(SCRATCH, `docketry-report-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  w.defer(() => { rmSync(dir, { recursive: true, force: true }); });
  const file = join(dir, 'DOCKET.md');
  if (state === 'empty') writeFileSync(file, 'docket: 1\n', 'utf8');
  if (state === 'comments only') writeFileSync(file, 'docket: 1\n\n# a note that records nothing\n# and a second note\n', 'utf8');
  const ran = spawnSync(process.execPath, [BIN, 'lint', file, ...(strict ? ['--strict'] : [])], { encoding: 'utf8' });
  const failed: LintResult = { ok: false, refusals: [{ line: 0, message: ran.stderr.trim() }], exitCode: 2 };
  w.dir = dir;
  w.linted = failed;
  w.exit = ran.status ?? 2;
}

// ── the grammar reference's rule words, read here so this file stands alone ──
const cells = (row: string): string[] => row.split('|').slice(1, -1).map((s) => s.trim());
const ticks = (s: string): string[] => [...s.matchAll(/`([^`]*)`/gu)].map((m) => m[1] ?? '');

function grammarRuleWords(md: string): Record<string, string[]> {
  const lines = md.split('\n');
  const at = lines.findIndex((l) => l.trim().toLowerCase() === '### rule words');
  assert.ok(at >= 0, 'GRAMMAR.md has no "### Rule words" heading');
  const out: Record<string, string[]> = {};
  const rows: string[][] = [];
  for (let i = at + 1; i < lines.length; i++) {
    const line = (lines[i] ?? '').trim();
    if (line === '') { if (rows.length > 0) break; continue; }
    if (!line.startsWith('|')) break;
    rows.push(cells(line));
  }
  // the column-name row and the |---| rule
  for (const row of rows.slice(2)) out[ticks(row[0] ?? '')[0] ?? ''] = ticks(row[1] ?? '');
  return out;
}

const sameSet = (a: readonly string[], b: readonly string[], what: string): void => {
  assert.deepEqual(a.toSorted(), b.toSorted(), `${what} differ`);
};

export const reportSteps: Table = [
  // ── dockets stated by the findings they carry ─────────────────────────────
  [/^a docket whose entry ([A-Z]\d+) has trigger provenance (\S+) and an unspread quantity in its response$/u, (w, id, tag) => {
    const b = builder(w);
    b.slot(id, 'trig').tags = [tag];
    b.slot(id, 'resp').text = "the file appears in the folder's listing within {2 seconds}";
  }],
  [/^a docket with (\d+) findings$/u, (w, n) => {
    const b = builder(w);
    const count = Number(n);
    if (count === 0) { b.ensure('R13'); return; }
    // one inferred trigger per entry: the header tag follows its lowest slot,
    // so the entry is otherwise well-formed and states exactly one finding
    for (let i = 0; i < count; i++) b.slot(`R${12 + i}`, 'trig').tags = ['I'];
  }],
  [/^a docket with (\d+) entries of which (\d+) lack a sib line$/u, (w, n, missing) => {
    const b = builder(w);
    for (let i = 0; i < Number(n); i++) {
      const id = `R${12 + i}`;
      b.ensure(id);
      if (i < Number(missing)) b.removeRaw(id, 'sib');
    }
  }],
  [/^a docket that is (empty|comments only|a path that is missing)$/u, (w, state) => {
    builder(w);
    scene(w).state = state as NonNullable<Scene['state']>;
  }],
  [/^a docket whose entry ([A-Z]\d+) has a trigger$/u, (w, id) => { builder(w).slot(id, 'trig'); }],
  [/^a later entry ([A-Z]\d+) amends ([A-Z]\d+) with a response slot and no trigger$/u, (w, id, target) => {
    const b = builder(w);
    b.later(id, 'amends', target, null, null);
    b.setBody(id, ['resp', 'touches']);
  }],
  [/^a later entry ([A-Z]\d+) reverses ([A-Z]\d+)$/u, (w, id, target) => { builder(w).later(id, 'reverses', target, null, null); }],
  [/^a docket whose entry ([A-Z]\d+) response on line (\d+) reads "([^"]*)"$/u, (w, id, line, text) => {
    const b = builder(w);
    b.slot(id, 'resp').text = text;
    b.ensure(id).pad = { line: Number(line), marker: 'slot:resp' };
  }],
  [/^([A-Z]\d+) has trigger provenance (\S+)$/u, (w, id, tag) => { builder(w).slot(id, 'trig').tags = [tag]; }],
  [/^a docket with findings in every layer$/u, (w) => {
    const b = builder(w);
    b.ensure('N0');                                     // coverage: a need nothing serves
    b.slot('R12', 'trig').tags = ['I'];                 // provenance: an inferred trigger
    b.slot('R13', 'resp').text = 'the listing appears within 2 seconds';  // form: a bare digit run
    b.setBody('R14', ['resp', 'touches']);              // resolution: no trigger, no resolution
    b.setBody('R15', ['trig', 'resp', 'sib']);          // consistency: no touches line
    b.slot('R16', 'resp').text = "the file appears in the folder's listing within {2 seconds}";
    scene(w).corpus = 'untagged';                       // traceability: a scenario with no tag
  }],
  [/^a docket and a corpus with recorded checksums$/u, (w) => {
    builder(w).ensure('R13');
    scene(w).corpus = 'full';
  }],

  // ── the instrument ────────────────────────────────────────────────────────
  [/^lint version (\S+) parsing grammar version (\d+)$/u, (w, lint, grammar) => {
    builder(w);
    assert.equal(LINT_VERSION, lint);
    assert.equal(GRAMMAR_VERSION, Number(grammar));
  }],
  [/^a corpus directory$/u, (w) => { scene(w).corpus = 'bare'; }],
  [/^gnt parser version (\S+) installed$/u, (w, version) => {
    builder(w);
    assert.equal(loadGnt()?.version, version);
  }],
  [/^the findings format version (\d+)$/u, (w, v) => {
    assert.equal(v, '1');
    builder(w).ensure('R13');
  }],

  // ── running ───────────────────────────────────────────────────────────────
  [/^the docket is linted in (default|strict) mode$/u, (w, mode) => {
    const s = scene(w);
    if (mode === 'strict') builder(w).strict = true;
    if (s.state !== null) { runCli(w, s.state, mode === 'strict'); return; }
    runLint(w);
  }],
  [/^the docket is linted without a corpus$/u, (w) => { runLint(w); }],
  [/^the docket is linted with the corpus$/u, (w) => {
    const kind = scene(w).corpus;
    runLint(w, {}, kind === 'none' ? 'bare' : kind);
  }],
  [/^the docket is linted with the corpus path "([^"]*)"$/u, (w, path) => { runLint(w, { corpus: path }); }],
  [/^the docket is linted with machine output$/u, (w) => {
    const r = runLint(w);
    assert.ok(r, 'the docket was refused');
    scene(w).machine = reportMachine(r);
  }],
  [/^the docket is linted twice in a row$/u, (w) => {
    runLint(w);
    runLint(w);
  }],
  [/^its declaration is read$/u, (w) => {
    const r = runLint(w);
    assert.ok(r, 'the docket was refused');
    const machine = reportMachine(r);
    scene(w).machine = machine;
    w.tables = { 'rule words': machine['rules'] as Record<string, string[]> };
  }],

  // ── the report's lines ────────────────────────────────────────────────────
  [/^the report's (form|provenance|resolution|coverage|consistency|traceability) row lists the key "([^"]*)"$/u, (w, layer, key) => {
    const row = report(w).layers.find((x) => x.layer === layer);
    assert.ok(row?.findings.some((f) => f.key === key), show(row?.findings ?? []));
    const lines = reportText(report(w)).split('\n');
    assert.ok(lines.some((l) => l.startsWith(`  ${key} L`)), `no report line for ${key}`);
  }],
  [/^the report's findings count is (\d+)$/u, (w, n) => {
    assert.equal(reportLine(w, /^findings: /u), `findings: ${n}`, show(report(w).findings));
  }],
  [/^the report lists (\d+) findings$/u, (w, n) => {
    assert.equal(reportLine(w, /^findings: /u), `findings: ${n}`, show(report(w).findings));
    assert.equal(report(w).findings.length, Number(n));
  }],
  [/^the report lists the same (\d+) findings as default mode$/u, (w, n) => {
    const strict = report(w).findings;
    assert.equal(strict.length, Number(n), show(strict));
    const again = lintDocket(w.text ?? '');
    assert.ok(again.ok, 'the docket was refused in default mode');
    assert.deepEqual(again.report.findings, strict);
    assert.equal(again.report.exitCode, 0);
  }],
  [/^the (form|provenance|resolution|coverage|consistency|traceability) layer lists (\d+) findings$/u, (w, layer, n) => {
    const row = report(w).layers.find((x) => x.layer === layer);
    assert.equal(row?.findings.length, Number(n));
  }],
  [/^no line of the report reads "([^"]*)"$/u, (w, text) => {
    const hit = reportText(report(w)).split('\n').find((l) => l.includes(text));
    assert.equal(hit, undefined, `a report line reads "${text}": ${hit ?? ''}`);
  }],
  [/^the finding names line (\d+) and the key "([^"]*)"$/u, (w, line, key) => {
    const hits = report(w).findings.filter((f) => f.line === Number(line) && f.key === key);
    assert.equal(hits.length, 1, show(report(w).findings));
    w.found = hits;
  }],
  [/^the report's de-triggered line names "([^"]*)"$/u, (w, text) => {
    const line = reportLine(w, /^de-triggered: /u);
    assert.ok(line.includes(text), line);
  }],
  [/^the report's not-counted line reads "([^"]*)"$/u, (w, text) => {
    assert.equal(reportLine(w, /^not counted: /u), text);
  }],
  [/^the report's first line names lint version (\S+), grammar version (\d+), and that the gnt parser was not used$/u, (w, lint, grammar) => {
    const first = reportText(report(w)).split('\n')[0] ?? '';
    assert.equal(first, `docketry ${lint} — grammar ${grammar} — gnt parser not used`);
    assert.equal(report(w).instrument.gnt, null);
  }],
  [/^the report's first line contains "([^"]*)"$/u, (w, text) => {
    const first = reportText(report(w)).split('\n')[0] ?? '';
    assert.ok(first.includes(text), first);
  }],
  [/^the refusal names "([^"]*)"$/u, (w, text) => {
    const r = w.linted;
    assert.ok(r && !r.ok, 'the docket was not refused');
    assert.ok(r.refusals.some((x) => x.message.includes(text)), r.refusals.map((x) => x.message).join('\n'));
  }],

  // ── the machine form ──────────────────────────────────────────────────────
  [/^the output's first key is "([^"]*)" with value (\d+)$/u, (w, key, value) => {
    const m = scene(w).machine ?? {};
    assert.equal(Object.keys(m)[0], key);
    assert.equal(m[key], Number(value));
  }],
  [/^the single finding carries entry "([^"]*)", slot "([^"]*)", layer "([^"]*)", a rule, and a line$/u, (w, entry, slot, layer) => {
    const found = (scene(w).machine?.['findings'] ?? []) as Record<string, unknown>[];
    assert.equal(found.length, 1, JSON.stringify(found));
    const one = found[0] ?? {};
    assert.equal(one['entry'], entry);
    assert.equal(one['slot'], slot);
    assert.equal(one['layer'], layer);
    assert.ok(typeof one['rule'] === 'string' && one['rule'] !== '', 'the finding carries no rule');
    assert.ok(typeof one['line'] === 'number' && (one['line'] as number) > 0, 'the finding carries no line');
  }],

  // ── read-only, and the same twice ─────────────────────────────────────────
  [/^both reports are byte-identical$/u, (w) => {
    const [first, second] = scene(w).texts;
    assert.equal(scene(w).texts.length, 2);
    assert.equal(second, first);
  }],
  [/^every input file's checksum is unchanged$/u, (w) => {
    const before = scene(w).sums;
    assert.ok(before.size > 1, 'no checksums were recorded');
    assert.deepEqual([...checksums(w.dir ?? '')], [...before]);
  }],

  // ── the closed set of rule words ──────────────────────────────────────────
  [/^every finding's rule word is a member of the declared set for its layer$/u, (w) => {
    const r = report(w);
    const declared = RULE_WORDS as Record<string, readonly string[]>;
    for (const row of r.layers) {
      if (row.status !== 'ran') continue;
      assert.ok(row.findings.length > 0, `the ${row.layer} layer has no finding`);
      for (const f of row.findings) assert.ok(declared[f.layer]?.includes(f.rule), `${f.layer} rule "${f.rule}" is outside the declared set`);
    }
  }],
  [/^it lists the rule words per layer as a closed set$/u, (w) => {
    const rules = (w.tables?.['rule words'] ?? {}) as Record<string, string[]>;
    sameSet(Object.keys(rules), [...LAYERS], 'rule-word layers');
    for (const [layer, words] of Object.entries(rules)) {
      assert.ok(words.length > 0, `${layer} declares no rule word`);
      assert.equal(new Set(words).size, words.length, `${layer} repeats a rule word`);
      sameSet(words, (RULE_WORDS as Record<string, readonly string[]>)[layer] ?? [], `${layer} rule words`);
    }
  }],
  [/^the set equals the grammar reference's table of rule words$/u, (w) => {
    const rules = (w.tables?.['rule words'] ?? {}) as Record<string, string[]>;
    const md = grammarRuleWords(readFileSync(GRAMMAR_MD, 'utf8'));
    sameSet(Object.keys(md), Object.keys(rules), 'rule-word layers');
    for (const [layer, words] of Object.entries(rules)) sameSet(md[layer] ?? [], words, `${layer} rule words`);
  }],
];
