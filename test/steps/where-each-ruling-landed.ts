// Steps particular to features/where-each-ruling-landed.feature: the four
// deliverables a ruling can land in — the corpus, the fence, the ledger, the
// design doc — written exactly as the readers in src/deliverables.ts expect
// them, and the three ways the lint is pointed at them (D23, D24, D68, D77,
// D88, D111).
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chainOf, effectiveShape, FENCE_SECTION, lintDocket, parseDocket, roots } from '../../dist/index.js';
import type { Finding, LintOptions } from '../../dist/index.js';
import type { Table } from './bind.ts';
import { builder, layerOf, refusals, report, reportLine, SCRATCH, type DocketBuilder, type World } from './world.ts';

// ── what a scenario said about its deliverables, beside the builder ──────────
interface Row { title: string; tags: string[]; outline: boolean }
interface Scene {
  /** ids the scenario said no scenario cites: never given a filler scenario */
  uncited: Set<string>;
  /** the `where` string of the fence entry and of the ledger row last written */
  fence: string | null;
  ledger: string | null;
  /** the file line of the fence entry and of the ruled tag last written */
  fenceLine: number;
  designLine: number;
}

const scenes = new WeakMap<World, Scene>();
const scene = (w: World): Scene => {
  const seen = scenes.get(w);
  if (seen) return seen;
  const made: Scene = { uncited: new Set(), fence: null, ledger: null, fenceLine: 0, designLine: 0 };
  scenes.set(w, made);
  return made;
};

const keep = (w: World, list: Finding[]): Finding[] => { w.found = list; return list; };
const trace = (w: World): Finding[] => layerOf(w, 'traceability');
const show = (list: Finding[]): string => list.map((f) => `${f.key} [${f.rule}] ${f.message}`).join(' | ');

/** the resolution kind a draft's `->` line carries, as the scenario wrote it */
function kindOf(b: DocketBuilder, id: string): string | null {
  const line = b.draft(id)?.body.find((x) => x.t === 'raw' && x.key === 'res');
  return line?.t === 'raw' ? /->\s+(\S+)/u.exec(line.text)?.[1] ?? null : null;
}

/** the entry whose resolution references this need */
function resolverOf(b: DocketBuilder, need: string): string {
  const hit = b.drafts.find((d) => d.body.some((x) => x.t === 'raw' && x.key === 'res' && x.text.endsWith(` ${need}`)));
  assert.ok(hit, `no entry resolves to ${need}`);
  return hit.id;
}

/**
 * A docket that names an id holds it. common.ts states a relation without
 * drafting its target, and states `-> need N<n>` without drafting the need;
 * both are entries this feature's scenarios describe, so draft them before the
 * docket is written.
 */
function closeReferences(b: DocketBuilder): void {
  const named: string[] = [];
  for (const d of b.drafts) {
    if (d.relation) named.push(d.relation.target);
    for (const line of d.body) {
      if (line.t !== 'raw' || line.key !== 'res') continue;
      const ref = /->\s+(?:means|need)\s+(N\d+)/u.exec(line.text)?.[1];
      if (ref !== undefined) named.push(ref);
    }
  }
  for (const id of named) b.ensure(id);
}

// ── the corpus ───────────────────────────────────────────────────────────────
function featureText(rows: readonly Row[]): string {
  const out = ['Feature: archive', ''];
  for (const r of rows) {
    if (r.tags.length > 0) out.push(`  ${r.tags.map((t) => `@${t}`).join(' ')}`);
    out.push(`  ${r.outline ? 'Scenario Outline' : 'Scenario'}: ${r.title}`);
    if (r.outline) out.push('    Given a thing of <size>', '', '    Examples:', '      | size |', '      | one  |', '      | two  |', '');
    else out.push('    Given a thing', '');
  }
  return out.join('\n');
}

/**
 * The corpus the scenario described, completed so only the defect under test
 * shows: every triggered ruling in effect the scenario did not declare uncited
 * gets the scenario that cites it, as a real corpus would.
 */
