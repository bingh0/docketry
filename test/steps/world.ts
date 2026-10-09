// The DocketBuilder world. Scenarios describe a docket in prose; this builds
// the text. Every entry it invents is WELL-FORMED, so a scenario that asks for
// one defect gets exactly one finding and nothing else.
import { tmpdir } from 'node:os';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { lintDocket, parseDocket, RANK, reportText } from '../../dist/index.js';
import type { DocketTree, Entry, Finding, LintOptions, LintResult, ParseResult, Report, Tag } from '../../dist/index.js';

export const SCRATCH = join(process.env['DOCKETRY_SCRATCH'] ?? tmpdir(), 'docketry-tests');

// ── the shapes of a well-formed entry (no digits anywhere: a bare digit run is a finding)
const RULING_DATE = '2026-09-05';
const LATER_DATE = '2026-09-06';
const NEED_DATE = '2026-09-04';
const SLOT_TEXT: Record<string, string> = {
  pre: 'the folder is being watched',
  trig: 'a file is dropped onto the folder',
  resp: "the file appears in the folder's listing",
  need: 'I need to find any document again when I actually need it',
  means: 'the folder is watched by a background process',
  why: 'the figure was read off the field test of the archive',
};
const SLOT_TAG: Record<string, string> = { pre: 'I>V', trig: 'I>V', resp: 'I>V', why: 'I>V', need: 'V', means: 'V' };
const SIB_LINE = '  sib:   none -- the drop is idempotent by construction';
const TOUCHES_LINE = '  touches: none';

const SLOT_ORDER = ['pre', 'trig', 'resp', 'why', 'need', 'means'];
/** where a non-slot line sits in canonical order */
const RAW_RANK: Record<string, number> = { res: 0, sib: 1, spread: 2, serves: 3, tension: 4, touches: 5, note: 6, stray: 7 };

export interface SlotLine { t: 'slot'; word: string; text: string; tags: string[]; indent: string; gap: string }
export interface RawLine { t: 'raw'; key: string; text: string }
export interface BlankLine { t: 'blank' }
export type BodyLine = SlotLine | RawLine | BlankLine;

/** where a padded entry must land: which rendered line, on which file line */
export interface Pad { line: number; marker: string }

export interface Draft {
  id: string;
  ekind: 'ruling' | 'need';
  date: string | null;
  /** an explicit header tag; null means "the lowest slot tag" */
  tag: string | null;
  unwanted: boolean;
  markFirst: boolean;
  relation: { type: string; target: string } | null;
  beneficiary: string;
  weight: string;
  rawHeader: string | null;
  body: BodyLine[];
  commentsBefore: string[];
  pad: Pad | null;
}

/** header and slot line numbers of one emitted entry, for refusal assertions */
export interface Placed { id: string; header: number; marks: Map<string, number> }

const idNumber = (id: string): number => Number(id.slice(1));
const keyOfRaw = (line: string): string => {
  const s = line.trim();
  if (s.startsWith('->')) return 'res';
  if (s.startsWith('#')) return 'note';
  const kw = /^([A-Za-z]+):/u.exec(s);
  return kw && RAW_RANK[kw[1] ?? ''] !== undefined ? (kw[1] ?? 'stray') : 'stray';
};

export class DocketBuilder {
  drafts: Draft[] = [];
  versionLine: string | null = 'docket: 1';
  /** save the file with a byte-order mark and CRLF endings (D184) */
  bomCrlf = false;
  /** the whole docket, written out by the scenario itself (D194); null means "build it" */
  inline: string | null = null;
  asOf: string | null = null;
  strict = false;
  noGnt = false;
  /** corpus deliverables, for the features still in wip */
  corpus = false;
  corpusFeature: { title: string; tags: string[]; outline: boolean }[] = [];
  fenceText = '';
  ledgerText = '';
  designText = '';
  placed: Placed[] = [];
  /** the entry the scenario is talking about, for steps that say "that node" */
  subject = 'R13';

  // ── drafts ────────────────────────────────────────────────────────────────
  /** not named `find`: an iterator-method name here reads as a callback to the lint */
  draft(id: string): Draft | undefined {
    return this.drafts.find((d) => d.id === id);
  }

