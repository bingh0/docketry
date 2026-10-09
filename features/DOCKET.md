docket: 1

# The docket of the /scope interview that scoped the docket lint (2026-09-04).
# First live specimen of the grammar. Transcribed from the interviewer's running
# record into the ruled shape; ids renumbered sequentially at transcription
# (suffixed working ids were a grammar violation — D15).
# Roads not taken live in OUT-OF-SCOPE.md; comments here point at them.

N0 2026-09-04 [V] visionary 5
  need:  I need the interview's hidden failures visible before the contract is reviewed — content the interviewer inferred, failure cases never asked, quantities never spread, statements that never resolved to a need or a fence [V]
  means: a simple, unambiguous slot grammar and a lint over it, built like gnt; a deterministic parse of a simple grammar is how an agent navigates squishy human intent [V]

N1 2026-09-04 [V] visionary 5
  need:  I need as much as possible defined, explained, ruled on, and planned before anything is built — measure twice, cut once [V]
  means: the docket and its lint as the measuring pass [V]

N2 2026-09-04 [I>V] consumers 4
  need:  I need enough observable information to make a judgment, at a cost low enough that someone will actually run it [V]
  means: three declared surfaces — text, parse, findings — with findings pointing into the docket by id [I>V]

N3 2026-09-04 [I>V] visionary 3
  need:  I need the gaps to point at intent still unknown, so the needs ledger and design document get built from what was never asked, not only the feature files [V]
  means: coverage findings as the question queue; the renderer emitting ledger and design skeletons from the docket [I>V]

D1 2026-09-04 [V]
  resp:  the interviewer's ruling record has a fixed slot grammar so a linter can count inferred slots, unasked failure cases, unspread quantities, and unresolved statements; counts, never verdicts [V]
  ->     need N0
  touches: none

D2 2026-09-04 [V]
  resp:  the grammar is simple, unambiguous, well-specified, built like gnt [V]
  ->     means N0
  touches: D1

D3 2026-09-04 [V] !
  trig:  the docket becomes a runner with worlds and step definitions [V]
  resp:  a linter on the binding side exists too [V]
  ->     fence-deferred binding-side-lint
  touches: D1

D4 2026-09-04 [V]
  resp:  four actors — the interviewer agent writes and reads mid-interview; the visionary reads counts at handoff, optionally; the build agent reads unsupervised; downstream consumers such as gherkin-trace, audit, and a future muster monitor read it too [V]
  ->     boundary
  touches: D1

D5 2026-09-04 [V]
  resp:  the counts feed the needs ledger and possibly the design document, not only the feature files [V]
  ->     need N3
  touches: D4

D6 2026-09-04 [I>V]
  resp:  all six layers — form, provenance, resolution, coverage, consistency, traceability — are in v1; the content layer stays judgment [I>V]
  ->     structural
  touches: D1

D7 2026-09-04 [V]
  resp:  the cadence of mid-interview runs — per question, per checkpoint, or per feature group — is decided during build [V]
  ->     fence-deferred cadence
  touches: D6

D8 2026-09-04 [I]
  resp:  the lint reads a docket file and holds no state between runs, so any cadence works [I]
  ->     structural
  touches: D7

D9 2026-09-04 [V]
  pre:   an unsupervised build is running [V]
  trig:  the build agent reads the lint output [V]
  resp:  coverage gaps become new questions to the visionary; the build may stop and seek clarification [V]
  sib:   D10
  touches: D1

D10 2026-09-04 [I>V] !
  trig:  the lint is invoked with the strict flag [I>V]
  resp:  any finding exits nonzero; default mode reports counts and exits zero; the gate is the consumer's flag, not the lint's judgment [I>V]
  touches: D9 D1
# roads not taken: consumer-always (audit posture); gate-by-default

D11 2026-09-04 [V] reaffirms D10
  resp:  two invocation times need two modes — mid-interview default reports the queue; handoff and build run strict; nothing is hidden in either mode, no relaxed mode, no per-rule severity, inherited from gnt's fence [V]
  touches: D10

D12 2026-09-04 [I>V]
  resp:  three declared surfaces from birth — the docket text; its parse as an addressable graph; findings with stable entry-and-slot keys pointing into the docket [I>V]
  ->     means N2
  touches: D4 D2
# roads not taken: text and findings only; parse and findings with the text private

D13 2026-09-04 [V]
  resp:  the parse is first-party — a declared output, not an internal; it forces a specified grammar and lets agents walk it deterministically [V]
  ->     means N0
  touches: D12 D2

D14 2026-09-04 [I>V]
  pre:   a wanted entry has a trigger [I>V]
  trig:  the lint checks coverage [I>V]
  resp:  the entry carries a sib line naming its unwanted entries; absence is the finding; no inference from touches, no text matching [I>V]
  sib:   none -- absence of the sib line is itself the failure case this entry defines
  touches: D6 D2
# roads not taken: trigger keys; inference from touches (masked 2 of 13 in the field test)

D15 2026-09-04 [I>V]
  trig:  a line is parsed [I>V]
  resp:  provenance is exactly one of four tags, one per slot; resolution is a typed kind from a fixed set plus an optional reference; ids match one pattern and an amendment is a new entry; touches names entries only; anything else is a form finding naming the line [I>V]
  sib:   D28
  touches: D2 D13 D14
# roads not taken: closed tags with free resolution; open grammar with a normalizer

D16 2026-09-04 [I>V]
  trig:  an entry is ratified, reaffirmed, or reversed [I>V]
  resp:  every entry carries its ratification date in ISO form; the docket is append-only; a reaffirmation or reversal is a new dated entry with a typed relation to the old; effective state is derived by walking relations, never from a date in prose [I>V]
  sib:   none -- an entry with no date is the failure case and is a form finding under D28
  touches: D15 D12
# roads not taken: update in place; undated with journal time

D17 2026-09-04 [I>V]
  trig:  a need is sketched [I>V]
  resp:  it is an N entry in the same docket — statement, beneficiary, weight, provenance — under the same closed grammar; a ruling's resolution to an N id is a verifiable reference; the handoff ledger is derived from N entries [I>V]
  sib:   none -- a need outside the docket is the road not taken, not a failure of this entry
  touches: D15 D12 D6
# roads not taken: outside by id; a separate needs grammar and lint

D18 2026-09-04 [I>V]
  resp:  slot keywords are the docket's own, never Given, When, or Then; a docket cannot be mistaken for a feature file by any parser or reader [I>V]
  ->     structural
  touches: D15 D2
# road not taken: Gherkin keywords inside entries

D19 2026-09-04 [I>V]
  trig:  a slot's prose contains a number and the entry has no spread line [I>V]
  resp:  a finding by regex over prose, admitted as a floor [I>V]
  sib:   none -- reversed by D20 before any build
  touches: D15 D6

D20 2026-09-04 [I>V] reverses D19
  trig:  a slot's prose contains a quantity [I>V]
  resp:  the quantity is written as a braced island and the parse holds it as a quantity node; a quantity node no spread references is an exact finding; a bare digit run outside braces is a lexical near-miss finding; numbers written as words stay invisible by rule [I>V]
  sib:   none -- the bare digit run is the failure case and is named in this entry
  touches: D19 D13 D15
# roads not taken: declaration-only spread line; both mechanisms; drop the check

D21 2026-09-04 [I>V]
  resp:  the entry shape as rendered is the grammar — header with id, date, provenance, optional unwanted mark, optional relation; slots pre, trig, resp each with one tag; sib; a typed resolution; touches; N entries with beneficiary and weight, a need slot, an optional means slot; braced quantities [I>V]
  ->     structural
  touches: D14 D15 D16 D17 D18 D20

D22 2026-09-04 [I>V]
  trig:  the lint runs over a docket [I>V]
  resp:  a per-layer table of findings each keyed by entry and slot with rule and line; a layer with no input is reported dark, never zero; a findings count; a machine form declaring its format and carrying entry, slot, layer, rule, line [I>V]
  sib:   D26
  touches: D10 D12 D6

D23 2026-09-04 [I>V]
  trig:  a scenario is drafted from a docket entry [I>V]
  resp:  the scenario carries the entry id as a tag so either parse joins scenario to ruling by id [I>V]
  sib:   none -- a scenario without the tag is the traceability finding D24 defines
  touches: D12 D13 D6
# roads not taken: a full-line comment; the docket naming scenario titles

D24 2026-09-04 [I>V]
  pre:   the lint is given the docket and the deliverables [I>V]
  trig:  the traceability layer runs [I>V]
  resp:  every entry must land where its kind implies — triggered entries in scenarios by tag, needs in the ledger, fence kinds in the fence, structural and means in the design doc's ruled tags; findings for an entry in effect with no destination, a scenario citing a reversed entry, a dangling or mis-kinded citation, a spread naming a missing outline, a guarded-by scenario lacking the guarding tag; what was not counted is listed with why [I>V]
  sib:   D35
  touches: D23 D17 D16 D6
# roads not taken: scenarios only; scenarios and the design doc

D25 2026-09-04 [I>V]
  trig:  a docket is parsed through the exported parse function [I>V]
  resp:  a tree declaring its format; one node per entry with kind, date, provenance, unwanted mark, source line, slots each with text, provenance, and quantity nodes, touches and sib as id lists, a typed resolution, typed relations, and in-effect derived by walking relations [I>V]
  sib:   D28
  touches: D13 D12 D16 D20 D21

D26 2026-09-04 [I>V] ! amends D22
  pre:   the docket has zero entries, only comments, or the file is missing [I>V]
  trig:  the lint runs in either mode [I>V]
  resp:  it names the cause and exits two; the exit family is zero ran, one strict findings, two could not run [I>V]
  touches: D22 D10
# roads not taken: zero entries as clean; empty as a form finding

D27 2026-09-04 [I>V]
  pre:   the docket has one entry, or thousands [I>V]
  trig:  the lint runs [I>V]
  resp:  the same behaviour; no cap, no warning, no sampling; findings listed in full; roll-up is caller-side [I>V]
  sib:   D26
  touches: D26 D22
# roads not taken: roll-up past a threshold; a size warning

D28 2026-09-04 [I>V] !
  trig:  the parser meets a defect [I>V]
  resp:  tree-breaking defects refuse the docket with exit two — a duplicate id, an unmatched header, a relation to a missing id, a relation cycle, a resolution kind outside the set, a slot keyword outside the set; entry-level defects parse with a form finding at the line — a stray line in an entry, a missing, double, or unknown provenance tag, a bare digit run, an undated entry, touches to a missing or later id, a sib line naming a wanted entry or the entry itself, a weight outside one to five [I>V]
  touches: D15 D16 D20 D26
# roads not taken: refuse on any defect; never refuse

D29 2026-09-04 [I>V]
  trig:  the lint runs twice in a row, or with a corpus path that does not exist [I>V]
  resp:  the lint is read-only toward the docket and every deliverable; it keeps no state between runs, so identical inputs report identically at any cadence; a given-but-missing path exits two, never a silent dark layer [I>V]
  sib:   none -- writing or remembering would be the failure, and both are declined on the fence
  touches: D8 D7 D22 D26
# roads not taken: a last-run record; normalizing in place

D30 2026-09-04 [V] ratifies D8
  resp:  the stateless consequence stands as stated [V]
  touches: D8 D29

D31 2026-09-04 [I>V]
  resp:  the docket lives beside the fence, ledger, and design doc as a fifth surface the runner ignores; the scope validation script runs the docket lint strict with the corpus as a fifth refusal; ledger and fence stay checked as files though derived [I>V]
  ->     structural
  touches: D17 D24 D26
# roads not taken: script unchanged; residence beside the run record

D32 2026-09-04 [I]
  resp:  a visionary provenance tag is the interviewer's claim about the visionary, corroborable only against the journal [I]
  ->     fence-assumption provenance-uncorroborated
  touches: D15 D24

D33 2026-09-04 [I>V] !
  trig:  the interviewer writes a malformed entry [I>V]
  resp:  the form finding names the line, what was found, and the one correct form; the grammar reference fits one screen [I>V]
  touches: D28 D15
# roads not taken: a scaffold command; terse findings

D34 2026-09-04 [I>V] !
  pre:   a session ended mid-entry [I>V]
  trig:  the docket is parsed [I>V]
  resp:  the trailing incomplete entry is kept as a node marked incomplete; the form finding says incomplete entry, resume here; the resuming interviewer finishes it before adding another [I>V]
  touches: D28 D29
# roads not taken: treat as stray lines; atomic by convention

D35 2026-09-04 [I>V] !
  pre:   the gnt parser is unavailable where the lint runs [I>V]
  trig:  the lint runs [I>V]
  resp:  form, provenance, resolution, coverage, and consistency run on the docket alone; with no corpus given traceability is dark; with a corpus given the run exits two naming the missing parser [I>V]
  touches: D22 D26
# roads not taken: the whole lint refuses without gnt; the row declined

D36 2026-09-04 [I>V]
  resp:  the lint reads no meaning from slot text, so text addressed to a reader cannot steer it; the steering hazard belongs to prose-reading consumers [I>V]
  ->     structural
  touches: D32 D29 D20
# roads not taken: flagging directive text; journal corroboration in v1

D37 2026-09-04 [I>V] !
  pre:   a docket declares a format version on its first line [I>V]
  trig:  the lint meets a version it does not know [I>V]
  resp:  a could-not-run refusal naming both versions; within a major version changes are additive so older dockets parse; a breaking change bumps the major and ships a documented migration the operator runs deliberately; no silent upgrades [I>V]
  touches: D26 D25 D16
# roads not taken: a parser per past version; an unversioned never-breaks promise

