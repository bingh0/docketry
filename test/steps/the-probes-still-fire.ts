// Steps particular to features/the-probes-still-fire.feature. Shared vocabulary lives in common.ts.
// The four gamed dockets and the house docket are acceptance specimens (D187),
// asserted by key and firing ruling, never by count of the whole run. Each
// expectation names the ruling that decides it; the table below is the map from
// that ruling to the rule word its layer declares (D183).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintDocket } from '../../dist/index.js';
import type { Finding, LintOptions } from '../../dist/index.js';
import type { Table } from './bind.ts';
import { layerOf, report, reportLine, type World } from './world.ts';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const SPECIMENS = join(ROOT, 'specimens');
const HOUSE = join(ROOT, 'features');

const LAYERS = '(form|provenance|resolution|coverage|consistency|traceability)';

/** The ruling a row of specimens/README.md names, and the rule word it fires. */
const RULE_OF: Record<string, string[]> = {
  D24: ['uncited-trigger', 'scenario-cites-reversed'],
  D68: ['trigger-with-resolution'],
  D108: ['unserved-need'],
  D114: ['orphan-unwanted'],
  D147: ['date-order'],
  D148: ['unserved-ruling'],
  D151: ['spread-untagged'],
  D163: ['scenario-mis-kinded'],
  D177: ['rewrite'],
  D181: ['bare-digit-run'],
};

/** "R2, R3, and R4" → three keys; `"R1 resp"` → the one composite key, quotes and all. */
const keysOf = (list: string): string[] => [...list.matchAll(/"([^"]+)"|([A-Z]\d+)/gu)].map((m) => m[1] ?? m[2] ?? '');

/** A finding answers to its whole key (D79) or, for a bare id, to its entry. */
const keyed = (f: Finding, key: string): boolean => f.key === key;

const rulesOf = (ruling: string): string[] => {
  const rules = RULE_OF[ruling];
  assert.ok(rules !== undefined, `no rule word is mapped for ${ruling}`);
  return rules;
};

const shown = (list: Finding[]): string => list.map((f) => `${f.key} [${f.rule}]`).join(' | ');

/** Read a specimen's docket; the corpus is the directory beside it, never copied. */
function specimen(w: World, dir: string): void {
  w.dir = dir;
  w.text = readFileSync(join(dir, 'DOCKET.md'), 'utf8');
}

function lintWithCorpus(w: World, strict: boolean): void {
  const opts: LintOptions = { corpus: w.dir };
  if (strict) opts.strict = true;
  const r = lintDocket(w.text ?? '', opts);
  w.linted = r;
  w.exit = r.ok ? r.report.exitCode : 2;
}

export const probesSteps: Table = [
  [/^the specimen "([A-Z])" and its corpus$/u, (w, name) => { specimen(w, join(SPECIMENS, name)); }],
  [/^the repository's own docket and the corpus beside it$/u, (w) => { specimen(w, HOUSE); }],

  [/^the docket is linted with the corpus$/u, (w) => { lintWithCorpus(w, false); }],
  [/^the docket is linted in strict mode with the corpus$/u, (w) => { lintWithCorpus(w, true); }],

  [new RegExp(`^the ${LAYERS} layer has (\\d+) findings? keyed (.+) by the rule of (D\\d+)$`, 'u'), (w, layer, n, list, ruling) => {
    const rules = rulesOf(ruling);
    const keys = keysOf(list);
    assert.ok(keys.length > 0, `no key named in "${list}"`);
    const hits = layerOf(w, layer).filter((f) => rules.includes(f.rule) && keys.some((k) => keyed(f, k)));
    w.found = hits;
    assert.equal(hits.length, Number(n), `${layer} by ${ruling} (${rules.join(' or ')}), keyed ${keys.join(', ')}: ${shown(layerOf(w, layer))}`);
    for (const k of keys) assert.ok(hits.some((f) => keyed(f, k)), `no ${ruling} finding keyed ${k}: ${shown(hits)}`);
  }],
  [new RegExp(`^the ${LAYERS} layer has (\\d+) findings? at the scenarios "([^"]*)" and "([^"]*)" by the rule of (D\\d+)$`, 'u'), (w, layer, n, first, second, ruling) => {
    const rules = rulesOf(ruling);
    const titles = [first, second];
    const hits = layerOf(w, layer).filter((f) => rules.includes(f.rule) && titles.some((t) => (f.where ?? '').includes(`"${t}"`)));
    w.found = hits;
    assert.equal(hits.length, Number(n), `${layer} by ${ruling} at ${titles.join(' and ')}: ${shown(layerOf(w, layer))}`);
    for (const t of titles) assert.ok(hits.some((f) => (f.where ?? '').includes(`"${t}"`)), `no ${ruling} finding at "${t}"`);
  }],
  [new RegExp(`^the ${LAYERS} layer has (\\d+) findings? at the scenario "([^"]*)" citing reversed ([A-Z]\\d+)$`, 'u'), (w, layer, n, title, id) => {
    const hits = layerOf(w, layer).filter((f) => f.rule === 'scenario-cites-reversed' && (f.where ?? '').includes(`"${title}"`) && f.message.includes(id));
    w.found = hits;
    assert.equal(hits.length, Number(n), `scenario "${title}" citing reversed ${id}: ${shown(layerOf(w, layer))}`);
  }],
  [new RegExp(`^the ${LAYERS} layer has (\\d+) findings? at the design document's ruled tag citing reversed ([A-Z]\\d+)$`, 'u'), (w, layer, n, id) => {
    const hits = layerOf(w, layer).filter((f) => f.rule === 'design-cites-reversed' && (f.where ?? '') === 'DESIGN.md' && f.message.includes(id));
    w.found = hits;
    assert.equal(hits.length, Number(n), `the design document's ruled tag citing reversed ${id}: ${shown(layerOf(w, layer))}`);
  }],

  [/^the findings count is (\d+)$/u, (w, n) => {
    const all = report(w).findings;
    assert.equal(all.length, Number(n), shown(all));
  }],
  [/^the visionary-tagged relations line names ([A-Z]\d+)$/u, (w, id) => {
    const line = reportLine(w, /^visionary-tagged relations: /u);
    assert.ok(line.includes(id), line);
  }],
  [/^the de-triggered line names "([^"]*)"$/u, (w, text) => {
    const line = reportLine(w, /^de-triggered: /u);
    assert.ok(line.includes(text), line);
  }],
];