  ensure(id: string): Draft {
    const seen = this.draft(id);
    if (seen) return seen;
    const need = /^N\d+$/u.test(id);
    const d: Draft = {
      id,
      ekind: need ? 'need' : 'ruling',
      date: need ? NEED_DATE : RULING_DATE,
      tag: null,
      unwanted: false,
      markFirst: true,
      relation: null,
      beneficiary: 'user',
      weight: '5',
      rawHeader: null,
      body: need
        ? [this.newSlot('need')]
        : [this.newSlot('pre'), this.newSlot('trig'), this.newSlot('resp'), { t: 'raw', key: 'sib', text: SIB_LINE }, { t: 'raw', key: 'touches', text: TOUCHES_LINE }],
      commentsBefore: [],
      pad: null,
    };
    this.drafts.push(d);
    return d;
  }

  /** a second draft under an id that already exists (D28's duplicate) */
  duplicate(id: string): Draft {
    const first = this.ensure(id);
    const copy: Draft = { ...first, body: first.body.map((b) => ({ ...b })), commentsBefore: [] };
    this.drafts.push(copy);
    return copy;
  }

  ensureAny(): void {
    if (this.drafts.length === 0) this.ensure('R13');
  }

  /** an entry dated after the docket's rulings, optionally carrying a relation and one tag throughout */
  later(id: string, type: string | null, target: string | null, tag: string | null, date: string | null): Draft {
    if (target !== null) this.ensure(target);
    const d = this.ensure(id);
    d.date = date ?? LATER_DATE;
    if (type !== null && target !== null) d.relation = { type, target };
    if (tag !== null) {
      d.tag = tag;
      for (const b of d.body) if (b.t === 'slot') b.tags = [tag];
    }
    return d;
  }

  /** a following entry, so the subject is not the trailing (and therefore incomplete) one */
  notLast(id: string): void {
    const n = idNumber(id);
    if (!this.drafts.some((d) => d.ekind === 'ruling' && idNumber(d.id) > n)) this.ensure(`${id[0] ?? 'R'}${n + 1}`);
  }

  // ── body lines ────────────────────────────────────────────────────────────
  private newSlot(word: string): SlotLine {
    return { t: 'slot', word, text: SLOT_TEXT[word] ?? 'the behaviour holds', tags: [SLOT_TAG[word] ?? 'I>V'], indent: '  ', gap: `${word}:`.length >= 7 ? ' ' : ' '.repeat(7 - `${word}:`.length) };
  }

  slot(id: string, word: string): SlotLine {
    const d = this.ensure(id);
    this.subject = id;
    const seen = d.body.find((b): b is SlotLine => b.t === 'slot' && b.word === word);
    if (seen) return seen;
    const line = this.newSlot(word);
    let at = 0;
    d.body.forEach((b, i) => {
      if (b.t === 'slot' && SLOT_ORDER.indexOf(b.word) < SLOT_ORDER.indexOf(word)) at = i + 1;
    });
    d.body.splice(at, 0, line);
    return line;
  }

  /** put the slot lines in the given order, leaving every other line where it is */
  orderSlots(id: string, words: string[]): void {
    const d = this.ensure(id);
    const slots = words.map((word) => this.slot(id, word));
    let at = 0;
    d.body = d.body.map((b) => (b.t === 'slot' ? slots[at++] ?? b : b));
  }

  removeSlot(id: string, word: string): void {
    const d = this.ensure(id);
    d.body = d.body.filter((b) => !(b.t === 'slot' && b.word === word));
  }

  setRaw(id: string, key: string, text: string): void {
    const d = this.ensure(id);
    const at = d.body.findIndex((b) => b.t === 'raw' && b.key === key);
    if (at >= 0) { d.body[at] = { t: 'raw', key, text }; return; }
    const rank = RAW_RANK[key] ?? 9;
    let insert = d.body.length;
    for (let i = 0; i < d.body.length; i++) {
      const b = d.body[i];
      if (b?.t === 'raw' && (RAW_RANK[b.key] ?? 9) > rank) { insert = i; break; }
    }
    d.body.splice(insert, 0, { t: 'raw', key, text });
  }

  removeRaw(id: string, key: string): void {
    const d = this.ensure(id);
    d.body = d.body.filter((b) => !(b.t === 'raw' && b.key === key));
  }

  /** a line as the scenario wrote it, placed in canonical order under the entry */
  setLine(id: string, raw: string): void {
    const key = keyOfRaw(raw);
    if (key === 'res') { this.removeSlot(id, 'pre'); this.removeSlot(id, 'trig'); }
    this.setRaw(id, key, `  ${raw}`);
  }

