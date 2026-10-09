import { FENCE_KINDS, KINDS, KINDS_WITH_REFERENCE, RANK, TAGS, type Tag } from '../grammar.js';
import { chainOf, effectiveShape, roots } from '../effect.js';
import { entryMap, isNeedId } from '../parse.js';
import type { DocketTree, Entry, Finding } from '../tree.js';

export interface Counted {
  distribution: Record<Tag, number>;
  noSibByReason: number;
  coveredByInferred: { wanted: string; by: string }[];
  fencedNeeds: string[];
  spreadUnverified: string[];
  ratified: { id: string; target: string; date: string | null }[];
  visionaryRelations: string[];
  deTriggered: { id: string; target: string }[];
  /** D220: braced islands carrying TBD or TBR, counted and never a finding */
  unresolved: { id: string; slot: string; text: string }[];
  /** D225: an island in a slot tagged below V on an entry with no why slot */
  withoutWhy: { id: string; slot: string }[];
  /** D223: every V-tagged signs entry by id, target, and date */
  signed: { id: string; target: string; date: string | null }[];
}

const f = (layer: Finding['layer'], rule: string, entry: string, slot: string | null, line: number, message: string, fix: string | null = null): Finding =>
  ({ layer, rule, key: slot ? `${entry} ${slot}` : entry, entry, slot, line, message, fix });

/** The rewrite comparison reads a ratified entry as visionary (D146, D165, D177). */
const rankOf = (x: Entry): number => (x.ratified ? RANK.V : x.tag ? RANK[x.tag] : 0);

/** Near-misses read the effective text only (D181); every other form check ran on the parse. */
export function formLayer(tree: DocketTree, parseFindings: Finding[]): Finding[] {
  const out = [...parseFindings];
  for (const r of roots(tree)) {
    const x = effectiveShape(tree, r);
    for (const s of Object.values(x.slots)) {
      for (const tok of s.bare) {
        const braced = s.text.replace(new RegExp(`${tok.replaceAll(/[.*+?^${}()|[\]\\]/gu, '\\$&')}(\\s+[A-Za-z]+)?`, 'u'), (m) => `{${m}}`);
        out.push(f('form', 'bare-digit-run', x.id, s.keyword, s.line, `bare digit run "${tok}" outside braces and backticks — a quantity is braced, a literal is backticked`, braced));
      }
    }
  }
  return out;
}

export function provenanceLayer(tree: DocketTree, counted: Counted): Finding[] {
  const out: Finding[] = [];
  const byId = entryMap(tree);
  for (const t of TAGS) counted.distribution[t] = 0;
  const ratifiedChains = new Set<string>();
  for (const r of tree.entries) {
    if (r.relation?.type === 'signs' && r.tag === 'V') counted.signed.push({ id: r.id, target: r.relation.target, date: r.date });
    if (r.relation?.type !== 'ratifies') continue;
    counted.ratified.push({ id: r.id, target: r.relation.target, date: r.date });
    if (r.tag === 'V') for (const id of chainOf(tree, r.relation.target)) ratifiedChains.add(id);
  }
  for (const e of tree.entries) {
    for (const s of Object.values(e.slots)) {
      if (s.tag) counted.distribution[s.tag] += 1;
      const silenced = e.ratified !== null || ratifiedChains.has(e.id) || (byId.get(e.chainRoot)?.ratified !== null && e.relation?.type !== 'amends');
      if (s.tag === 'I' && !silenced) out.push(f('provenance', 'inferred', e.id, s.keyword, s.line, `${s.keyword} of ${e.id} is inferred, unratified`, `a later entry: <id> <date> [V] ratifies ${e.id}`));
      if (s.tag === '?' && !silenced) out.push(f('provenance', 'lost', e.id, s.keyword, s.line, `${s.keyword} of ${e.id} has lost its provenance — who supplied it?`, `retag the slot, or a later entry [V] ratifies ${e.id}`));
    }
  }
  return out;
}

export function resolutionLayer(tree: DocketTree): Finding[] {
  const out: Finding[] = [];
  for (const r of roots(tree)) {
    if (r.kind === 'need' || r.relation || r.incomplete) continue;
    const x = effectiveShape(tree, r);
    if (!x.slots.trig && !x.resolution) out.push(f('resolution', 'unresolved', r.id, null, r.line, `${r.id} has no trigger, no resolution, and no relation`, `-> one of ${KINDS.join(', ')}`));
  }
  return out;
}

