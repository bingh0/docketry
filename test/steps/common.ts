// The shared vocabulary: how a scenario describes a docket, how it runs the
// lint, and how it names a finding, a refusal, a node, or a report line.
import assert from 'node:assert/strict';
import { parseDocket } from '../../dist/index.js';
import type { Finding, ProseNode, SlotKeyword } from '../../dist/index.js';
import type { Table } from './bind.ts';
import { builder, layerOf, node, refusalBody, refusals, reportLine, run, tree, type World } from './world.ts';

const SLOT_OF: Record<string, SlotKeyword> = { trigger: 'trig', response: 'resp', precondition: 'pre', need: 'need', means: 'means', why: 'why' };
const LAYERS = '(form|provenance|resolution|coverage|consistency|traceability)';

const slotWord = (w: string): SlotKeyword => SLOT_OF[w] ?? (w as SlotKeyword);
const found = (w: World): Finding[] => {
  if (!w.found?.length) throw new Error('no finding was named by an earlier step');
  return w.found;
};
const keep = (w: World, list: Finding[]): Finding[] => { w.found = list; return list; };
const nodesUnder = (w: World, id: string, slot: string, type: ProseNode['type']): ProseNode[] =>
  (node(w, id).slots[slotWord(slot)]?.nodes ?? []).filter((n) => n.type === type);

