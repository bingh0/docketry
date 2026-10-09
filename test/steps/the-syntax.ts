// The syntactic specification's own vocabulary (D194): the docket arrives
// written out in the scenario, one line per table row, and this file decodes
// it and hands it to the world unchanged. Nothing here builds a docket.
import assert from 'node:assert/strict';
import type { DataTable } from 'gherkin-node-test';
import { formatDocket, parseDocket } from '../../dist/index.js';
import type { Entry, Finding } from '../../dist/index.js';
import type { StepFn, Table } from './bind.ts';
import { builder, layerOf, node, refusalBody, refusals, run, tree, writeDocket, type World } from './world.ts';

/** U+2423 stands for one space of indent, U+21E5 for one tab (D194, D184). */
const OPEN_BOX = '␣';
const TAB_ARROW = '⇥';
const decode = (cell: string): string => cell.replaceAll(OPEN_BOX, ' ').replaceAll(TAB_ARROW, '\t');

/** The one-column table as a file: one docket line per row, line feeds, a final newline. */
const fileOf = (table: DataTable): string => `${table.raw().map((row) => decode(row[0] ?? '')).join('\n')}\n`;

type TableFn = (w: World, table: DataTable) => void;
/** A step whose sentence carries a data table: the runner passes it as the last argument. */
const withTable = (fn: TableFn): StepFn => fn as unknown as StepFn;

const found = (w: World): Finding[] => {
  if (!w.found?.length) throw new Error('no finding was named by an earlier step');
  return w.found;
};

/** Whether the parse recorded a line under this keyword on that entry. */
const carries = (e: Entry, word: string): boolean => {
  switch (word) {
    case 'pre': case 'trig': case 'resp': case 'why': case 'need': case 'means':
      return e.slots[word] !== undefined;
    case 'sib': return e.sib !== null;
    case 'spread': return e.spread.length > 0;
    case 'serves': return e.serves !== null;
    case 'tension': return e.tension.length > 0;
    case 'touches': return e.touches !== null;
    default: throw new Error(`${word} is not a keyword of the grammar`);
  }
};

export const syntaxSteps: Table = [
  // ── the docket, as the scenario wrote it
  [/^the docket$/u, withTable((w, table) => { builder(w).inline = fileOf(table); })],
  [/^the file is saved with a leading byte-order mark and CRLF line endings$/u, (w) => { builder(w).bomCrlf = true; }],

  // ── running it
  [/^the docket is parsed and then formatted$/u, (w) => {
    const b = builder(w);
    const plain = b.text();
    const saved = b.saved();
    writeDocket(w);
    w.text = saved;
    w.parsed = parseDocket(saved);
    w.plainParsed = parseDocket(plain);
    w.formatted = formatDocket(saved);
  }],
  [/^the docket is put into canonical form$/u, (w) => {
    run(w);
    w.formatted = formatDocket(builder(w).saved());
  }],

  // ── findings, by rule word, line, and key (D33, D194)
  [/^form fires ([a-z-]+) at line (\d+) keyed "?([A-Z]\d+(?: [a-z]+)?)"?$/u, (w, rule, line, key) => {
    const all = layerOf(w, 'form');
    const hits = all.filter((f) => f.rule === rule && f.line === Number(line) && f.key === key);
    assert.ok(hits.length > 0, `no form finding [${rule}] at line ${line} keyed ${key}: ${all.map((f) => `[${f.rule}] ${f.key} line ${f.line}`).join(' | ')}`);
    w.found = hits;
  }],
  [/^the fix reads "([^"]*)"$/u, (w, text) => {
    assert.ok(found(w).some((f) => f.fix === text), `no fix reads "${text}": ${found(w).map((f) => f.fix).join(' | ')}`);
  }],
  [/^the docket parses with (\d+) form findings?$/u, (w, n) => {
    const p = w.parsed;
    assert.ok(p?.ok, `the docket was refused: ${p && !p.ok ? p.refusals.map((r) => r.message).join('; ') : 'it was never parsed'}`);
    const form = layerOf(w, 'form');
    assert.equal(form.length, Number(n), form.map((f) => `[${f.rule}] ${f.key} line ${f.line}`).join(' | '));
  }],
  [/^the refusal names "([^"]*)"$/u, (w, text) => {
    assert.ok(refusalBody(w).includes(text), refusalBody(w));
  }],
  [/^the refusal at line (\d+) names "([^"]*)"$/u, (w, line, text) => {
    assert.ok(refusals(w).some((r) => r.line === Number(line) && r.message.includes(text)), refusalBody(w));
  }],

  // ── the parse
  [/^the (pre|trig|resp|why|need|means|sib|spread|serves|tension|touches) line of ([A-Z]\d+) is on the parse$/u, (w, word, id) => {
    assert.ok(carries(node(w, id), word), `${id} carries no ${word} line`);
  }],
  [/^the tree is identical to the parse of the same docket saved plain$/u, (w) => {
    const plain = w.plainParsed;
    assert.ok(plain?.ok, 'the plain docket did not parse');
    assert.deepEqual(tree(w), plain.tree);
  }],

  // ── the formatter (D196)
  [/^the formatted docket is$/u, withTable((w, table) => {
    assert.equal(w.formatted, fileOf(table));
  })],
  [/^the formatted file begins with "([^"]*)" and contains no carriage return$/u, (w, first) => {
    const out = w.formatted ?? '';
    assert.ok(out.startsWith(first), out.slice(0, 40));
    assert.ok(!out.includes('\r'), 'the formatted file carries a carriage return');
    assert.notEqual(out.codePointAt(0), 0xfeff, 'the formatted file carries a byte-order mark');
  }],
];