export function coverageLayer(tree: DocketTree, counted: Counted, hasCorpus: boolean): Finding[] {
  const out: Finding[] = [];
  const byId = entryMap(tree);
  const served = new Map<string, string[]>();
  const fencedServed = new Map<string, string[]>();
  const rs = roots(tree);
  for (const r of rs) {
    if (r.kind === 'need' || !r.inEffect) continue;
    const x = effectiveShape(tree, r);
    const fenced = x.resolution !== null && FENCE_KINDS.includes(x.resolution.kind);
    for (const n of x.serves?.ids ?? []) (fenced ? fencedServed : served).set(n, [...(fenced ? fencedServed : served).get(n) ?? [], r.id]);
    if (x.resolution && KINDS_WITH_REFERENCE.includes(x.resolution.kind) && x.resolution.reference) served.set(x.resolution.reference, [...served.get(x.resolution.reference) ?? [], r.id]);
  }
  const named = new Set<string>();
  for (const r of rs) {
    if (!r.inEffect) continue;
    const x = effectiveShape(tree, r);
    if (x.sib && !x.sib.none && x.sib.target) for (const id of chainOf(tree, x.sib.target)) named.add(id);
  }
  for (const r of rs) {
    if (r.kind === 'ruling' && !r.inEffect) continue;
    const x = effectiveShape(tree, r);
    if (r.kind === 'ruling') {
      const triggered = x.slots.trig !== undefined && !x.resolution;
      if (triggered && !x.unwanted) {
        if (!x.sib) out.push(f('coverage', 'no-sib', r.id, null, x.line, `${r.id} is a wanted behaviour with a trigger and no sib line — what is its failure case?`, 'sib: <an unwanted entry marked !>, or sib: none -- <reason>'));
        else if (x.sib.none) counted.noSibByReason += 1;
        else {
          const t = byId.get(x.sib.target ?? '');
          const tx = t ? effectiveShape(tree, t) : null;
          if (tx && Object.values(tx.slots).some((s) => s.tag === 'I' || s.tag === '?')) counted.coveredByInferred.push({ wanted: r.id, by: t?.id ?? '' });
        }
      }
      if (triggered && x.unwanted && !named.has(r.id) && !x.resolution) out.push(f('coverage', 'orphan-unwanted', r.id, null, x.line, `${r.id} is an unwanted entry no wanted entry names`, 'name the wanted behaviour this fails, or record it'));
      if (x.resolution && (x.resolution.kind === 'structural' || x.resolution.kind === 'boundary') && !x.serves) out.push(f('coverage', 'unserved-ruling', r.id, null, x.line, `${r.id} is a ${x.resolution.kind} ruling serving no need`, 'serves: N<n> — name the need or reclassify'));
    }
    for (const s of Object.values(x.slots)) {
      let island = false;
      for (const node of s.nodes) {
        if (node.type !== 'quantity' && node.type !== 'list') continue;
        island = true;
        const label = node.type === 'quantity' ? node.text : node.members.join(' | ');
        const unresolved = node.type === 'quantity' && node.unresolved !== null;
        if (unresolved) counted.unresolved.push({ id: r.id, slot: s.keyword, text: node.text });
        if (x.spread.length === 0) out.push(f('coverage', 'unspread', r.id, s.keyword, s.line, `{${label}} in ${s.keyword} of ${r.id} is referenced by no spread line`, 'spread: <the outline title that varies it>'));
        // D118, D221: no corpus verifies nothing; an unresolved island is never cleared while the token stands
        else if ((!hasCorpus || unresolved) && !counted.spreadUnverified.includes(r.id)) counted.spreadUnverified.push(r.id);
      }
      // D225: the interviewer's numbers owe a why; the visionary's do not
      if (island && s.keyword !== 'why' && s.tag !== 'V' && !x.slots.why) counted.withoutWhy.push({ id: r.id, slot: s.keyword });
    }
  }
  for (const r of rs) {
    if (r.kind !== 'need' || !r.inEffect) continue;
    if (served.has(r.id)) continue;
    if (fencedServed.has(r.id)) { counted.fencedNeeds.push(r.id); continue; }
    out.push(f('coverage', 'unserved-need', r.id, 'need', r.line, `${r.id} is a need nothing serves`, 'ask what behaviour meets it, or fence it'));
  }
  return out;
}

