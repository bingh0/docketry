import type { Layer, Relation, ResolutionKind, SlotKeyword, Tag } from './grammar.js';

export type ProseNode =
  | { type: 'text'; text: string }
  /** D220: a braced island carrying TBD (a value nobody has) or TBR (a value held with low confidence) is unresolved */
  | { type: 'quantity'; text: string; unresolved: 'TBD' | 'TBR' | null }
  | { type: 'list'; members: string[] }
  | { type: 'literal'; text: string };

export interface Slot {
  keyword: SlotKeyword;
  /** the prose with its tag removed */
  text: string;
  tag: Tag | null;
  /** every bracketed token seen on the line, for the double-tag finding */
  tags: string[];
  nodes: ProseNode[];
  /** whitespace tokens carrying a digit run outside braces and backticks (D173) */
  bare: string[];
  line: number;
}

export interface Resolution { kind: ResolutionKind; reference: string | null; label: string | null; line: number }
export interface Sib { target: string | null; none: boolean; dash: boolean; reason: string | null; line: number }
export interface Spread { title: string; line: number }
export interface Tension { target: string; reason: string | null; line: number }
export interface IdList { ids: string[]; line: number }

export interface Entry {
  id: string;
  kind: 'ruling' | 'need';
  date: string | null;
  tag: Tag | null;
  unwanted: boolean;
  relation: { type: Relation; target: string } | null;
  beneficiary: string | null;
  weight: number | null;
  line: number;
  order: number;
  slots: Partial<Record<SlotKeyword, Slot>>;
  resolution: Resolution | null;
  sib: Sib | null;
  spread: Spread[];
  serves: IdList | null;
  tension: Tension[];
  touches: IdList | null;
  notes: string[];
  /** the source lines of the entry, header first */
  raw: string[];
  // ── derived (D142, D155, D110, D112, D113, D43)
  hash: string;
  inEffect: boolean;
  reversedBy: string[];
  amendedBy: string[];
  reaffirmedBy: string[];
  ratifiedBy: string[];
  ratified: { by: string; date: string | null } | null;
  /** D223: the V-tagged signs entries whose date this entry was in effect at, latest last */
  signedBy: string[];
  signed: { by: string; date: string | null } | null;
  /** id of the entry whose shape is this entry's effective shape (D113) */
  effectiveFrom: string;
  /** root of the amendment chain this entry belongs to */
  chainRoot: string;
  touchedBy: string[];
  servedBy: string[];
  tensionWith: string[];
  incomplete: boolean;
}

export interface Refusal { line: number; message: string }

export interface Finding {
  layer: Layer;
  rule: string;
  /** "R13", "R13 resp", or a deliverable location */
  key: string;
  entry: string | null;
  slot: string | null;
  line: number;
  message: string;
  fix: string | null;
  where?: string;
}

export interface DocketTree {
  docket: 1;
  asOf: string;
  letter: string | null;
  chainHash: string;
  entries: Entry[];
}

export type ParseResult =
  | { ok: true; tree: DocketTree; findings: Finding[] }
  | { ok: false; refusals: Refusal[] };