export const givenSteps: Table = [
  [/^the docket format version (\d+)$/u, (w, v) => { assert.equal(v, '1'); builder(w); }],

  // ── slots and their provenance
  [/^a docket whose entry ([A-Z]\d+) has (trigger|response|precondition|need|why) provenance (\S+)$/u, (w, id, slot, tag) => {
    builder(w).slot(id, slotWord(slot)).tags = [tag];
  }],
  [/^a docket whose entry ([A-Z]\d+) has a (trigger|response|precondition|need|why) tagged (\S+)$/u, (w, id, slot, tag) => {
    builder(w).slot(id, slotWord(slot)).tags = [tag];
  }],
  [/^a docket whose entry ([A-Z]\d+) has a (trigger|response|precondition|need|why) tagged (\S+) on line (\d+)$/u, (w, id, slot, tag, line) => {
    const b = builder(w);
    b.slot(id, slotWord(slot)).tags = [tag];
    b.ensure(id).pad = { line: Number(line), marker: `slot:${slotWord(slot)}` };
  }],
  [/^a docket whose entry ([A-Z]\d+) has a (trigger|response|precondition|need|why) tagged both (\S+) and (\S+)$/u, (w, id, slot, a, bTag) => {
    builder(w).slot(id, slotWord(slot)).tags = [a, bTag];
  }],
  [/^([A-Z]\d+) has a (trigger|response|precondition|why) tagged (\S+)$/u, (w, id, slot, tag) => {
    builder(w).slot(id, slotWord(slot)).tags = [tag];
  }],
  [/^([A-Z]\d+) has no why slot$/u, (w, id) => { builder(w).removeSlot(id, 'why'); }],
  [/^([A-Z]\d+) has a trigger tagged (\S+) and a response tagged (\S+)$/u, (w, id, t, r) => {
    const b = builder(w);
    b.slot(id, 'trig').tags = [t];
    b.slot(id, 'resp').tags = [r];
  }],
  [/^a docket whose entry ([A-Z]\d+) response reads "([^"]*)"$/u, (w, id, text) => { builder(w).slot(id, 'resp').text = text; }],
  [/^([A-Z]\d+) has the need slot "([^"]*)"$/u, (w, id, text) => { builder(w).slot(id, 'need').text = text; }],
  [/^([A-Z]\d+) has a response slot and no resolution line$/u, (w, id) => {
    const b = builder(w);
    b.slot(id, 'resp');
    b.removeRaw(id, 'res');
  }],

  // ── whole dockets
  [/^a docket with entries ([A-Z]\d+) and ([A-Z]\d+)$/u, (w, a, b) => { builder(w).ensure(a); builder(w).ensure(b); }],
  [/^a docket with needs ([A-Z]\d+) and ([A-Z]\d+)$/u, (w, a, b) => { builder(w).ensure(a); builder(w).ensure(b); }],
  [/^a docket with rulings ([A-Z0-9, ]+) and need ([A-Z]\d+)$/u, (w, ids, need) => {
    const b = builder(w);
    for (const id of ids.split(/,\s*/u)) b.ensure(id);
    b.ensure(need);
  }],
  [/^a docket with (\d+) entries$/u, (w, n) => {
    const b = builder(w);
    for (let i = 0; i < Number(n); i++) b.ensure(`R${12 + i}`);
  }],
  [/^a docket with two entries both named ([A-Z]\d+)$/u, (w, id) => { builder(w).duplicate(id); }],
  [/^([A-Z]\d+) is a need entry in the docket$/u, (w, id) => { assert.equal(builder(w).ensure(id).ekind, 'need'); }],
  [/^no entry ([A-Z]\d+) exists$/u, (w, id) => { assert.equal(builder(w).draft(id), undefined); }],
  [/^no entry ratifies ([A-Z]\d+)$/u, (w, id) => {
    assert.ok(!builder(w).drafts.some((d) => d.relation?.type === 'ratifies' && d.relation.target === id));
  }],
  [/^([A-Z]\d+) appears after ([A-Z]\d+) in the docket$/u, (w, later, earlier) => {
    const b = builder(w);
    b.ensure(later);
    assert.ok(Number(later.slice(1)) > Number(earlier.slice(1)));
  }],
  [/^([A-Z]\d+) is not the last entry$/u, (w, id) => { builder(w).notLast(id); }],

  // ── headers
  [/^a docket whose entry ([A-Z]\d+) begins on line (\d+)$/u, (w, id, line) => {
    builder(w).ensure(id).pad = { line: Number(line), marker: 'header' };
  }],
  [/^a docket whose entry ([A-Z]\d+) header reads "([^"]*)"$/u, (w, id, raw) => {
    const b = builder(w);
    b.ensure(id).rawHeader = raw;
    const rel = /\b(amends|reverses|reaffirms|ratifies|signs) ([A-Z]\d+)/u.exec(raw);
    if (rel) b.ensure(rel[2] ?? '');
  }],
  [/^a docket whose entry ([A-Z]\d+) header carries (V|I>V|I\+V|I|\?)$/u, (w, id, tag) => { builder(w).ensure(id).tag = tag; }],
  [/^a docket whose entry ([A-Z]\d+) header carries no date$/u, (w, id) => { builder(w).ensure(id).date = null; }],
  [/^a docket whose entry ([A-Z]\d+) is dated (\d{4}-\d{2}-\d{2})$/u, (w, id, date) => { builder(w).ensure(id).date = date; }],
  [/^the next entry ([A-Z]\d+) is dated (\d{4}-\d{2}-\d{2})$/u, (w, id, date) => { builder(w).ensure(id).date = date; }],
  [/^a docket whose entry ([A-Z]\d+) has weight (\d+)$/u, (w, id, weight) => { builder(w).ensure(id).weight = weight; }],

  // ── relations
  [/^a docket whose entry ([A-Z]\d+) (amends|reverses|reaffirms|ratifies|signs) ([A-Z]\d+)$/u, (w, id, type, target) => {
    builder(w).ensure(id).relation = { type, target };
  }],
  [/^a docket whose entry ([A-Z]\d+) dated (\d{4}-\d{2}-\d{2}) (amends|reverses|reaffirms|ratifies|signs) ([A-Z]\d+)$/u, (w, id, date, type, target) => {
    const b = builder(w);
    b.ensure(target);
    const d = b.ensure(id);
    d.date = date;
    d.relation = { type, target };
  }],
  [/^whose entry ([A-Z]\d+) dated (\d{4}-\d{2}-\d{2}) (amends|reverses|reaffirms|ratifies|signs) ([A-Z]\d+)$/u, (w, id, date, type, target) => {
    const b = builder(w);
    b.ensure(target);
    const d = b.ensure(id);
    d.date = date;
    d.relation = { type, target };
  }],
  [/^a later entry ([A-Z]\d+) dated (\d{4}-\d{2}-\d{2}) that (amends|reverses|reaffirms|ratifies|signs) ([A-Z]\d+) with provenance (\S+)$/u, (w, id, date, type, target, tag) => {
    builder(w).later(id, type, target, tag, date);
  }],
  [/^a later entry ([A-Z]\d+) with provenance (\S+) that (amends|reverses|reaffirms|ratifies|signs) ([A-Z]\d+)$/u, (w, id, tag, type, target) => {
    builder(w).later(id, type, target, tag, null);
  }],
  [/^a later entry ([A-Z]\d+) whose (trigger|response) provenance is (\S+)$/u, (w, id, slot, tag) => {
    const b = builder(w);
    b.later(id, null, null, null, null);
    b.slot(id, slotWord(slot)).tags = [tag];
  }],
  [/^a later entry ([A-Z]\d+) amends ([A-Z]\d+) with the response "([^"]*)"$/u, (w, id, target, text) => {
    const b = builder(w);
    b.later(id, 'amends', target, null, null);
    b.slot(id, 'resp').text = text;
  }],

  // ── resolutions and raw lines
  [/^a docket whose entry ([A-Z]\d+) resolves to kind (\S+)$/u, (w, id, kind) => { builder(w).setLine(id, `-> ${kind}`); }],
  [/^a docket whose entry ([A-Z]\d+) resolves to (means|need) ([A-Z]\d+)$/u, (w, id, kind, ref) => { builder(w).setLine(id, `-> ${kind} ${ref}`); }],
  [/^a docket whose entry ([A-Z]\d+) has a trigger and resolves to (\S+)$/u, (w, id, kind) => {
    const b = builder(w);
    b.slot(id, 'trig');
    b.setRaw(id, 'res', `  -> ${kind}`);
  }],
  [/^a docket whose (?:wanted )?entry ([A-Z]\d+) has the line "([^"]*)"$/u, (w, id, raw) => { builder(w).setLine(id, raw); }],
  [/^an entry ([A-Z]\d+) with the line "([^"]*)"$/u, (w, id, raw) => { builder(w).setLine(id, raw); }],
  [/^a docket whose wanted entry ([A-Z]\d+) has sib ([A-Z]\d+)$/u, (w, id, target) => {
    const b = builder(w);
    b.ensure(id).unwanted = false;
    b.setRaw(id, 'sib', `  sib: ${target}`);
  }],
  [/^a docket whose entry ([A-Z]\d+) has a slot line beginning with "([^"]*)"$/u, (w, id, prefix) => {
    builder(w).setRaw(id, 'stray', `  ${prefix} a thing worth remembering`);
  }],
  [/^a docket whose entry ([A-Z]\d+) contains the line "([^"]*)" on line (\d+)$/u, (w, id, raw, line) => {
    const b = builder(w);
    b.setRaw(id, 'stray', `  ${raw}`);
    b.ensure(id).pad = { line: Number(line), marker: 'last' };
  }],
  [/^a docket whose entry ([A-Z]\d+) contains the line "([^"]*)" after its touches line$/u, (w, id, raw) => {
    builder(w).setRaw(id, 'note', raw);
  }],
  [/^a docket with the line "([^"]*)" between entries ([A-Z]\d+) and ([A-Z]\d+)$/u, (w, raw, first, second) => {
    const b = builder(w);
    b.ensure(first);
    b.ensure(second).commentsBefore.push(raw);
  }],

  // ── bodies stated line by line
  [/^a docket whose entry ([A-Z]\d+) has a pre slot and a response slot and no trigger$/u, (w, id) => {
    builder(w).setBody(id, ['pre', 'resp', 'sib', 'touches']);
  }],
  [/^a docket whose entry ([A-Z]\d+) has a pre, a trigger, a response, a sib line, and a touches line, each in canonical form$/u, (w, id) => {
    builder(w).setBody(id, ['pre', 'trig', 'resp', 'sib', 'touches']);
  }],
  [/^a docket whose last entry ([A-Z]\d+) has a header, a response slot tagged (\S+), and no touches line$/u, (w, id, tag) => {
    const b = builder(w);
    b.setBody(id, ['resp']);
    b.slot(id, 'resp').tags = [tag];
  }],
  [/^a docket whose last entry ([A-Z]\d+) has a header, a trigger, a response, a sib line, and a touches line$/u, (w, id) => {
    builder(w).setBody(id, ['trig', 'resp', 'sib', 'touches']);
  }],
  [/^a docket whose last entry ([A-Z]\d+) has a header, a response, a resolution, and a touches line$/u, (w, id) => {
    builder(w).setBody(id, ['resp', 'res:boundary', 'touches']);
  }],
  [/^a docket whose last entry ([A-Z]\d+) has a header and a pre slot and nothing else$/u, (w, id) => {
    builder(w).setBody(id, ['pre']);
  }],

  // ── the file itself
  [/^a docket whose first line reads "([^"]*)"$/u, (w, line) => {
    const b = builder(w);
    b.versionLine = line;
    b.ensureAny();
  }],
  [/^a docket whose first line reads "([^"]*)" and whose entry ([A-Z]\d+) is declared twice$/u, (w, line, id) => {
    const b = builder(w);
    b.versionLine = line;
    b.duplicate(id);
  }],
  [/^a docket whose first line is an entry header$/u, (w) => {
    const b = builder(w);
    b.versionLine = null;
    b.ensureAny();
  }],
  [/^the lint knows format version (\d+)$/u, (w, v) => { assert.equal(v, '1'); builder(w); }],
  [/^a docket whose entry ([A-Z]\d+) has its (pre|trig|resp) line indented by one tab$/u, (w, id, word) => {
    const b = builder(w);
    b.slot(id, word).indent = '\t';
    b.notLast(id);
  }],
  [/^a docket whose entry ([A-Z]\d+) is followed by ([A-Z]\d+) and has a blank line between its trig line and its resp line$/u, (w, id, next) => {
    const b = builder(w);
    b.subject = id;
    const d = b.ensure(id);
    b.ensure(next);
    const at = d.body.findIndex((x) => x.t === 'slot' && x.word === 'resp');
    d.body.splice(at, 0, { t: 'blank' });
  }],
  [/^a docket where ([A-Z]\d+) is declared twice, ([A-Z]\d+) resolves to the kind (\S+), and ([A-Z]\d+) amends ([A-Z]\d+)$/u, (w, dup, res, kind, amender, target) => {
    const b = builder(w);
    b.duplicate(dup);
    b.setLine(res, `-> ${kind}`);
    b.ensure(amender).relation = { type: 'amends', target };
  }],
];