function corpusRows(w: World, b: DocketBuilder, text: string): Row[] {
  const rows: Row[] = b.corpusFeature.map((r) => ({ title: r.title, tags: [...r.tags], outline: r.outline }));
  const tagged = new Set(rows.flatMap((r) => r.tags));
  const parsed = parseDocket(text);
  if (parsed.ok) {
    for (const r of roots(parsed.tree)) {
      if (r.kind !== 'ruling' || !r.inEffect) continue;
      const x = effectiveShape(parsed.tree, r);
      if (x.resolution || !x.slots.trig) continue;
      const chain = [...chainOf(parsed.tree, r.id)];
      if (chain.some((id) => tagged.has(id) || scene(w).uncited.has(id))) continue;
      rows.push({ title: `${r.id} is proved here`, tags: [r.id], outline: false });
      for (const id of chain) tagged.add(id);
    }
  }
  // a feature file with no scenario is refused by the gnt parser, and a corpus
  // with no ruling tag left to carry is still a corpus
  if (rows.length === 0) rows.push({ title: 'an unrelated behaviour', tags: ['smoke'], outline: false });
  return rows;
}

// ── the fence, the ledger, the design doc ────────────────────────────────────
const FENCE_HEAD = ['# Out of scope — the fixture fence', '', 'Every entry below is also a resolution in the docket, cited by docket id.', ''];

function setFence(w: World, section: string, entry: string): void {
  const lines = [...FENCE_HEAD, `## ${section}`, '', `- ${entry}`, ''];
  builder(w).fenceText = lines.join('\n');
  const s = scene(w);
  s.fence = `OUT-OF-SCOPE.md ${section}`;
  s.fenceLine = lines.indexOf(`- ${entry}`) + 1;
}

/** the section a fence entry recording this ruling belongs under */
const sectionOf = (b: DocketBuilder, id: string): string => FENCE_SECTION[kindOf(b, id) ?? ''] ?? 'Roads not taken';

const cited = (ids: readonly string[]): string => `(${[...ids, '2026-09-05'].join(', ')})`;

function setLedger(w: World, rows: readonly { id: string; cites: readonly string[] }[], row: string): void {
  const lines = ['# User needs — the fixture ledger', ''];
  for (const r of rows) {
    const evidence = r.cites.length > 0 ? `Evidence: ${r.cites.join(', ')}.` : 'Evidence: the interview itself.';
    lines.push(`- **${r.id}** (visionary, wt 5) — *the need as the ledger states it.* ${evidence}`);
  }
  lines.push('');
  builder(w).ledgerText = lines.join('\n');
  scene(w).ledger = `USER-NEEDS.md ${row}`;
  assert.ok(rows.some((r) => r.id === row), `no ledger row ${row}`);
}

/** every need the docket already holds, so a ledger states one defect at a time */
const needRows = (b: DocketBuilder): { id: string; cites: string[] }[] =>
  b.drafts.filter((d) => d.ekind === 'need').map((d) => ({ id: d.id, cites: [] }));

function setDesign(w: World, ids: readonly string[]): void {
  const lines = ['# DESIGN — the fixture', '', `- the constraint the ruling fixes. [ruled: ${ids.join(', ')}]`, ''];
  builder(w).designText = lines.join('\n');
  scene(w).designLine = 3;
}

// ── running the lint ─────────────────────────────────────────────────────────
type Mode = 'corpus' | 'deliverables' | 'none';

/**
 * Write the docket and the deliverables the scenario described into one
 * directory and lint over it. "with the corpus" always writes a feature file;
 * "with the deliverables" writes one only when the scenario described
 * scenarios, so the corpus destination stays dark and a triggered ruling is
 * not reported uncited (D22).
 */
