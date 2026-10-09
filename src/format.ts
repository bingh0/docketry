import { SLOT_KEYWORDS } from './grammar.js';
import type { Entry, Slot } from './tree.js';

/** D196: text begins at the tenth column — the keyword and colon padded — or after one space when the keyword is longer. */
export const field = (keyword: string): string => { const f = `${keyword}:`; return f.length >= 7 ? `${f} ` : f.padEnd(7); };
const ARROW = '->'.padEnd(7);

const slotLine = (s: Slot): string => {
  const tags = s.tags.length > 0 ? s.tags.map((t) => `[${t}]`).join(' ') : '';
  return `  ${field(s.keyword)}${[s.text, tags].filter(Boolean).join(' ')}`.trimEnd();
};

/** The canonical text of one entry (D40, D120, D185): one space after each keyword, mark first, slots in grammar order. */
export function formatEntry(e: Entry): string {
  const head: string[] = [e.id];
  if (e.date) head.push(e.date);
  if (e.tag) head.push(`[${e.tag}]`);
  if (e.kind === 'need') { if (e.beneficiary) head.push(e.beneficiary); if (e.weight !== null) head.push(String(e.weight)); }
  if (e.unwanted) head.push('!');
  if (e.relation) head.push(e.relation.type, e.relation.target);
  const out = [head.join(' ')];
  for (const kw of SLOT_KEYWORDS) { const s = e.slots[kw]; if (s) out.push(slotLine(s)); }
  if (e.resolution) out.push(`  ${ARROW}${[e.resolution.kind, e.resolution.reference ?? e.resolution.label].filter(Boolean).join(' ')}`);
  if (e.sib) out.push(e.sib.none ? `  ${field('sib')}none${e.sib.dash ? ' --' : ''}${e.sib.reason ? ` ${e.sib.reason}` : ''}` : `  ${field('sib')}${e.sib.target ?? ''}`);
  for (const sp of e.spread) out.push(`  ${field('spread')}${sp.title}`);
  if (e.serves) out.push(`  ${field('serves')}${e.serves.ids.join(' ')}`);
  for (const t of e.tension) out.push(`  ${field('tension')}${t.target}${t.reason === null ? '' : ` -- ${t.reason}`}`);
  if (e.touches) out.push(`  ${field('touches')}${e.touches.ids.join(' ')}`);
  for (const n of e.notes) out.push(`# ${n}`);
  return out.join('\n');
}