D38 2026-09-04 [V] amends D22
  trig:  any report is rendered [V]
  resp:  an instrument line names the lint version, the docket grammar version parsed, and the gnt parser version when traceability ran [V]
  sib:   none -- a report without the line is a drafting defect the corpus asserts against directly
  touches: D22 D37 D35

D39 2026-09-04 [I>V]
  trig:  a new check or a new family grammar arrives [I>V]
  resp:  a check enters only through gnt's four lint-admission tests with a field specimen, additively; family members join through stable ids as citations and declared formats on every surface; nothing else is promised to future grammars now [I>V]
  sib:   none -- a check entering without admission is the fence's road not taken, never a runtime case
  touches: D37 D12 D23 D20
# roads not taken: a layer-plugin interface; checks by ruling only

D40 2026-09-04 [V]
  trig:  the formatter is invoked on a docket [V]
  resp:  the docket is rewritten in canonical spacing and ordering; only this command writes, only when invoked; the lint never does [V]
  sib:   none -- the formatter has no failure case beyond a docket it cannot parse, which D28 already refuses
  touches: D29 D15

D41 2026-09-04 [I>V]
  resp:  the docket tool is its own package; parse, five lint layers, format, and render run with nothing else installed; traceability loads the gnt parser when present; coupling is by stable ids, declared formats, lint-admission tests, and message doctrine, never by import [I>V]
  ->     structural
  touches: D31 D35 D39 D12
# roads not taken: shipped inside gnt; re-exported by gnt

D42 2026-09-04 [I>V]
  trig:  the tool is invoked as a library or as render [I>V]
  resp:  four exported functions — parse, lint, format, render — with a thin CLI over them; render emits skeletons for all four deliverables by kind to a new path or standard output, never overwriting [I>V]
  sib:   none -- overwriting is the failure case and is named as never happening in this entry
  touches: D41 D24 D23 D17 D18
# roads not taken: renderer deferred; renderer for scenarios only

D43 2026-09-04 [I>V] amends D16
  trig:  the visionary says yes to an entry that entered as interviewer-inferred [I>V]
  resp:  a new dated entry carrying ratifies and the target id, with the visionary's provenance; the parse marks the target ratified from that date; the provenance finding stops; the relation set is amends, reverses, reaffirms, ratifies [I>V]
  sib:   none -- a ratifies entry naming a target that was never inferred is a consistency case not yet ruled, held at handoff
  touches: D16 D29 D8 D15
# roads not taken: an in-place tag flip; re-entry with amends

D44 2026-09-04 [I>V] amends D22
  trig:  any report is rendered [I>V]
  resp:  a provenance distribution line counts slots per tag beside the findings table; no threshold, never a finding [I>V]
  sib:   none -- the line is observability, and its absence is a drafting defect the corpus asserts against directly
  touches: D22 D15
# roads not taken: a threshold finding; no distribution

D45 2026-09-04 [I>V] amends D14
  pre:   a wanted entry has a trigger and no failure case worth a scenario [I>V]
  trig:  the interviewer records it [I>V]
  resp:  sib none with a reason after a double dash; the lint counts these in a no-sibling-by-reason line; a reason stating nothing checkable is a form finding; the fence is no longer the home for this claim [I>V]
  sib:   none -- the vacuous reason is the failure case and is named in this entry
  touches: D14 D22 D28
# roads not taken: fence citation only; fence with per-slug counts

D46 2026-09-04 [I>V] amends D28
  pre:   an unwanted entry has failure cases of its own [I>V]
  trig:  the interviewer records them [I>V]
  resp:  a sib line is allowed on unwanted entries and optional; the coverage check forces the first level only [I>V]
  sib:   none -- omission at the second level is permitted by this ruling, so it is not a failure
  touches: D28 D14 D45
# roads not taken: required at every level; one level only

D47 2026-09-04 [I>V] amends D25
  trig:  the parse function is called with an as-of date [I>V]
  resp:  in-effect is computed against that date by walking the dated relations; the default is today; a pure function of the docket [I>V]
  sib:   none -- a date before every entry yields nothing in effect, which is a correct answer, not a failure
  touches: D25 D16 D43 D29
# roads not taken: consumers walk relations themselves; deferred

D48 2026-09-04 [V] ratifies D32
  resp:  the fence, including the provenance assumption, stands as read [V]
  touches: D32

D49 2026-09-04 [V]
  resp:  elective E1 — TypeScript; the typed tree is the deterministic surface; the package publishes JavaScript plus declaration files [V]
  ->     means N0
  touches: D13 D41

D50 2026-09-04 [V]
  resp:  elective E2 — vitest, coherent with gnt's one shipped runner binding; the corpus binds through gnt under vitest [V]
  ->     means N1
  touches: D41

D51 2026-09-04 [V]
  resp:  elective E3 — zod at the declared-format boundary only, the sole runtime dependency [V]
  ->     means N2
  touches: D37 D25 D41

D52 2026-09-04 [V]
  resp:  elective E4 — oxlint with correctness, suspicious, and pedantic as deny, restriction as warn promoted never demoted; the type-aware backend checked at build [V]
  ->     means N1
  touches: D41

D53 2026-09-04 [V]
  resp:  elective E5 — latest versions at pinning then pinned exactly, bumped deliberately; the node engine floor matches gnt's [V]
  ->     means N1
  touches: D41
# road not taken: vite — a library and a CLI need a compiler, not a bundler

# Added at drafting by the interviewer (post-draft pass); interviewer-inferred until ratified at review.

D54 2026-09-04 [I]
  resp:  the package name is the visionary's to settle; open at handoff [I]
  ->     fence-deferred package-name
  touches: D41

D55 2026-09-04 [I]
  resp:  the resolution set carries a road-not-taken kind, but this first docket records rejected options as comments and in the fence; whether every rejected option becomes its own entry reopens on the first re-litigated ruling a docket-reading agent could have prevented [I]
  ->     fence-deferred rejected-options-as-entries
  touches: D15 D21

D56 2026-09-04 [I]
  resp:  a ratifies entry whose target was never tagged inferred is a consistency case not yet ruled [I]
  ->     fence-deferred ratifying-the-never-inferred
  touches: D43

# Review rulings (interactive gate, 2026-09-05), in ratification order.

D57 2026-09-05 [I>V] amends D21
  resp:  an entry carrying a relation — amends, reverses, reaffirms, ratifies — needs no resolution line; the relation is its resolution; D11, D30, D48 drop their placeholder structural lines [I>V]
  touches: D21 D43 D11 D30 D48
# roads not taken: a resolution kind named relation; keep structural placeholders (traceability noise into DESIGN.md)

D58 2026-09-05 [I>V] amends D9
  resp:  the build agent's use of the lint is another actor's behaviour; D9 keeps its text and provenance, loses its trigger and sib line, and lands nowhere by kind [I>V]
  ->     boundary
  touches: D9 D24

D59 2026-09-05 [I>V] amends D39
  resp:  admission of checks is a process, not a runtime behaviour; D39 keeps its text and provenance, loses its trigger and sib line, and lands in DESIGN.md [I>V]
  ->     structural
  touches: D39 D24
# roads not taken: keep them triggered and accept permanent findings; a new resolution kind named external

D60 2026-09-05 [V] ratifies D54
  resp:  the package name stays the visionary's, open at handoff [V]
  touches: D54

D61 2026-09-05 [V] ratifies D55
  resp:  rejected options stay as comments in the docket and entries in the fence for this first docket; the reopening condition stands [V]
  touches: D55

D62 2026-09-05 [V] ratifies D56
  resp:  a ratifies entry whose target was never inferred stays a held consistency case [V]
  touches: D56 D43

D63 2026-09-05 [I>V] amends D55
  resp:  the resolution set carries no road-not-taken kind until this deferral reopens; rejected options remain comments in the docket and entries in the fence's roads-not-taken list; re-admitting the kind is a dated amendment to D15 [I>V]
  ->     fence-deferred rejected-options-as-entries
  touches: D55 D15 D24
# roads not taken: keep the kind and rule its destination as the fence's roads-not-taken list; every rejected option as its own entry now

D64 2026-09-05 [I>V] amends D15
  resp:  the fixed resolution set is seven kinds — boundary, structural, means, need, fence-declined, fence-deferred, fence-assumption; need and the fence kinds carry a reference, the other three carry none; a kind outside the seven refuses the docket [I>V]
  ->     structural
  touches: D15 D28 D24 D63

# Pre-build ruling pass (2026-09-05, after the cold adversarial review), in ratification order.

D65 2026-09-05 [I>V]
  resp:  an amends entry restates its target in full — slots, sib, spread, and resolution — and that restatement is the target's effective shape for every layer; the target stays in effect, marked amended, and a chain of amendments resolves to the last amender; the parse carries the effective shape on the amended node [I>V]
  ->     structural
  touches: D16 D25 D43 D57 D58 D59
# roads not taken: amends as annotation only, with D58 and D59 re-expressed as reversals plus fresh entries; a delta grammar naming what an amendment drops or replaces

D66 2026-09-05 [I>V] amends D20
  trig:  a slot's prose contains a quantity [I>V]
  resp:  the quantity is written as a braced island and the parse holds it as a quantity node; a quantity node no spread references is an exact finding; a bare digit run outside braces is a lexical near-miss finding; a digit run glued to a letter prefix — D11, R7, v1, E3, N4 — is a token, never a quantity, and never a near-miss; numbers written as words stay invisible by rule [I>V]
  sib:   none -- the bare digit run is the failure case and is named in this entry
  touches: D20 D19 D13 D15
# roads not taken: ids in prose as braced reference nodes; keep the rule and let the house docket refuse itself under D31

D67 2026-09-05 [I>V] amends D64
  resp:  the fixed resolution set is seven kinds — boundary, structural, means, need, fence-declined, fence-deferred, fence-assumption; need, means, and the fence kinds carry a reference, boundary and structural carry none; a reference where the kind admits none, or none where the kind requires one, is a form finding; a kind outside the seven refuses the docket [I>V]
  ->     structural
  touches: D64 D15 D28 D24
# roads not taken: means carries none and the ledger's means-to-need join finds another mechanism

D68 2026-09-05 [I>V] amends D24
  pre:   the lint is given the docket and the deliverables [I>V]
  trig:  the traceability layer runs [I>V]
  resp:  every entry must land where its effective shape implies — triggered entries in scenarios by tag, needs in the ledger, fence kinds in the fence, structural and means in the design doc's ruled tags; an entry carrying a resolution is not counted as triggered by coverage or traceability, and only fence kinds may carry a trigger, which is the reopening or failure condition; a trigger beside structural, means, boundary, or need is a form finding; findings for an entry whose kind implies a destination that is absent, a scenario citing a reversed entry, a dangling or mis-kinded citation, a spread naming a missing outline, a guarded-by scenario lacking the guarding tag; what was not counted is listed with why [I>V]
  sib:   D35
  touches: D24 D14 D23 D3 D65
# roads not taken: resolution wins with no guard on which kinds may carry a trigger; both destinations checked; trigger plus resolution as a form finding forcing a split

D69 2026-09-05 [I>V] amends D45
  pre:   a wanted entry has a trigger and no failure case worth a scenario [I>V]
  trig:  the interviewer records it [I>V]
  resp:  sib none with a reason after a double dash; the lint counts these in a no-sibling-by-reason line; a reason of fewer than three words is a form finding, and that word floor is the whole test — the lint reads no meaning from the reason; the fence is no longer the home for this claim [I>V]
  sib:   none -- the short reason is the failure case and is named in this entry
  touches: D45 D36 D14 D28
# roads not taken: only an empty reason is vacuous; the reason must cite an id or a quoted scenario title

D70 2026-09-05 [I>V]
  resp:  a line beginning with a hash inside an entry attaches to that node as a note; the parse keeps notes and the lint reads nothing from them; a hash line between entries is a file comment and is dropped; a hash line is never a stray line [I>V]
  ->     structural
  touches: D28 D25 D61 D36
# roads not taken: comments legal only between entries; a road line re-admitted, reversing D63

D71 2026-09-05 [I>V] amends D47
  trig:  the parse function is called, with or without an as-of date [I>V]
  resp:  a relation must name an earlier entry in file order, and one naming a later entry refuses the docket as a relation to a missing id does, so a cycle cannot occur; an entry is in effect as of a date when it is dated on or before that date and no in-effect entry reverses it, so reversing a reversal restores the original; reaffirms and ratifies change nothing about effect; same-date relations resolve by file order; the default as-of date is the latest entry date in the docket, never the clock, so the parse is a pure function of the docket [I>V]
  sib:   none -- a date before every entry yields nothing in effect, which is a correct answer, not a failure
  touches: D47 D16 D25 D28 D43 D65
# roads not taken: as-of defaulting to the clock; forward relations with a cycle refusal and terminal reversal

D72 2026-09-05 [I>V] amends D43
  trig:  the visionary says yes to an entry that entered as interviewer-inferred, or to one whose provenance was lost [I>V]
  resp:  a new dated entry carrying ratifies and the target id, with the visionary's provenance in its header; the parse marks the target ratified from that date; only a ratifies entry tagged V silences the provenance finding on its target; a ratifies entry with any other tag is a consistency finding and silences nothing; any target tag may be ratified; the relation set is amends, reverses, reaffirms, ratifies [I>V]
  sib:   none -- the non-visionary ratification is the failure case and is named in this entry
  touches: D43 D16 D15 D32 D65
# roads not taken: any ratifies entry silences; provenance-lost slots ratifiable only by amendment

D73 2026-09-05 [I>V] amends D21
  resp:  the entry shape as rendered is the grammar — header with id, date, provenance, optional unwanted mark, optional relation, the mark and the relation accepted in either order and emitted mark-first by the formatter; slots pre, trig, resp each with one tag; sib; spread; a typed resolution introduced by the arrow; touches; hash notes; N entries with beneficiary and weight, a need slot, an optional means slot; braced quantities; the header tag is the entry's summary and equals its lowest slot tag on the rank lost, inferred, ratified, visionary, so a header above its lowest slot is a consistency finding; the distribution line counts slots only [I>V]
  ->     structural
  touches: D21 D14 D15 D16 D17 D18 D20 D44 D70