function runLint(w: World, mode: Mode): void {
  const b = builder(w);
  closeReferences(b);
  b.ensureAny();
  const text = b.saved();
  const dir = join(SCRATCH, `docketry-landed-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  w.defer(() => { rmSync(dir, { recursive: true, force: true }); });
  writeFileSync(join(dir, 'DOCKET.md'), text, 'utf8');
  if (mode === 'corpus' || (mode === 'deliverables' && b.corpusFeature.length > 0)) {
    writeFileSync(join(dir, 'archive.feature'), featureText(corpusRows(w, b, text)), 'utf8');
  }
  if (b.fenceText !== '') writeFileSync(join(dir, 'OUT-OF-SCOPE.md'), b.fenceText, 'utf8');
  if (b.ledgerText !== '') writeFileSync(join(dir, 'USER-NEEDS.md'), b.ledgerText, 'utf8');
  if (b.designText !== '') writeFileSync(join(dir, 'DESIGN.md'), b.designText, 'utf8');
  const opts: LintOptions = {};
  if (mode !== 'none') opts.corpus = dir;
  if (b.noGnt) opts.loadGnt = () => null;
  if (b.strict) opts.strict = true;
  w.dir = dir;
  w.text = text;
  w.parsed = parseDocket(text);
  w.linted = lintDocket(text, opts);
  w.exit = w.linted.ok ? w.linted.report.exitCode : 2;
}

export const landedSteps: Table = [
  // ── the docket ────────────────────────────────────────────────────────────
  [/^a docket whose entry ([A-Z]\d+) (?:is a wanted ruling in effect|is a triggered ruling in effect|is a triggered ruling with no resolution|is a triggered ruling|has a trigger)$/u, (w, id) => {
    builder(w).slot(id, 'trig');
  }],
  [/^a docket whose entry ([A-Z]\d+) resolves to (\S+)$/u, (w, id, kind) => {
    builder(w).setLine(id, `-> ${kind}`);
  }],
  [/^a docket whose entry ([A-Z]\d+) has a trigger and whose entry ([A-Z]\d+) amends \1 keeping the trigger$/u, (w, id, amender) => {
    const b = builder(w);
    b.slot(id, 'trig');
    b.later(amender, 'amends', id, null, null);
    b.slot(amender, 'trig');
  }],
  [/^a docket whose entry ([A-Z]\d+) amends ([A-Z]\d+) and \2 has a trigger$/u, (w, amender, id) => {
    const b = builder(w);
    b.slot(id, 'trig');
    b.later(amender, 'amends', id, null, null);
  }],
  [/^a docket whose entry ([A-Z]\d+) resolves to (\S+) and whose entry ([A-Z]\d+) ratifies \1$/u, (w, id, kind, ratifier) => {
    const b = builder(w);
    b.setLine(id, `-> ${kind}`);
    b.later(ratifier, 'ratifies', id, 'V', null);
  }],
  [/^a docket whose entry ([A-Z]\d+) has a trigger and whose entry ([A-Z]\d+) resolves to (\S+)$/u, (w, id, other, kind) => {
    const b = builder(w);
    b.slot(id, 'trig');
    b.setLine(other, `-> ${kind}`);
  }],
  [/^a docket whose entry ([A-Z]\d+) reverses ([A-Z]\d+) and whose entry ([A-Z]\d+) resolves to (\S+)$/u, (w, id, target, other, kind) => {
    const b = builder(w);
    b.slot(target, 'trig');
    b.ensure(id).relation = { type: 'reverses', target };
    b.setLine(other, `-> ${kind}`);
  }],
  [/^a docket with ruling ([A-Z]\d+)$/u, (w, id) => { builder(w).ensure(id); }],
  [/^a docket with need entry ([A-Z]\d+)$/u, (w, id) => { assert.equal(builder(w).ensure(id).ekind, 'need'); }],
  [/^a docket with needs ([A-Z]\d+) through ([A-Z]\d+)$/u, (w, first, last) => {
    const b = builder(w);
    for (let n = Number(first.slice(1)); n <= Number(last.slice(1)); n++) b.ensure(`N${n}`);
  }],
  [/^a docket with two boundary rulings and one ruling resolving to need ([A-Z]\d+)$/u, (w, need) => {
    const b = builder(w);
    b.setLine('R12', '-> boundary');
    b.setLine('R13', '-> boundary');
    b.setLine('R14', `-> need ${need}`);
  }],
  [/^a docket with no entry ([A-Z]\d+)$/u, (w, id) => { assert.equal(builder(w).draft(id), undefined); }],

  // ── the corpus ────────────────────────────────────────────────────────────
  [/^a corpus where the scenario "([^"]*)" carries the tag @([A-Z]\d+)$/u, (w, title, tag) => {
    const b = builder(w);
    b.corpus = true;
    b.corpusFeature.push({ title, tags: [tag], outline: false });
  }],
  [/^a corpus where the scenario "([^"]*)" carries the tag @([A-Z]\d+) and no scenario carries @([A-Z]\d+)$/u, (w, title, tag, absent) => {
    const b = builder(w);
    b.corpus = true;
    b.corpusFeature.push({ title, tags: [tag], outline: false });
    scene(w).uncited.add(absent);
  }],
  [/^a corpus where the scenario "([^"]*)" carries no tag$/u, (w, title) => {
    const b = builder(w);
    b.corpus = true;
    b.corpusFeature.push({ title, tags: [], outline: false });
  }],
  [/^a corpus where no scenario carries the tag @([A-Z]\d+)$/u, (w, tag) => {
    builder(w).corpus = true;
    scene(w).uncited.add(tag);
  }],
  [/^a corpus where "([^"]*)" carries no tag @([A-Z]\d+)$/u, (w, title, tag) => {
    const b = builder(w);
    b.corpus = true;
    b.corpusFeature.push({ title, tags: ['smoke'], outline: false });
    scene(w).uncited.add(tag);
  }],
  // the outline is the only thing said to lack the tag; a scenario elsewhere
  // may still cite the entry, so nothing is added to `uncited` here
  [/^a corpus whose outline "([^"]*)" carries the tag @([A-Z]\d+) and not @([A-Z]\d+)$/u, (w, title, tag, absent) => {
    const b = builder(w);
    b.corpus = true;
    b.ensure(tag);
    b.corpusFeature.push({ title, tags: [tag], outline: true });
    assert.notEqual(tag, absent);
  }],
  [/^a corpus with no scenario outline titled "(?:[^"]*)"$/u, (w) => { builder(w).corpus = true; }],
  [/^a corpus directory$/u, (w) => { builder(w).corpus = true; }],
  [/^no gnt parser installed where the lint runs$/u, (w) => { builder(w).noGnt = true; }],

  // ── the fence ─────────────────────────────────────────────────────────────
  [/^a fence with an entry citing ([A-Z]\d+)$/u, (w, id) => {
    setFence(w, sectionOf(builder(w), id), `**The road this ruling closed.** The prose of the entry. ${cited([id])}`);
  }],
  [/^a fence with no entry citing ([A-Z]\d+)$/u, (w, id) => {
    setFence(w, sectionOf(builder(w), id), '**Another road entirely.** The prose of an entry that cites nothing.');
  }],
  [/^a fence whose ([A-Za-z-]+) entry cites ([A-Z0-9, and]+)$/u, (w, section, ids) => {
    const cites = [...ids.matchAll(/[A-Z]\d+/gu)].map((m) => m[0]);
    setFence(w, section.replaceAll('-', ' '), `**The road this entry records.** The prose of the entry. ${cited(cites)}`);
  }],
  [/^a fence entry citing ([A-Z]\d+) with Guarded by: "([^"]*)"$/u, (w, id, title) => {
    setFence(w, sectionOf(builder(w), id), `**The road this ruling closed.** The prose of the entry. Guarded by: "${title}" ${cited([id])}`);
  }],

  // ── the ledger ────────────────────────────────────────────────────────────
  [/^a ledger that names ([A-Z]\d+) through ([A-Z]\d+) and not ([A-Z]\d+)$/u, (w, first, last, absent) => {
    const b = builder(w);
    const rows: { id: string; cites: string[] }[] = [];
    for (let n = Number(first.slice(1)); n <= Number(last.slice(1)); n++) {
      b.ensure(`N${n}`);
      rows.push({ id: `N${n}`, cites: [] });
    }
    assert.equal(rows.some((r) => r.id === absent), false, `${absent} must not have a row`);
    setLedger(w, rows, first);
  }],
  [/^a ledger with a row for ([A-Z]\d+)$/u, (w, id) => {
    setLedger(w, [...needRows(builder(w)), { id, cites: [] }], id);
  }],
  [/^a ledger whose row ([A-Z]\d+) cites ([A-Z]\d+)(?: in its evidence)?$/u, (w, row, id) => {
    builder(w).ensure(row);
    setLedger(w, [{ id: row, cites: [id] }], row);
  }],
  [/^a ledger whose row ([A-Z]\d+) cites no ruling$/u, (w, row) => {
    builder(w).ensure(row);
    setLedger(w, [{ id: row, cites: [] }], row);
  }],
  [/^a ledger whose row ([A-Z]\d+) cites that ruling$/u, (w, row) => {
    const b = builder(w);
    b.ensure(row);
    setLedger(w, [{ id: row, cites: [resolverOf(b, row)] }], row);
  }],

  // ── the design doc ────────────────────────────────────────────────────────
  [/^a design doc whose ruled tags cite no ([A-Z]\d+)$/u, (w, id) => {
    assert.match(id, /^[A-Z]\d+$/u);
    setDesign(w, ['E1']);
  }],
  [/^a design doc whose ruled tag cites ([A-Z]\d+) and (E\d+)$/u, (w, id, alias) => { setDesign(w, [id, alias]); }],
  [/^a design doc whose ruled tag cites ([A-Z]\d+)$/u, (w, id) => { setDesign(w, [id]); }],

  // ── running ───────────────────────────────────────────────────────────────
  [/^the docket is linted with the corpus$/u, (w) => { runLint(w, 'corpus'); }],
  [/^the docket is linted with the deliverables$/u, (w) => { runLint(w, 'deliverables'); }],
  [/^the docket is linted without a corpus$/u, (w) => { runLint(w, 'none'); }],

  // ── findings located in a deliverable ─────────────────────────────────────
  [/^the traceability layer has (\d+) findings? at the scenario "([^"]*)"$/u, (w, n, title) => {
    const hits = keep(w, trace(w).filter((f) => (f.where ?? '').includes(`"${title}"`)));
    assert.equal(hits.length, Number(n), show(trace(w)));
  }],
  [/^the traceability layer has (\d+) findings? at that fence entry$/u, (w, n) => {
    const s = scene(w);
    const hits = keep(w, trace(w).filter((f) => f.where === s.fence && f.line === s.fenceLine));
    assert.equal(hits.length, Number(n), show(trace(w)));
  }],
  [/^the traceability layer has (\d+) findings? at that ledger row$/u, (w, n) => {
    const hits = keep(w, trace(w).filter((f) => f.where === scene(w).ledger));
    assert.equal(hits.length, Number(n), show(trace(w)));
  }],
  [/^the traceability layer has (\d+) findings? at that design line$/u, (w, n) => {
    const hits = keep(w, trace(w).filter((f) => f.where === 'DESIGN.md' && f.line === scene(w).designLine));
    assert.equal(hits.length, Number(n), show(trace(w)));
  }],
  [/^the finding's message names "([^"]*)" and ([A-Z]\d+)$/u, (w, text, id) => {
    assert.ok((w.found ?? []).some((f) => f.message.includes(text) && f.message.includes(id)), show(w.found ?? []));
  }],
  [/^the finding's message names ([A-Z]\d+) and ([A-Z]\d+)$/u, (w, a, b) => {
    assert.ok((w.found ?? []).some((f) => f.message.includes(a) && f.message.includes(b)), show(w.found ?? []));
  }],
  [/^the finding's message names "([^"]*)"$/u, (w, text) => {
    assert.ok((w.found ?? []).some((f) => f.message.includes(text)), show(w.found ?? []));
  }],

  // ── the counted and the dark surfaces ─────────────────────────────────────
  [/^the not-counted list names ([A-Z]\d+) with the reason "([^"]*)"$/u, (w, id, reason) => {
    const list = report(w).notCounted;
    assert.ok(list.some((x) => x.id === id && x.reason === reason), list.map((x) => `${x.id}: ${x.reason}`).join(' | '));
  }],
  [/^the report's not-counted line reads "([^"]*)"$/u, (w, text) => {
    assert.equal(reportLine(w, /^not counted: /u), text);
  }],
  [/^the traceability row reads "dark" with the reason "([^"]*)"$/u, (w, reason) => {
    const row = report(w).layers.find((x) => x.layer === 'traceability');
    assert.equal(row?.status, 'dark');
    assert.equal(row?.reason, reason);
    assert.equal(reportLine(w, /^traceability: /u), `traceability: dark (${reason})`);
  }],
  [/^the findings count excludes traceability$/u, (w) => {
    const r = report(w);
    assert.deepEqual(r.findings.filter((f) => f.layer === 'traceability'), []);
    const ran = r.layers.filter((x) => x.status === 'ran').reduce((n, x) => n + x.findings.length, 0);
    assert.equal(r.findings.length, ran);
    assert.equal(reportLine(w, /^findings: /u), `findings: ${r.findings.length}`);
  }],
  [/^the refusal names the gnt parser$/u, (w) => {
    assert.match(refusals(w).map((x) => x.message).join('\n'), /gherkin-node-test/u);
  }],
];
