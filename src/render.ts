import { FENCE_KINDS, FENCE_SECTION } from './grammar.js';
import { effectiveShape, roots } from './effect.js';
import type { DocketTree, Entry, ProseNode } from './tree.js';

export interface Rendered { scenarios: string; ledger: string; fence: string; design: string }

const proseWith = (nodes: ProseNode[], island: (n: ProseNode) => string): string =>
  nodes.map((n) => (n.type === 'text' ? n.text : n.type === 'literal' ? `\`${n.text}\`` : island(n))).join('').replaceAll(/\s+/gu, ' ').trim();

/** Skeletons from the tree (D42, D75, D84, D121, D160): every citation exists from birth. */
export function renderDocket(tree: DocketTree): Rendered {
  const rs = roots(tree).filter((r) => r.inEffect);
  const shapes = rs.map((r) => ({ root: r, x: effectiveShape(tree, r) }));
  const triggered = shapes.filter(({ root, x }) => root.kind === 'ruling' && x.slots.trig && !x.resolution);
  const titleCounts = new Map<string, number>();
  for (const { x } of triggered) titleCounts.set(x.slots.trig?.text ?? '', (titleCounts.get(x.slots.trig?.text ?? '') ?? 0) + 1);
  const seen = new Map<string, number>();
  const feature: string[] = ['Feature: skeletons rendered from the docket', '  Rendered by docketry; every scenario cites the entry that rules it.', ''];
  for (const { root, x } of triggered) {
    const trig = x.slots.trig?.text ?? '';
    const n = (seen.get(trig) ?? 0) + 1; seen.set(trig, n);
    const title = (titleCounts.get(trig) ?? 0) > 1 && n > 1 ? `${trig} (${root.id})` : trig;
    const resp = x.slots.resp;
    const islands = resp ? resp.nodes.filter((k) => k.type === 'quantity' || k.type === 'list') : [];
    const steps = (thenText: string): string[] => [
      ...(x.slots.pre ? [`    Given ${x.slots.pre.text}`] : []),
      `    When ${trig}`,
      `    Then ${thenText}`,
    ];
    if (x.spread.length > 0 && islands.length > 0) {
      for (const sp of x.spread) {
        const first = islands[0] as ProseNode;
        const then = resp ? proseWith(resp.nodes, (k) => (k === first ? '<value>' : k.type === 'quantity' ? `{${k.text}}` : k.type === 'list' ? `{${k.members.join(' | ')}}` : '')) : '';
        const rows = first.type === 'list' ? first.members : ['<placeholder 1>', '<placeholder 2>'];
        feature.push(`  @${root.id}`, `  Scenario Outline: ${sp.title}`, ...steps(then), '', '    Examples:', '      | value |', ...rows.map((v) => `      | ${v} |`), '');
      }
      continue;
    }
    const then = resp ? proseWith(resp.nodes, (k) => (k.type === 'quantity' ? `{${k.text}}` : k.type === 'list' ? `{${k.members.join(' | ')}}` : '')) : 'the outcome is recorded';
    feature.push(`  @${root.id}`, `  Scenario: ${title}`, ...steps(then), '');
  }
  const needs = shapes.filter(({ root }) => root.kind === 'need');
  const evidence = (n: Entry): string[] => tree.entries.filter((e) => e.inEffect && ((e.resolution && (e.resolution.kind === 'need' || e.resolution.kind === 'means') && e.resolution.reference === n.id) || e.serves?.ids.includes(n.id))).map((e) => e.id);
  // D225: a why renders beside the ruling, in the ledger under the row that cites it and in the design line
  const whyOf = (id: string): string | null => { const e = tree.entries.find((k) => k.id === id); return e ? effectiveShape(tree, e).slots.why?.text ?? null : null; };
  const ledger = ['# User needs', '', ...needs.flatMap(({ root, x }) => [
    `- **${root.id}** (${x.beneficiary ?? ''}, wt ${x.weight ?? ''}) — ${x.slots.need?.text ?? ''}. Evidence: ${evidence(root).join(', ')}. Coverage: `,
    ...evidence(root).flatMap((id) => { const why = whyOf(id); return why === null ? [] : [`  - why, ${id}: ${why}`]; }),
  ]), ''];
  if (needs.some(({ x }) => x.tension.length)) ledger.push('Tensions:', ...needs.flatMap(({ root, x }) => x.tension.map((t) => `- ${root.id} with ${t.target}${t.reason ? ` — ${t.reason}` : ''}`)), '');
  const fence: string[] = ['# Out of scope', ''];
  for (const kind of FENCE_KINDS) {
    fence.push(`## ${FENCE_SECTION[kind] ?? kind}`, '');
    for (const { root, x } of shapes) {
      if (x.resolution?.kind !== kind) continue;
      const label = x.resolution.label ?? root.id;
      const reopen = x.slots.trig && kind !== 'fence-declined' ? ` Reopens when ${x.slots.trig.text}.` : '';
      fence.push(`- **${label}.** ${x.slots.resp?.text ?? ''}${reopen} (${root.id}, ${root.date ?? ''})`);
    }
    fence.push('');
  }
  fence.push('## Out of reach by construction', '', '## Roads not taken', '');
  const design: string[] = ['# DESIGN', '', '## Constraints', ''];
  for (const { root, x } of shapes) if (x.resolution && (x.resolution.kind === 'structural' || x.resolution.kind === 'means')) design.push(`- ${x.slots.resp?.text ?? ''}${x.slots.why ? ` (why: ${x.slots.why.text})` : ''} [ruled: ${root.id}]`);
  design.push('', '## Changelog', '', `- ${tree.asOf} — rendered from the docket (${shapes.length} entries in effect).`, '');
  return { scenarios: `${feature.join('\n').trimEnd()}\n`, ledger: ledger.join('\n'), fence: fence.join('\n'), design: design.join('\n') };
}