# roads not taken: a strict header order under an append-only record; a free, uncounted header tag; dropping the header tag from rulings

D74 2026-09-05 [I>V]
  resp:  a slot tagged inferred or lost is a provenance finding until a visionary ratification lands; an entry with no trigger and no relation must carry a resolution, and its absence is a resolution finding; a precondition without a trigger is a form finding whose fix says add the trigger or drop the precondition, except on the trailing incomplete entry [I>V]
  ->     structural
  touches: D15 D21 D28 D34 D43 D72
# roads not taken: a pre-only entry treated as triggered; treated as untriggered

D75 2026-09-05 [I>V] amends D42
  trig:  the tool is invoked as a library or as render [I>V]
  resp:  four exported functions — parse, lint, format, render — with a thin CLI over them; render emits skeletons for all four deliverables by kind to a new path or standard output, never overwriting; a skeleton scenario's title is the entry's trigger text, with the id appended only when that title already exists in the file; a skeleton outline carries two rows of placeholder values so it parses under the dialect [I>V]
  sib:   none -- overwriting is the failure case and is named as never happening in this entry
  touches: D42 D41 D24 D23 D17 D18 D31
# roads not taken: the entry id as the title; zero rows with validation relaxed for rendered files

D76 2026-09-05 [I>V] amends D67
  resp:  the fixed resolution set is seven kinds — boundary, structural, means, need, fence-declined, fence-deferred, fence-assumption; need and means require a need reference; boundary and structural admit none; the fence kinds admit an optional label the lint ignores, since the fence is joined by id; a missing or misplaced reference is a form finding; a kind outside the seven refuses the docket [I>V]
  ->     structural
  touches: D67 D64 D15 D28
# roads not taken: a required fence slug that must also match the bold title; forward joins only

D77 2026-09-05 [I>V]
  resp:  a ruling id is one uppercase letter other than N followed by digits, one letter per docket, and N followed by digits is a need; the id is the only join key — the scenario tag, the fence entry's trailing parenthetical, the ledger row's bold N id, and the design doc's ruled tag, whose grammar is now ruled; one ruling may land in several fence entries; ids outside the docket's patterns, such as an elective, are listed as not counted; in the reverse direction a scenario with no ruling tag, a fence entry, ledger row, or ruled tag citing an id that is missing or reversed, a fence entry citing an entry whose effective kind is not a fence kind, and a ledger row citing a ruling are traceability findings; a ruled tag may cite any entry in effect [I>V]
  ->     structural
  touches: D23 D24 D68 D17 D42 D75 D76
# roads not taken: explicit key fields added to the fence and ledger; the id pattern alone with the other joins left to the build

D78 2026-09-05 [I>V] ! amends D28
  trig:  the parser meets a defect [I>V]
  resp:  a line at slot indent whose first token is a single word followed by a colon is a keyword line, and any other indented line is a stray line; tree-breaking defects refuse the docket with exit two — a duplicate id, an unmatched header, a relation to a missing or later id, a bad version line, and a keyword, provenance tag, resolution kind, or relation outside its closed set; entry-level defects parse with a form finding at the line — a stray line, a missing or double provenance tag, a bare digit run, an undated entry, touches to a missing or later id, a sib line naming a wanted entry, a missing id, or the entry itself, a precondition without a trigger, a weight outside one to five, a missing or misplaced reference; the trailing entry is incomplete when it lacks any of response, touches, or resolution-or-relation, and only the incomplete finding fires on it [I>V]
  touches: D28 D15 D16 D18 D20 D26 D34 D66 D74 D76
# roads not taken: unknown members as findings never refusals; severity left per scenario as drafted

D79 2026-09-05 [I>V] amends D22
  trig:  the lint runs over a docket [I>V]
  resp:  a per-layer table of findings each keyed by the entry id, a space, and the slot word when one applies, with rule and line; a layer with no input is reported dark, never zero; a findings count; a machine form declaring its format and carrying entry, slot, layer, rule, line; report lines are specified by content, and only the declared machine formats are exact [I>V]
  sib:   D26
  touches: D22 D10 D12 D6 D33 D38 D44
# roads not taken: a dotted key with every quoted report string frozen as contract

D80 2026-09-05 [I>V] amends D23
  trig:  a scenario is drafted from a docket entry [I>V]
  resp:  the scenario carries the entry id as a tag so either parse joins scenario to ruling by id; a failure-case scenario carries the tag of an entry marked unwanted, and a wanted entry's tag covers only wanted behaviour; the effective shape of an amended entry includes its unwanted mark [I>V]
  sib:   none -- a scenario without the tag is the traceability finding D77 defines
  touches: D23 D12 D13 D6 D65 D77
# roads not taken: a wanted entry's tag covering its failure scenarios

D81 2026-09-05 [I>V] !
  pre:   a corpus path is given [I>V]
  trig:  the path does not exist [I>V]
  resp:  the run exits two naming the path; no layer is silently dark [I>V]
  touches: D29 D26 D35

D82 2026-09-05 [I>V] !
  trig:  render is pointed at a path that already exists [I>V]
  resp:  nothing is overwritten; the skeletons go under a new path the output names [I>V]
  touches: D75 D42 D29

D83 2026-09-05 [I>V] amends D29
  trig:  the lint runs twice in a row, or with a corpus path that does not exist [I>V]
  resp:  the lint is read-only toward the docket and every deliverable; it keeps no state between runs, so identical inputs report identically at any cadence; a given-but-missing path exits two, never a silent dark layer [I>V]
  sib:   D81
  touches: D29 D8 D7 D22 D26 D81

D84 2026-09-05 [I>V] amends D75
  trig:  the tool is invoked as a library or as render [I>V]
  resp:  four exported functions — parse, lint, format, render — with a thin CLI over them; render emits skeletons for all four deliverables by kind to a new path or standard output, never overwriting; a skeleton scenario's title is the entry's trigger text, with the id appended only when that title already exists in the file; a skeleton outline carries two rows of placeholder values so it parses under the dialect [I>V]
  sib:   D82
  touches: D75 D42 D82

D85 2026-09-05 [I>V] amends D10
  trig:  the lint is invoked with the strict flag [I>V]
  resp:  any finding exits nonzero; default mode reports counts and exits zero; the gate is the consumer's flag, not the lint's judgment; the strict flag is a mode, a wanted behaviour, not a failure case of any entry [I>V]
  sib:   none -- findings present and findings absent are both wanted outcomes of the flag, each with its scenario
  touches: D10 D9 D1 D80

# Fence entries found citing no ruling or the wrong one (cold review F21); interviewer-inferred until ratified.

D86 2026-09-05 [I]
  resp:  checking a visionary tag against the installation's journal is deferred; reopens when a journal-reading consumer exists [I]
  ->     fence-deferred
  touches: D32 D36

D87 2026-09-05 [I]
  resp:  the field-test catch rate rests on one retrospective run of the audit interview; the first live run is the second data point [I]
  ->     fence-assumption
  touches: D1 D14

D88 2026-09-05 [I>V] amends D77
  resp:  a ruling id is one uppercase letter other than N followed by digits, one letter per docket, and N followed by digits is a need; the id is the only join key — the scenario tag, the fence entry's trailing parenthetical, the ledger row's bold N id, and the design doc's ruled tag, whose grammar is ruled; one ruling may land in several fence entries; ids outside the docket's own patterns, such as an elective, are listed as not counted; the Declined, Deferred, and Named-assumption sections are kind-strict — each entry cites at least one entry whose effective kind is that section's fence kind — while Roads-not-taken and Out-of-reach entries cite any entry in effect; a parenthetical may also cite the relation entries on its target, and a reversed entry beside its reverser; a citation of any entry in an amendment chain joins the whole chain; in the reverse direction a scenario with no ruling tag, any citation of a missing id, a citation of a reversed id without its reverser, a kind-strict section entry citing no entry of its kind, and a ledger row citing a ruling are traceability findings [I>V]
  ->     structural
  touches: D77 D65 D68 D80 D23 D24
# roads not taken: existence-only for every section; kind-strict for deferrals and assumptions but not declines

D89 2026-09-05 [V] ratifies D86
  resp:  the journal-corroboration deferral stands as written [V]
  touches: D86

D90 2026-09-05 [V] ratifies D87
  resp:  the one-run catch-rate assumption stands as written [V]
  touches: D87

D91 2026-09-05 [I>V] amends D66
  trig:  a slot's prose contains a quantity [I>V]
  resp:  the quantity is written as a braced island and the parse holds it as a quantity node; a quantity node no spread references is an exact finding, in a need slot as in any other, so an N entry admits spread lines and a need's quantity is spread by a scenario outline somewhere in the corpus; a spread line names one outline title and an entry may carry several; a bare digit run outside braces is a lexical near-miss finding; a digit run glued to a letter prefix is a token, never a quantity, and never a near-miss; numbers written as words stay invisible by rule [I>V]
  sib:   none -- the bare digit run is the failure case and is named in this entry
  touches: D66 D20 D17 D13 D15
# roads not taken: needs exempt from the spread check; illustrative numbers in needs left unbraced

# Declined fence entries transcribed as fence-declined rulings (D88); the fence text was confirmed at the gate, so interviewer-drafted, visionary-ratified.

D92 2026-09-05 [I>V]
  resp:  declined — coverage by inference — siblings are never matched from touches links or trigger text; a wanted entry names its unwanted entries or says none with a reason; inference masked two of thirteen known omissions in the field test [I>V]
  ->     fence-declined
  touches: D14

D93 2026-09-05 [I>V]
  resp:  declined — open vocabularies and a normalizing pass — prose lives only inside slots, every other field is a closed set, and a normalizer would be a second grammar nobody specified [I>V]
  ->     fence-declined
  touches: D15

D94 2026-09-05 [I>V]
  resp:  declined — dates updated in place, and undated entries — the docket is append-only with typed relations; in-place rewrites lose history and an undated entry cannot be walked [I>V]
  ->     fence-declined
  touches: D16

D95 2026-09-05 [I>V]
  resp:  declined — Gherkin keywords as slot keywords — a docket must never be mistakable for a feature file [I>V]
  ->     fence-declined
  touches: D18

D96 2026-09-05 [I>V]
  resp:  declined — a regex heuristic for quantities — ruled in as D19, then reversed the same day; quantities are syntax, a node kind, and a bare digit run is a lexical near-miss [I>V]
  ->     fence-declined
  touches: D19 D20

D97 2026-09-05 [I>V]
  resp:  declined — the lint writing or remembering — no last-run record, no normalizing in place; a second historian beside the journal is the self-grounding hazard the audit fence closed [I>V]
  ->     fence-declined
  touches: D29

D98 2026-09-05 [I>V]
  resp:  declined — an empty docket reported as clean — nothing to lint is a could-not-run refusal, never exit zero [I>V]
  ->     fence-declined
  touches: D26

D99 2026-09-05 [I>V]
  resp:  declined — roll-ups or warnings at size — size is not a behaviour; roll-up is caller-side [I>V]
  ->     fence-declined
  touches: D27

D100 2026-09-05 [I>V]
  resp:  declined — flagging directive text in slot prose — a heuristic over meaning; the steering hazard belongs to prose-reading consumers [I>V]
  ->     fence-declined
  touches: D36

D101 2026-09-05 [I>V]
  resp:  declined — gating by default, and gating left entirely to the consumer — strict is an opt-in flag; default reports and exits zero [I>V]
  ->     fence-declined
  touches: D10

D102 2026-09-05 [I>V]
  resp:  declined — a scaffold command — findings state their fix instead [I>V]
  ->     fence-declined
  touches: D33

D103 2026-09-05 [I>V]
  resp:  declined — refusing the whole lint when gnt is absent — five layers run on the docket alone [I>V]
  ->     fence-declined
  touches: D35

D104 2026-09-05 [I>V]
  resp:  declined — a layer-plugin interface for future grammars — an interface designed before its second user exists [I>V]
  ->     fence-declined
  touches: D39

D105 2026-09-05 [I>V]
  resp:  declined — a threshold finding on provenance share — the distribution is shown, never judged [I>V]
  ->     fence-declined
  touches: D44

D106 2026-09-05 [I>V]
  resp:  declined — the fence as the home for no-failure-case claims — replaced by sib none with a reason inline, counted, with short reasons a form finding [I>V]
  ->     fence-declined
  touches: D45

D107 2026-09-05 [V] amends D54
  resp:  the package is docketry — the craft of dockets, naming the whole toolkit of language, tree, lint, formatter, and renderer; the bin is docketry, with docket left to the operator as an alias since the bare bin is claimed on npm by an unrelated package [V]
  ->     structural
  touches: D54 D60 D41
# roads not taken: gherkin-docket (advertises a Gherkin reader, which D18 forbids the docket to resemble); abdd-docket (a second naming family, opaque to the standalone user); docket-ast, docketlang (name the implementation); dockets (one letter from a taken, unrelated package)

# Second ruling pass (2026-09-05, after the cold review of the grammar and AST against intent), in ratification order.

D108 2026-09-05 [I>V]
  resp:  a serves line — an id list of needs — is legal on any ruling and names the needs the ruling serves; a triggered ruling stays triggered with it; serves names N entries only; an in-effect need named by no in-effect ruling's serves, need, or means is a coverage finding keyed by the need, with the fix ask what behaviour meets it or fence it; a need served only by fence kinds is listed as fenced, never a finding; the parse exposes servedBy on every need [I>V]
  ->     structural
  serves: N3 N0
  touches: D14 D17 D68 D73 D78
