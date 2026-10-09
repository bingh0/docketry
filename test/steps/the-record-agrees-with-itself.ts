// Steps particular to features/the-record-agrees-with-itself.feature: dockets
// described by their relations — what amends, reverses, reaffirms, or ratifies
// what — and the derived facts the parse hands back: effect as of a date, the
// effective shape of an amended entry, touches and tensions in both directions
// (D16, D47, D65, D71, D110, D113, D116, D146, D165, D177). Shared vocabulary
// lives in common.ts; the corpus writer lives beside it in what-was-never-asked.
import assert from 'node:assert/strict';
import type { Entry, Finding } from '../../dist/index.js';
import type { Table } from './bind.ts';
import { lintWithCorpus } from './what-was-never-asked.ts';
import { builder, node, refusalBody, refusals, report, reportLine, run, tree, type World } from './world.ts';
import { reportText } from '../../dist/index.js';

const num = (id: string): number => Number(id.slice(1));
/** a date before every date the world writes, for the entry a scenario places under a later one */
const EARLIER = '2026-09-04';

/** the findings the last "the ... layer has N findings" step named (common.ts keeps its own copy) */
const found = (w: World): Finding[] => {
  const list = w.found ?? [];
  assert.ok(list.length > 0, 'no finding was named by an earlier step');
  return list;
};

/** the entry whose shape stands for `id` once its amendments are walked (D65, D113) */
const shape = (w: World, id: string): Entry => node(w, node(w, id).effectiveFrom);

/** a relation entry dated after its target; a ratifier is the visionary's, or it is a finding of its own (D72) */
const relate = (w: World, id: string, type: string, target: string, tag: string | null, date: string | null): void => {
  builder(w).later(id, type, target, tag ?? (type === 'ratifies' || type === 'signs' ? 'V' : null), date);
};

