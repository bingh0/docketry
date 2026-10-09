# docketry

The craft of dockets. A closed grammar for the ruling record of a
structured interview — the docket — with a first-party tree, a lint, a
formatter, and a renderer over it.

**Status: beta, 0.1.0.** A proof-of-concept release for field use,
published so a scoping interview can be linted by anyone who runs one.
Grammar version 1 and findings format 1 are what the beta parses and
emits; before 1.0 a later release may bump either major between package
minors, and when it does it ships the migration the operator runs
deliberately (D39, D59). No backward or forward compatibility is
promised beyond that. The package is scoped because npm refuses the
bare name as too close to an existing package; the bin is `docketry`
regardless. The repository holds the reviewed contract and the build
that binds it: the feature files under `features/` are the
specification, and the suite is green when the tree is committed.
[CHANGELOG.md](CHANGELOG.md) names each release by the rulings it
built.

## What it is

Every generation of software practice has stopped reading one artifact
and moved its attention a level up: from machine code to source, and
now, when an agent writes the code, from source to the specification.
Agentic BDD argues the move should go one level further. The human
ratifies the scope, the bounded statement of what the system must do
and for whom, and the agent owns the feature files and everything
beneath them. That is safe only under two conditions: intent is
ratified above, in plain behaviour, and drift is instrumented below, so
a divergence announces itself rather than waiting to be found.

docketry is the instrument for the first condition. A scoping interview
between an agent and a human visionary produces rulings: this is a
need, this is a failure case, this is out of scope, this constraint
stands. The docket is the record of those rulings, one dated entry
each, kept as the interview runs. docketry defines a small closed
grammar for that record and lints it, answering four questions
mechanically before a human reviews the contract: who supplied each
statement, which behaviour has no failure case, which quantity was
never spread into cases, and which need nothing serves. It reports
counts, never verdicts.

Where it sits in the chain: the scope skill conducts the interview and
writes the docket; gherkin-node-test and gherkin-cargo-test run the
feature files against the code; gherkin-trace watches for drift over
time; treecontext keeps the agent's working memory across sessions.
docketry checks none of those. It checks the record they all descend
from, so the needs ledger, the design document, the out-of-scope fence,
and the feature files can be shown to describe one interview.

What it does not do: it cannot make intent deterministic, only the
record of intent. Prose inside an entry is inert to the lint, so
meaning stays the interviewer's and the reviewer's job. In its first
field test, a real interview record re-transcribed into the grammar,
the structural checks reached six of the thirteen omissions a later
review had found. The seven misses were content: enumerations, second
and third failure cases, the form of an answer. Those remain the
interview's job, and the lint's job is to leave nothing else for a
reviewer to hunt.

## Where the contract lives

`features/` is the runFeatures root: the feature files, the docket of
the interview that scoped this tool (`DOCKET.md`, the grammar's first
specimen and its own acceptance test), the needs ledger, the fence, and
the design document. Counts live in the lint's own report, never here:
`npx docketry lint features/DOCKET.md --corpus features` prints the
entry count, the provenance distribution, and every ratification. Five
cold adversarial reviews and two field tests preceded the build. The
review record is private; its public residue is `specimens/`, the four
gamed dockets those reviews produced, kept as acceptance fixtures
asserted by key (D187).

## Use

    npm i -D @bingh/docketry
    npm i -D gherkin-node-test      # optional: the traceability layer reads scenario tags through it
    npx docketry lint features/DOCKET.md --corpus features          # every finding, exit 0
    npx docketry lint features/DOCKET.md --corpus features --strict # exit 1 on any finding
    npx docketry lint features/DOCKET.md --json                     # {"docket-findings":1,...}
    npx docketry parse features/DOCKET.md                           # {"docket":1,...}
    npx docketry format features/DOCKET.md [--write]                # canonical form; the only writer
    npx docketry render features/DOCKET.md --out features           # skeletons into a new directory

Run the lint every chat cycle, not only at handoff. It costs a second
and reads in one screen, which is the point: a continuous-integration
test of the record, run as often as the record changes (N9, D218).

Exit family: 0 ran, 1 strict findings, 2 could not run. Six layers — form,
provenance, resolution, coverage, consistency, traceability — the last
dark without a corpus and needing gherkin-node-test installed where the
lint runs. In-process: `parseDocket`, `lintDocket`, `formatDocket`,
`renderDocket` from `@bingh/docketry`; the grammar on one screen is
[GRAMMAR.md](GRAMMAR.md). To develop it: clone, `npm ci`, `npm run check`
(build, lint, suite).

Most dockets are written by the scope skill, not by hand: install the
`scope` plugin from the gherkin-node-test marketplace and the interview
writes `features/DOCKET.md` as it rules, running this lint as its fifth
refusal at handoff.

## Relation to the toolchain

docketry is one of the tiny tools of the agentic BDD chain — beside
gherkin-node-test and gherkin-cargo-test (the dialect runners),
gherkin-trace (the watcher), and treecontext (the journal). It depends
on none of them at runtime; traceability loads the gherkin-node-test
parser when a corpus is given. The scope skill is its first caller and
grounds against a docketry version, as it grounds against
gherkin-node-test.

## Glossary

Two vocabularies meet in this repository. The first is inherited from
the scope skill and the runner it grounds against; the second is
docketry's own. Neither is defined here. Each row says where the
definition lives, and the docket entry that ruled it where one did.

