import { normalise, parseDocket } from './parse.js';
import { formatEntry } from './format.js';

/**
 * Rewrite a docket into canonical form (D40): entries canonical, file comments
 * kept in place, one blank line between blocks, LF endings, no byte-order mark.
 * A docket the parse refuses is returned unchanged: the formatter never guesses.
 */
export function formatDocket(input: string): string {
  const text = normalise(input);
  const parsed = parseDocket(text);
  if (!parsed.ok) return text;
  const lines = text.split('\n');
  const starts = new Map<number, string>();
  for (const e of parsed.tree.entries) starts.set(e.line, formatEntry(e));
  const owned = new Set<number>();
  for (const e of parsed.tree.entries) for (let i = 0; i < e.raw.length; i++) owned.add(e.line + i);
  const blocks: string[] = [lines[0] ?? 'docket: 1'];
  for (let i = 1; i < lines.length; i++) {
    const n = i + 1;
    const canon = starts.get(n);
    if (canon !== undefined) { blocks.push(canon); continue; }
    if (owned.has(n)) continue;
    const ln = lines[i] ?? '';
    if (ln.trim() === '') continue;
    // a file comment between entries, or a stray line the parse reported: kept verbatim
    const prev = blocks.at(-1);
    if (ln.startsWith('#') && prev !== undefined && prev.startsWith('#') && !starts.has(n - 1)) blocks[blocks.length - 1] = `${prev}\n${ln}`;
    else blocks.push(ln);
  }
  return `${blocks.join('\n\n')}\n`;
}
