import { createRequire } from 'node:module';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { normalise } from './parse.js';

export interface CorpusScenario { file: string; title: string; tags: string[]; line: number; outline: boolean }
export interface FenceEntry { section: string; text: string; cites: string[]; guardedBy: string[]; line: number }
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

export function readFence(text: string): FenceEntry[] {
  const out: FenceEntry[] = [];
  let section = '';
  let cur: FenceEntry | null = null;
  const flush = (): void => {
    if (!cur) return;
    const tail = /\(([^()]*)\)\s*$/u.exec(cur.text);
    cur.cites = tail ? idsIn(tail[1] ?? '') : [];
    cur.guardedBy = [...cur.text.matchAll(/Guarded by:\s*((?:"[^"]*"[,\s]*)+)/gu)].flatMap((m) => [...(m[1] ?? '').matchAll(/"([^"]*)"/gu)].map((q) => q[1] ?? ''));
    out.push(cur); cur = null;
  };
  for (const [i, ln] of text.split('\n').entries()) {
    if (ln.startsWith('## ')) { flush(); section = ln.slice(3).trim(); continue; }
    if (ln.startsWith('- ')) { flush(); cur = { section, text: ln.slice(2), cites: [], guardedBy: [], line: i + 1 }; continue; }
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