  /** rebuild the body from a short spec: 'pre', 'trig', 'resp', 'sib', 'touches', 'res:<kind>' */
  setBody(id: string, spec: string[]): void {
    const d = this.ensure(id);
    d.body = [];
    for (const part of spec) {
      if (part.startsWith('res:')) this.setRaw(id, 'res', `  -> ${part.slice(4)}`);
      else if (part === 'sib') this.setRaw(id, 'sib', SIB_LINE);
      else if (part === 'touches') this.setRaw(id, 'touches', TOUCHES_LINE);
      else this.slot(id, part);
    }
  }

  // ── rendering ─────────────────────────────────────────────────────────────
  private autoTag(d: Draft): string {
    const tags = d.body
      .filter((b): b is SlotLine => b.t === 'slot')
      .map((s) => s.tags.find((t) => RANK[t as Tag] !== undefined))
      .filter((t): t is string => t !== undefined);
    if (tags.length === 0) return d.ekind === 'need' ? 'V' : 'I>V';
    return tags.reduce((a, b) => (RANK[a as Tag] <= RANK[b as Tag] ? a : b));
  }

  private header(d: Draft): string {
    if (d.rawHeader !== null) return d.rawHeader;
    const parts = [d.id];
    if (d.date !== null) parts.push(d.date);
    parts.push(`[${d.tag ?? this.autoTag(d)}]`);
    if (d.ekind === 'need') parts.push(d.beneficiary, d.weight);
    const mark = d.unwanted ? ['!'] : [];
    const rel = d.relation ? [d.relation.type, d.relation.target] : [];
    parts.push(...(d.markFirst ? [...mark, ...rel] : [...rel, ...mark]));
    return parts.join(' ');
  }

  private block(d: Draft): { lines: string[]; marks: Map<string, number> } {
    const lines = [this.header(d)];
    const marks = new Map<string, number>([['header', 0]]);
    for (const b of d.body) {
      if (b.t === 'blank') { lines.push(''); continue; }
      if (b.t === 'slot') {
        marks.set(`slot:${b.word}`, lines.length);
        lines.push(`${b.indent}${b.word}:${b.gap}${[b.text, ...b.tags.map((t) => `[${t}]`)].filter(Boolean).join(' ')}`);
        continue;
      }
      marks.set(`raw:${b.key}`, lines.length);
      lines.push(b.text);
    }
    marks.set('last', lines.length - 1);
    return { lines, marks };
  }

  private sorted(): Draft[] {
    return this.drafts
      .map((d, i) => ({ d, i }))
      .toSorted((a, b) => (a.d.ekind === b.d.ekind ? 0 : a.d.ekind === 'need' ? -1 : 1) || idNumber(a.d.id) - idNumber(b.d.id) || a.i - b.i)
      .map((x) => x.d);
  }

  /** the docket, and the line map it implies */
  text(): string {
    // D194: a scenario that wrote its docket out inline hands the whole file
    // over; the builder invents nothing under it and places nothing.
    if (this.inline !== null) { this.placed = []; return this.inline; }
    this.ensureAny();
    const lines: string[] = [];
    this.placed = [];
    if (this.versionLine !== null) lines.push(this.versionLine);
    for (const d of this.sorted()) {
      if (lines.length > 0) lines.push('');
      for (const c of d.commentsBefore) lines.push(c);
      const { lines: block, marks } = this.block(d);
      if (d.pad) {
        const target = d.pad.line - (marks.get(d.pad.marker) ?? 0);
        while (lines.length + 1 < target) lines.push('# pad');
      }
      const start = lines.length + 1;
      this.placed.push({ id: d.id, header: start, marks: new Map([...marks].map(([k, v]) => [k, start + v])) });
      lines.push(...block);
    }
    return `${lines.join('\n')}\n`;
  }

  /** the same docket as the operator saved it (D184) */
  saved(): string {
    const plain = this.text();
    return this.bomCrlf ? `\uFEFF${plain.replaceAll('\n', '\r\n')}` : plain;
  }

  /** every emitted header line for an id (a duplicate has two) */
  headerLines(id: string): number[] {
    return this.placed.filter((p) => p.id === id).map((p) => p.header);
  }

  lineOf(id: string, mark: string): number {
    return this.placed.find((p) => p.id === id)?.marks.get(mark) ?? -1;
  }
}