# roads not taken: a counted needs-unserved line with no finding; the edge with no check; no new edge, needs reachable only by untriggered resolutions

D109 2026-09-05 [I>V]
  resp:  a structural ruling in effect with no serves line is a coverage finding — the hoisting catch, a constraint nobody has tied to a need — with the fix name the need or reclassify the ruling [I>V]
  ->     structural
  serves: N3
  touches: D108 D76 D6
# roads not taken: a counted constraints-without-a-need line, promoted to a finding by the first live run; the tie living only in the design doc's tags

D110 2026-09-05 [I>V]
  resp:  touches names the entries a change to this one would disturb — the re-examination set of the scope skill's rule seven; the parse exposes touchedBy on every node; the lint infers nothing from touches beyond existence and order; with serves, sib, relations, and touches each read in both directions the parse is the addressable graph D12 promised [I>V]
  ->     structural
  serves: N2
  touches: D15 D14 D12 D92
# roads not taken: a closed set of typed edges retiring touches; a rename to cites with the parse demoted to a tree; a single depends line beside an undefined touches

D111 2026-09-05 [I>V] amends D88
  resp:  a ruling id is one uppercase letter other than N followed by digits, one letter per docket, and N followed by digits is a need; the id is the only join key — the scenario tag, the fence entry's trailing parenthetical, the ledger row's bold N id and its evidence citations, and the design doc's ruled tag, whose grammar is ruled; one ruling may land in several fence entries; ids outside the docket's own patterns, such as an elective, are listed as not counted; the Declined, Deferred, and Named-assumption sections are kind-strict — each entry cites at least one entry whose effective kind is that section's fence kind — while Roads-not-taken and Out-of-reach entries cite any entry in effect; a parenthetical may also cite the relation entries on its target, and a reversed entry beside its reverser; a citation of any entry in an amendment chain joins the whole chain; the ledger row for a need is the destination of every in-effect ruling resolving to need or means that need, and the row must cite each — a missing citation is a traceability finding, and a row citing a ruling that does not resolve to that need is the mis-cite; boundary rulings have no destination by nature; the not-counted list is a declared surface carrying a per-kind count; in the reverse direction a scenario with no ruling tag, any citation of a missing id, and a citation of a reversed id without its reverser are traceability findings [I>V]
  ->     structural
  serves: N3
  touches: D88 D77 D68 D17 D108
# roads not taken: sinks kept as sinks with only the declared not-counted surface; narrowing the ledger-cites-ruling finding alone

D112 2026-09-05 [I>V] amends D73
  resp:  the entry shape as rendered is the grammar — header with id, date, provenance, optional unwanted mark, optional relation, the mark and the relation accepted in either order and emitted mark-first by the formatter; slots pre, trig, resp each with one tag; sib; spread; a typed resolution introduced by the arrow; serves; touches; hash notes; N entries with beneficiary and weight, a need slot, an optional means slot; braced quantities; the header tag is the entry's summary and equals its lowest slot tag on the rank lost, inferred, ratified, visionary, so a header above its lowest slot is a consistency finding; the distribution line counts slots only [I>V]
  ->     structural
  serves: N0
  touches: D73 D21 D108 D78

D113 2026-09-05 [I>V] amends D65
  resp:  an amends entry restates its target in full — slots, sib, spread, serves, and resolution — and that restatement is the target's effective shape for every layer; the target stays in effect, marked amended; a chain of amendments resolves to the last amender that is itself in effect, and when every amender is reversed the target's own text is its effective shape again; the parse carries the effective shape on the amended node [I>V]
  ->     structural
  serves: N0
  touches: D65 D71 D25 D108
# roads not taken: reversing an amender as a form finding; an amender's reversal reversing the whole chain

D114 2026-09-05 [I>V]
  resp:  an in-effect, triggered, non-fence unwanted entry that no in-effect sib line names is a coverage finding — a failure case of a behaviour never written — with the fix name the wanted behaviour this fails, or record it [I>V]
  ->     structural
  serves: N0
  touches: D14 D46 D68 D80
# roads not taken: a counted orphan-failure-cases line; nothing

D115 2026-09-05 [I>V]
  resp:  the coverage layer counts sib links whose target's effective shape carries any inferred or lost slot and reports them on a covered-by-inferred line naming the pairs; never a second finding on a fact the provenance layer reports [I>V]
  ->     structural
  serves: N0
  touches: D14 D72 D74
# roads not taken: a coverage finding on the wanted entry until the sibling is ratified; the layers kept independent

D116 2026-09-05 [I>V]
  resp:  N entries admit the four relations under the restate-in-full rule, so an amending need restates beneficiary, weight, and slots; a tension line — the id of another need, a double dash, and a reason held to the three-word floor — is a typed edge between needs, exposed in both directions by the parse, and the ledger's tensions are rendered from it [I>V]
  ->     structural
  serves: N3
  touches: D112 D113 D71 D72 D69
# roads not taken: relations only with tensions left as ledger prose; needs immutable

D117 2026-09-06 [I>V]
  resp:  an elective is a docket ruling resolving to means — D49 to D53 in this docket — and the design doc's ruled tag cites the D id; an E label may remain in prose as an alias and is never a join key; the scope skill's numbering of electives retires wherever an interview keeps a docket [I>V]
  ->     structural
  serves: N3
  touches: D49 D50 D51 D52 D53 D111
# roads not taken: electives foreign, with D49 to D53 re-kinded boundary; two ids per fact with the E id as a declared alias

D118 2026-09-06 [I>V]
  resp:  a spread line clears a quantity only when traceability has confirmed the outline; with no corpus given, the coverage layer reports the entries on a spread-unverified line instead of clearing them, and nothing is a finding in isolation [I>V]
  ->     structural
  serves: N2
  touches: D91 D68 D35
# roads not taken: the hollow accepted as a standalone limitation; spread lines restricted to one-token slugs

D119 2026-09-06 [I>V] amends D15
  trig:  a line is parsed [I>V]
  resp:  provenance is exactly one of five tags, one per slot — visionary, interviewer-drafted and accepted as written, interviewer-drafted and corrected by the visionary before acceptance, interviewer-inferred, lost — written V, I>V, I+V, I, and the question mark; resolution is a typed kind from a fixed set plus an optional reference; ids match one pattern and an amendment is a new entry; touches names entries only; anything else is a form finding naming the line [I>V]
  sib:   D28
  touches: D15 D2 D13 D14 D44 D72
# roads not taken: four tags kept until the first live run; corrections recorded as notes

D120 2026-09-06 [I>V] amends D112
  resp:  the entry shape as rendered is the grammar — header with id, date, provenance, optional unwanted mark, optional relation, the mark and the relation accepted in either order and emitted mark-first by the formatter; slots pre, trig, resp each with one tag; sib; spread; a typed resolution introduced by the arrow; serves; touches; hash notes; N entries with beneficiary and weight, a need slot, an optional means slot, relations, and tension lines; braced quantities; the header tag is the entry's summary and equals its lowest slot tag on the rank lost, inferred, accepted, corrected, visionary, so a header above its lowest slot is a consistency finding; the distribution line counts slots only, across the five tags [I>V]
  ->     structural
  serves: N0
  touches: D112 D119 D116

D121 2026-09-06 [I>V] amends D91
  trig:  a slot's prose contains a quantity or a list [I>V]
  resp:  a quantity is written as a braced island and the parse holds it as a quantity node; a braced island whose members are separated by pipes is a list node holding its members; a quantity or list node no spread references is an exact finding, in a need slot as in any other, so an N entry admits spread lines and a need's islands are spread by a scenario outline somewhere in the corpus; a spread line names one outline title and an entry may carry several; the outline skeleton for a list carries one row per member; a bare digit run outside braces is a lexical near-miss finding; a digit run glued to a letter prefix is a token, never a quantity, and never a near-miss; numbers and lists written as plain words stay invisible by rule [I>V]
  sib:   none -- the bare digit run is the failure case and is named in this entry
  touches: D91 D66 D20 D17 D13 D84
# roads not taken: commas as the list separator, forbidding commas in quantities; a separate list form by double braces or a list line; lists left as prose

# Serves lines for the structural rulings in effect (D109), mapping ratified by the visionary 2026-09-06; each amends its chain root and restates the effective shape.

D122 2026-09-06 [I>V] amends D6
  resp:  all six layers — form, provenance, resolution, coverage, consistency, traceability — are in v1; the content layer stays judgment [I>V]
  ->     structural
  serves: N0
  touches: D6 D1 D109

D123 2026-09-06 [I>V] amends D8
  resp:  the lint reads a docket file and holds no state between runs, so any cadence works [I>V]
  ->     structural
  serves: N2
  touches: D8 D7 D30 D109

D124 2026-09-06 [I>V] amends D18
  resp:  slot keywords are the docket's own, never Given, When, or Then; a docket cannot be mistaken for a feature file by any parser or reader [I>V]
  ->     structural
  serves: N0
  touches: D18 D15 D2 D109

D125 2026-09-06 [I>V] amends D31
  resp:  the docket lives beside the fence, ledger, and design doc as a fifth surface the runner ignores; the scope validation script runs the docket lint strict with the corpus as a fifth refusal; ledger and fence stay checked as files though derived [I>V]
  ->     structural
  serves: N1
  touches: D31 D17 D24 D26 D109

D126 2026-09-06 [I>V] amends D36
  resp:  the lint reads no meaning from slot text, so text addressed to a reader cannot steer it; the steering hazard belongs to prose-reading consumers [I>V]
  ->     structural
  serves: N2
  touches: D36 D32 D29 D20 D109

D127 2026-09-06 [I>V] amends D41
  resp:  the docket tool is its own package; parse, five lint layers, format, and render run with nothing else installed; traceability loads the gnt parser when present; coupling is by stable ids, declared formats, lint-admission tests, and message doctrine, never by import [I>V]
  ->     structural
  serves: N2
  touches: D41 D31 D35 D39 D12 D109

D128 2026-09-06 [I>V] amends D39
  resp:  a check enters only through gnt's four lint-admission tests with a field specimen, additively; family members join through stable ids as citations and declared formats on every surface; nothing else is promised to future grammars now; admission of checks is a process, not a runtime behaviour [I>V]
  ->     structural
  serves: N1
  touches: D39 D59 D37 D12 D23 D20 D109

D129 2026-09-06 [I>V] amends D70
  resp:  a line beginning with a hash inside an entry attaches to that node as a note; the parse keeps notes and the lint reads nothing from them; a hash line between entries is a file comment and is dropped; a hash line is never a stray line [I>V]
  ->     structural
  serves: N3
  touches: D70 D28 D25 D61 D36 D109

D130 2026-09-06 [I>V] amends D74
  resp:  a slot tagged inferred or lost is a provenance finding until a visionary ratification lands; an entry with no trigger and no relation must carry a resolution, and its absence is a resolution finding; a precondition without a trigger is a form finding whose fix says add the trigger or drop the precondition, except on the trailing incomplete entry [I>V]
  ->     structural
  serves: N0
  touches: D74 D15 D21 D28 D34 D43 D72 D109

D131 2026-09-06 [I>V] amends D64
  resp:  the fixed resolution set is seven kinds — boundary, structural, means, need, fence-declined, fence-deferred, fence-assumption; need and means require a need reference; boundary and structural admit none; the fence kinds admit an optional label the lint ignores, since the fence is joined by id; a missing or misplaced reference is a form finding; a kind outside the seven refuses the docket [I>V]
  ->     structural
  serves: N0
  touches: D64 D67 D76 D15 D28 D109

D132 2026-09-06 [V] amends D54
  resp:  the package is docketry — the craft of dockets, naming the whole toolkit of language, tree, lint, formatter, and renderer; the bin is docketry, with docket left to the operator as an alias since the bare bin is claimed on npm by an unrelated package [V]
  ->     structural
  serves: N2
  touches: D54 D60 D107 D41 D109

# Wanted parents for the three orphan unwanted entries (D114), ratified by the visionary 2026-09-06.

D133 2026-09-06 [I>V]
  trig:  the interviewer writes a well-formed entry [I>V]
  resp:  the form layer reports nothing for it and the node carries every slot as written [I>V]
  sib:   D33
  serves: N0
  touches: D33 D28 D15

D134 2026-09-06 [I>V]
  pre:   a session ended after a complete entry [I>V]
  trig:  the docket is parsed [I>V]
  resp:  no node is marked incomplete and the resume point is the end of the file [I>V]
  sib:   D34
  serves: N1
  touches: D34 D78

D135 2026-09-06 [I>V]
  trig:  the lint meets a docket declaring a format version it knows [I>V]
  resp:  the docket parses under that version and the instrument line names it [I>V]
  sib:   D37
  serves: N2
  touches: D37 D38 D25

D136 2026-09-06 [I>V] amends D77
  resp:  a ruling id is one uppercase letter other than N followed by digits, one letter per docket, and N followed by digits is a need; the id is the only join key — the scenario tag, the fence entry's trailing parenthetical, the ledger row's bold N id and its evidence citations, and the design doc's ruled tag, whose grammar is ruled; one ruling may land in several fence entries; ids outside the docket's own patterns, such as an elective label, are listed as not counted; the Declined, Deferred, and Named-assumption sections are kind-strict — each entry cites at least one entry whose effective kind is that section's fence kind — while Roads-not-taken and Out-of-reach entries cite any entry in effect; a parenthetical may also cite the relation entries on its target, and a reversed entry beside its reverser; a citation of any entry in an amendment chain joins the whole chain; the ledger row for a need is the destination of every in-effect ruling resolving to need or means that need, and the row must cite each; a row may also cite any ruling that serves the need, so the evidence column is the rulings that serve it; a row citing a ruling that neither resolves to nor serves the need is the mis-cite; boundary rulings have no destination by nature; the not-counted list is a declared surface carrying a per-kind count; in the reverse direction a scenario with no ruling tag, any citation of a missing id, and a citation of a reversed id without its reverser are traceability findings [I>V]
  ->     structural
  serves: N3
  touches: D77 D88 D111 D108