export const whenSteps: Table = [
  [/^the docket is linted$/u, (w) => { run(w); }],
  [/^the docket is parsed$/u, (w) => { run(w); }],
];

export const thenSteps: Table = [
  // ── exit
  [/^the exit code is (\d+)$/u, (w, code) => { assert.equal(w.exit, Number(code)); }],
  [/^the exit code in default mode is (\d+)$/u, (w, code) => { assert.equal(w.exit, Number(code)); }],

  // ── findings
  [new RegExp(`^the ${LAYERS} layer has (\\d+) findings?$`, 'u'), (w, layer, n) => {
    assert.equal(keep(w, layerOf(w, layer)).length, Number(n), `${layer}: ${layerOf(w, layer).map((f) => `${f.key} [${f.rule}] ${f.message}`).join(' | ')}`);
  }],
  [new RegExp(`^the ${LAYERS} layer has (\\d+) findings? keyed ([A-Z]\\d+(?: [a-z]+)?)$`, 'u'), (w, layer, n, key) => {
    const hits = keep(w, layerOf(w, layer).filter((f) => f.key === key));
    assert.equal(hits.length, Number(n), `${layer} keyed ${key}: ${layerOf(w, layer).map((f) => `${f.key} [${f.rule}]`).join(' | ')}`);
  }],
  [new RegExp(`^the ${LAYERS} layer has (\\d+) findings? keyed ([A-Z]\\d+) whose message contains "([^"]*)"$`, 'u'), (w, layer, n, key, text) => {
    const hits = keep(w, layerOf(w, layer).filter((f) => f.key === key));
    assert.equal(hits.length, Number(n));
    assert.ok(hits.some((f) => f.message.includes(text)), `no message contains "${text}": ${hits.map((f) => f.message).join(' | ')}`);
  }],
  [new RegExp(`^the ${LAYERS} layer has (\\d+) finding at line (\\d+)$`, 'u'), (w, layer, n, line) => {
    assert.equal(keep(w, layerOf(w, layer).filter((f) => f.line === Number(line))).length, Number(n));
  }],
  [/^the form layer has a finding keyed ([A-Z]\d+) for the missing response$/u, (w, id) => {
    const hits = keep(w, layerOf(w, 'form').filter((f) => f.rule === 'missing-response' && f.entry === id));
    assert.ok(hits.length > 0, `no missing-response finding on ${id}`);
  }],
  [/^the form layer has a stray-line finding at the orphaned resp line$/u, (w) => {
    const b = builder(w);
    const line = b.lineOf(b.subject, 'slot:resp');
    const hits = keep(w, layerOf(w, 'form').filter((f) => f.rule === 'stray-line' && f.line === line));
    assert.ok(hits.length > 0, `no stray-line finding at line ${line}`);
  }],
  [/^the finding's message contains "([^"]*)"$/u, (w, text) => {
    assert.ok(found(w).some((f) => f.message.includes(text)), `no message contains "${text}": ${found(w).map((f) => f.message).join(' | ')}`);
  }],
  [/^the finding's fix shows "([^"]*)"$/u, (w, text) => {
    assert.ok(found(w).some((f) => (f.fix ?? '').includes(text)), `no fix shows "${text}": ${found(w).map((f) => f.fix).join(' | ')}`);
  }],
  [/^the finding's fix says "([^"]*)"$/u, (w, text) => {
    assert.ok(found(w).some((f) => (f.fix ?? '').includes(text)), `no fix says "${text}": ${found(w).map((f) => f.fix).join(' | ')}`);
  }],
  [/^the finding's fix reads "([^"]*)"$/u, (w, text) => {
    assert.ok(found(w).some((f) => f.fix === text), `no fix reads "${text}": ${found(w).map((f) => f.fix).join(' | ')}`);
  }],
  [/^the finding's fix names the ISO date form$/u, (w) => {
    assert.ok(found(w).some((f) => (f.fix ?? '').includes('YYYY-MM-DD')), `no fix names the ISO form: ${found(w).map((f) => f.fix).join(' | ')}`);
  }],
  [/^the finding's fix names the range (\d+) to (\d+)$/u, (w, lo, hi) => {
    assert.ok(found(w).some((f) => (f.fix ?? '').includes(`${lo} to ${hi}`)), `no fix names the range: ${found(w).map((f) => f.fix).join(' | ')}`);
  }],
  [/^the finding's fix shows the response with the quantity braced$/u, (w) => {
    const b = builder(w);
    const text = b.slot(b.subject, 'resp').text;
    const fix = found(w).map((f) => f.fix ?? '').find((x) => x.replaceAll('{', '').replaceAll('}', '') === text);
    assert.ok(fix !== undefined, `no fix restates the response: ${found(w).map((f) => f.fix).join(' | ')}`);
    assert.match(fix, /\{[^}]*\d[^}]*\}/u);
  }],

  // ── refusals
  [/^the refusal names line (\d+) and the tag (\S+)$/u, (w, line, tag) => {
    assert.ok(refusals(w).some((r) => r.line === Number(line) && r.message.includes(tag)), refusalBody(w));
  }],
  [/^the refusal names ([A-Z]\d+) and the kind (\S+)$/u, (w, id, kind) => {
    assert.ok(refusals(w).some((r) => r.message.includes(id) && r.message.includes(kind)), refusalBody(w));
  }],
  [/^the refusal names ([A-Z]\d+) and both(?: of its)? lines$/u, (w, id) => {
    const lines = builder(w).headerLines(id);
    assert.equal(lines.length, 2, `${id} was not emitted twice`);
    const hit = refusals(w).find((r) => r.message.includes(id) && lines.every((l) => new RegExp(`line ${l}\\b`, 'u').test(r.message)));
    assert.ok(hit, `no refusal names ${id} on lines ${lines.join(' and ')}: ${refusalBody(w)}`);
  }],
  [/^the refusal names the keyword (\S+)$/u, (w, word) => {
    assert.ok(refusals(w).some((r) => r.message.includes('keyword') && r.message.includes(word)), refusalBody(w));
  }],
  [/^the refusal names the slot keyword (\S+)$/u, (w, word) => {
    assert.ok(refusals(w).some((r) => r.message.includes('keyword') && r.message.includes(word)), refusalBody(w));
  }],
  [/^the refusal names ([A-Z]\d+) and ([A-Z]\d+)$/u, (w, a, b) => {
    assert.ok(refusals(w).some((r) => r.message.includes(a) && r.message.includes(b)), refusalBody(w));
  }],
  [/^the refusal names ([A-Z]\d+) and ([A-Z]\d+) and says "([^"]*)"$/u, (w, a, b, word) => {
    assert.ok(refusals(w).some((r) => r.message.includes(a) && r.message.includes(b) && r.message.includes(word)), refusalBody(w));
  }],
  [/^the refusal names version (\d+) and version (\d+)$/u, (w, given, known) => {
    assert.ok(refusals(w).some((r) => r.message.includes(given) && r.message.includes(known)), refusalBody(w));
  }],
  [/^the refusal names the missing version line$/u, (w) => {
    assert.ok(refusals(w).some((r) => r.message.includes('version line')), refusalBody(w));
  }],
  [/^the refusal does not mention ([A-Z]\d+)$/u, (w, id) => {
    assert.ok(!refusalBody(w).includes(id), refusalBody(w));
  }],

  // ── the tree
  [/^the tree holds (\d+) nodes$/u, (w, n) => { assert.equal(tree(w).entries.length, Number(n)); }],
  [/^(\d+) nodes have kind (ruling|need)$/u, (w, n, kind) => {
    assert.equal(tree(w).entries.filter((e) => e.kind === kind).length, Number(n));
  }],
  [/^(\d+) node has kind (ruling|need)$/u, (w, n, kind) => {
    assert.equal(tree(w).entries.filter((e) => e.kind === kind).length, Number(n));
  }],
  [/^the tree's first key is "([^"]*)" with value (\d+)$/u, (w, key, value) => {
    const t = tree(w) as unknown as Record<string, unknown>;
    assert.equal(Object.keys(t)[0], key);
    assert.equal(t[key], Number(value));
  }],
  [/^the node ([A-Z]\d+) has line (\d+)$/u, (w, id, line) => { assert.equal(node(w, id).line, Number(line)); }],
  [/^the node ([A-Z]\d+) has a hash of (\d+) hex digits$/u, (w, id, n) => {
    assert.match(node(w, id).hash, new RegExp(`^[0-9a-f]{${n}}$`, 'u'));
  }],
  [/^the tree's chain hash changes when ([A-Z]\d+)'s response changes$/u, (w, id) => {
    const before = tree(w).chainHash;
    const b = builder(w);
    b.slot(id, 'resp').text = 'the file appears twice in the listing';
    const after = parseDocket(b.saved());
    assert.ok(after.ok, 'the edited docket no longer parses');
    assert.notEqual(after.tree.chainHash, before);
  }],
  [/^the docket file contains no hash line$/u, (w) => {
    assert.doesNotMatch(w.text ?? '', /\b[0-9a-f]{64}\b/u);
    assert.doesNotMatch(w.text ?? '', /^\s*hash:/mu);
  }],
  [/^the node ([A-Z]\d+) has (trigger|response|precondition|need|why) provenance (\S+)$/u, (w, id, slot, tag) => {
    assert.equal(node(w, id).slots[slotWord(slot)]?.tag, tag);
  }],
  [/^the node ([A-Z]\d+) resolves to (\S+) with reference ([A-Z]\d+)$/u, (w, id, kind, ref) => {
    assert.equal(node(w, id).resolution?.kind, kind);
    assert.equal(node(w, id).resolution?.reference, ref);
  }],
  [/^the node ([A-Z]\d+) resolves to (\S+) with no reference$/u, (w, id, kind) => {
    assert.equal(node(w, id).resolution?.kind, kind);
    assert.equal(node(w, id).resolution?.reference, null);
  }],
  [/^the node ([A-Z]\d+) (?:still )?has (\d+) slots$/u, (w, id, n) => {
    assert.equal(Object.keys(node(w, id).slots).length, Number(n));
  }],
  [/^the node ([A-Z]\d+) has 1 note reading "([^"]*)"$/u, (w, id, text) => {
    assert.deepEqual(node(w, id).notes, [text]);
  }],
  [/^the node ([A-Z]\d+) has (\d+) notes$/u, (w, id, n) => { assert.equal(node(w, id).notes.length, Number(n)); }],
  [/^the node ([A-Z]\d+) serves ([A-Z]\d+) and ([A-Z]\d+)$/u, (w, id, a, b) => {
    assert.deepEqual(node(w, id).serves?.ids, [a, b]);
  }],
  [/^the node ([A-Z]\d+) has (\d+) (quantity|list|literal) nodes? under (pre|trig|resp|need|means)$/u, (w, id, n, type, slot) => {
    assert.equal(nodesUnder(w, id, slot, type as ProseNode['type']).length, Number(n));
  }],
  [/^the node ([A-Z]\d+) has (\d+) (quantity|list|literal) nodes$/u, (w, id, n, type) => {
    const all = Object.values(node(w, id).slots).flatMap((s) => s.nodes).filter((x) => x.type === type);
    assert.equal(all.length, Number(n));
  }],
  [/^that quantity node has text "([^"]*)"$/u, (w, text) => {
    const b = builder(w);
    const q = nodesUnder(w, b.subject, 'resp', 'quantity')[0];
    assert.equal(q?.type === 'quantity' ? q.text : undefined, text);
  }],
  [/^that list node has (\d+) members$/u, (w, n) => {
    const b = builder(w);
    const l = nodesUnder(w, b.subject, 'resp', 'list')[0];
    assert.equal(l?.type === 'list' ? l.members.length : -1, Number(n));
  }],
  [/^the nodes ([A-Z]\d+) and ([A-Z]\d+) are both unwanted with relation (\w+) ([A-Z]\d+)$/u, (w, a, b, type, target) => {
    for (const id of [a, b]) {
      assert.equal(node(w, id).unwanted, true, `${id} is not unwanted`);
      assert.deepEqual(node(w, id).relation, { type, target });
    }
  }],
  [/^the node ([A-Z]\d+) has relation (amends|reverses|reaffirms|ratifies|signs) ([A-Z]\d+)$/u, (w, id, type, target) => {
    assert.deepEqual(node(w, id).relation, { type, target });
  }],
  [/^the node ([A-Z]\d+) has beneficiary (\S+)$/u, (w, id, who) => { assert.equal(node(w, id).beneficiary, who); }],
  [/^the node ([A-Z]\d+) has weight (\d+)$/u, (w, id, n) => { assert.equal(node(w, id).weight, Number(n)); }],
  [/^the node ([A-Z]\d+) is marked incomplete$/u, (w, id) => { assert.equal(node(w, id).incomplete, true); }],
  [/^no node is marked incomplete$/u, (w) => {
    const bad = tree(w).entries.filter((e) => e.incomplete).map((e) => e.id);
    assert.deepEqual(bad, []);
  }],
  [/^the node ([A-Z]\d+) is marked ratified on (\d{4}-\d{2}-\d{2})$/u, (w, id, date) => {
    assert.equal(node(w, id).ratified?.date, date);
  }],

  // ── the report
  [/^the report's instrument line names grammar version (\d+)$/u, (w, v) => {
    const line = reportLine(w, /^docketry /u);
    assert.ok(line.includes(`grammar ${v}`), line);
  }],
];
