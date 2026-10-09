// Extras for features/the-docket-grammar.feature: the shipped grammar
// reference (D182). The lexical floor's own steps moved to the-syntax.ts with
// its scenarios (D194).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { KINDS, RELATIONS, RULE_WORDS, SLOT_KEYWORDS, TAGS } from '../../dist/index.js';
import type { ProseNode } from '../../dist/index.js';
import type { Table } from './bind.ts';
import { builder, node, type World } from './world.ts';

const GRAMMAR_MD = fileURLToPath(new URL('../../GRAMMAR.md', import.meta.url));

const firstQuantity = (w: World): ProseNode | undefined => (node(w, builder(w).subject).slots.resp?.nodes ?? []).find((n) => n.type === 'quantity');

const cells = (row: string): string[] => row.split('|').slice(1, -1).map((s) => s.trim());
const ticks = (s: string): string[] => [...s.matchAll(/`([^`]*)`/gu)].map((m) => m[1] ?? '');

/** The rows of the table under a `###` heading, header and rule row dropped. */
function tableUnder(md: string, heading: string): string[][] {
  const lines = md.split('\n');
  const at = lines.findIndex((l) => l.trim().toLowerCase() === `### ${heading.toLowerCase()}`);
  assert.ok(at >= 0, `GRAMMAR.md has no "### ${heading}" heading`);
  const rows: string[][] = [];
  for (let i = at + 1; i < lines.length; i++) {
    const line = (lines[i] ?? '').trim();
    if (line === '') { if (rows.length > 0) break; continue; }
    if (!line.startsWith('|')) break;
    rows.push(cells(line));
  }
  // the column-name row and the |---| rule
  return rows.slice(2);
}

export function readGrammarTables(md: string): Record<string, string[] | Record<string, string[]>> {
  const firstColumn = (heading: string): string[] => tableUnder(md, heading).map((r) => ticks(r[0] ?? '')[0] ?? '');
  const rules: Record<string, string[]> = {};
  for (const row of tableUnder(md, 'Rule words')) rules[ticks(row[0] ?? '')[0] ?? ''] = ticks(row[1] ?? '');
  return {
    'slot keywords': firstColumn('Slot keywords'),
    'provenance tags': firstColumn('Provenance tags'),
    'resolution kinds': firstColumn('Resolution kinds'),
    relations: firstColumn('Relations'),
    'rule words': rules,
  };
}

const sameSet = (a: readonly string[], b: readonly string[], what: string): void => {
  assert.deepEqual(a.toSorted(), b.toSorted(), `${what} differ`);
};

export const grammarSteps: Table = [
  // D220: TBD and TBR are lexical tokens inside the island; the parse marks the node, the lint counts it
  [/^that quantity node is unresolved as (TBD|TBR)$/u, (w, token) => {
    const q = firstQuantity(w);
    assert.equal(q?.type === 'quantity' ? q.unresolved : undefined, token);
  }],
  [/^the shipped file GRAMMAR\.md$/u, (w) => { w.text = readFileSync(GRAMMAR_MD, 'utf8'); }],
  [/^its tables of slot keywords, provenance tags, resolution kinds, relations, and rule words are read$/u, (w) => {
    w.tables = readGrammarTables(w.text ?? '');
  }],
  [/^each table equals the parser's set of the same name$/u, (w) => {
    const t = w.tables ?? {};
    sameSet(t['slot keywords'] as string[], SLOT_KEYWORDS, 'slot keywords');
    sameSet(t['provenance tags'] as string[], TAGS, 'provenance tags');
    sameSet(t['resolution kinds'] as string[], KINDS, 'resolution kinds');
    sameSet(t.relations as string[], RELATIONS, 'relations');
    const rules = t['rule words'] as Record<string, string[]>;
    sameSet(Object.keys(rules), Object.keys(RULE_WORDS), 'rule-word layers');
    for (const [layer, words] of Object.entries(RULE_WORDS)) sameSet(rules[layer] ?? [], words, `${layer} rule words`);
  }],
];