### Inherited from the scope skill and gherkin-node-test

| Term | In one line | Defined in |
|---|---|---|
| visionary | the human whose intent the interview captures; the only one who can ratify | [scope SKILL.md](https://github.com/bingh0/gherkin-node-test/blob/main/plugins/scope/skills/scope/SKILL.md) |
| interviewer | the agent that runs the interview and drafts every deliverable | scope SKILL.md |
| scope | the bounded statement of what the system must do, for whom, and what it must not; the artifact the human ratifies | scope SKILL.md; the paper's section 3 |
| contract | the feature files plus their companions, as handed to the build; the thing reviewed before code exists | scope SKILL.md, output contract |
| feature file, scenario | Gherkin, in the gherkin-node-test dialect; the agent's working representation of a behaviour | [gherkin-node-test README](https://github.com/bingh0/gherkin-node-test#supported-grammar) |
| fence | `OUT-OF-SCOPE.md`: declined, deferred, and assumed items, each citing its ruling | scope SKILL.md, the fence |
| needs ledger | `USER-NEEDS.md`: one row per need with beneficiary, weight, evidence, chosen means, and coverage | [scope needs.md](https://github.com/bingh0/gherkin-node-test/blob/main/plugins/scope/skills/scope/needs.md) |
| means versus need | the swap test: a statement that survives its mechanism being swapped is a need; one that dies with it is a means, recorded under the need it serves | scope needs.md |
| design document, `ruled` tag | `DESIGN.md`: the build agent's orienting constraints, each tagged `ruled` with the id that fixed it or `chosen` by the agent | scope SKILL.md, phase 5½ |
| elective | a technology preference the visionary volunteers at the end of the interview; a means ruling with a prose alias `E1`, `E2` | scope SKILL.md; here D117 |
| ratify | the visionary accepts a drafted statement as their own | scope SKILL.md; here D43 |
| spread | a quantity or list written into a scenario outline, one row per case, so nothing enumerated hides in prose | scope SKILL.md, phase 3; here D20 |
| cino, blind, hollow | the failure ladder: `cino` is completion in name only, green and hollow; `blind` is never written at all; each address names a lie, a tell, and a catch | [scope layers.md](https://github.com/bingh0/gherkin-node-test/blob/main/plugins/scope/skills/scope/layers.md) |
| gnt | gherkin-node-test, the dialect runner; also the pattern docketry is built like | gherkin-node-test README; here D2 |

### docketry's own

| Term | In one line | Defined in |
|---|---|---|
| docket | the interviewer's ruling record: `features/DOCKET.md`, append-only, one entry per ruling | [GRAMMAR.md](GRAMMAR.md); D1, D16 |
| entry | one ruling: a header line, slots, and a resolution or a relation; `D41` is a ruling, `N2` a need | GRAMMAR.md; D21, D169 |
| slot | `pre`, `trig`, `resp`: the precondition, trigger, and response of a ruling, each ending in a provenance tag; `why`, the origin of a quantity the interviewer supplied | GRAMMAR.md, slot keywords; D21, D225 |
| provenance tag | who supplied a slot's content: `[V]` the visionary, `[I>V]` drafted and accepted as written, `[I+V]` drafted and corrected, `[I]` inferred and unratified, `[?]` lost | GRAMMAR.md, provenance tags; D15, D119 |
| unwanted entry, `sib` | an entry marked `!` records a failure case; every wanted entry names its failure cases on a `sib` line by id, or says `none` with a reason; absence is the finding, and nothing is inferred | GRAMMAR.md; D14 |
| resolution, kind | where a ruling lands: `boundary`, `structural`, `means`, `need`, or one of three fence kinds; kind implies destination | GRAMMAR.md, resolution kinds; D64, D23 |
| relation, in effect | `amends`, `reverses`, `reaffirms`, `ratifies`, `signs`: a change is a new dated entry pointing back; effective state is walked from relations, optionally as of a date; a `[V]` signs entry marks the record as of its date read and signed | GRAMMAR.md, relations; D16, D43, D71, D223 |
| `touches` | the entries a change to this one would disturb; read in both directions by the parse, never inferred from by the lint | GRAMMAR.md; D110 |
| `serves` | the needs a ruling serves; a need nothing serves is a coverage finding | GRAMMAR.md; D108 |
| quantity, list, near-miss, unresolved | a number or a pipe-separated list is written in braces and must be spread; a bare digit run outside braces or backticks is a near-miss finding; an island carrying `TBD` or `TBR` is a quantity nobody has yet, counted and never cleared while the token stands | GRAMMAR.md; D20, D173, D220 |
| layer, dark | the six groups of checks: form, provenance, resolution, coverage, consistency, traceability; a layer with no input reports dark, never zero | GRAMMAR.md, rule words; D6, D22 |
| finding, key | one count: an entry id and slot word, a rule word, a line, and the one correct form; findings point into the docket and never hide | GRAMMAR.md; D22, D33, D195 |
| canonical form, hash | the formatter's output is the canonical text; the parse derives a SHA-256 per entry and a chain hash over the docket, never written into it | D185, D155 |
| specimen | a docket kept as an acceptance fixture under `specimens/`, asserted by key and firing rule, never by count | [specimens/README.md](specimens/README.md); D187 |

## License

MIT.
