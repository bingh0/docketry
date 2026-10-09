import { createHash } from 'node:crypto';
import {
  DATE_RE, FENCE_KINDS, GHERKIN_KEYWORDS, GRAMMAR_VERSION, ID_RE, KEYWORDS, KINDS, KINDS_WITHOUT_REFERENCE,
  KINDS_WITH_REFERENCE, RELATIONS, SLOT_KEYWORDS, TAGS,
  type Relation, type ResolutionKind, type SlotKeyword, type Tag,
} from './grammar.js';
import { deriveEffect } from './effect.js';
import { formatEntry } from './format.js';
import type { DocketTree, Entry, Finding, ParseResult, ProseNode, Refusal, Slot } from './tree.js';

const isTag = (s: string): s is Tag => (TAGS as readonly string[]).includes(s);
const isKind = (s: string): s is ResolutionKind => (KINDS as readonly string[]).includes(s);
const isRelation = (s: string): s is Relation => (RELATIONS as readonly string[]).includes(s);
const isSlot = (s: string): s is SlotKeyword => (SLOT_KEYWORDS as readonly string[]).includes(s);
export const isNeedId = (s: string): boolean => /^N\d+$/u.test(s);
export const isId = (s: string): boolean => ID_RE.test(s);

/** D184: UTF-8, byte-order mark dropped, CRLF read as LF. */
export function normalise(text: string): string {
  return (text.codePointAt(0) === 0xfeff ? text.slice(1) : text).replaceAll('\r\n', '\n');
}

export function sha256(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

const TAG_TOKEN = /\[([^\]]*)\]/gu;

