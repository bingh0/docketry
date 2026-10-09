// The closed sets of docket grammar v1. Every member here is a ruling's word;
// GRAMMAR.md lists the same tables, typed from the docket, and a scenario
// (D182) holds the two equal. Nothing is inferred from prose (D14, D36).

export const GRAMMAR_VERSION = 1 as const;
export const FINDINGS_FORMAT = 1 as const;

export const TAGS = ['V', 'I>V', 'I+V', 'I', '?'] as const;
export type Tag = (typeof TAGS)[number];
/** Rank for the rewrite comparison (D146, D165, D177): lost < inferred < corrected-then-accepted < accepted-as-drafted < visionary. */
export const RANK: Record<Tag, number> = { '?': 0, I: 1, 'I>V': 2, 'I+V': 3, V: 4 };

export const SLOT_KEYWORDS = ['pre', 'trig', 'resp', 'why', 'need', 'means'] as const;
export type SlotKeyword = (typeof SLOT_KEYWORDS)[number];
export const LINE_KEYWORDS = ['sib', 'spread', 'serves', 'tension', 'touches'] as const;
export type LineKeyword = (typeof LINE_KEYWORDS)[number];
export const KEYWORDS = [...SLOT_KEYWORDS, ...LINE_KEYWORDS] as const;
export const GHERKIN_KEYWORDS = ['Given', 'When', 'Then', 'And', 'But'] as const;

export const KINDS = ['boundary', 'structural', 'means', 'need', 'fence-declined', 'fence-deferred', 'fence-assumption'] as const;
export type ResolutionKind = (typeof KINDS)[number];
export const KINDS_WITH_REFERENCE: readonly ResolutionKind[] = ['means', 'need'];
export const KINDS_WITHOUT_REFERENCE: readonly ResolutionKind[] = ['boundary', 'structural'];
export const FENCE_KINDS: readonly ResolutionKind[] = ['fence-declined', 'fence-deferred', 'fence-assumption'];
export const FENCE_SECTION: Record<string, string> = {
  'fence-declined': 'Declined',
  'fence-deferred': 'Deferred',
  'fence-assumption': 'Named assumptions',
};

export const RELATIONS = ['amends', 'reverses', 'reaffirms', 'ratifies', 'signs'] as const;
export type Relation = (typeof RELATIONS)[number];

export const LAYERS = ['form', 'provenance', 'resolution', 'coverage', 'consistency', 'traceability'] as const;
export type Layer = (typeof LAYERS)[number];

/** Rule words per layer (D183): a closed set; a word never changes within a findings-format major. */
export const RULE_WORDS = {
  form: [
    'stray-line', 'missing-tag', 'double-tag', 'duplicate-slot', 'bare-digit-run', 'undated', 'date-order',
    'touches-missing', 'touches-later', 'sib-wanted', 'sib-missing', 'sib-self', 'sib-none-dash', 'sib-none-vacuous',
    'pre-without-trigger', 'weight-range', 'reference-misplaced', 'reference-missing', 'trigger-with-resolution',
    'incomplete', 'two-letters', 'serves-not-need', 'tension-form', 'tension-vacuous', 'missing-response',
  ],
  provenance: ['inferred', 'lost'],
  resolution: ['unresolved'],
  coverage: ['no-sib', 'unspread', 'unserved-need', 'unserved-ruling', 'orphan-unwanted'],
  consistency: ['header-above-slots', 'no-touches', 'missing-need', 'rewrite', 'ratifier-not-visionary', 'signer-not-visionary'],
  traceability: [
    'uncited-trigger', 'scenario-cites-missing', 'scenario-cites-reversed', 'scenario-mis-kinded', 'scenario-cites-need',
    'untagged-scenario', 'need-not-in-ledger', 'not-in-fence', 'not-in-design', 'spread-no-outline', 'spread-untagged',
    'guard-untagged', 'ledger-uncited', 'ledger-mis-cite', 'ledger-cites-missing', 'fence-cites-missing',
    'fence-cites-reversed', 'fence-mis-kinded', 'design-cites-missing', 'design-cites-reversed',
  ],
} as const satisfies Record<Layer, readonly string[]>;
export type RuleWord = (typeof RULE_WORDS)[Layer][number];

export const ID_RE = /^([A-Z])(\d+)$/u;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/u;
