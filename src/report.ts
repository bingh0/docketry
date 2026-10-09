import { readFileSync } from 'node:fs';
import { existsSync, statSync } from 'node:fs';
import { FINDINGS_FORMAT, GRAMMAR_VERSION, LAYERS, RULE_WORDS, TAGS, type Layer } from './grammar.js';
import { loadGnt, readDeliverables, type Deliverables, type GntApi } from './deliverables.js';
import { parseDocket } from './parse.js';
import { consistencyLayer, coverageLayer, formLayer, provenanceLayer, resolutionLayer, type Counted } from './lint/layers.js';
import { notCountedWithoutCorpus, traceabilityLayer, type NotCounted } from './lint/traceability.js';
import { assertFindingsFormat } from './formats.js';
import type { DocketTree, Finding, Refusal } from './tree.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
export const LINT_VERSION: string = pkg.version;

export interface LintOptions {
  /** directory holding the corpus (*.feature) and the deliverables beside it */
  corpus?: string | undefined;
  asOf?: string | undefined;
  strict?: boolean | undefined;
  /** override the gnt loader (tests use it to simulate absence) */
  loadGnt?: (() => GntApi | null) | undefined;
}

export interface LayerRow { layer: Layer; status: 'ran' | 'dark'; reason: string | null; findings: Finding[] }

export interface Report {
  instrument: { lint: string; grammar: number; gnt: string | null };
  layers: LayerRow[];
  findings: Finding[];
  counted: Counted;
  notCounted: NotCounted[];
  tree: DocketTree;
  exitCode: 0 | 1;
}

export type LintResult = { ok: true; report: Report } | { ok: false; refusals: Refusal[]; exitCode: 2 };

export function lintDocket(text: string, opts: LintOptions = {}): LintResult {
  const parsed = parseDocket(text, opts.asOf === undefined ? {} : { asOf: opts.asOf });
  if (!parsed.ok) return { ok: false, refusals: parsed.refusals, exitCode: 2 };
  const { tree } = parsed;
  if (tree.entries.length === 0) return { ok: false, refusals: [{ line: 1, message: 'zero entries: nothing to lint is a could-not-run, never a clean report' }], exitCode: 2 };
  let deliverables: Deliverables | null = null;
  let gnt: GntApi | null = null;
  if (opts.corpus !== undefined) {
    if (!existsSync(opts.corpus) || !statSync(opts.corpus).isDirectory()) return { ok: false, refusals: [{ line: 0, message: `corpus path "${opts.corpus}" is not a directory` }], exitCode: 2 };
    gnt = (opts.loadGnt ?? loadGnt)();
    if (!gnt) return { ok: false, refusals: [{ line: 0, message: 'a corpus was given and the gnt parser (gherkin-node-test) is not installed where the lint runs; install it, or lint without a corpus' }], exitCode: 2 };
    try { deliverables = readDeliverables(opts.corpus, gnt); } catch (err) { return { ok: false, refusals: [{ line: 0, message: `the corpus could not be read: ${(err as Error).message}` }], exitCode: 2 }; }
  }
  const counted: Counted = {
    distribution: Object.fromEntries(TAGS.map((t) => [t, 0])) as Counted['distribution'],
    noSibByReason: 0, coveredByInferred: [], fencedNeeds: [], spreadUnverified: [], ratified: [], visionaryRelations: [], deTriggered: [],
    unresolved: [], withoutWhy: [], signed: [],
  };
  const notCounted: NotCounted[] = [];
  const rows: LayerRow[] = [
    { layer: 'form', status: 'ran', reason: null, findings: formLayer(tree, parsed.findings) },
    { layer: 'provenance', status: 'ran', reason: null, findings: provenanceLayer(tree, counted) },
    { layer: 'resolution', status: 'ran', reason: null, findings: resolutionLayer(tree) },
    { layer: 'coverage', status: 'ran', reason: null, findings: coverageLayer(tree, counted, deliverables !== null) },
    { layer: 'consistency', status: 'ran', reason: null, findings: consistencyLayer(tree, counted) },
    deliverables
      ? { layer: 'traceability', status: 'ran', reason: darkDestinations(deliverables), findings: traceabilityLayer(tree, deliverables, notCounted) }
      : { layer: 'traceability', status: 'dark', reason: 'no corpus given', findings: [] },
  ];
  if (!deliverables) notCounted.push(...notCountedWithoutCorpus(tree));
  for (const r of rows) r.findings.sort((a, b) => a.line - b.line || a.key.localeCompare(b.key));
  const findings = rows.flatMap((r) => r.findings);
  const report: Report = {
    instrument: { lint: LINT_VERSION, grammar: GRAMMAR_VERSION, gnt: gnt?.version ?? null },
    layers: rows, findings, counted, notCounted, tree,
    exitCode: opts.strict && findings.length > 0 ? 1 : 0,
  };
  return { ok: true, report };
}

/** D195: a destination with no input is named dark on the row, never counted as a miss. */
const darkDestinations = (d: Deliverables): string | null => {
  const dark = [d.scenarios === null ? 'scenarios' : null, d.fence === null ? 'fence' : null, d.ledger === null ? 'ledger' : null, d.design === null ? 'design' : null].filter((x): x is string => x !== null);
  return dark.length > 0 ? `dark: ${dark.join(', ')}` : null;
};

