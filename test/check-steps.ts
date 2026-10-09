// A dev script, not a test: `node test/check-steps.ts`.
// For every feature file it lists the step texts no pattern matches and the
// step texts two patterns match — the two ways a binding goes wrong.
// A bound feature must show zero of each; a wip feature is reported against
// the whole vocabulary, so the list doubles as the next feature's worklist.
import { stepTexts, type Table } from './steps/bind.ts';
import { ALL_TABLES, ALL_FEATURES, BOUND, featureFile } from './steps/registry.ts';

const patterns = (tables: Table[]): RegExp[] => tables.flatMap((t) => t.map(([re]) => re));

let unmatched = 0;
let ambiguous = 0;

for (const base of ALL_FEATURES) {
  const bound = base in BOUND;
  const res = patterns(BOUND[base] ?? ALL_TABLES);
  const rows = stepTexts(featureFile(base)).map((text) => ({ text, hits: res.filter((re) => re.test(text)) }));
  const zero = rows.filter((r) => r.hits.length === 0);
  const many = rows.filter((r) => r.hits.length > 1);
  if (bound) { unmatched += zero.length; ambiguous += many.length; }

  console.log(`\n${base}.feature${bound ? '' : '  (wip — checked against every table)'}`);
  console.log(`  steps ${rows.length}, unmatched ${zero.length}, ambiguous ${many.length}`);
  for (const r of zero) console.log(`  [0] ${r.text}`);
  for (const r of many) console.log(`  [${r.hits.length}] ${r.text}\n${r.hits.map((re) => `        ${String(re)}`).join('\n')}`);
}

console.log(`\nbound features: unmatched ${unmatched}, ambiguous ${ambiguous}`);
process.exitCode = unmatched || ambiguous ? 1 : 0;