# roads not taken: the mis-cite class dropped with citations checked for existence only; the ledger's evidence rewritten to cite need-kind rulings alone

# Serves lines for the triggered rulings the house ledger cites as evidence (D136), so each citation is a serves join.

D137 2026-09-06 [I>V] amends D9
  resp:  the build agent's use of the lint is another actor's behaviour; D9 keeps its text and provenance, loses its trigger and sib line, and lands nowhere by kind [I>V]
  ->     boundary
  serves: N1
  touches: D9 D58 D136

D138 2026-09-06 [I>V] amends D10
  trig:  the lint is invoked with the strict flag [I>V]
  resp:  any finding exits nonzero; default mode reports counts and exits zero; the gate is the consumer's flag, not the lint's judgment; the strict flag is a mode, a wanted behaviour, not a failure case of any entry [I>V]
  sib:   none -- findings present and findings absent are both wanted outcomes of the flag, each with its scenario
  serves: N1
  touches: D10 D85 D136

D139 2026-09-06 [I>V] amends D42
  trig:  the tool is invoked as a library or as render [I>V]
  resp:  four exported functions — parse, lint, format, render — with a thin CLI over them; render emits skeletons for all four deliverables by kind to a new path or standard output, never overwriting; a skeleton scenario's title is the entry's trigger text, with the id appended only when that title already exists in the file; a skeleton outline carries two rows of placeholder values so it parses under the dialect [I>V]
  sib:   D82
  serves: N3
  touches: D42 D84 D136

D140 2026-09-06 [I>V] amends D17
  trig:  a need is sketched [I>V]
  resp:  it is an N entry in the same docket — statement, beneficiary, weight, provenance — under the same closed grammar; a ruling's resolution to an N id is a verifiable reference; the handoff ledger is derived from N entries [I>V]
  sib:   none -- a need outside the docket is the road not taken, not a failure of this entry
  serves: N3
  touches: D17 D136

D141 2026-09-06 [I>V] amends D22
  trig:  the lint runs over a docket [I>V]
  resp:  a per-layer table of findings each keyed by the entry id, a space, and the slot word when one applies, with rule and line; a layer with no input is reported dark, never zero; a findings count; a machine form declaring its format and carrying entry, slot, layer, rule, line; report lines are specified by content, and only the declared machine formats are exact [I>V]
  sib:   D26
  serves: N3 N2
  touches: D22 D79 D136

D142 2026-09-06 [I>V] amends D25
  trig:  the parse function is called, with or without an as-of date [I>V]
  resp:  a tree declaring its format, one node per entry with kind, date, provenance, unwanted mark, source line, slots each with text, provenance, quantity and list nodes, touches, sib, and serves as id lists read in both directions, notes, a typed resolution, typed relations, and the effective shape; a relation must name an earlier entry in file order, and one naming a later entry refuses the docket as a relation to a missing id does, so a cycle cannot occur; an entry is in effect as of a date when it is dated on or before that date and no in-effect entry reverses it, so reversing a reversal restores the original; reaffirms and ratifies change nothing about effect; same-date relations resolve by file order; the default as-of date is the latest entry date in the docket, never the clock, so the parse is a pure function of the docket [I>V]
  sib:   none -- a date before every entry yields nothing in effect, which is a correct answer, not a failure
  serves: N2
  touches: D25 D47 D71 D136

D143 2026-09-06 [V]
  resp:  docketry lives in its own repository, private during alpha with open source as the goal, and its own npm package reserved at version zero; the scope skill grounds against a docketry version as it grounds against gnt, and its validation script probes for docketry and prints the one-line install; no facade package until a run record shows the friction [V]
  ->     structural
  serves: N2
  touches: D41 D127 D132 D31
# roads not taken: a package directory inside the gnt repository publishing under its own name; a facade package depending on every tiny tool from the start

D144 2026-09-06 [I>V]
  resp:  the aBDD destination table — the seven kinds naming fence sections, spread naming a Gherkin outline, the renderer's four deliverables — is one profile over a core of entries, slots, provenance, relations, siblings, islands, needs, and tensions; the build keeps the profile in one module the core does not import; making the kind set pluggable reopens when a second profile arrives, the general interview register for projects, books, papers, and articles [I>V]
  ->     fence-deferred
  serves: N2
  touches: D143 D64 D131 D68 D42

D145 2026-09-06 [V] amends D54
  resp:  the package is docketry — the craft of dockets, naming the whole toolkit of language, tree, lint, formatter, and renderer; on npm it is published under the visionary's user scope as @bingh/docketry, since the registry refuses the bare name as too similar to an existing package; the bin is docketry, with docket left to the operator as an alias since the bare bin is claimed on npm by an unrelated package [V]
  ->     structural
  serves: N2
  touches: D54 D107 D132 D143
# roads not taken: an organisation scope naming the family; another unscoped name retried blind against the similarity check

# Third ruling pass (2026-09-06, after the gaming review), in ratification order.

D146 2026-09-06 [I>V]
  resp:  an amends or reverses entry whose header tag ranks below its target's effective header tag is a consistency finding — an interviewer may not rewrite the visionary — and the remedy is a visionary ratification of the amender or reverser; reaffirms and ratifies are exempt since they change nothing [I>V]
  ->     structural
  serves: N0
  touches: D113 D72 D120 D32
# roads not taken: a counted line of rewritten pairs; accepting every relation as the interviewer's claim on the fence

D147 2026-09-06 [I>V]
  resp:  an entry dated earlier than the entry above it is a form finding, so the append-only record is checkable and dates never decrease in file order; the fix is today's date or the entry's proper position [I>V]
  ->     structural
  serves: N0
  touches: D16 D71 D78
# roads not taken: a counted line of out-of-order dates; the date accepted as the interviewer's claim

D148 2026-09-06 [I>V] amends D109
  resp:  a structural or boundary ruling in effect with no serves line is a coverage finding — the hoisting catch, a constraint or a boundary fact nobody has tied to a need — with the fix name the need or reclassify the ruling [I>V]
  ->     structural
  serves: N3
  touches: D109 D108 D76 D4
# roads not taken: the not-counted line listing boundary ids; boundary named on the fence as the unconstrained kind

D149 2026-09-06 [I>V]
  resp:  a scenario citing an entry whose effective shape is resolved or a need is a mis-kinded citation and a traceability finding, symmetric with the fence's kind-strict sections; a citation of an amender of a triggered ruling joins the chain [I>V]
  ->     structural
  serves: N3
  touches: D136 D88 D80 D68
# roads not taken: a counted line of mis-kinded scenario citations; scenario joins by existence alone

D150 2026-09-06 [V] amends D4
  resp:  four actors — the interviewer agent writes and reads mid-interview; the visionary reads counts at handoff, optionally; the build agent reads unsupervised; downstream consumers such as gherkin-trace, audit, and a future muster monitor read it too [V]
  ->     boundary
  serves: N2
  touches: D4 D148

D151 2026-09-06 [I>V]
  resp:  traceability confirms a spread only when the outline it names carries the spreading entry's tag or the tag of an entry in its chain; a spread naming an outline tagged with another id is a traceability finding; with no corpus the spread stays counted unverified [I>V]
  ->     structural
  serves: N3
  touches: D121 D118 D84 D136
# roads not taken: the borrowed outline accepted on the strength of its title

D152 2026-09-06 [I>V] ! amends D28
  trig:  the parser meets a defect [I>V]
  resp:  a line at slot indent whose first token is a single word followed by a colon is a keyword line, and any other indented line is a stray line; tree-breaking defects refuse the docket with exit two — a duplicate id, an unmatched header, a relation to a missing or later id, a bad version line, and a keyword, provenance tag, resolution kind, or relation outside its closed set; entry-level defects parse with a form finding at the line — a stray line, a missing or double provenance tag, a bare digit run, an undated entry, a date earlier than the entry above, touches to a missing or later id, a sib line naming a wanted entry, a missing id, or the entry itself, a precondition without a trigger, a weight outside one to five, a missing or misplaced reference; the trailing entry is incomplete when it lacks any of response, touches, or trigger-or-resolution-or-relation, so a session ending on a behaviour is complete; on an incomplete entry only the findings its missing lines would cause are held, and every other check still fires [I>V]
  touches: D28 D78 D34 D147 D74
# roads not taken: the definition kept with only the suppression narrowed; D78 kept as written

D153 2026-09-06 [I>V] amends D74
  resp:  a slot tagged inferred or lost is a provenance finding until a visionary ratification lands; an entry with no trigger and no relation must carry a resolution, and its absence is a resolution finding; a precondition without a trigger is a form finding whose fix says add the trigger, except on the trailing incomplete entry [I>V]
  ->     structural
  serves: N0
  touches: D74 D130 D152
# roads not taken: both remedies offered, the cheaper of which deletes content

D154 2026-09-06 [I>V]
  resp:  every report carries a ratified line listing each ratifies entry by its id, its target, and its date, so the visionary sees every ratification attributed to them and can deny any at the read; journal corroboration stays deferred as ruled [I>V]
  ->     structural
  serves: N0
  touches: D72 D86 D89 D44
# roads not taken: journal corroboration reopened now with this lint as its first consumer; nothing beyond the fence's named assumption

D155 2026-09-06 [I>V]
  resp:  the parse derives, and never writes, a SHA-256 hash of each entry's canonical text and a chain hash over the docket in file order, carried as fields of the tree so git, the journal, gherkin-trace, and audit can corroborate a docket across snapshots without trusting its text; the docket itself carries no hash line, so the grammar is unchanged and the interviewer has nothing to recompute; the hash comes from the runtime's built-in crypto, no dependency [I>V]
  ->     structural
  serves: N2
  touches: D142 D40 D29 D97 D51
# roads not taken: a hash line written into every entry and verified by the lint, a second historian beside git and the journal that the actor holding the pen can recompute; BLAKE3, a dependency E3 forbids for no gain at docket sizes; no hashes at all

D156 2026-09-06 [I>V]
  resp:  every report carries a de-triggered line listing each amends entry whose restatement drops its target's trigger, by amender and target, so retiring a behaviour by amendment is visible at handoff; the honest case stays legal [I>V]
  ->     structural
  serves: N0
  touches: D113 D58 D68 D44
# roads not taken: a de-triggering amendment below rank as a finding, folded into D146; the mechanism trusted as ruled

D157 2026-09-06 [I>V]
  resp:  the scope skill's handoff step reads the report's counted lines to the visionary in words — of the slots, how many are in the visionary's words, how many were corrected, how many inferred and unratified, how many wanted behaviours carry no sibling by reason, how many ratifications and de-triggerings — because under an optimising interviewer those lines are the lint's whole residual defence and the visionary is their only reader; a protocol amendment to the scope skill at build time, recorded here as the docket's expectation of its first caller [I>V]
  ->     boundary
  serves: N0
  touches: D137 D44 D154 D156 D69
# roads not taken: the report left for the visionary to read or not

# Accepted and named after the gaming review: what the lint counts but cannot judge.

D158 2026-09-06 [I>V]
  resp:  a sib-none reason, a sibling entry, a wanted parent, and a serves edge are claims the lint counts and never judges, since it reads no meaning; whether a sibling is a real failure case and whether a ruling serves the need it names are judgment, routed to the audit skill as checklist lines; the no-sibling-by-reason and covered-by-inferred lines stay as the visionary's tells [I>V]
  ->     fence-assumption
  serves: N0
  touches: D36 D69 D108 D114 D115

D159 2026-09-06 [I>V]
  resp:  only fence kinds carry a trigger and none is asked for a sibling, so deferring is the legal way out of any awkward behaviour; it lands in a reviewed artifact, and the rendered Deferred entry carries the entry's trigger as its reopening condition so the visionary sees what was deferred, not only that it was [I>V]
  ->     fence-assumption
  serves: N0
  touches: D68 D84 D99

D160 2026-09-06 [I>V] amends D42
  trig:  the tool is invoked as a library or as render [I>V]
  resp:  four exported functions — parse, lint, format, render — with a thin CLI over them; render emits skeletons for all four deliverables by kind to a new path or standard output, never overwriting; a skeleton scenario's title is the entry's trigger text, with the id appended only when that title already exists in the file; a skeleton outline carries two rows of placeholder values so it parses under the dialect; a Deferred or Named-assumption skeleton carries the entry's trigger as its reopening or failure condition [I>V]
  sib:   D82
  serves: N3
  touches: D42 D139 D159

D161 2026-09-06 [V] ratifies D58
  resp:  the reclassification of D9 to boundary was the visionary's choice at the gate and stands; the amender is ratified as D146 requires [V]
  touches: D58 D146

D162 2026-09-06 [I>V] amends D20
  trig:  a slot's prose contains a quantity or a list [I>V]
  resp:  a quantity is written as a braced island and the parse holds it as a quantity node; a braced island whose members are separated by pipes is a list node holding its members; a quantity or list node no spread references is an exact finding, in a need slot as in any other, so an N entry admits spread lines and a need's islands are spread by a scenario outline somewhere in the corpus; a spread line names one outline title and an entry may carry several; the outline skeleton for a list carries one row per member; a bare digit run outside braces is a lexical near-miss finding; a digit run joined to a letter prefix directly, by a hyphen, or by a dot — D11, v1, SHA-256, UTF-8, v1.2 — is a token, never a quantity, and never a near-miss; numbers and lists written as plain words stay invisible by rule [I>V]
  sib:   none -- the bare digit run is the failure case and is named in this entry
  touches: D20 D121 D155