const notCountedLine = (r: Report): string => {
  const counts = new Map<string, number>();
  for (const n of r.notCounted) {
    const kind = n.reason.startsWith('reversed') ? 'reversed' : n.reason.startsWith('resolves to boundary') ? 'boundary' : n.reason.startsWith('a ') ? 'relation' : n.reason.startsWith('resolves to need') ? 'need' : n.reason.startsWith('resolved;') ? 'fenced' : 'alias';
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  const order = ['boundary', 'relation', 'reversed', 'need', 'fenced', 'alias'];
  const parts = order.filter((k) => counts.has(k)).map((k) => `${k} ${counts.get(k)}`);
  return `not counted: ${parts.length > 0 ? parts.join(', ') : 'none'}`;
};

/** The human report: every line specified by content (D79); nothing hidden, nothing rolled up (D27). */
export function reportText(r: Report): string {
  const c = r.counted;
  const lines: string[] = [
    `docketry ${r.instrument.lint} — grammar ${r.instrument.grammar} — ${r.instrument.gnt ? `gnt parser ${r.instrument.gnt}` : 'gnt parser not used'}`,
    `entries: ${r.tree.entries.length} (${r.tree.entries.filter((e) => e.kind === 'ruling').length} rulings, ${r.tree.entries.filter((e) => e.kind === 'need').length} needs); as of ${r.tree.asOf}; chain ${r.tree.chainHash.slice(0, 12)}`,
  ];
  for (const row of r.layers) {
    if (row.status === 'dark') { lines.push(`${row.layer}: dark (${row.reason})`); continue; }
    lines.push(`${row.layer}: ${row.findings.length}${row.reason === null ? '' : ` (${row.reason})`}`);
    for (const f of row.findings) lines.push(`  ${f.key} L${f.line} [${f.rule}] ${f.message}${f.fix ? ` — fix: ${f.fix}` : ''}`);
  }
  lines.push(
    `provenance: ${TAGS.map((t) => `${t} ${c.distribution[t]}`).join(', ')}`,
    `no sibling by reason: ${c.noSibByReason}`,
    `covered by inferred: ${c.coveredByInferred.length}${c.coveredByInferred.length > 0 ? ` (${c.coveredByInferred.map((p) => `${p.wanted} by ${p.by}`).join(', ')})` : ''}`,
    `fenced needs: ${c.fencedNeeds.length > 0 ? c.fencedNeeds.join(', ') : 'none'}`,
    // D118: dark traceability verifies nothing; D221: an unresolved island stays unverified whatever the corpus holds
    ...(r.layers[5]?.status === 'dark' || c.spreadUnverified.length > 0 ? [`spread, unverified: ${c.spreadUnverified.length > 0 ? c.spreadUnverified.join(', ') : 'none'}`] : []),
    `unresolved quantities: ${c.unresolved.length}${c.unresolved.length > 0 ? ` (${c.unresolved.map((q) => `${q.id} ${q.slot} {${q.text}}`).join(', ')})` : ''}`,
    `quantities without why: ${c.withoutWhy.length}${c.withoutWhy.length > 0 ? ` (${c.withoutWhy.map((q) => `${q.id} ${q.slot}`).join(', ')})` : ''}`,
    `ratified: ${c.ratified.length > 0 ? c.ratified.map((x) => `${x.id} for ${x.target} on ${x.date ?? '?'}`).join(', ') : 'none'}`,
    `signed: ${c.signed.length > 0 ? c.signed.map((x) => `${x.id} for ${x.target} on ${x.date ?? '?'}`).join(', ') : 'none'}`,
    `visionary-tagged relations: ${c.visionaryRelations.length > 0 ? c.visionaryRelations.join(', ') : 'none'}`,
    `de-triggered: ${c.deTriggered.length}${c.deTriggered.length > 0 ? ` (${c.deTriggered.map((x) => `${x.id} for ${x.target}`).join(', ')})` : ''}`,
    notCountedLine(r),
  );
  for (const n of r.notCounted) lines.push(`  ${n.id}: ${n.reason}`);
  lines.push(`findings: ${r.findings.length}`);
  return `${lines.join('\n')}\n`;
}

/** The machine form (D22, D79, D183): declares its format, the rule words, and keys every finding. */
export function reportMachine(r: Report): Record<string, unknown> {
  const out = {
    'docket-findings': FINDINGS_FORMAT,
    instrument: r.instrument,
    rules: RULE_WORDS,
    layers: r.layers.map((row) => ({ layer: row.layer, status: row.status, reason: row.reason, count: row.status === 'ran' ? row.findings.length : null })),
    findings: r.findings.map((f) => ({ entry: f.entry, slot: f.slot, layer: f.layer, rule: f.rule, line: f.line, key: f.key, message: f.message, fix: f.fix, ...(f.where ? { where: f.where } : {}) })),
    counted: { ...r.counted, notCounted: r.notCounted },
    count: r.findings.length,
    exit: r.exitCode,
  };
  assertFindingsFormat(out);
  return out;
}

export function refusalText(refusals: Refusal[]): string {
  return `${refusals.map((x) => `refused${x.line ? ` (line ${x.line})` : ''}: ${x.message}`).join('\n')}\n`;
}

export { LAYERS };
