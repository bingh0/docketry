// The declared formats, validated at the boundary and nowhere else (D51):
// the findings machine form ({"docket-findings":1}) and the tree ({"docket":1}).
// A failure here is a defect of the lint, never of the docket (D183).
import { z } from 'zod';
import { FINDINGS_FORMAT, GRAMMAR_VERSION, KINDS, LAYERS, RELATIONS, RULE_WORDS, TAGS } from './grammar.js';

const layer = z.enum(LAYERS);

export const FindingSchema = z.object({
  entry: z.string().nullable(),
  slot: z.string().nullable(),
  layer,
  rule: z.string(),
  line: z.number().int().nonnegative(),
  key: z.string(),
  message: z.string(),
  fix: z.string().nullable(),
  where: z.string().optional(),
}).refine((f) => (RULE_WORDS[f.layer] as readonly string[]).includes(f.rule), { message: 'rule word outside the closed set of its layer' });

export const FindingsFormatSchema = z.object({
  'docket-findings': z.literal(FINDINGS_FORMAT),
  instrument: z.object({ lint: z.string(), grammar: z.literal(GRAMMAR_VERSION), gnt: z.string().nullable() }),
  rules: z.record(layer, z.array(z.string())),
  layers: z.array(z.object({ layer, status: z.enum(['ran', 'dark']), reason: z.string().nullable(), count: z.number().int().nullable() })),
  findings: z.array(FindingSchema),
  counted: z.record(z.string(), z.unknown()),
  count: z.number().int().nonnegative(),
  exit: z.union([z.literal(0), z.literal(1)]),
});

export const EntrySchema = z.object({
  id: z.string().regex(/^[A-Z]\d+$/u),
  kind: z.enum(['ruling', 'need']),
  date: z.string().nullable(),
  tag: z.enum(TAGS).nullable(),
  unwanted: z.boolean(),
  relation: z.object({ type: z.enum(RELATIONS), target: z.string() }).nullable(),
  line: z.number().int().positive(),
  resolution: z.object({ kind: z.enum(KINDS), reference: z.string().nullable(), label: z.string().nullable(), line: z.number().int() }).nullable(),
  hash: z.string().regex(/^[0-9a-f]{64}$/u),
  inEffect: z.boolean(),
  effectiveFrom: z.string(),
  chainRoot: z.string(),
}).loose();

export const TreeFormatSchema = z.object({
  docket: z.literal(GRAMMAR_VERSION),
  asOf: z.string(),
  letter: z.string().nullable(),
  chainHash: z.string().regex(/^[0-9a-f]{64}$/u),
  entries: z.array(EntrySchema),
}).loose();

export function assertFindingsFormat(value: unknown): void {
  const r = FindingsFormatSchema.safeParse(value);
  if (!r.success) throw new Error(`docket-findings ${FINDINGS_FORMAT} violated by the lint itself: ${r.error.message}`);
}

export function assertTreeFormat(value: unknown): void {
  const r = TreeFormatSchema.safeParse(value);
  if (!r.success) throw new Error(`docket ${GRAMMAR_VERSION} tree format violated by the parse itself: ${r.error.message}`);
}