# roads not taken: names written without their hyphen to satisfy the rule

D163 2026-09-06 [I>V] amends D149
  resp:  a scenario may cite a triggered, structural, or means ruling, since a parser's rules are proved by scenarios and a scenario carries the id it came from; a scenario citing a need, a boundary, or a fence-kind entry is a mis-kinded citation and a traceability finding; a citation of an amender joins the chain; that an optimiser may still tag a scenario with a structural id is a named residual, and the cost lands on the runner, whose steps must bind [I>V]
  ->     structural
  serves: N3
  touches: D149 D23 D136 D158
# roads not taken: triggered rulings only, retagging sixty-four house scenarios; scenario joins by existence alone

D164 2026-09-06 [V] ratifies D44
  resp:  the provenance distribution line, drafted by the interviewer at the objections round and accepted then, stands; the amender is ratified as D146 requires since it restated D22 after D38 had done so in the visionary's words [V]
  touches: D44 D38 D146

# Fourth ruling pass (2026-09-06, after the re-test of the third), in ratification order.

D165 2026-09-06 [I>V] amends D146
  resp:  an amends or reverses entry compares its header tag against the highest tag on its target's chain so far — the root and every in-effect amender before it, a ratified amender counting as visionary — and a tag below that is a consistency finding, since an interviewer may not rewrite the visionary and the visionary's word on a ruling holds until the visionary lowers it; the remedy is a visionary ratification of the entry; every visionary-tagged amends or reverses entry is listed by id on the report beside the ratified line; reaffirms and ratifies are exempt [I>V]
  ->     structural
  serves: N0
  touches: D146 D113 D154 D72
# roads not taken: the chain's effective tag just before the entry, under which one ratification lowers the guard; the wording kept with chain-amend named on the fence

D166 2026-09-06 [I>V] amends D156
  resp:  every report carries a de-triggered line listing each amends entry whose restatement drops its target's trigger and each reverses entry whose target had a trigger, by amender or reverser and target, so retiring a behaviour by either path is visible at handoff; the not-counted line is emitted on every run, with or without a corpus; the honest case stays legal [I>V]
  ->     structural
  serves: N0
  touches: D156 D113 D71 D111
# roads not taken: reversal accepted and named beside the deferred escape

D167 2026-09-06 [I>V] amends D163
  resp:  a scenario may cite a triggered, structural, or means ruling, since a parser's rules are proved by scenarios and a scenario carries the id it came from; a scenario citing a need, a ruling that resolves to a need, a boundary, or a fence-kind entry is a mis-kinded citation and a traceability finding; a citation of an amender joins the chain; that an optimiser may still tag a scenario with a structural id is a named residual, and the cost lands on the runner, whose steps must bind [I>V]
  ->     structural
  serves: N3
  touches: D163 D149 D111
# roads not taken: the need's own statement citable by scenarios

# Consolidating restatements: under restate-in-full, parallel amenders of one root had dropped each other's additions (the interviewer's drafting defect, found at the re-test). Each restates the whole chain.

D168 2026-09-06 [I>V] amends D15
  trig:  a line is parsed [I>V]
  resp:  provenance is exactly one of five tags, one per slot — visionary, interviewer-drafted and accepted as written, interviewer-drafted and corrected by the visionary before acceptance, interviewer-inferred, lost — written V, I>V, I+V, I, and the question mark; resolution is a typed kind from the fixed set of seven — boundary, structural, means, need, fence-declined, fence-deferred, fence-assumption — where need and means require a need reference, boundary and structural admit none, and the fence kinds admit an optional label the lint ignores; a missing or misplaced reference is a form finding and a kind outside the seven refuses the docket; ids match one pattern and an amendment is a new entry; touches names entries only; anything else is a form finding naming the line [I>V]
  sib:   D28
  touches: D15 D119 D64 D131 D2 D13 D14

D169 2026-09-06 [I>V] amends D21
  resp:  the entry shape as rendered is the grammar — header with id, date, provenance, optional unwanted mark, optional relation, the mark and the relation accepted in either order and emitted mark-first by the formatter; slots pre, trig, resp each with one tag; sib; spread; a typed resolution introduced by the arrow; serves; touches; hash notes; N entries with beneficiary and weight, a need slot, an optional means slot, relations, and tension lines; braced quantities and lists; an entry carrying a relation needs no resolution line, the relation is its resolution; the header tag is the entry's summary and equals its lowest slot tag on the rank lost, inferred, accepted, corrected, visionary, so a header above its lowest slot is a consistency finding; the distribution line counts slots only, across the five tags [I>V]
  ->     structural
  serves: N0
  touches: D21 D57 D73 D112 D120

D170 2026-09-06 [I>V] amends D22
  trig:  the lint runs over a docket [I>V]
  resp:  a per-layer table of findings each keyed by the entry id, a space, and the slot word when one applies, with rule and line; a layer with no input is reported dark, never zero; a findings count; an instrument line opening every report that names the lint version, the docket grammar version parsed, and the gnt parser version when traceability ran; a provenance distribution line counting slots per tag beside the findings table, no threshold, never a finding; a machine form declaring its format and carrying entry, slot, layer, rule, line; report lines are specified by content, and only the declared machine formats are exact; a docket with zero entries, only comments, or a missing file names the cause and exits two, the exit family being zero ran, one strict findings, two could not run [I>V]
  sib:   D26
  serves: N3 N2
  touches: D22 D26 D38 D44 D79 D141

D171 2026-09-06 [I>V] ! amends D28
  trig:  the parser meets a defect [I>V]
  resp:  a line at slot indent whose first token is a single word followed by a colon is a keyword line, and any other indented line is a stray line; tree-breaking defects refuse the docket with exit two — a duplicate id, an unmatched header, a relation to a missing or later id, a bad version line, and a keyword, provenance tag, resolution kind, or relation outside its closed set; entry-level defects parse with a form finding at the line — a stray line, a missing or double provenance tag, a bare digit run, an undated entry, a date earlier than the entry above, touches to a missing or later id, a sib line naming a wanted entry, a missing id, or the entry itself, a precondition without a trigger, a weight outside one to five, a missing or misplaced reference; a sib line is allowed on unwanted entries and optional, the coverage check forcing the first level only; the trailing entry is incomplete when it lacks any of response, touches, or trigger-or-resolution-or-relation, so a session ending on a behaviour is complete; on an incomplete entry only the findings its missing lines would cause are held, and every other check still fires [I>V]
  touches: D28 D46 D78 D152

D172 2026-09-06 [I>V] amends D77
  resp:  a ruling id is one uppercase letter other than N followed by digits, one letter per docket, and N followed by digits is a need; the id is the only join key — the scenario tag, the fence entry's trailing parenthetical, the ledger row's bold N id and its evidence citations, and the design doc's ruled tag, whose grammar is ruled; one ruling may land in several fence entries; ids outside the docket's own patterns, such as an elective label, are listed as not counted; the Declined, Deferred, and Named-assumption sections are kind-strict — each entry cites at least one entry whose effective kind is that section's fence kind — while Roads-not-taken and Out-of-reach entries cite any entry in effect; a parenthetical may also cite the relation entries on its target, and a reversed entry beside its reverser; a citation of any entry in an amendment chain joins the whole chain; the ledger row for a need is the destination of every in-effect ruling resolving to need or means that need, and the row must cite each; a row may also cite any ruling that serves the need, so the evidence column is the rulings that serve it; a row citing a ruling that neither resolves to nor serves the need is the mis-cite; a boundary ruling has no deliverable of its own, and one that serves a need may be cited as that need's evidence; the not-counted list is a declared surface carrying a per-kind count; in the reverse direction a scenario with no ruling tag, any citation of a missing id, and a citation of a reversed id without its reverser are traceability findings [I>V]
  ->     structural
  serves: N3
  touches: D77 D136 D148

D173 2026-09-07 [I>V] amends D20
  trig:  a slot's prose contains a quantity, a list, or a literal [I>V]
  resp:  a quantity is written as a braced island and the parse holds it as a quantity node; a braced island whose members are separated by pipes is a list node holding its members; a quantity or list node no spread references is an exact finding, in a need slot as in any other, so an N entry admits spread lines and a need's islands are spread by a scenario outline somewhere in the corpus; a spread line names one outline title and an entry may carry several; the outline skeleton for a list carries one row per member; a span in backticks is a literal node — a version, a standard, an identifier, a unit-bearing figure that is not a quantity — and the lint reads nothing from it; a token of one uppercase letter followed by digits is exempt by pattern, whether a docket id or an alias; every other digit run outside braces and backticks is a lexical near-miss finding, decimals and glued units included, with no heuristic about letters, hyphens, or dots; numbers and lists written as plain words stay invisible by rule [I>V]
  sib:   none -- the bare digit run is the failure case and is named in this entry
  touches: D20 D162 D66 D121 D36
# roads not taken: dot-after-letter and unit-suffix heuristics, each a future special case; decimals and glued units accepted beside words

D174 2026-09-07 [V] ratifies D170
  resp:  the consolidated report ruling, carrying the instrument line the visionary ruled in D38, stands [V]
  touches: D170 D38 D165

D175 2026-09-07 [I>V] amends D6
  resp:  all six layers — form, provenance, resolution, coverage, consistency, traceability — are in `v1`; the content layer stays judgment [I>V]
  ->     structural
  serves: N0
  touches: D6 D122 D173

D176 2026-09-07 [I>V] amends D155
  resp:  the parse derives, and never writes, a `SHA-256` hash of each entry's canonical text and a chain hash over the docket in file order, carried as fields of the tree so git, the journal, gherkin-trace, and audit can corroborate a docket across snapshots without trusting its text; the docket itself carries no hash line, so the grammar is unchanged and the interviewer has nothing to recompute; the hash comes from the runtime's built-in crypto, no dependency [I>V]
  ->     structural
  serves: N2
  touches: D155 D173

D177 2026-09-07 [I>V] amends D146
  resp:  an amends or reverses entry compares its header tag against the highest tag on its target's chain so far — the root and every in-effect amender before it, a ratified amender counting as visionary — and a tag below that is a consistency finding, since an interviewer may not rewrite the visionary and the visionary's word on a ruling holds until the visionary lowers it; the remedy is a visionary ratification of the entry, and a ratification of an amender also ratifies every earlier amender of the same root, since the visionary accepted the restatement that supersedes them; every visionary-tagged amends or reverses entry is listed by id on the report beside the ratified line; reaffirms and ratifies are exempt [I>V]
  ->     structural
  serves: N0
  touches: D146 D165 D174
# roads not taken: every amender ratified individually

D178 2026-09-07 [V] ratifies D63
  resp:  dropping the road-not-taken kind until the deferral reopens was the visionary's choice at the review and stands [V]
  touches: D63 D55 D177

D179 2026-09-07 [V] ratifies D123
  resp:  the serves line on the stateless ruling was ratified with the mapping and stands [V]
  touches: D123 D8 D177

D180 2026-09-07 [V] ratifies D137
  resp:  the serves line on the build agent's boundary ruling was ratified with the ledger citations and stands [V]
  touches: D137 D9 D177

D181 2026-09-07 [I>V] amends D20
  trig:  a slot's prose contains a quantity, a list, or a literal [I>V]
  resp:  a quantity is written as a braced island and the parse holds it as a quantity node; a braced island whose members are separated by pipes is a list node holding its members; a quantity or list node no spread references is an exact finding, in a need slot as in any other, so an N entry admits spread lines and a need's islands are spread by a scenario outline somewhere in the corpus; a spread line names one outline title and an entry may carry several; the outline skeleton for a list carries one row per member; a span in backticks is a literal node — a version, a standard, an identifier, a unit-bearing figure that is not a quantity — and the lint reads nothing from it; a token of one uppercase letter followed by digits is exempt by pattern, whether a docket id or an alias; every other digit run outside braces and backticks is a lexical near-miss finding, decimals and glued units included, with no heuristic about letters, hyphens, or dots; the near-miss reads only the effective text of each chain, since a superseded line's prose is history with no remedy left, while structural checks read every line; numbers and lists written as plain words stay invisible by rule [I>V]
  sib:   none -- the bare digit run is the failure case and is named in this entry
  touches: D20 D173 D113 D28
# roads not taken: every line forever, with old dockets accumulating findings as the grammar gains lexical rules

D182 2026-09-07 [I]
  resp:  the one-screen grammar reference is a file of this repository, `GRAMMAR.md` — the lexical rules, the line grammar, every closed set, and the rule words of every layer — explanatory where the feature files bind; the scope skill's companion points at it by docketry version and copies nothing; its closed sets and rule words are typed from this docket, never generated from the code, and a scenario holds each equal to the parser's own, so the reference and the parser answer to the docket and not to each other [I]
  ->     structural
  serves: N2
  touches: D33 D143 D31 D2
# roads not taken: a fifth description generated from the parser's constants — a mirror that verifies nothing; a companion file in the scope skill beside a reference here — two copies that drift

D183 2026-09-07 [I]
  resp:  the rule word of a finding is drawn from a closed set declared per layer in the findings format and listed in the grammar reference; a rule word never changes within a findings-format major, so a consumer keying on it survives every rewording of the message; a rule word outside the set is a defect of the lint, never of the docket [I]
  ->     structural
  serves: N2
  touches: D170 D79 D22 D51 D37
# roads not taken: numeric error codes beside the words — a second key for the same thing

D184 2026-09-07 [I]
  resp:  the docket is read as `UTF-8`; a leading byte-order mark is dropped and a carriage return before a line feed is dropped, so a docket saved on any platform parses the same, and the formatter writes line feeds and no mark; slot indent is exactly two spaces, so a line indented by a tab or by any other width is a stray line; a blank line ends an entry, so a keyword line after a blank line and before the next header is a stray line; every other whitespace difference is the formatter's to erase [I]
  ->     structural
  serves: N0
  touches: D78 D152 D171 D40 D28