/** Split slot prose into text, quantity, list, and literal nodes (D20, D121, D173). */
export function proseNodes(body: string): { nodes: ProseNode[]; bare: string[] } {
  const nodes: ProseNode[] = [];
  const re = /`([^`]*)`|\{([^}]*)\}/gu;
  let last = 0;
  let masked = '';
  for (const m of body.matchAll(re)) {
    const idx = m.index;
    if (idx > last) { nodes.push({ type: 'text', text: body.slice(last, idx) }); masked += body.slice(last, idx); }
    if (m[1] === undefined) {
      const island = m[2] ?? '';
      if (island.includes('|')) nodes.push({ type: 'list', members: island.split('|').map((x) => x.trim()) });
      else nodes.push({ type: 'quantity', text: island.trim(), unresolved: (/\b(TBD|TBR)\b/u.exec(island)?.[1] as 'TBD' | 'TBR' | undefined) ?? null });
    } else nodes.push({ type: 'literal', text: m[1] });
    masked += ' ';
    last = idx + m[0].length;
  }
  if (last < body.length) { nodes.push({ type: 'text', text: body.slice(last) }); masked += body.slice(last); }
  const bare: string[] = [];
  for (const tok of masked.split(/\s+/u)) {
    if (!/\d/u.test(tok)) continue;
    const core = tok.replaceAll(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/gu, '');
    if (/^[A-Z]\d+$/u.test(core)) continue;
    bare.push(tok);
  }
  return { nodes, bare };
}

interface Draft {
  entry: Entry;
  slotLines: Set<string>;
}

const blank = (id: string, line: number, order: number): Entry => ({
  id, kind: 'ruling', date: null, tag: null, unwanted: false, relation: null, beneficiary: null, weight: null,
  line, order, slots: {}, resolution: null, sib: null, spread: [], serves: null, tension: [], touches: null,
  notes: [], raw: [], hash: '', inEffect: true, reversedBy: [], amendedBy: [], reaffirmedBy: [], ratifiedBy: [],
  ratified: null, signedBy: [], signed: null, effectiveFrom: id, chainRoot: id, touchedBy: [], servedBy: [], tensionWith: [], incomplete: false,
});

/**
 * Parse a docket. Tree-breaking defects are collected into one refusal (D78, D186);
 * entry-level defects become form findings on the parse (D28). The lint layers
 * add their own findings over the returned tree.
 */
export function parseDocket(input: string, opts: { asOf?: string } = {}): ParseResult {
  const text = normalise(input);
  const lines = text.split('\n');
  const refusals: Refusal[] = [];
  const findings: Finding[] = [];
  const form = (rule: string, entry: string | null, slot: string | null, line: number, message: string, fix: string | null = null): number =>
    findings.push({ layer: 'form', rule, key: entry ? (slot ? `${entry} ${slot}` : entry) : '?', entry, slot, line, message, fix });

  // ── the version line stands alone (D37, D186)
  const first = lines[0] ?? '';
  const vm = /^docket:\s*(\d+)\s*$/u.exec(first);
  if (!vm) return { ok: false, refusals: [{ line: 1, message: `missing version line: the first line must read "docket: ${GRAMMAR_VERSION}"` }] };
  if (Number(vm[1]) !== GRAMMAR_VERSION) {
    return { ok: false, refusals: [{ line: 1, message: `unknown docket format version ${vm[1]}: this lint parses grammar version ${GRAMMAR_VERSION}` }] };
  }

  const entries: Entry[] = [];
  let cur: Draft | null = null;
  let prev: Draft | null = null;

  const headerRuling = /^([A-Z]\d+)(?: (?!\[)(\S+))? \[([^\]]*)\](.*)$/u;
  const parseHeaderTail = (d: Draft, tail: string, lineNo: number): void => {
    const toks = tail.trim() === '' ? [] : tail.trim().split(/\s+/u);
    let i = 0;
    if (d.entry.kind === 'need') {
      d.entry.beneficiary = toks[i++] ?? null;
      const w = toks[i++];
      if (w === undefined || !/^\d+$/u.test(w)) form('weight-range', d.entry.id, null, lineNo, `need ${d.entry.id} lacks a weight`, 'weight is an integer from 1 to 5');
      else {
        d.entry.weight = Number(w);
        if (d.entry.weight < 1 || d.entry.weight > 5) form('weight-range', d.entry.id, null, lineNo, `weight ${w} is outside the range`, 'weight is an integer from 1 to 5');
      }
    }
    while (i < toks.length) {
      const t = toks[i] ?? '';
      if (t === '!') { d.entry.unwanted = true; i += 1; continue; }
      if (isRelation(t)) {
        const target = toks[i + 1];
        if (!target || !isId(target)) refusals.push({ line: lineNo, message: `${d.entry.id}: relation ${t} names no entry id` });
        else d.entry.relation = { type: t, target };
        i += 2; continue;
      }
      if (/^[a-z]+$/u.test(t) && toks[i + 1] !== undefined && isId(toks[i + 1] ?? '')) {
        refusals.push({ line: lineNo, message: `${d.entry.id}: relation "${t}" is outside the set ${RELATIONS.join(', ')}` });
        i += 2; continue;
      }
      form('stray-line', d.entry.id, null, lineNo, `unexpected token "${t}" on the header of ${d.entry.id}`, 'header: id date [tag] (!) (relation target)');
      i += 1;
    }
  };

  for (let n = 1; n < lines.length; n++) {
    const lineNo = n + 1;
    const ln = lines[n] ?? '';
    if (ln.trim() === '') { if (cur) prev = cur; cur = null; continue; }
    if (ln.startsWith('#')) {
      if (cur) { cur.entry.notes.push(ln.slice(1).trim()); cur.entry.raw.push(ln); }
      continue;
    }
    if (/^\s/u.test(ln)) {
      const owner = cur ?? prev;
      const ownerId = owner?.entry.id ?? null;
      if (!ln.startsWith('  ') || ln.startsWith('   ') || ln.startsWith('  \t')) {
        form('stray-line', ownerId, null, lineNo, `stray line: indented by something other than two spaces`, 'indent by two spaces');
        owner?.entry.raw.push(ln);
        continue;
      }
      if (!cur) {
        form('stray-line', ownerId, null, lineNo, `stray line: a slot line after a blank line belongs to no entry`, 'remove the blank line inside the entry, or start a new entry with a header');
        continue;
      }
      cur.entry.raw.push(ln);
      const body = ln.slice(2);
      const arrow = /^->\s+(\S+)(?:\s+(\S+))?\s*$/u.exec(body);
      if (arrow) {
        const kind = arrow[1] ?? '';
        const ref = arrow[2] ?? null;
        if (!isKind(kind)) { refusals.push({ line: lineNo, message: `${cur.entry.id}: resolution kind "${kind}" is outside the set ${KINDS.join(', ')}` }); continue; }
        if (cur.entry.resolution) form('duplicate-slot', cur.entry.id, null, lineNo, `a second resolution line on ${cur.entry.id}`, 'one resolution per entry');
        const res = { kind, reference: null as string | null, label: null as string | null, line: lineNo };
        if (KINDS_WITH_REFERENCE.includes(kind)) {
          if (!ref || !isNeedId(ref)) form('reference-missing', cur.entry.id, null, lineNo, `${kind} requires a need reference`, `-> ${kind} N<n>`);
          else res.reference = ref;
        } else if (KINDS_WITHOUT_REFERENCE.includes(kind)) {
          if (ref) form('reference-misplaced', cur.entry.id, null, lineNo, `${kind} carries no reference; found "${ref}"`, `-> ${kind}`);
        } else if (FENCE_KINDS.includes(kind)) {
          res.label = ref;
        }
        cur.entry.resolution = res;
        continue;
      }
      const kw = /^([A-Za-z]+):(?:\s+(.*))?$/u.exec(body);
      if (!kw) { form('stray-line', cur.entry.id, null, lineNo, `stray line: "${body.trim()}"`, 'a slot line is a keyword, a colon, and its text'); continue; }
      const word = kw[1] ?? '';
      const rest = (kw[2] ?? '').trim();
      if ((GHERKIN_KEYWORDS as readonly string[]).includes(word)) { refusals.push({ line: lineNo, message: `${cur.entry.id}: Gherkin keyword "${word}" used as a slot keyword` }); continue; }
      if (!(KEYWORDS as readonly string[]).includes(word)) { refusals.push({ line: lineNo, message: `${cur.entry.id}: keyword "${word}" is outside the set ${KEYWORDS.join(', ')}` }); continue; }
      if (isSlot(word)) {
        if (cur.slotLines.has(word)) form('duplicate-slot', cur.entry.id, word, lineNo, `a second ${word} slot on ${cur.entry.id}`, 'one slot per keyword');
        cur.slotLines.add(word);
        const tags = [...rest.matchAll(TAG_TOKEN)].map((m) => m[1] ?? '');
        for (const t of tags) if (!isTag(t)) refusals.push({ line: lineNo, message: `${cur.entry.id} ${word}: provenance tag [${t}] is outside the set ${TAGS.join(' ')}` });
        const good = tags.filter((t): t is Tag => isTag(t));
        if (tags.length === 0) form('missing-tag', cur.entry.id, word, lineNo, `${word} slot carries no provenance tag`, `${word}: ... [V]`);
        else if (tags.length > 1) form('double-tag', cur.entry.id, word, lineNo, `${word} slot carries ${tags.length} provenance tags`, 'exactly one tag per slot');
        const prose = rest.replaceAll(TAG_TOKEN, '').trim();
        const { nodes, bare } = proseNodes(prose);
        const slot: Slot = { keyword: word, text: prose, tag: good[0] ?? null, tags, nodes, bare, line: lineNo };
        cur.entry.slots[word] = slot;
        continue;
      }
      switch (word) {
        case 'sib': {
          if (/^none\b/u.test(rest)) {
            const after = rest.slice(4).trim();
            const dash = after.startsWith('--');
            cur.entry.sib = { target: null, none: true, dash, reason: dash ? after.slice(2).trim() : after, line: lineNo };
          } else cur.entry.sib = { target: rest.split(/\s+/u)[0] ?? '', none: false, dash: false, reason: null, line: lineNo };
          break;
        }
        case 'spread': cur.entry.spread.push({ title: rest, line: lineNo }); break;
        case 'serves': cur.entry.serves = { ids: rest === '' ? [] : rest.split(/\s+/u), line: lineNo }; break;
        case 'tension': {
          const m = /^(\S+)\s*(?:--\s*(.*))?$/u.exec(rest);
          cur.entry.tension.push({ target: m?.[1] ?? '', reason: m?.[2]?.trim() ?? null, line: lineNo });
          break;
        }
        case 'touches': cur.entry.touches = { ids: rest === '' ? [] : rest.split(/\s+/u), line: lineNo }; break;
        default: break;
      }
      continue;
    }
    // ── a header
    if (cur) prev = cur;
    const hm = headerRuling.exec(ln);
    if (!hm) {
      const idm = /^([A-Z]\d+)\b(.*)$/u.exec(ln);
      if (!idm) { refusals.push({ line: lineNo, message: `unmatched header line: "${ln}"` }); cur = null; continue; }
      const e = blank(idm[1] ?? '', lineNo, entries.length);
      e.kind = isNeedId(e.id) ? 'need' : 'ruling';
      e.raw.push(ln);
      form('undated', e.id, null, lineNo, `${e.id} carries no date`, 'header: id YYYY-MM-DD [tag]');
      cur = { entry: e, slotLines: new Set() };
      entries.push(e);
      continue;
    }
    const e = blank(hm[1] ?? '', lineNo, entries.length);
    e.kind = isNeedId(e.id) ? 'need' : 'ruling';
    e.raw.push(ln);
    if (hm[2] === undefined) form('undated', e.id, null, lineNo, `${e.id} carries no date`, 'header: id YYYY-MM-DD [tag]');
    else if (DATE_RE.test(hm[2])) e.date = hm[2];
    else form('undated', e.id, null, lineNo, `${e.id} date "${hm[2]}" is not ISO`, 'header: id YYYY-MM-DD [tag]');
    const tag = hm[3] ?? '';
    if (isTag(tag)) e.tag = tag;
    else refusals.push({ line: lineNo, message: `${e.id}: provenance tag [${tag}] is outside the set ${TAGS.join(' ')}` });
    cur = { entry: e, slotLines: new Set() };
    entries.push(e);
    parseHeaderTail(cur, hm[4] ?? '', lineNo);
  }

  // ── tree-breaking defects across entries (D28, D71, D186)
  const byId = new Map<string, Entry>();
  for (const e of entries) {
    const seen = byId.get(e.id);
    if (seen) refusals.push({ line: e.line, message: `duplicate id ${e.id}: declared on line ${seen.line} and line ${e.line}` });
    else byId.set(e.id, e);
  }
  for (const e of entries) {
    if (!e.relation) continue;
    const t = byId.get(e.relation.target);
    if (!t) refusals.push({ line: e.line, message: `${e.id} ${e.relation.type} ${e.relation.target}, an id not in the docket` });
    else if (t.order > e.order) refusals.push({ line: e.line, message: `${e.id} ${e.relation.type} ${e.relation.target}, a later entry; relations point backward only` });
  }
  if (refusals.length > 0) return { ok: false, refusals };

  // ── entry-level form findings that need the whole docket
  const letters = new Set<string>();
  for (const e of entries) {
    if (e.kind === 'ruling') {
      const l = e.id[0] ?? '';
      if (letters.size > 0 && !letters.has(l)) form('two-letters', e.id, null, e.line, `${e.id} uses a second ruling letter; one ruling letter per docket`, `use ${[...letters][0]}`);
      letters.add(l);
    }
  }
  let prevDate: string | null = null;
  for (const e of entries) {
    if (e.date && prevDate && e.date < prevDate) form('date-order', e.id, null, e.line, `${e.id} is dated ${e.date}, earlier than the entry above (${prevDate})`, "today's date, or the entry's proper position");
    if (e.date) prevDate = e.date;
  }
  for (const e of entries) {
    if (e.touches) {
      for (const t of e.touches.ids) {
        if (t === 'none') continue;
        const x = byId.get(t);
        if (!x) form('touches-missing', e.id, 'touches', e.touches.line, `touches names ${t}, an id not in the docket`, 'touches: <earlier ids> or none');
        else if (x.order > e.order) form('touches-later', e.id, 'touches', e.touches.line, `touches names ${t}, a later entry`, 'touches names earlier entries only');
      }
    }
    if (e.serves) {
      for (const t of e.serves.ids) {
        if (!isNeedId(t) || !byId.has(t)) form('serves-not-need', e.id, 'serves', e.serves.line, `serves names ${t}; serves names needs only`, 'serves: N<n> ...');
      }
    }
    for (const tn of e.tension) {
      if (!isNeedId(tn.target) || !byId.has(tn.target)) form('tension-form', e.id, 'tension', tn.line, `tension names ${tn.target || 'nothing'}; a tension names a need`, 'tension: N<n> -- <reason>');
      else if (tn.reason === null || tn.reason.split(/\s+/u).filter(Boolean).length < 3) form('tension-vacuous', e.id, 'tension', tn.line, 'tension reason has fewer than three words and states nothing checkable', 'tension: N<n> -- <a reason of three words or more>');
    }
    if (e.sib) {
      if (e.sib.none) {
        if (!e.sib.dash) form('sib-none-dash', e.id, 'sib', e.sib.line, 'sib none without the double dash before its reason', 'sib: none -- <reason>');
        else if ((e.sib.reason ?? '').split(/\s+/u).filter(Boolean).length < 3) form('sib-none-vacuous', e.id, 'sib', e.sib.line, 'sib none: the reason has fewer than three words and states nothing checkable', 'sib: none -- <a reason of three words or more>');
      } else {
        const t = e.sib.target ?? '';
        const x = byId.get(t);
        if (t === e.id) form('sib-self', e.id, 'sib', e.sib.line, `sib names ${e.id} itself`, 'sib names an unwanted entry, or none -- <reason>');
        else if (!x) form('sib-missing', e.id, 'sib', e.sib.line, `sib names ${t}, an id not in the docket`, 'sib names an unwanted entry, or none -- <reason>');
        else if (!x.unwanted) form('sib-wanted', e.id, 'sib', e.sib.line, `sib names ${t}, a wanted entry`, 'sib names an unwanted entry (marked !)');
      }
    }
    if (e.resolution && e.slots.trig && !FENCE_KINDS.includes(e.resolution.kind)) form('trigger-with-resolution', e.id, null, e.resolution.line, `${e.id} carries a trigger beside ${e.resolution.kind}; only a fence kind may carry a trigger`, 'drop the trigger or the resolution');
  }

  // ── the trailing entry (D152, D153, D34)
  const last = entries.at(-1);
  if (last && last.kind === 'ruling') {
    const missing: string[] = [];
    if (!last.slots.resp) missing.push('response');
    if (!last.touches) missing.push('touches');
    if (!last.slots.trig && !last.resolution && !last.relation) missing.push('a trigger, a resolution, or a relation');
    if (missing.length > 0) {
      last.incomplete = true;
      form('incomplete', last.id, null, last.line, `${last.id} is incomplete — resume here; it lacks ${missing.join(', ')}`, 'finish the entry');
    }
  }
  for (const e of entries) {
    if (e.kind !== 'ruling') continue;
    if (e.slots.pre && !e.slots.trig && !e.incomplete) form('pre-without-trigger', e.id, 'pre', e.slots.pre.line, `${e.id} has a precondition and no trigger`, 'add the trigger');
    if (!e.slots.resp && !e.incomplete && !e.relation) form('missing-response', e.id, 'resp', e.line, `${e.id} has no response slot`, 'resp: <text> [tag]');
  }

  // ── hashes (D155, D185): canonical text, never written
  let chain = '';
  for (const e of entries) {
    e.hash = sha256(formatEntry(e));
    chain = sha256(chain + e.hash);
  }
  const letter = entries.find((e) => e.kind === 'ruling')?.id[0] ?? null;
  const dates = entries.map((e) => e.date).filter((d): d is string => d !== null);
  const asOf = opts.asOf ?? (dates.length > 0 ? dates.reduce((a, b) => (a > b ? a : b)) : '');
  const tree: DocketTree = { docket: 1, asOf, letter, chainHash: chain, entries };
  deriveEffect(tree);
  return { ok: true, tree, findings };
}

export function entryMap(tree: DocketTree): Map<string, Entry> {
  return new Map(tree.entries.map((e) => [e.id, e]));
}
