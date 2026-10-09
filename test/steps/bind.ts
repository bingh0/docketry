// The unused-definition guard makes a step definition no scenario consumes a
// failing test. The step tables below are shared by several features, so a
// definer registers only the patterns the feature it serves actually uses.
import { readFileSync } from 'node:fs';
import { parseFeature } from 'gherkin-node-test';
import type { Registry } from 'gherkin-node-test/vitest';
import type { World } from './world.ts';

export type StepFn = (w: World, ...args: string[]) => void | Promise<void>;
export type Table = readonly (readonly [RegExp, StepFn])[];
type Define = Parameters<Registry<World>['define']>[1];

/** Every step text a feature can present: Background plus every (already expanded) scenario. */
export function stepTexts(file: string): string[] {
  const parsed = parseFeature(readFileSync(file, 'utf8'), file);
  const out = new Set<string>();
  for (const s of parsed.background) out.add(s.text);
  for (const sc of parsed.scenarios) for (const s of sc.steps) out.add(s.text);
  return [...out];
}

/** Register the patterns this feature consumes, and only those. */
export function bindUsed(reg: Registry<World>, file: string, tables: Table[]): void {
  const texts = stepTexts(file);
  for (const table of tables) {
    for (const [re, fn] of table) {
      if (texts.some((t) => re.test(t))) reg.define(re, fn as Define);
    }
  }
}
