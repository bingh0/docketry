import { createRequire } from 'node:module';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { normalise } from './parse.js';

export interface CorpusScenario { file: string; title: string; tags: string[]; line: number; outline: boolean }
/** guardNearMiss (D236): the guard phrase appears in a spelling the one form does not read, so some quoted title was dropped */
export interface FenceEntry { section: string; text: string; cites: string[]; guardedBy: string[]; guardNearMiss: boolean; line: number }
export interface LedgerRow { id: string; text: string; cites: string[]; line: number }
export interface Deliverables {
  scenarios: CorpusScenario[] | null;
  fence: FenceEntry[] | null;
  ledger: LedgerRow[] | null;
  design: { cites: string[]; lines: { cites: string[]; line: number }[] } | null;
}

export interface GntApi { version: string; parseFeature: (text: string, file?: string) => { scenarios: { name: string; tags: string[]; line: number }[]; outlines: { name: string; line: number }[] } }

/** Load gherkin-node-test from beside this package or from where the lint runs (D41): null when absent. */
export function loadGnt(): GntApi | null {
  const tries = [createRequire(import.meta.url), createRequire(path.join(process.cwd(), 'package.json'))];
  for (const req of tries) {
    try {
      const mod = req('gherkin-node-test') as { parseFeature: GntApi['parseFeature'] };
      const pkg = req('gherkin-node-test/package.json') as { version: string };
      return { version: pkg.version, parseFeature: mod.parseFeature };
    } catch { /* next */ }
  }
  return null;
}

const idsIn = (s: string): string[] => [...s.matchAll(/\b([A-Z]\d+)\b/gu)].map((m) => m[1] ?? '');

export function readCorpus(dir: string, gnt: GntApi): CorpusScenario[] {
  const out: CorpusScenario[] = [];
  const files = readdirSync(dir).filter((f) => f.endsWith('.feature')).toSorted();
  for (const file of files) {
    const text = normalise(readFileSync(path.join(dir, file), 'utf8'));
    const parsed = gnt.parseFeature(text, file);
    // an expanded row carries its outline's line; the title may hold a placeholder, so the line is the join
    const outlinesByLine = new Map<number, { title: string; tags: Set<string> }>();
    for (const o of parsed.outlines) outlinesByLine.set(o.line, { title: o.name, tags: new Set() });
    for (const s of parsed.scenarios) {
      const o = outlinesByLine.get(s.line);
      if (o && /\[\d+\]$/u.test(s.name)) { for (const t of s.tags) o.tags.add(t); continue; }
      out.push({ file, title: s.name, tags: s.tags.map((t) => t.replace(/^@/u, '')), line: s.line, outline: false });
    }
    for (const [line, o] of outlinesByLine) out.push({ file, title: o.title, tags: [...o.tags].map((t) => t.replace(/^@/u, '')), line, outline: true });
  }
  return out;
}

/** the guard's one form: non-empty straight-quoted titles, one comma or none between, as gherkin-trace reads them too */
const FORM_RUN = '(?:"[^"]+",?\\s*)+';
/** the one form read at one position: the phrase in this case with its colon, then the run */
const ONE_FORM = new RegExp(`^Guarded by:\\s*(${FORM_RUN})`, 'u');
/** the one form wherever it stands in the entry: what the lint takes as the guardians */
const FORM_ANYWHERE = new RegExp(`Guarded by:\\s*(${FORM_RUN})`, 'gu');
/**
 * One more title as a drafter might write it, after any run of commas, semicolons, or ands: straight, double-curly,
 * backtick, single, or single-curly quotes. A single or single-curly closing quote followed by a letter or digit is an
 * apostrophe in prose ('til, owner's), never the end of a title.
 */
const ANY_TITLE = /^\s*(?:(?:,|;|and\b)\s*)*(?:"[^"]*"|\u201C[^\u201D]*\u201D|`[^`]*`|'[^']*'(?![\p{L}\p{N}])|\u2018[^\u2019]*\u2019(?![\p{L}\p{N}]))/u;

/**
 * D236: a guard claim is the phrase with its colon, or the phrase followed by a quoted title; prose that merely says
 * "guarded by" is not one, and neither is the bare phrase followed by an apostrophe word ('til), since a title and
 * not a quote character opens a claim. For each claim, the run of quoted titles right after it (loose) against the
 * titles the one form reads at that position (strict); a claim quoting none, or more than the one form reads, is a
 * near-miss. A claim consumes its run, so the phrase inside a title it named is no second claim.
 */
