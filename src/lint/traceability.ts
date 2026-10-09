import { FENCE_KINDS, FENCE_SECTION } from '../grammar.js';
import { chainOf, effectiveShape, roots } from '../effect.js';
import { entryMap, isNeedId } from '../parse.js';
import type { Deliverables } from '../deliverables.js';
import type { DocketTree, Entry, Finding } from '../tree.js';

export interface NotCounted { id: string; reason: string }

const at = (rule: string, where: string, line: number, message: string, fix: string | null = null): Finding =>
  ({ layer: 'traceability', rule, key: where, entry: null, slot: null, line, message, fix, where });
const on = (rule: string, entry: string, line: number, message: string, fix: string | null = null, where?: string): Finding =>
  ({ layer: 'traceability', rule, key: entry, entry, slot: null, line, message, fix, ...(where === undefined ? {} : { where }) });

/**
 * The traceability layer (D23, D24, D68, D77, D88, D111, D136, D149/D163, D151, D167):
 * kind implies destination; every join is by id, in both directions.
 */
/** The not-counted kinds the docket alone settles (D197): boundary, relation, reversed, and need-kind rulings no ledger joined. */
export function notCountedWithoutCorpus(tree: DocketTree): NotCounted[] {
  const out: NotCounted[] = [];
  for (const r of roots(tree)) {
    if (r.kind === 'need' || !r.inEffect) continue;
    const x = effectiveShape(tree, r);
    if (r.relation) out.push({ id: r.id, reason: `a ${r.relation.type} entry` });
    else if (x.resolution?.kind === 'boundary') out.push({ id: r.id, reason: 'resolves to boundary' });
    else if (x.resolution?.kind === 'need' && x.resolution.reference) out.push({ id: r.id, reason: `resolves to need ${x.resolution.reference}` });
  }
  for (const e of tree.entries) if (!e.inEffect) out.push({ id: e.id, reason: `reversed by ${e.reversedBy.join(', ')}` });
  return out;
}

