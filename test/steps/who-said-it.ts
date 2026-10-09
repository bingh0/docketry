// Extras for features/who-said-it.feature: dockets described by how many
// slots carry which tag, and the counted lines the report reads back (D44, D154).
import assert from 'node:assert/strict';
import type { Table } from './bind.ts';
import { builder, reportLine, type DocketBuilder } from './world.ts';

/** Lay `tags` out over well-formed entries, two slots each (three on the tail if odd). */
export function slotsTagged(b: DocketBuilder, tags: string[]): void {
  const chunks: string[][] = [];
  for (let i = 0; i < tags.length; i += 2) chunks.push(tags.slice(i, i + 2));
  const tail = chunks.at(-1);
  if (chunks.length > 1 && tail?.length === 1) { chunks.pop(); chunks.at(-1)?.push(...tail); }
  chunks.forEach((chunk, i) => {
    const id = `R${12 + i}`;
    const words = chunk.length >= 3 ? ['pre', 'trig', 'resp'] : chunk.length === 2 ? ['trig', 'resp'] : ['resp'];
    b.setBody(id, [...words, 'sib', 'touches']);
    words.forEach((word, j) => { b.slot(id, word).tags = [chunk[j] ?? 'I>V']; });
  });
}

const many = (n: string, tag: string): string[] => Array.from({ length: Number(n) }, () => tag);

export const whoSaidItSteps: Table = [
  [/^a docket with (\d+) slots tagged V, (\d+) tagged I>V, (\d+) tagged I, and (\d+) tagged \?$/u, (w, v, iv, i, lost) => {
    const tags = [...many(v, 'V'), ...many(iv, 'I>V'), ...many(i, 'I'), ...many(lost, '?')];
    slotsTagged(builder(w), tags);
  }],
  [/^a docket with (\d+) slots all tagged (\S+)$/u, (w, n, tag) => {
    slotsTagged(builder(w), many(n, tag));
  }],

  [/^the report's distribution line reads "([^"]*)"$/u, (w, text) => {
    assert.equal(reportLine(w, /^provenance: V /u), text);
  }],
  [/^the report's ratified line names "([^"]*)" and "([^"]*)"$/u, (w, first, second) => {
    const line = reportLine(w, /^ratified: /u);
    assert.ok(line.includes(first), line);
    assert.ok(line.includes(second), line);
  }],
];
