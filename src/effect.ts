import type { DocketTree, Entry } from './tree.js';

/**
 * In-effect and chain derivation (D71, D65, D113, D43, D110, D112, D116, D223).
 * Relations point backward only, so a single pass from the end settles effect.
 */
export function deriveEffect(tree: DocketTree): void {
  const byId = new Map(tree.entries.map((e) => [e.id, e]));
  const { entries } = tree;
  for (const e of entries) {
    e.reversedBy = []; e.amendedBy = []; e.reaffirmedBy = []; e.ratifiedBy = [];
    e.touchedBy = []; e.servedBy = []; e.tensionWith = []; e.ratified = null; e.signedBy = []; e.signed = null;
  }
  for (const e of entries) {
    if (!e.relation) continue;
    const t = byId.get(e.relation.target);
    if (!t) continue;
    if (e.relation.type === 'reverses') t.reversedBy.push(e.id);
    if (e.relation.type === 'amends') t.amendedBy.push(e.id);
    if (e.relation.type === 'reaffirms') t.reaffirmedBy.push(e.id);
    if (e.relation.type === 'ratifies') t.ratifiedBy.push(e.id);
  }
  // effect, from the end: an entry is in effect when dated on or before as-of and no in-effect entry reverses it
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i] as Entry;
    const inWindow = tree.asOf === '' ? true : e.date !== null && e.date <= tree.asOf;
    e.inEffect = inWindow && !e.reversedBy.some((r) => byId.get(r)?.inEffect);
  }
  // chains and effective shape
  const rootOf = (e: Entry): Entry => {
    let x = e;
    const seen = new Set<string>();
    while (x.relation?.type === 'amends' && !seen.has(x.id)) {
      seen.add(x.id);
      const t = byId.get(x.relation.target);
      if (!t) break;
      x = t;
    }
    return x;
  };
  const effective = (e: Entry): Entry => {
    for (let i = e.amendedBy.length - 1; i >= 0; i--) {
      const a = byId.get(e.amendedBy[i] ?? '');
      if (a?.inEffect) return effective(a);
    }
    return e;
  };
  for (const e of entries) {
    e.chainRoot = rootOf(e).id;
    e.effectiveFrom = effective(e).id;
  }
  // ratification (D43, D72, D177): a V-tagged ratifies entry marks its target, and reaches the earlier amenders of its root
  for (const r of entries) {
    if (r.relation?.type !== 'ratifies' || r.tag !== 'V') continue;
    const t = byId.get(r.relation.target);
    if (!t) continue;
    const mark = (x: Entry): void => { if (!x.ratified) x.ratified = { by: r.id, date: r.date }; };
    mark(t);
    if (t.relation?.type === 'amends') {
      const root = rootOf(t);
      for (const a of entries) if (a.relation?.type === 'amends' && rootOf(a).id === root.id && a.order < t.order) mark(a);
    }
  }
  // signatures (D223): a V-tagged signs entry marks every entry in effect as of its date signed; the as-of parse at that date is the signed state
  for (const r of entries) {
    if (r.relation?.type !== 'signs' || r.tag !== 'V' || r.date === null) continue;
    const at = r.date;
    const reversedAt = (e: Entry): boolean => e.reversedBy.some((id) => { const x = byId.get(id); return x !== undefined && x.date !== null && x.date <= at; });
    for (const e of entries) {
      if (e.date === null || e.date > at || reversedAt(e)) continue;
      e.signedBy.push(r.id);
      e.signed = { by: r.id, date: at };
    }
  }
  // inbound edges
  for (const e of entries) {
    for (const t of e.touches?.ids ?? []) byId.get(t)?.touchedBy.push(e.id);
    for (const n of e.serves?.ids ?? []) byId.get(n)?.servedBy.push(e.id);
    for (const tn of e.tension) {
      const n = byId.get(tn.target);
      if (n) { n.tensionWith.push(e.id); e.tensionWith.push(n.id); }
    }
  }
}

/** Every entry sharing an amendment root with `id` (D88). */
export function chainOf(tree: DocketTree, id: string): Set<string> {
  const root = tree.entries.find((e) => e.id === id)?.chainRoot ?? id;
  return new Set(tree.entries.filter((e) => e.chainRoot === root).map((e) => e.id));
}

export function effectiveShape(tree: DocketTree, e: Entry): Entry {
  return tree.entries.find((x) => x.id === e.effectiveFrom) ?? e;
}

/** The roots: entries that are not amendments (the units the coverage and traceability layers count). */
export function roots(tree: DocketTree): Entry[] {
  return tree.entries.filter((e) => e.relation?.type !== 'amends');
}
