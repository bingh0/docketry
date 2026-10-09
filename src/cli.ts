import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { formatDocket } from './formatDocket.js';
import { parseDocket } from './parse.js';
import { lintDocket, refusalText, reportMachine, reportText, LINT_VERSION } from './report.js';
import { renderDocket } from './render.js';
import { assertTreeFormat } from './formats.js';

const usage = `docketry ${LINT_VERSION}
usage:
  docketry parse  <docket>                       the tree as JSON ({"docket":1,...})
  docketry lint   <docket> [--corpus <dir>] [--strict] [--json] [--as-of YYYY-MM-DD]
  docketry format <docket> [--write]             canonical form to stdout, or in place with --write
  docketry render <docket> [--out <dir>]         skeletons to stdout, or into a new directory
exit: 0 ran, 1 strict findings, 2 could not run
run it every chat cycle, not only at handoff: a continuous-integration test of the record (D218)`;

const read = (p: string): string | null => (existsSync(p) ? readFileSync(p, 'utf8') : null);

export function main(argv: string[]): number {
  const [cmd, file, ...rest] = argv;
  const flag = (name: string): string | undefined => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : undefined; };
  const has = (name: string): boolean => rest.includes(name);
  if (!cmd || !file || !['parse', 'lint', 'format', 'render'].includes(cmd)) { process.stderr.write(`${usage}\n`); return 2; }
  const text = read(file);
  if (text === null) { process.stderr.write(`refused: file not found: ${file}\n`); return 2; }
  if (cmd === 'parse') {
    const p = parseDocket(text, flag('--as-of') === undefined ? {} : { asOf: flag('--as-of') as string });
    if (!p.ok) { process.stderr.write(refusalText(p.refusals)); return 2; }
    const tree = { docket: 1, asOf: p.tree.asOf, letter: p.tree.letter, chainHash: p.tree.chainHash, findings: p.findings, entries: p.tree.entries.map((e) => ({ ...e, raw: undefined })) };
    assertTreeFormat(tree);
    process.stdout.write(`${JSON.stringify(tree, null, 2)}\n`);
    return 0;
  }
  if (cmd === 'lint') {
    const r = lintDocket(text, { corpus: flag('--corpus'), strict: has('--strict'), asOf: flag('--as-of') });
    if (!r.ok) { process.stderr.write(refusalText(r.refusals)); return 2; }
    process.stdout.write(has('--json') ? `${JSON.stringify(reportMachine(r.report), null, 2)}\n` : reportText(r.report));
    return r.report.exitCode;
  }
  if (cmd === 'format') {
    const out = formatDocket(text);
    if (has('--write')) { writeFileSync(file, out); return 0; }
    process.stdout.write(out);
    return 0;
  }
  const p = parseDocket(text);
  if (!p.ok) { process.stderr.write(refusalText(p.refusals)); return 2; }
  const rendered = renderDocket(p.tree);
  const out = flag('--out');
  if (out === undefined) {
    process.stdout.write(`# docket-skeletons.feature\n${rendered.scenarios}\n# USER-NEEDS.md\n${rendered.ledger}\n# OUT-OF-SCOPE.md\n${rendered.fence}\n# DESIGN.md\n${rendered.design}`);
    return 0;
  }
  let dir = path.join(out, 'docketry-render');
  for (let n = 2; existsSync(dir); n++) dir = path.join(out, `docketry-render-${n}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'docket-skeletons.feature'), rendered.scenarios);
  writeFileSync(path.join(dir, 'USER-NEEDS.md'), rendered.ledger);
  writeFileSync(path.join(dir, 'OUT-OF-SCOPE.md'), rendered.fence);
  writeFileSync(path.join(dir, 'DESIGN.md'), rendered.design);
  process.stdout.write(`rendered into ${dir}\n`);
  return 0;
}
