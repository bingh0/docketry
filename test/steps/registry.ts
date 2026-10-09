// One place that says which feature is bound to which step tables, so the
// suite and the check-steps script can never drift apart.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Definer, Registry } from 'gherkin-node-test/vitest';
import { bindUsed, type Table } from './bind.ts';
import { givenSteps, thenSteps, whenSteps } from './common.ts';
import { grammarSteps } from './the-docket-grammar.ts';
import { syntaxSteps } from './the-syntax.ts';
import { whoSaidItSteps } from './who-said-it.ts';
import { neverAskedSteps } from './what-was-never-asked.ts';
import { recordSteps } from './the-record-agrees-with-itself.ts';
import { landedSteps } from './where-each-ruling-landed.ts';
import { reportSteps } from './the-report-and-its-exits.ts';
import { renderSteps } from './rendering-and-formatting.ts';
import { probesSteps } from './the-probes-still-fire.ts';
import type { World } from './world.ts';

export const FEATURES = fileURLToPath(new URL('../../features', import.meta.url));

export const ALL_FEATURES: string[] = readdirSync(FEATURES)
  .filter((f) => f.endsWith('.feature'))
  .map((f) => f.replace(/\.feature$/u, ''))
  .toSorted();

/** basename → the tables its definer may draw from */
export const BOUND: Record<string, Table[]> = {
  'the-docket-grammar': [givenSteps, whenSteps, thenSteps, grammarSteps],
  'the-syntax': [givenSteps, whenSteps, thenSteps, syntaxSteps],
  'who-said-it': [givenSteps, whenSteps, thenSteps, whoSaidItSteps],
  'what-was-never-asked': [givenSteps, whenSteps, thenSteps, neverAskedSteps],
  'the-record-agrees-with-itself': [givenSteps, whenSteps, thenSteps, recordSteps],
  'where-each-ruling-landed': [givenSteps, whenSteps, thenSteps, landedSteps],
  'the-report-and-its-exits': [givenSteps, whenSteps, thenSteps, reportSteps],
  'rendering-and-formatting': [givenSteps, whenSteps, thenSteps, renderSteps],
  'the-probes-still-fire': [givenSteps, whenSteps, thenSteps, probesSteps],
};

/**
 * Features whose binding is still in progress. A builder tests its own work
 * without editing this file: DOCKETRY_BIND=a,b npx vitest run lifts those
 * names out of wip for that run. A name is removed here once its binding is
 * complete and the run is green.
 */
const STILL_WIP: string[] = [];
const lifted = new Set((process.env['DOCKETRY_BIND'] ?? '').split(',').map((x) => x.trim()).filter(Boolean));

/** every table, for reporting on the features not yet bound */
export const ALL_TABLES: Table[] = [givenSteps, whenSteps, thenSteps, grammarSteps, syntaxSteps, whoSaidItSteps, neverAskedSteps, recordSteps, landedSteps, reportSteps, renderSteps, probesSteps];

/** the debt register: whole features still bootstrapping */
export const WIP: string[] = ALL_FEATURES.filter((f) => !(f in BOUND) || (STILL_WIP.includes(f) && !lifted.has(f)));

export const featureFile = (base: string): string => join(FEATURES, `${base}.feature`);

export const definers: Record<string, Definer<World>> = Object.fromEntries(
  Object.entries(BOUND).map(([base, tables]) => [base, (reg: Registry<World>) => { bindUsed(reg, featureFile(base), tables); }]),
);