export function traceabilityLayer(tree: DocketTree, d: Deliverables, notCounted: NotCounted[]): Finding[] {
  const out: Finding[] = [];
  const byId = entryMap(tree);
  const letter = tree.letter;
  const ownId = (id: string): boolean => (letter !== null && id.startsWith(letter)) || isNeedId(id);
  const chain = (id: string): Set<string> => chainOf(tree, id);
  const scenarioTags = new Set((d.scenarios ?? []).flatMap((s) => s.tags));
  const outlines = new Map((d.scenarios ?? []).filter((s) => s.outline).map((s) => [s.title, s]));
  const titles = new Map((d.scenarios ?? []).map((s) => [s.title, s]));
  const fenceIdsByKind = new Map<string, Set<string>>();
  for (const fe of d.fence ?? []) {
    const kind = Object.entries(FENCE_SECTION).find(([, sec]) => fe.section.startsWith(sec))?.[0];
    if (!kind) continue;
    for (const c of fe.cites) if (byId.has(c)) for (const id of chain(c)) fenceIdsByKind.set(kind, new Set([...(fenceIdsByKind.get(kind) ?? []), id]));
  }
  const ruled = new Set(d.design?.cites ?? []);
  const rows = new Map((d.ledger ?? []).map((r) => [r.id, r]));
  const shapeOf = (e: Entry): Entry => effectiveShape(tree, byId.get(e.chainRoot) ?? e);

  for (const r of roots(tree)) {
    if (r.kind === 'need') {
      if (d.ledger && !rows.has(r.id)) out.push(on('need-not-in-ledger', r.id, r.line, `${r.id} is absent from the ledger`, `a row for ${r.id} in USER-NEEDS.md`));
      continue;
    }
    if (!r.inEffect) continue;
    const x = effectiveShape(tree, r);
    const ch = chain(r.id);
    if (r.relation) { notCounted.push({ id: r.id, reason: `a ${r.relation.type} entry` }); continue; }
    if (x.resolution) {
      const k = x.resolution.kind;
      if (FENCE_KINDS.includes(k)) {
        if (d.fence && ![...ch].some((id) => fenceIdsByKind.get(k)?.has(id))) out.push(on('not-in-fence', r.id, x.resolution.line, `${r.id} resolves to ${k} and no ${FENCE_SECTION[k] ?? ''} entry of the fence cites it`, `an entry under ${FENCE_SECTION[k] ?? ''} citing (${r.id}, ${r.date ?? ''})`));
        else if (x.slots.trig) notCounted.push({ id: r.id, reason: 'resolved; trigger is the reopening condition' });
      } else if ((k === 'structural' || k === 'means') && d.design && ![...ch].some((id) => ruled.has(id))) {
        out.push(on('not-in-design', r.id, x.resolution.line, `${r.id} resolves to ${k} and no ruled tag in DESIGN.md cites it`, `[ruled: ${r.id}] on the constraint it rules`));
      }
      if (k === 'boundary') notCounted.push({ id: r.id, reason: 'resolves to boundary' });
      if ((k === 'need' || k === 'means') && x.resolution.reference) {
        const row = rows.get(x.resolution.reference);
        if (d.ledger && row && ![...ch].some((id) => row.cites.includes(id))) out.push(on('ledger-uncited', r.id, x.resolution.line, `${r.id} resolves to ${x.resolution.reference} and ledger row ${x.resolution.reference} does not cite it`, `cite ${r.id} in the evidence of row ${x.resolution.reference}`));
        if (k === 'need' && !(d.ledger && row)) notCounted.push({ id: r.id, reason: `resolves to need ${x.resolution.reference}` });
      }
    } else if (x.slots.trig && d.scenarios && ![...ch].some((id) => scenarioTags.has(id))) {
      out.push(on('uncited-trigger', r.id, x.line, `${r.id} is a triggered ruling in effect and no scenario cites it`, `a scenario tagged @${r.id}`));
    }
    for (const sp of x.spread) {
      if (!d.scenarios) continue;
      const o = outlines.get(sp.title);
      if (!o) out.push(on('spread-no-outline', r.id, sp.line, `spread names "${sp.title}" and the corpus has no scenario outline of that title`, `an outline titled "${sp.title}" tagged @${r.id}`));
      else if (!o.tags.some((t) => ch.has(t))) out.push(on('spread-untagged', r.id, sp.line, `outline "${sp.title}" carries no tag @${r.id}`, `@${r.id} on the outline`));
    }
  }
  for (const s of d.scenarios ?? []) {
    const where = `${s.file} "${s.title}"`;
    if (!s.tags.some((t) => ownId(t))) { out.push(at('untagged-scenario', where, s.line, `scenario "${s.title}" carries no ruling tag: no docket entry cited`, 'tag it with the ruling it proves')); continue; }
    for (const t of s.tags) {
      if (!ownId(t)) continue;
      const e = byId.get(t);
      if (!e) { out.push(at('scenario-cites-missing', where, s.line, `scenario "${s.title}" cites ${t}, an id not in the docket`, 'cite an entry the docket holds')); continue; }
      if (e.kind === 'need') { out.push(at('scenario-cites-need', where, s.line, `scenario "${s.title}" cites ${t}, a need; scenarios cite rulings`, 'cite the ruling that serves the need')); continue; }
      if (!e.inEffect) { out.push(on('scenario-cites-reversed', t, s.line, `scenario "${s.title}" cites ${t}, reversed by ${e.reversedBy.join(', ')}`, 'cite a ruling in effect, or retire the scenario', where)); continue; }
      const x = shapeOf(e);
      const k = x.resolution?.kind ?? null;
      if (k === 'need') out.push(at('scenario-mis-kinded', where, s.line, `scenario "${s.title}" cites ${t}, which resolves to need ${x.resolution?.reference ?? ''}`, 'cite a triggered, structural, or means ruling'));
      else if (k === 'boundary' || (k !== null && FENCE_KINDS.includes(k))) out.push(at('scenario-mis-kinded', where, s.line, `scenario "${s.title}" cites ${t}, a ${k} entry`, 'cite a triggered, structural, or means ruling'));
    }
  }
  for (const fe of d.fence ?? []) {
    const where = `OUT-OF-SCOPE.md ${fe.section}`;
    const sec = fe.section.split(' ')[0] ?? '';
    const kindStrict = Object.entries(FENCE_SECTION).find(([, s]) => fe.section.startsWith(s))?.[0] ?? null;
    for (const c of fe.cites) {
      if (!ownId(c)) continue;
      const e = byId.get(c);
      if (!e) { out.push(at('fence-cites-missing', where, fe.line, `${sec} entry cites ${c}, an id not in the docket`, 'cite an entry the docket holds')); continue; }
      if (!e.inEffect && !e.reversedBy.some((r) => fe.cites.includes(r))) out.push(at('fence-cites-reversed', where, fe.line, `${sec} entry cites ${c}, reversed by ${e.reversedBy.join(', ')}, without its reverser`, `cite ${e.reversedBy.join(', ')} beside ${c}`));
    }
    if (kindStrict) {
      // a citation the docket cannot resolve, or one already reversed, is a different fault reported above (D88, D33)
      const resolvable = fe.cites.filter((c) => byId.get(c)?.inEffect);
      const ok = resolvable.some((c) => { const e = byId.get(c); return e !== undefined && shapeOf(e).resolution?.kind === kindStrict; });
      if (resolvable.length > 0 && !ok) out.push(at('fence-mis-kinded', where, fe.line, `${sec} entry cites ${fe.cites.join(', ')} and none is a ${kindStrict} ruling — not a fence kind of this section`, `cite the ${kindStrict} ruling this entry records`));
    }
    for (const title of fe.guardedBy) {
      const s = titles.get(title);
      if (!d.scenarios || !s) continue;
      const ok = fe.cites.some((c) => byId.has(c) && s.tags.some((t) => chain(c).has(t)));
      if (!ok) for (const c of fe.cites.filter((id) => byId.has(id))) out.push(on('guard-untagged', c, fe.line, `fence entry is guarded by "${title}", which carries no tag @${c}`, `@${c} on "${title}"`));
    }
  }
  for (const dl of d.design?.lines ?? []) {
    for (const c of dl.cites) {
      if (!ownId(c)) { if (!notCounted.some((n) => n.id === c)) notCounted.push({ id: c, reason: "outside the docket's id patterns" }); continue; }
      const e = byId.get(c);
      if (!e) out.push(at('design-cites-missing', 'DESIGN.md', dl.line, `ruled tag cites ${c}, an id not in the docket`, 'cite an entry the docket holds'));
      else if (!e.inEffect) out.push(at('design-cites-reversed', 'DESIGN.md', dl.line, `ruled tag cites ${c}, reversed by ${e.reversedBy.join(', ')}`, 'cite the ruling in effect'));
    }
  }
  for (const row of d.ledger ?? []) {
    const where = `USER-NEEDS.md ${row.id}`;
    if (!byId.has(row.id)) { out.push(at('ledger-cites-missing', where, row.line, `ledger row ${row.id} names a need the docket lacks`, 'a row per N entry of the docket')); continue; }
    for (const c of row.cites) {
      if (!ownId(c)) continue;
      const e = byId.get(c);
      if (!e) { out.push(at('ledger-cites-missing', where, row.line, `row ${row.id} cites ${c}, an id not in the docket`, 'cite an entry the docket holds')); continue; }
      const x = shapeOf(e);
      const ok = (x.resolution && (x.resolution.kind === 'need' || x.resolution.kind === 'means') && x.resolution.reference === row.id) || (x.serves?.ids.includes(row.id) ?? false);
      if (!ok) out.push(at('ledger-mis-cite', where, row.line, `row ${row.id} cites ${c}, which neither resolves to nor serves ${row.id}`, `cite only rulings that resolve to or serve ${row.id}`));
    }
  }
  for (const e of tree.entries) if (!e.inEffect && !notCounted.some((n) => n.id === e.id)) notCounted.push({ id: e.id, reason: `reversed by ${e.reversedBy.join(', ')}` });
  return out;
}
