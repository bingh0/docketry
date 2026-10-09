// Steps particular to features/what-was-never-asked.feature: the gaps a docket
// can carry — the missing sibling, the unspread quantity, the unserved need,
// the unresolved wish — and the counted lines the report reads them back on
// (D14, D45, D69, D91, D108, D114, D115, D118, D121). Shared vocabulary lives
// in common.ts.
import assert from 'node:assert/strict';
import { rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { KINDS, lintDocket, parseDocket, reportText } from '../../dist/index.js';
import type { Finding } from '../../dist/index.js';
import type { Table } from './bind.ts';
import { builder, node, report, reportLine, run, writeDocket, type DocketBuilder, type Draft, type World } from './world.ts';

const SLOT_OF: Record<string, string> = { trigger: 'trig', response: 'resp', precondition: 'pre' };
/** a well-formed sib line for an entry a scenario says has one without saying what it reads */
const SIB_NONE = '  sib: none -- the failure case is recorded elsewhere';

/** the findings the last "the ... layer has N findings" step named (common.ts keeps its own copy) */
const found = (w: World): Finding[] => {
  const list = w.found ?? [];
  assert.ok(list.length > 0, 'no finding was named by an earlier step');
  return list;
};

const raws = (d: Draft, key: string): string[] => d.body.filter((b) => b.t === 'raw' && b.key === key).map((b) => (b.t === 'raw' ? b.text : ''));
const names = (text: string, id: string): boolean => new RegExp(`\\b${id}\\b`, 'u').test(text);

/**
 * A wanted entry naming `id` as its unwanted sibling. An unwanted entry no
 * wanted entry names is a coverage finding of its own (D114), so a docket that
 * carries one and is otherwise well formed carries its namer too.
 */
const namedBy = (b: DocketBuilder, id: string): void => {
  const namer = `${id[0] ?? 'R'}${Number(id.slice(1)) - 1}`;
  b.ensure(namer).unwanted = false;
  b.setRaw(namer, 'sib', `  sib: ${id}`);
};

/** A wanted ruling serving `need`: a need nothing serves is a coverage finding of its own (D108). */
const servedBy = (b: DocketBuilder, need: string): void => {
  b.ensure(need);
  b.setRaw('R12', 'serves', `  serves: ${need}`);
};

/**
 * The corpus a scenario described, as the gnt parser can read it: the world's
 * writer emits a Scenario Outline with no Examples block, which gnt refuses,
 * and emits a scenario-less feature file when the scenario named no scenario at
 * all — where the ruling wants no feature file, so the destination reads dark.
 */
const corpusText = (rows: readonly { title: string; tags: string[]; outline: boolean }[]): string => {
  const blocks = rows.map((s) => {
    const tags = s.tags.length > 0 ? `  ${s.tags.map((t) => `@${t}`).join(' ')}\n` : '';
    return s.outline
      ? `${tags}  Scenario Outline: ${s.title}\n    Given a docket of <size>\n\n    Examples:\n      | size |\n      | one |\n      | two |\n`
      : `${tags}  Scenario: ${s.title}\n    Given a docket\n`;
  });
  return `Feature: archive\n\n${blocks.join('\n')}`;
};

/** run(), with that corpus written beside the docket. */
export function lintWithCorpus(w: World): void {
  const b = builder(w);
  b.corpus = true;
  const text = b.saved();
  const dir = writeDocket(w);
  const file = join(dir, 'archive.feature');
  if (b.corpusFeature.length > 0) writeFileSync(file, corpusText(b.corpusFeature), 'utf8');
  else rmSync(file, { force: true });
  w.text = text;
  w.parsed = parseDocket(text);
  w.linted = lintDocket(text, { corpus: dir });
  w.exit = w.linted.ok ? w.linted.report.exitCode : 2;
}

export const neverAskedSteps: Table = [
  // ── wanted and unwanted entries, with and without their sibling
  [/^a docket whose wanted entry ([A-Z]\d+) has a trigger and no sib line$/u, (w, id) => {
    const b = builder(w);
    b.ensure(id).unwanted = false;
    b.slot(id, 'trig');
    b.removeRaw(id, 'sib');
  }],
  [/^a docket whose wanted entry ([A-Z]\d+) has a trigger, no sib line, and resolves to (\S+) (\S+)$/u, (w, id, kind, label) => {
    const b = builder(w);
    b.ensure(id).unwanted = false;
    b.slot(id, 'trig');
    b.removeRaw(id, 'sib');
    b.setRaw(id, 'res', `  -> ${kind} ${label}`);
  }],
  [/^a docket whose unwanted entry ([A-Z]\d+) has a trigger and no sib line$/u, (w, id) => {
    const b = builder(w);
    b.ensure(id).unwanted = true;
    b.slot(id, 'trig');
    b.removeRaw(id, 'sib');
    namedBy(b, id);
  }],
  [/^a docket whose unwanted entry ([A-Z]\d+) has a trigger$/u, (w, id) => {
    const b = builder(w);
    b.ensure(id).unwanted = true;
    b.slot(id, 'trig');
  }],
  [/^a docket whose unwanted entry ([A-Z]\d+) has a trigger and resolves to (\S+)$/u, (w, id, kind) => {
    const b = builder(w);
    b.ensure(id).unwanted = true;
    b.slot(id, 'trig');
    b.setRaw(id, 'res', `  -> ${kind}`);
  }],
  [/^a docket whose unwanted entry ([A-Z]\d+) has sib ([A-Z]\d+)$/u, (w, id, target) => {
    const b = builder(w);
    b.ensure(id).unwanted = true;
    b.setRaw(id, 'sib', `  sib: ${target}`);
  }],
  [/^([A-Z]\d+) is an unwanted entry$/u, (w, id) => { builder(w).ensure(id).unwanted = true; }],
  [/^([A-Z]\d+) is an unwanted entry whose (trigger|response|precondition) provenance is (\S+)$/u, (w, id, slot, tag) => {
    const b = builder(w);
    b.ensure(id).unwanted = true;
    b.slot(id, SLOT_OF[slot] ?? slot).tags = [tag];
  }],
  [/^([A-Z]\d+) is a wanted entry$/u, (w, id) => { builder(w).ensure(id).unwanted = false; }],
  [/^a wanted entry ([A-Z]\d+) with a trigger, a sib line, and the line "([^"]*)"$/u, (w, id, raw) => {
    const b = builder(w);
    b.ensure(id).unwanted = false;
    b.slot(id, 'trig');
    if (raws(b.ensure(id), 'sib').length === 0) b.setRaw(id, 'sib', SIB_NONE);
    b.setLine(id, raw);
  }],
  [/^no (?:in-effect )?entry has a sib line naming ([A-Z]\d+)$/u, (w, id) => {
    const bad = builder(w).drafts.filter((d) => raws(d, 'sib').some((line) => names(line, id))).map((d) => d.id);
    assert.deepEqual(bad, [], `${bad.join(', ')} names ${id} on a sib line`);
  }],

  // ── quantities, lists, and the outlines that spread them
  [/^a docket whose entry ([A-Z]\d+) response contains the quantity \{([^}]*)\}$/u, (w, id, qty) => {
    builder(w).slot(id, 'resp').text = `the listing appears within {${qty}}`;
  }],
  [/^a docket whose entry ([A-Z]\d+) response contains the list \{([^}]*)\}$/u, (w, id, members) => {
    builder(w).slot(id, 'resp').text = `the report names {${members}}`;
  }],
  [/^([A-Z]\d+) has no spread line$/u, (w, id) => {
    const b = builder(w);
    b.removeRaw(id, 'spread');
    assert.deepEqual(raws(b.ensure(id), 'spread'), []);
  }],
  [/^([A-Z]\d+) has the line "([^"]*)"$/u, (w, id, raw) => { builder(w).setLine(id, raw); }],
  [/^a corpus with a scenario outline titled "([^"]*)"$/u, (w, title) => {
    const b = builder(w);
    b.corpus = true;
    b.corpusFeature.push({ title, tags: [b.subject], outline: true });
  }],

  // ── needs, and what serves them
  [/^a docket with need entry ([A-Z]\d+)$/u, (w, id) => { assert.equal(builder(w).ensure(id).ekind, 'need'); }],
  [/^a docket whose need ([A-Z]\d+) reads "([^"]*)" and ([A-Z]\d+) has the line "([^"]*)"$/u, (w, id, text, same, raw) => {
    const b = builder(w);
    assert.equal(same, id);
    b.slot(id, 'need').text = text;
    b.setLine(id, raw);
    servedBy(b, id);
  }],
  [/^a docket whose need ([A-Z]\d+) reads "([^"]*)" and ([A-Z]\d+) has no spread line$/u, (w, id, text, same) => {
    const b = builder(w);
    assert.equal(same, id);
    b.slot(id, 'need').text = text;
    b.removeRaw(id, 'spread');
    servedBy(b, id);
  }],
  [/^no in-effect ruling names ([A-Z]\d+) in a serves line, a need resolution, or a means resolution$/u, (w, id) => {
    const bad = builder(w).drafts
      .filter((d) => [...raws(d, 'serves'), ...raws(d, 'res')].some((line) => names(line, id)))
      .map((d) => d.id);
    assert.deepEqual(bad, [], `${bad.join(', ')} names ${id}`);
  }],
  [/^an entry ([A-Z]\d+) resolving to (\S+) with the line "([^"]*)"$/u, (w, id, kind, raw) => {
    const b = builder(w);
    b.setLine(id, `-> ${kind}`);
    b.setLine(id, raw);
  }],

  // ── the resolution an entry lacks
  [/^a docket whose entry ([A-Z]\d+) resolves to (structural|boundary) and has no serves line$/u, (w, id, kind) => {
    const b = builder(w);
    b.setLine(id, `-> ${kind}`);
    b.removeRaw(id, 'serves');
  }],
  [/^a docket whose entry ([A-Z]\d+) has only a response slot and no resolution line$/u, (w, id) => {
    const b = builder(w);
    b.setBody(id, ['resp', 'touches']);
    b.notLast(id);
  }],
  [/^a docket whose entry ([A-Z]\d+) has only a response slot and resolves to need ([A-Z]\d+)$/u, (w, id, ref) => {
    const b = builder(w);
    b.ensure(ref);
    b.setBody(id, ['resp', `res:need ${ref}`, 'touches']);
  }],

  // ── the run
  [/^the docket is linted without a corpus$/u, (w) => {
    builder(w).corpus = false;
    run(w);
  }],
  [/^the docket is linted with the corpus$/u, (w) => { lintWithCorpus(w); }],

  // ── what a finding says
  [/^the finding's fix names the sib line$/u, (w) => {
    assert.ok(found(w).some((f) => (f.fix ?? '').includes('sib:')), `no fix names the sib line: ${found(w).map((f) => f.fix).join(' | ')}`);
  }],
  [/^the finding's fix contains "([^"]*)"$/u, (w, text) => {
    assert.ok(found(w).some((f) => (f.fix ?? '').includes(text)), `no fix contains "${text}": ${found(w).map((f) => f.fix).join(' | ')}`);
  }],
  [/^the finding's fix lists the resolution kinds$/u, (w) => {
    assert.ok(found(w).some((f) => KINDS.every((k) => (f.fix ?? '').includes(k))), `no fix lists every kind: ${found(w).map((f) => f.fix).join(' | ')}`);
  }],

  // ── what the report counts
  [/^the report's no-sibling line reads "([^"]*)"$/u, (w, text) => {
    assert.equal(reportLine(w, /^no sibling by reason:/u), text);
  }],
  [/^the report's spread-unverified line names ([A-Z]\d+)$/u, (w, id) => {
    const line = reportLine(w, /^spread, unverified:/u);
    assert.ok(names(line, id), line);
  }],
  [/^the report's spread-unverified line is absent$/u, (w) => {
    const lines = reportText(report(w)).split('\n').filter((l) => l.startsWith('spread, unverified:'));
    assert.deepEqual(lines, []);
  }],
  [/^the report's unresolved line reads "([^"]*)"$/u, (w, text) => {
    assert.equal(reportLine(w, /^unresolved quantities:/u), text);
  }],
  [/^the report's without-why line reads "([^"]*)"$/u, (w, text) => {
    assert.equal(reportLine(w, /^quantities without why:/u), text);
  }],
  [/^the report's fenced-needs line names ([A-Z]\d+)$/u, (w, id) => {
    const line = reportLine(w, /^fenced needs:/u);
    assert.ok(names(line, id), line);
  }],
  [/^the report's covered-by-inferred line reads "([^"]*)"$/u, (w, text) => {
    assert.equal(reportLine(w, /^covered by inferred:/u), text);
  }],

  // ── what the parse holds
  [/^the node ([A-Z]\d+) has sib ([A-Z]\d+)$/u, (w, id, target) => {
    assert.equal(node(w, id).sib?.target, target);
  }],
  [/^the node ([A-Z]\d+) has a trigger and serves ([A-Z]\d+)$/u, (w, id, need) => {
    const e = node(w, id);
    assert.ok(e.slots.trig !== undefined, `${id} has no trigger`);
    assert.ok(e.serves?.ids.includes(need), `${id} serves ${e.serves?.ids.join(', ') ?? 'nothing'}`);
  }],
  [/^the node ([A-Z]\d+) is served by ([A-Z]\d+)$/u, (w, id, by) => {
    assert.ok(node(w, id).servedBy.includes(by), `${id} is served by ${node(w, id).servedBy.join(', ')}`);
  }],
];