# roads not taken: accepting any indent width and letting the formatter guess the entry — the guess is inference; refusing a byte-order mark as a bad version line — punishing an editor's habit

D185 2026-09-07 [I]
  resp:  the canonical text an entry's hash is taken over is the formatter's output for that entry, so formatting a docket changes no hash and the parse of a formatted docket agrees with the parse of the original on every field but line; canonical form is frozen within a grammar major, so a change to it is a breaking change under the migration rule and a hash compared across majors is compared through the migration's record [I]
  ->     structural
  serves: N2
  touches: D176 D155 D40 D37
# roads not taken: a hash over a serialisation of the tree — a second canonical form to keep; a hash over the raw bytes — a stray space would break corroboration

D186 2026-09-07 [I]
  resp:  a refusal reports every tree-breaking defect a single pass can find — each duplicate id, each unmatched header, each member outside a closed set, each relation to a missing or later id — with its line, so an author repairs the docket in one round; a missing or unknown version line is reported alone, since nothing after it can be read under a known grammar [I]
  ->     structural
  serves: N2
  touches: D78 D171 D37 D33
# roads not taken: stopping at the first defect — one repair per run for an author who reruns in a loop

D187 2026-09-07 [I]
  resp:  the gamed dockets of the pre-build reviews and this docket are the acceptance specimens, shipped in the repository outside the corpus root so the runner never reads their feature files as the corpus; each expected finding is asserted by its key, its layer, and the ruling that fires it, never by a count alone, so a build that disagrees with a specimen is adjudicated by the ruling and not by the reader that first produced the expectation; the house docket is asserted clean in strict mode against its own corpus, and it is red while any entry waits on ratification [I]
  ->     structural
  serves: N1
  touches: D37 D2 D74 D10
# roads not taken: asserting the counts the throwaway lints produced — a count passes with the wrong findings; fixtures built by the step layer alone — a second writer of the grammar that agrees with the parser by shared authorship

# Ratifications of the DSL-lens drafts (owner, 2026-09-07: "ok to ratify").

D188 2026-09-07 [V] ratifies D182
  resp:  the one-screen grammar reference lives in the repository, typed from the docket and held equal to the parser by scenario, and the scope companion points at it [V]
  touches: D182 D33 D143

D189 2026-09-07 [V] ratifies D183
  resp:  rule words are a closed set per layer, frozen within a findings-format major [V]
  touches: D183 D170

D190 2026-09-07 [V] ratifies D184
  resp:  the lexical floor stands — `UTF-8`, byte-order mark dropped, CRLF read as LF, two-space slot indent, a blank line ends an entry [V]
  touches: D184 D78

D191 2026-09-07 [V] ratifies D185
  resp:  an entry's hash is taken over the formatter's output, canonical form frozen within a grammar major [V]
  touches: D185 D176

D192 2026-09-07 [V] ratifies D186
  resp:  a refusal reports every tree-breaking defect one pass can find, the version line alone [V]
  touches: D186 D78

D193 2026-09-07 [V] ratifies D187
  resp:  the gamed probes and the house docket are acceptance specimens asserted by key and firing ruling, and the house is red while any entry waits on ratification [V]
  touches: D187 D37

# Interactive walk-through of the DSL-lens critique (owner, 2026-09-07), in ruling order.

D194 2026-09-07 [I>V]
  resp:  the syntactic specification is a feature file of its own in which every production of the grammar has a positive scenario and a negative scenario with the docket text inline as a one-column step table — leading indent written as one open-box glyph per space and an arrow glyph for a tab, so the table's trimming loses nothing — and every negative names the rule word, the line, and the one correct form; the step layer reads the table and constructs nothing, so only the semantic feature files keep step-built dockets; the syntactic scenarios of the grammar feature file move into it [I>V]
  ->     structural
  serves: N1
  touches: D187 D2 D33 D28 D78 D184
# roads not taken: inlining all eight files — long tables for chains and joins; keeping step-built dockets and adding negatives — the mirror stays

D195 2026-09-07 [I>V] amends D170
  trig:  the lint runs over a docket [I>V]
  resp:  a per-layer table of findings each keyed by the entry id, a space, and the slot word when one applies, with rule and line; a layer with no input is reported dark, never zero; a findings count; an instrument line opening every report that names the lint version, the docket grammar version parsed, and the gnt parser version when traceability ran; a provenance distribution line counting slots per tag beside the findings table, no threshold, never a finding; a machine form declaring its format and carrying entry, slot, layer, rule, line; report lines are specified by content, and only the declared machine formats are exact; a docket with zero entries, only comments, or a missing file names the cause and exits two, the exit family being zero ran, one strict findings, two could not run; a finding whose subject is an entry is keyed by the entry id, a space, and the slot word whenever a slot applies, a need slot included; a scenario citing a reversed entry is keyed by that entry, since the remedy is on the entry's side; a finding whose subject is a citation — a scenario citing a missing id or the wrong kind, a fence entry, a ledger row, a design line — is keyed by its location, the file and the scenario title, the fence section, the row id, or the design file, with the entry it concerns named in the message; a destination with no input — no feature file, no fence, no ledger, no design doc — is reported dark by name on the traceability row, never as a miss [I>V]
  sib:   D26
  serves: N3 N2
  touches: D170 D22 D79 D111 D24 D187
# roads not taken: every finding keyed by an entry where one is known — a missing id has none; ids only with the slot as a field — breaks the key the report already uses

D196 2026-09-07 [I>V] amends D40
  trig:  the formatter is invoked on a docket [I>V]
  resp:  the docket is rewritten in canonical spacing and ordering — a slot line's text begins at the tenth column, the keyword and its colon padded with spaces, or after one space when the keyword is longer; slots in grammar order; the unwanted mark before the relation; only this command writes, only when invoked; the lint never does [I>V]
  sib:   none -- the formatter has no failure case beyond a docket it cannot parse, which D28 already refuses
  touches: D40 D29 D15 D185
# roads not taken: one space after every keyword with the house reformatted once — the interviewer's habit rewritten on every run; one space with the house left non-canonical

D197 2026-09-07 [I]
  resp:  the not-counted line carries, on every run, every kind the docket alone can settle — boundary, relation, reversed, and need-kind rulings no ledger has joined — and adds the kinds a deliverable settles, a fence kind carrying its trigger and an alias outside the id patterns, only when that deliverable was read, so an agent reading a corpus-less report still sees what traceability will never count [I]
  ->     structural
  serves: N2
  touches: D166 D111 D195
# roads not taken: reversals alone without a corpus — the least informative line

D198 2026-09-07 [I>V] amends D111
  resp:  a ruling id is one uppercase letter other than N followed by digits, one letter per docket, and N followed by digits is a need; the id is the only join key — the scenario tag, the fence entry's trailing parenthetical, the ledger row's bold N id and its evidence citations, and the design doc's ruled tag, whose grammar is ruled; one ruling may land in several fence entries; ids outside the docket's own patterns, such as an elective, are listed as not counted; the Declined, Deferred, and Named-assumption sections are kind-strict — each entry cites at least one entry whose effective kind is that section's fence kind — while Roads-not-taken, Out-of-reach, and Sanctioned-changes entries cite any entry in effect, the sixth section read for its citations and never kind-checked; a parenthetical may also cite the relation entries on its target, and a reversed entry beside its reverser; a citation of any entry in an amendment chain joins the whole chain; the ledger row for a need is the destination of every in-effect ruling resolving to need or means that need, and the row must cite each — a missing citation is a traceability finding, and a row citing a ruling that does not resolve to that need is the mis-cite; boundary rulings have no destination by nature; the not-counted list is a declared surface carrying a per-kind count; in the reverse direction a scenario with no ruling-id tag, whatever other tags it carries, any citation of a missing id, and a citation of a reversed id without its reverser are traceability findings [I>V]
  ->     structural
  serves: N3
  touches: D111 D88 D77 D80 D195
# roads not taken: docketry's five sections only, with sanctioned changes folded into the changelog — existing fences carry the section

D199 2026-09-07 [I>V]
  resp:  an entry's notes are part of its canonical text, so its hash moves when a note is edited; the renderer writes a ledger row with the need id in bold as the needs companion prescribes, and the ledger reader accepts the id bold or plain [I>V]
  ->     structural
  serves: N2
  touches: D185 D42 D111
# roads not taken: notes outside the hash — a note edit invisible to corroboration; plain rows — a second row shape beside the house's

D200 2026-09-07 [V] ratifies D195
  resp:  finding keys — entry and slot, a reversed citation by its entry, a missing or mis-kinded citation by its location — and dark destinations named on the row stand [V]
  touches: D195 D170

D201 2026-09-07 [V] ratifies D196
  resp:  the aligned canonical form, as the house writes, stands; the house docket was formatted to it once [V]
  touches: D196 D40

D202 2026-09-07 [V] ratifies D197
  resp:  the not-counted line carries every docket-settled kind on every run [V]
  touches: D197 D166

# 2026-09-08 — needs rewritten one need per entry after the beta reading of 2026-09-07 (drafted [I]; the visionary ratifies or rewrites)

N4 2026-09-08 [I] visionary 5 amends N0
  need:  I need to know, for every statement in the ruling record, whether I said it or the interviewer supplied it, before I ratify the contract [I]
  means: a provenance tag on every slot, counted and never judged [I]
  touches: N0 D15 D119

N5 2026-09-08 [I] visionary 5
  need:  I need every behaviour the interview ruled on to have been asked its failure case, and to see which were not [I]
  means: an explicit sibling link on every wanted entry, with absence counted [I]
  touches: N0 D14

N6 2026-09-08 [I] visionary 4
  need:  I need every quantity and enumeration I gave to be spread into its cases, and to see which were not [I]
  means: braced islands and spread lines, with absence counted [I]
  touches: N0 D20 D121

N7 2026-09-08 [I] visionary 4
  need:  I need to see every statement from the interview that never became a need, a constraint, a scenario, or a fence entry [I]
  means: a typed resolution on every entry, with absence counted [I]
  touches: N0 D64 D74

N8 2026-09-08 [I] visionary 5 amends N1
  need:  I need every question the interview left open put in front of me before the build starts, so that I decide it and not the build agent [I]
  means: the lint's findings as the question queue, and a strict run that refuses the handoff while any remain [I]
  touches: N1 D9 D10 D31

N9 2026-09-08 [I+V] operator 4 amends N2
  need:  I need the record's findings to cost so little, in time and attention, to produce and to read that I run them on every change, every cycle, every question, and not only at handoff [I+V]
  means: declared surfaces for the text, the tree, and the findings, each finding pointing into the record by id and line; and the README, the tool's own help, and the scope workflow recommend that use, a continuous-integration test per chat cycle [I+V]
  tension: N8 -- sufficiency is capped by opportunity cost
  touches: N2 D12 D47

N10 2026-09-08 [I] visionary 3 amends N3
  need:  I need every gap the record shows phrased as a question I can answer, so that the needs and the design grow from what the interview never asked [I]
  means: coverage findings that carry their question, and a renderer that emits ledger and design skeletons from the record [I]
  touches: N3 D5 D108 D42

N11 2026-09-08 [I] reviewer 3
  need:  I need to understand what the record is, what was checked, and what was not, from the ledger and the README alone, without reading the record itself [I]
  touches: N10 D157

N12 2026-09-08 [I] visionary 5
  need:  I need what I ratified to stay what I ratified, so that nothing changes between my review and the build without a new dated entry I can see [I]
  means: an append-only record with typed relations and a derived hash on every entry [I]
  touches: D16 D146 D155

# 2026-09-09 — the nine drafts put to the visionary; seven ratified as written in one ruling after the ledger reading, N6 sent back for explanation, N9 for correction

D203 2026-09-09 [V] ratifies N4
  resp:  the provenance need stands as N4 states it: for every statement in the record, whether the visionary said it or the interviewer supplied it, known before the contract is ratified [V]
  touches: N4 N0

D204 2026-09-09 [V] ratifies N5
  resp:  the failure-case need stands as N5 states it: every behaviour ruled on was asked its failure case, and the ones that were not are visible [V]
  touches: N5 N0

D205 2026-09-09 [V] ratifies N7
  resp:  the resolution need stands as N7 states it: every interview statement that became nothing is visible [V]
  touches: N7 N0

D206 2026-09-09 [V] ratifies N8
  resp:  the open-questions need stands as N8 states it: every question the interview left open is put to the visionary before the build, and the strict run refuses the handoff while any remain [V]
  touches: N8 N1

D207 2026-09-09 [V] ratifies N10
  resp:  the gaps-as-questions need stands as N10 states it: every gap the record shows is a question the visionary can answer [V]
  touches: N10 N3

D208 2026-09-09 [V] ratifies N11
  resp:  the reviewer's need stands as N11 states it: what the record is, what was checked, and what was not, from the ledger and the README alone [V]
  touches: N11 N10

D209 2026-09-09 [V] ratifies N12
  resp:  the immutability need stands as N12 states it: what the visionary ratified stays ratified, and nothing changes without a new dated entry [V]
  touches: N12

# Serves lines re-pointed to the needs split out of N0 (D203–D209); each amends its chain root and restates the effective shape, changing only the serves line.

D210 2026-09-09 [I>V] amends D14
  pre:   a wanted entry has a trigger and no failure case worth a scenario [I>V]
  trig:  the interviewer records it [I>V]
  resp:  sib none with a reason after a double dash; the lint counts these in a no-sibling-by-reason line; a reason stating nothing checkable is a form finding; the fence is no longer the home for this claim [I>V]
  sib:   none -- the vacuous reason is the failure case and is named in this entry
  serves: N5
  touches: D14 D45 D204