// ── the world gnt hands each scenario ────────────────────────────────────────
export interface World {
  defer(fn: (w: World) => void | Promise<void>): void;
  b?: DocketBuilder;
  dir?: string;
  text?: string;
  parsed?: ParseResult;
  linted?: LintResult;
  exit?: number;
  /** the findings a "the ... layer has N findings" step last named */
  found?: Finding[];
  /** the parse of the same docket saved plain, for the byte-order-mark scenario */
  plainParsed?: ParseResult;
  formatted?: string;
  /** the closed sets read out of GRAMMAR.md */
  tables?: Record<string, string[] | Record<string, string[]>>;
  node?: unknown;
}

export const builder = (w: World): DocketBuilder => (w.b ??= new DocketBuilder());

/** Write the docket (and, when a scenario asked for one, its corpus) under the scratchpad. */
export function writeDocket(w: World): string {
  const b = builder(w);
  const dir = join(SCRATCH, `docketry-${randomUUID()}`);
  mkdirSync(dir, { recursive: true });
  w.defer(() => { rmSync(dir, { recursive: true, force: true }); });
  writeFileSync(join(dir, 'DOCKET.md'), b.saved(), 'utf8');
  if (b.corpus) {
    if (b.corpusFeature.length > 0) {
      const rows = b.corpusFeature.map((s) => {
        const tags = s.tags.length > 0 ? `  ${s.tags.map((t) => `@${t}`).join(' ')}\n` : '';
        return s.outline
          ? `${tags}  Scenario Outline: ${s.title}\n    Given a thing <value>\n\n    Examples:\n      | value |\n      | one |\n      | two |\n`
          : `${tags}  Scenario: ${s.title}\n    Given a thing\n`;
      }).join('\n');
      writeFileSync(join(dir, 'archive.feature'), `Feature: archive\n\n${rows}`, 'utf8');
    }
    writeFileSync(join(dir, 'OUT-OF-SCOPE.md'), b.fenceText, 'utf8');
    writeFileSync(join(dir, 'USER-NEEDS.md'), b.ledgerText, 'utf8');
    writeFileSync(join(dir, 'DESIGN.md'), b.designText, 'utf8');
  }
  w.dir = dir;
  return dir;
}

/** Parse and lint the docket in one place: a Then step may ask about either. */
export function run(w: World): void {
  const b = builder(w);
  const text = b.saved();
  writeDocket(w);
  w.text = text;
  const opts: LintOptions = {};
  if (b.asOf !== null) opts.asOf = b.asOf;
  if (b.strict) opts.strict = true;
  if (b.noGnt) opts.loadGnt = () => null;
  if (b.corpus && w.dir !== undefined) opts.corpus = w.dir;
  w.parsed = parseDocket(text, b.asOf === null ? {} : { asOf: b.asOf });
  w.linted = lintDocket(text, opts);
  w.exit = w.linted.ok ? w.linted.report.exitCode : 2;
}

export function tree(w: World): DocketTree {
  const p = w.parsed;
  if (!p) throw new Error('the docket was never parsed');
  if (!p.ok) throw new Error(`the docket was refused: ${p.refusals.map((r) => r.message).join('; ')}`);
  return p.tree;
}

export function node(w: World, id: string): Entry {
  const e = tree(w).entries.find((x) => x.id === id);
  if (!e) throw new Error(`no node ${id} in the parse`);
  return e;
}

export function report(w: World): Report {
  const r = w.linted;
  if (!r) throw new Error('the docket was never linted');
  if (!r.ok) throw new Error(`the docket was refused: ${r.refusals.map((x) => x.message).join('; ')}`);
  return r.report;
}

export function refusals(w: World): { line: number; message: string }[] {
  const r = w.linted;
  if (!r) throw new Error('the docket was never linted');
  if (r.ok) throw new Error('the docket was not refused');
  return r.refusals;
}

export function refusalBody(w: World): string {
  return refusals(w).map((r) => `line ${r.line}: ${r.message}`).join('\n');
}

export function layerOf(w: World, layer: string): Finding[] {
  return report(w).layers.find((row) => row.layer === layer)?.findings ?? [];
}

/** the report line whose content the scenario names (D79) */
export function reportLine(w: World, match: RegExp): string {
  const line = reportText(report(w)).split('\n').find((l) => match.test(l));
  if (line === undefined) throw new Error(`no report line matching ${String(match)} in:\n${reportText(report(w))}`);
  return line;
}