export function guardClaims(text: string): { loose: number; strict: number }[] {
  const out: { loose: number; strict: number }[] = [];
  const phrase = /guarded\s+by(\s*:)?/giu;
  for (let m = phrase.exec(text); m !== null; m = phrase.exec(text)) {
    const start = m.index + m[0].length;
    const rest = text.slice(start);
    if (m[1] === undefined && !ANY_TITLE.test(rest)) continue;
    let loose = 0;
    let used = 0;
    for (let cursor = rest; ; ) { const t = ANY_TITLE.exec(cursor); if (!t) break; loose += 1; used += t[0].length; cursor = cursor.slice(t[0].length); }
    const run = ONE_FORM.exec(text.slice(m.index));
    const strict = run ? [...(run[1] ?? '').matchAll(/"([^"]*)"/gu)].length : 0;
    out.push({ loose, strict });
    phrase.lastIndex = start + used;
  }
  return out;
}

export function readFence(text: string): FenceEntry[] {
  const out: FenceEntry[] = [];
  let section = '';
  let cur: FenceEntry | null = null;
  const flush = (): void => {
    if (!cur) return;
    const tail = /\(([^()]*)\)\s*$/u.exec(cur.text);
    cur.cites = tail ? idsIn(tail[1] ?? '') : [];
    cur.guardedBy = [...cur.text.matchAll(FORM_ANYWHERE)].flatMap((m) => [...(m[1] ?? '').matchAll(/"([^"]*)"/gu)].map((q) => q[1] ?? ''));
    cur.guardNearMiss = guardClaims(cur.text).some((c) => c.loose === 0 || c.loose > c.strict);
    out.push(cur); cur = null;
  };
  for (const [i, ln] of text.split('\n').entries()) {
    if (ln.startsWith('## ')) { flush(); section = ln.slice(3).trim(); continue; }
    if (ln.startsWith('- ')) { flush(); cur = { section, text: ln.slice(2), cites: [], guardedBy: [], guardNearMiss: false, line: i + 1 }; continue; }
    if (cur && /^\s+\S/u.test(ln)) { cur.text += ` ${ln.trim()}`; continue; }
    if (ln.trim() === '') flush();
  }
  flush();
  return out;
}

export function readLedger(text: string): LedgerRow[] {
  const out: LedgerRow[] = [];
  let cur: LedgerRow | null = null;
  for (const [i, ln] of text.split('\n').entries()) {
    const m = /^- (?:\*\*)?(N\d+)(?:\*\*)?\b(.*)$/u.exec(ln);
    if (m) { cur = { id: m[1] ?? '', text: m[2] ?? '', cites: [], line: i + 1 }; out.push(cur); continue; }
    if (cur && /^\s+\S/u.test(ln)) { cur.text += ` ${ln.trim()}`; continue; }
    cur = null;
  }
  for (const r of out) r.cites = idsIn(r.text).filter((id) => !/^N\d+$/u.test(id));
  return out;
}

export function readDesign(text: string): { cites: string[]; lines: { cites: string[]; line: number }[] } {
  const lines: { cites: string[]; line: number }[] = [];
  // a ruled tag may wrap across lines: read the whole text and locate each tag by its offset
  for (const m of text.matchAll(/\[ruled:([^\]]*)\]/gu)) {
    const line = text.slice(0, m.index).split('\n').length;
    lines.push({ cites: idsIn(m[1] ?? ''), line });
  }
  return { cites: [...new Set(lines.flatMap((l) => l.cites))], lines };
}

export function readDeliverables(dir: string, gnt: GntApi | null): Deliverables {
  // D184 holds for every deliverable as for the docket: byte-order mark dropped, CRLF read as LF, so a Windows checkout joins the same rows
  const rd = (name: string): string | null => (existsSync(path.join(dir, name)) ? normalise(readFileSync(path.join(dir, name), 'utf8')) : null);
  const fence = rd('OUT-OF-SCOPE.md');
  const ledger = rd('USER-NEEDS.md');
  const design = rd('DESIGN.md');
  return {
    // a directory with no feature files leaves the scenario destination dark (D22): nothing to join is not a miss
    scenarios: gnt && readdirSync(dir).some((f) => f.endsWith('.feature')) ? readCorpus(dir, gnt) : null,
    fence: fence === null ? null : readFence(fence),
    ledger: ledger === null ? null : readLedger(ledger),
    design: design === null ? null : readDesign(design),
  };
}