D211 2026-09-09 [I>V] amends D15
  trig:  a line is parsed [I>V]
  resp:  provenance is exactly one of five tags, one per slot — visionary, interviewer-drafted and accepted as written, interviewer-drafted and corrected by the visionary before acceptance, interviewer-inferred, lost — written V, I>V, I+V, I, and the question mark; resolution is a typed kind from the fixed set of seven — boundary, structural, means, need, fence-declined, fence-deferred, fence-assumption — where need and means require a need reference, boundary and structural admit none, and the fence kinds admit an optional label the lint ignores; a missing or misplaced reference is a form finding and a kind outside the seven refuses the docket; ids match one pattern and an amendment is a new entry; touches names entries only; anything else is a form finding naming the line [I>V]
  sib:   D28
  serves: N0 N7
  touches: D15 D168 D64 D131 D203 D205

D212 2026-09-09 [I>V] amends D74
  resp:  a slot tagged inferred or lost is a provenance finding until a visionary ratification lands; an entry with no trigger and no relation must carry a resolution, and its absence is a resolution finding; a precondition without a trigger is a form finding whose fix says add the trigger, except on the trailing incomplete entry [I>V]
  ->     structural
  serves: N0 N7
  touches: D74 D153 D203 D205

D213 2026-09-09 [I>V] amends D157
  resp:  the scope skill's handoff step reads the report's counted lines to the visionary in words — of the slots, how many are in the visionary's words, how many were corrected, how many inferred and unratified, how many wanted behaviours carry no sibling by reason, how many ratifications and de-triggerings — because under an optimising interviewer those lines are the lint's whole residual defence and the visionary is their only reader; a protocol amendment to the scope skill at build time, recorded here as the docket's expectation of its first caller [I>V]
  ->     boundary
  serves: N0 N11
  touches: D157 D203 D208

D214 2026-09-09 [I>V] amends D16
  trig:  the visionary says yes to an entry that entered as interviewer-inferred [I>V]
  resp:  a new dated entry carrying ratifies and the target id, with the visionary's provenance; the parse marks the target ratified from that date; the provenance finding stops; the relation set is amends, reverses, reaffirms, ratifies [I>V]
  sib:   none -- a ratifies entry naming a target that was never inferred is a consistency case not yet ruled, held at handoff
  serves: N12
  touches: D16 D43 D209

D215 2026-09-09 [I>V] amends D146
  resp:  an amends or reverses entry compares its header tag against the highest tag on its target's chain so far — the root and every in-effect amender before it, a ratified amender counting as visionary — and a tag below that is a consistency finding, since an interviewer may not rewrite the visionary and the visionary's word on a ruling holds until the visionary lowers it; the remedy is a visionary ratification of the entry, and a ratification of an amender also ratifies every earlier amender of the same root, since the visionary accepted the restatement that supersedes them; every visionary-tagged amends or reverses entry is listed by id on the report beside the ratified line; reaffirms and ratifies are exempt [I>V]
  ->     structural
  serves: N12
  touches: D146 D177 D209

D216 2026-09-09 [I>V] amends D155
  resp:  the parse derives, and never writes, a `SHA-256` hash of each entry's canonical text and a chain hash over the docket in file order, carried as fields of the tree so git, the journal, gherkin-trace, and audit can corroborate a docket across snapshots without trusting its text; the docket itself carries no hash line, so the grammar is unchanged and the interviewer has nothing to recompute; the hash comes from the runtime's built-in crypto, no dependency [I>V]
  ->     structural
  serves: N2 N12
  touches: D155 D176 D209

D217 2026-09-09 [V] ratifies N6
  resp:  the spread need stands as N6 states it at its drafted weight, the visionary knowing the house docket has never carried a braced island or a spread line: every quantity and enumeration given is spread into its cases, and the ones that were not are visible [V]
  touches: N6 N0 D20 D181

D218 2026-09-09 [I>V]
  resp:  the README, the tool's own help text, and the scope skill's workflow each recommend running the lint on every chat cycle, as a continuous-integration test of the record, and not only at handoff; the recommendation is one sentence beside the invocation in each place [I>V]
  ->     structural
  serves: N2
  touches: N9 D12 D110 D157
# roads not taken: a watch mode or a hook that runs the lint itself — a mechanism the operator did not ask for; the recommendation only at handoff in the scope skill, which is where N9 says it is not enough

D219 2026-09-09 [I>V] amends D20
  trig:  a slot's prose contains a quantity, a list, or a literal [I>V]
  resp:  a quantity is written as a braced island and the parse holds it as a quantity node; a braced island whose members are separated by pipes is a list node holding its members; a quantity or list node no spread references is an exact finding, in a need slot as in any other, so an N entry admits spread lines and a need's islands are spread by a scenario outline somewhere in the corpus; a spread line names one outline title and an entry may carry several; the outline skeleton for a list carries one row per member; a span in backticks is a literal node — a version, a standard, an identifier, a unit-bearing figure that is not a quantity — and the lint reads nothing from it; a token of one uppercase letter followed by digits is exempt by pattern, whether a docket id or an alias; every other digit run outside braces and backticks is a lexical near-miss finding, decimals and glued units included, with no heuristic about letters, hyphens, or dots; the near-miss reads only the effective text of each chain, since a superseded line's prose is history with no remedy left, while structural checks read every line; numbers and lists written as plain words stay invisible by rule [I>V]
  sib:   none -- the bare digit run is the failure case and is named in this entry
  serves: N6
  touches: D20 D181 D217

# 2026-09-09 — drafted after the INCOSE review and the walk of its takeaways (agent-bdd-research/paper/notes-incose-20260909.md, W5, W12, W15); each put to the visionary as an option and accepted, the slot text below is the interviewer's; ratified 2026-10-05 by D228–D232. Three drafts of the same sitting — D224 (hash-pinned citations, W14), D226 (the handoff reading the new counted lines), D227 (the house-numbers pass, W16) — were lifted unratified on 2026-10-05 to docs/lifted-drafts-20260909.md before anything was committed; their ids are not reused.

D220 2026-09-09 [I] amends D219
  trig:  a slot's prose contains a quantity, a list, or a literal [I]
  resp:  a quantity is written as a braced island and the parse holds it as a quantity node; a braced island whose members are separated by pipes is a list node holding its members; a quantity or list node no spread references is an exact finding, in a need slot as in any other, so an N entry admits spread lines and a need's islands are spread by a scenario outline somewhere in the corpus; a spread line names one outline title and an entry may carry several; the outline skeleton for a list carries one row per member; a span in backticks is a literal node — a version, a standard, an identifier, a unit-bearing figure that is not a quantity — and the lint reads nothing from it; a token of one uppercase letter followed by digits is exempt by pattern, whether a docket id or an alias; every other digit run outside braces and backticks is a lexical near-miss finding, decimals and glued units included, with no heuristic about letters, hyphens, or dots; the near-miss reads only the effective text of each chain, since a superseded line's prose is history with no remedy left, while structural checks read every line; numbers and lists written as plain words stay invisible by rule; a braced island whose text carries the token `TBD` or `TBR` is an unresolved quantity — `TBD` a value nobody has yet, `TBR` a stated value held with low confidence — the token is lexical, the parse marks the node unresolved, and the coverage layer counts unresolved quantities on a counted line, never a finding; the owner and date of a resolution live in the fence's Deferred entry, whose reopening condition is the entry's trigger [I]
  sib:   none -- the bare digit run is the failure case and is named in this entry
  serves: N6
  touches: D219 D118 D160
# roads not taken: a confidence field beside the provenance tag; a TBX register as a sixth deliverable; nothing, confidence in a value left to the journal

D221 2026-09-09 [I] amends D118
  resp:  a spread line clears a quantity only when traceability has confirmed the outline; with no corpus given, the coverage layer reports the entries on a spread-unverified line instead of clearing them; an island carrying `TBD` or `TBR` is reported on the same spread-unverified line whatever the corpus holds, never cleared while the token stands, because an outline over a value nobody has asserts cases of nothing; nothing is a finding in isolation [I]
  ->     structural
  serves: N6 N2
  touches: D118 D220 D151
# roads not taken: a TBD island exempt from the spread demand; a TBD island cleared by any outline

D222 2026-09-09 [I] amends D72
  trig:  the visionary says yes to an entry that entered as interviewer-inferred, or to one whose provenance was lost [I]
  resp:  a new dated entry carrying ratifies and the target id, with the visionary's provenance in its header; the parse marks the target ratified from that date; only a ratifies entry tagged V silences the provenance finding on its target; a ratifies entry with any other tag is a consistency finding and silences nothing; any target tag may be ratified; the relation set is amends, reverses, reaffirms, ratifies, signs [I]
  sib:   none -- the non-visionary ratification is the failure case and is named in this entry
  touches: D72 D168
# roads not taken: a gate resolution kind, refused as too strong by the visionary; a structural ruling by convention with no consumer

D223 2026-09-09 [I]
  trig:  the visionary has read the contract and signs it [I]
  resp:  a new dated entry tagged V carrying signs and the id of the last entry in effect at the read; it means the record as of its date was read and signed by the visionary; only a V entry may sign, a signs entry with any other tag is a consistency finding and signs nothing; a signs entry is a relation entry and needs no resolution, and its target may be any entry in effect; the parse marks every entry in effect as of that date signed, and the as-of parse at that date is the signed state, the chain hash at that date its fingerprint, derived and never written; every report carries a signed line listing each signs entry by id, target, and date, beside the ratified line; the scope skill's handoff writes the signs entry after the read, not before [I]
  sib:   none -- the non-visionary signature is the failure case and is named in this entry
  serves: N12 N8
  touches: D222 D154 D155 D47 D71
# roads not taken: the sign-off in DESIGN.md's changelog and the run record only, which no lint reads

D225 2026-09-09 [I] amends D169
  resp:  the entry shape as rendered is the grammar — header with id, date, provenance, optional unwanted mark, optional relation, the mark and the relation accepted in either order and emitted mark-first by the formatter; slots pre, trig, resp each with one tag; a why slot, one tag, holding the origin of a quantity in the entry's own slots — what the number was derived from, or who set it and on what — required where a braced quantity sits in a slot tagged below V, admitted beside a visionary-tagged quantity as the visionary's own account, and rendered beside the ruling in the ledger and design skeletons; an interviewer-supplied quantity with no why is counted on a counted line, never a finding; sib; spread; a typed resolution introduced by the arrow; serves; touches; hash notes; N entries with beneficiary and weight, a need slot, an optional means slot, relations, and tension lines; braced quantities and lists; an entry carrying a relation needs no resolution line, the relation is its resolution; the header tag is the entry's summary and equals its lowest slot tag on the rank lost, inferred, accepted, corrected, visionary, so a header above its lowest slot is a consistency finding; the distribution line counts slots only, across the five tags [I]
  ->     structural
  serves: N6 N4
  touches: D169 D199 D70 D219 D220
# roads not taken: a why note by convention, refused as an untagged channel the renderer never reads; a why on every ruling; nothing, the journal as the carrier — tested on D69's three-word floor, whose origin was recoverable only by raw database access to another repository's store and still held no why

# 2026-10-05 — the visionary lifted the September hold: a junior team enters a 24h hackathon on 2026-10-17 to stress-test the toolchain and wants a public install by 2026-10-12; docketry 0.1.0 ships as a proof-of-concept alpha with the five drafts below ratified and built, pins and the house-numbers pass deferred

D228 2026-10-05 [V] ratifies D220
  resp:  the unresolved quantity stands as D220 drafts it: a braced island carrying TBD or TBR is a quantity nobody has or holds with low confidence, counted on its own line and never a finding, its owner and date in the fence's Deferred entry [V]
  touches: D220 D219 D217

D229 2026-10-05 [V] ratifies D221
  resp:  stands as drafted: no outline clears an unresolved quantity while the token stands, and it is reported on the spread-unverified line whatever the corpus holds [V]
  touches: D221 D220 D118

D230 2026-10-05 [V] ratifies D222
  resp:  stands as drafted: the visionary may ratify any target tag, only a V ratifies entry silences, and the relation set gains signs [V]
  touches: D222 D72

D231 2026-10-05 [V] ratifies D223
  resp:  stands as drafted: the signs entry is the visionary's own record of having read the contract, written by the handoff after the read and never before, the signed line beside the ratified line on every report [V]
  touches: D223 D222 D154

D232 2026-10-05 [V] ratifies D225
  resp:  stands as drafted: the why slot carries the origin of a quantity in the entry's own slots, owed by the interviewer's numbers and not by the visionary's, counted when missing and never a finding [V]
  touches: D225 D169 D220

D233 2026-10-05 [I>V]
  trig:  an amendment or a reversal in a scoped corpus leaves a citation on a deliverable — a scenario tag, a fence parenthetical, a ledger evidence id, a ruled tag — pointing at a shape that no longer stands, and the lint did not name it [I>V]
  resp:  hash-pinned citations — the id, a hyphen, and the first six hex of the cited chain's effective entry hash on every citation outside the docket, a stale pin a traceability finding, an unpinned citation counted and refused under strict — are deferred to the next grammar; the draft is D224 as lifted to `docs/lifted-drafts-20260909.md`; the reopening evidence is the first stale citation a scoped corpus shows after an amendment, the hackathon corpora of `2026-10-17` being the first field data; until then, a citing surface is re-read by hand after each amendment, as the touches line of D110 directs [I>V]
  ->     fence-deferred pinned-citations
  serves: N12
  touches: D172 D155 D223 D110
# roads not taken: pins shipped in 0.1.0 against a seven-day clock, refused as a change to every citing surface in the scope skill and the house corpus that a junior team's 24h build would then see go stale on every amendment