export function consistencyLayer(tree: DocketTree, counted: Counted): Finding[] {
  const out: Finding[] = [];
  const byId = entryMap(tree);
  for (const e of tree.entries) {
    if (e.kind === 'ruling' && !e.touches && !e.incomplete) out.push(f('consistency', 'no-touches', e.id, null, e.line, `${e.id} has no touches line`, 'touches: none'));
    const tags = Object.values(e.slots).map((s) => s.tag).filter((t): t is Tag => t !== null);
    if (e.tag && tags.length > 0) {
      const lowest = tags.reduce((a, b) => (RANK[a] <= RANK[b] ? a : b));
      if (RANK[e.tag] > RANK[lowest]) out.push(f('consistency', 'header-above-slots', e.id, null, e.line, `header tag [${e.tag}] is above its slots: the lowest slot is ${lowest}`, `[${lowest}] on the header`));
    }
    if (e.resolution && KINDS_WITH_REFERENCE.includes(e.resolution.kind) && e.resolution.reference) {
      const n = byId.get(e.resolution.reference);
      if (!n || n.kind !== 'need') out.push(f('consistency', 'missing-need', e.id, null, e.resolution.line, `${e.id} resolves to ${e.resolution.reference}, a need the docket lacks`, 'add the N entry, or resolve to an existing need'));
    }
    if (e.relation?.type === 'ratifies' && e.tag !== 'V') out.push(f('consistency', 'ratifier-not-visionary', e.id, null, e.line, `${e.id} ratifies ${e.relation.target} under [${e.tag ?? '?'}]; only the visionary ratifies`, `[V] on ${e.id}`));
    if (e.relation?.type === 'signs' && e.tag !== 'V') out.push(f('consistency', 'signer-not-visionary', e.id, null, e.line, `${e.id} signs ${e.relation.target} under [${e.tag ?? '?'}]; only the visionary signs, and this entry signs nothing`, `[V] on ${e.id}`));
  }
  // rewrite rank (D146, D165, D177): compare against the highest tag on the target's chain so far
  const rootOf = (x: Entry): Entry => byId.get(x.chainRoot) ?? x;
  for (const e of tree.entries) {
    if (!e.relation || (e.relation.type !== 'amends' && e.relation.type !== 'reverses') || !e.tag) continue;
    if (e.tag === 'V') counted.visionaryRelations.push(e.id);
    const target = byId.get(e.relation.target);
    if (!target) continue;
    const root = rootOf(target);
    let top = rankOf(root);
    for (const a of tree.entries) if (a.relation?.type === 'amends' && a.chainRoot === root.id && a.order < e.order) top = Math.max(top, rankOf(a));
    if (RANK[e.tag] < top && !e.ratified) {
      const topTag = (Object.keys(RANK) as Tag[]).find((t) => RANK[t] === top) ?? 'V';
      out.push(f('consistency', 'rewrite', e.id, null, e.line, `${e.id} ${e.relation.type} ${e.relation.target} under [${e.tag}], below the chain's [${topTag}]: an interviewer may not rewrite the visionary`, `a later entry [V] ratifies ${e.id}`));
    }
  }
  // de-triggered (D156, D166)
  for (const a of tree.entries) {
    if (a.relation?.type === 'amends') {
      const root = byId.get(a.chainRoot);
      if (!root) continue;
      const before = [root, ...tree.entries.filter((x) => x.relation?.type === 'amends' && x.chainRoot === root.id && x.order < a.order && x.inEffect)].at(-1);
      if (before?.slots.trig && !a.slots.trig) counted.deTriggered.push({ id: a.id, target: a.relation.target });
    }
    if (a.relation?.type === 'reverses') {
      const t = byId.get(a.relation.target);
      if (t && effectiveShape(tree, byId.get(t.chainRoot) ?? t).slots.trig) counted.deTriggered.push({ id: a.id, target: a.relation.target });
    }
  }
  return out;
}

export const isNeed = isNeedId;