export const recordSteps: Table = [
  // ── touches
  [/^a docket whose entry ([A-Z]\d+) has no touches line$/u, (w, id) => {
    const b = builder(w);
    b.removeRaw(id, 'touches');
    b.notLast(id);
  }],
  [/^a docket whose entry ([A-Z]\d+) has touches ([A-Z]\d+)$/u, (w, id, target) => {
    const b = builder(w);
    b.ensure(id);
    // touches names earlier entries: one the scenario places later, or nowhere, is the defect under test
    if (num(target) < num(id)) b.ensure(target);
    b.setRaw(id, 'touches', `  touches: ${target}`);
  }],
  [/^a docket with need entry ([A-Z]\d+) and whose entry ([A-Z]\d+) has touches ([A-Z]\d+)$/u, (w, need, id, target) => {
    const b = builder(w);
    b.ensure(need);
    b.setRaw(id, 'touches', `  touches: ${target}`);
  }],

  // ── relations and their dates
  [/^a docket whose entry ([A-Z]\d+) dated (\d{4}-\d{2}-\d{2}) (amends|reverses|reaffirms|ratifies|signs) ([A-Z]\d+) dated (\d{4}-\d{2}-\d{2})$/u, (w, id, date, type, target, targetDate) => {
    builder(w).ensure(target).date = targetDate;
    relate(w, id, type, target, null, date);
  }],
  [/^a docket whose entry ([A-Z]\d+) dated (\d{4}-\d{2}-\d{2}) is reversed by ([A-Z]\d+) dated (\d{4}-\d{2}-\d{2})$/u, (w, id, date, by, byDate) => {
    builder(w).ensure(id).date = date;
    relate(w, by, 'reverses', id, null, byDate);
  }],
  [/^a docket whose entry ([A-Z]\d+) (amends|reverses|reaffirms|ratifies|signs) ([A-Z]\d+) and whose (?:later )?entry ([A-Z]\d+) (amends|reverses|reaffirms|ratifies|signs) ([A-Z]\d+)$/u, (w, first, firstType, firstTarget, second, secondType, secondTarget) => {
    relate(w, first, firstType, firstTarget, null, null);
    relate(w, second, secondType, secondTarget, null, null);
  }],
  [/^a docket whose entries ([A-Z]\d+) and ([A-Z]\d+) both amend ([A-Z]\d+), in that order$/u, (w, first, second, target) => {
    relate(w, first, 'amends', target, null, null);
    relate(w, second, 'amends', target, null, null);
  }],
  [/^a later entry ([A-Z]\d+) (amends|reverses|reaffirms|ratifies|signs) ([A-Z]\d+)$/u, (w, id, type, target) => {
    relate(w, id, type, target, null, null);
  }],
  [/^a later entry ([A-Z]\d+) tagged (\S+) that (amends|reverses|reaffirms|ratifies|signs) ([A-Z]\d+)$/u, (w, id, tag, type, target) => {
    relate(w, id, type, target, tag, null);
  }],
  [/^a later entry ([A-Z]\d+) tagged (\S+) that (amends|reverses|reaffirms|ratifies|signs) ([A-Z]\d+), ratified by ([A-Z]\d+) tagged (\S+)$/u, (w, id, tag, type, target, ratifier, ratifierTag) => {
    relate(w, id, type, target, tag, null);
    relate(w, ratifier, 'ratifies', id, ratifierTag, null);
  }],
  [/^later entries ([A-Z]\d+) and ([A-Z]\d+), each tagged (\S+), each amending ([A-Z]\d+)$/u, (w, first, second, tag, target) => {
    relate(w, first, 'amends', target, tag, null);
    relate(w, second, 'amends', target, tag, null);
  }],
  [/^a docket whose entry ([A-Z]\d+) tagged (\S+) amends ([A-Z]\d+)$/u, (w, id, tag, target) => {
    relate(w, id, 'amends', target, tag, null);
  }],
  [/^([A-Z]\d+) appears after ([A-Z]\d+)$/u, (w, later, earlier) => {
    const b = builder(w);
    b.ensure(earlier);
    b.ensure(later);
    assert.ok(num(later) > num(earlier), `${later} does not follow ${earlier}`);
  }],

  // ── the shapes a relation entry restates
  [/^a docket whose entry ([A-Z]\d+) has a trigger, a sib line, and no resolution$/u, (w, id) => {
    const b = builder(w);
    b.slot(id, 'trig');
    b.removeRaw(id, 'res');
  }],
  [/^a docket whose entry ([A-Z]\d+) has a trigger and no sib line$/u, (w, id) => {
    const b = builder(w);
    b.slot(id, 'trig');
    b.removeRaw(id, 'sib');
  }],
  [/^a later entry ([A-Z]\d+) amends ([A-Z]\d+) with a response slot, no trigger, and the resolution (\S+)$/u, (w, id, target, kind) => {
    const b = builder(w);
    relate(w, id, 'amends', target, null, null);
    b.setBody(id, ['resp', `res:${kind}`, 'touches']);
    // a structural or boundary ruling naming no need is a coverage finding of its own (D109, D148)
    if (kind === 'structural' || kind === 'boundary') {
      b.ensure('N4');
      b.setRaw(id, 'serves', '  serves: N4');
    }
  }],
  [/^a docket whose entry ([A-Z]\d+) has every slot tagged (\S+)$/u, (w, id, tag) => {
    for (const line of builder(w).ensure(id).body) if (line.t === 'slot') line.tags = [tag];
  }],

  // ── dates, and the clock the lint never reads
  [/^a docket whose earliest entry is dated (\d{4}-\d{2}-\d{2})$/u, (w, date) => {
    const b = builder(w);
    b.ensure(b.subject).date = date;
  }],
  [/^a docket whose latest entry is dated (\d{4}-\d{2}-\d{2})$/u, (w, date) => {
    const b = builder(w);
    b.ensure('R13').date = EARLIER;
    b.ensure('R14').date = date;
  }],
  [/^the clock reads (\d{4}-\d{2}-\d{2})$/u, (w, date) => {
    const b = builder(w);
    assert.equal(b.asOf, null, 'the run was given an as-of date: the default must come from the docket');
    assert.deepEqual(b.drafts.filter((d) => d.date === date).map((d) => d.id), [], `the docket is dated ${date} too: the clock could not be told from it`);
  }],

  // ── needs: weight and tension
  [/^a docket whose need ([A-Z]\d+) has weight (\d+)$/u, (w, id, weight) => {
    const b = builder(w);
    assert.equal(b.ensure(id).ekind, 'need');
    b.ensure(id).weight = weight;
  }],
  [/^a later entry ([A-Z]\d+) dated (\d{4}-\d{2}-\d{2}) amends ([A-Z]\d+) with weight (\d+) and the same need slot$/u, (w, id, date, target, weight) => {
    const b = builder(w);
    const text = b.slot(target, 'need').text;
    relate(w, id, 'amends', target, null, date);
    b.ensure(id).weight = weight;
    b.slot(id, 'need').text = text;
  }],
  [/^([A-Z]\d+) has the line "([^"]*)"$/u, (w, id, raw) => { builder(w).setLine(id, raw); }],

  // ── the run
  [/^the docket is parsed as of (\d{4}-\d{2}-\d{2})$/u, (w, date) => {
    builder(w).asOf = date;
    run(w);
  }],
  [/^the docket is linted with the corpus$/u, (w) => { lintWithCorpus(w); }],

  // ── effect
  [/^the node ([A-Z]\d+) is in effect$/u, (w, id) => { assert.equal(node(w, id).inEffect, true); }],
  [/^the node ([A-Z]\d+) is not in effect$/u, (w, id) => { assert.equal(node(w, id).inEffect, false); }],
  [/^the node dated (\d{4}-\d{2}-\d{2}) is in effect$/u, (w, date) => {
    const hits = tree(w).entries.filter((e) => e.date === date);
    assert.ok(hits.length > 0, `no entry is dated ${date}`);
    assert.deepEqual(hits.filter((e) => !e.inEffect).map((e) => e.id), []);
  }],
  [/^the nodes ([A-Z0-9, ]+) are all in effect$/u, (w, ids) => {
    const wanted = ids.split(/,\s*/u);
    assert.deepEqual(wanted.filter((id) => !node(w, id).inEffect), []);
  }],
  [/^(\d+) nodes are in effect$/u, (w, n) => {
    assert.equal(tree(w).entries.filter((e) => e.inEffect).length, Number(n));
  }],
  [/^the tree's as-of date is (\d{4}-\d{2}-\d{2})$/u, (w, date) => { assert.equal(tree(w).asOf, date); }],

  // ── the effective shape
  [/^the node ([A-Z]\d+) has effective shape from ([A-Z]\d+)$/u, (w, id, from) => {
    assert.equal(node(w, id).effectiveFrom, from);
  }],
  [/^the effective shape of ([A-Z]\d+) has no trigger$/u, (w, id) => {
    assert.equal(shape(w, id).slots.trig, undefined);
  }],
  [/^the effective shape of ([A-Z]\d+) resolves to (\S+)$/u, (w, id, kind) => {
    assert.equal(shape(w, id).resolution?.kind, kind);
  }],
  [/^the node ([A-Z]\d+) has effective weight (\d+)$/u, (w, id, weight) => {
    assert.equal(shape(w, id).weight, Number(weight));
  }],

  // ── the inbound edges
  [/^the node ([A-Z]\d+) touches ([A-Z]\d+)$/u, (w, id, target) => {
    assert.ok(node(w, id).touches?.ids.includes(target), `${id} touches ${node(w, id).touches?.ids.join(', ') ?? 'nothing'}`);
  }],
  [/^the node ([A-Z]\d+) is touched by ([A-Z]\d+)$/u, (w, id, by) => {
    assert.ok(node(w, id).touchedBy.includes(by), `${id} is touched by ${node(w, id).touchedBy.join(', ')}`);
  }],
  [/^the node ([A-Z]\d+) has tension with ([A-Z]\d+)$/u, (w, id, target) => {
    assert.ok(node(w, id).tension.some((t) => t.target === target), `${id} names no tension with ${target}`);
  }],
  [/^the node ([A-Z]\d+) is in tension with ([A-Z]\d+)$/u, (w, id, other) => {
    assert.ok(node(w, id).tensionWith.includes(other), `${id} is in tension with ${node(w, id).tensionWith.join(', ')}`);
  }],

  // ── signatures (D223)
  [/^the node ([A-Z]\d+) is marked signed on (\d{4}-\d{2}-\d{2}) by ([A-Z]\d+)$/u, (w, id, date, by) => {
    assert.deepEqual(node(w, id).signed, { by, date });
    assert.ok(node(w, id).signedBy.includes(by), `${id} is signed by ${node(w, id).signedBy.join(', ')}`);
  }],
  [/^the node ([A-Z]\d+) is not signed$/u, (w, id) => {
    assert.equal(node(w, id).signed, null, `${id} is signed by ${node(w, id).signedBy.join(', ')}`);
  }],
  [/^the nodes in effect are exactly the nodes marked signed$/u, (w) => {
    const all = tree(w).entries;
    assert.ok(all.some((e) => e.inEffect) && all.some((e) => !e.inEffect), 'the as-of date splits nothing');
    assert.deepEqual(all.filter((e) => e.inEffect).map((e) => e.id), all.filter((e) => e.signed !== null).map((e) => e.id));
  }],
  [/^the report's signed line reads "([^"]*)"$/u, (w, text) => {
    assert.equal(reportLine(w, /^signed: /u), text);
  }],
  [/^the report's signed line follows its ratified line$/u, (w) => {
    const lines = reportText(report(w)).split('\n');
    const at = lines.findIndex((l) => l.startsWith('signed: '));
    assert.ok(at > 0, 'no signed line');
    assert.ok(lines[at - 1]?.startsWith('ratified: '), `the line before the signed line reads "${lines[at - 1] ?? ''}"`);
  }],

  // ── what the report and the refusal say
  [/^the finding's fix names "([^"]*)"$/u, (w, text) => {
    assert.ok(found(w).some((f) => (f.fix ?? '').includes(text)), `no fix names "${text}": ${found(w).map((f) => f.fix).join(' | ')}`);
  }],
  [/^the report's visionary-relations line names ([A-Z]\d+)$/u, (w, id) => {
    const line = reportLine(w, /^visionary-tagged relations:/u);
    assert.ok(new RegExp(`\\b${id}\\b`, 'u').test(line), line);
  }],
  [/^the refusal names the relation (\S+)$/u, (w, word) => {
    assert.ok(refusals(w).some((r) => r.message.includes('relation') && r.message.includes(word)), refusalBody(w));
  }],
  [/^the node ([A-Z]\d+) has relation (reversedBy|amendedBy|reaffirmedBy|ratifiedBy) ([A-Z]\d+)$/u, (w, id, edge, target) => {
    const n = node(w, id) as unknown as Record<string, string[]>;
    assert.ok(n[edge]?.includes(target), `${id}.${edge} = ${JSON.stringify(n[edge])}, expected ${target}`);
  }],
];
