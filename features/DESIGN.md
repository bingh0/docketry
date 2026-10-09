# DESIGN — the docket lint

The orienting document for the build agent. Highest altitude only: what
the tool is, the shape it must keep, the constraints it must not cross.
Every constraint carries `ruled` (the visionary's, citing its docket
entry, elective, or need) or `chosen` (the agent's call). The feature
files bind; this document explains. Nobody edits it outside a
discussion; every change appends a changelog line naming its ruling.

## Identity

- The second member of the aBDD grammar-and-linter family, after the
  Gherkin linters in gherkin-node-test and gherkin-cargo-test. A grammar
  for the interviewer's ruling record — the docket — and a lint that
  counts its failures. Counts, never verdicts. [ruled: D1, N0]
- The grammar is simple, unambiguous, closed: prose lives only inside
  slots; every other field is an enumerated set. [ruled: D2, D15]
- The entry shape is fixed: a header (id, date, provenance, optional
  unwanted mark, optional relation), slots `pre` / `trig` / `resp` with
  one provenance tag each, `sib`, a typed resolution, `touches`; need
  entries with beneficiary and weight. Slot keywords are the docket's
  own, never Given, When, or Then. [ruled: D21, D18]
- The parse is first-party: a declared output with a versioned format,
  the surface agents and family members walk. [ruled: D13, D25]

## Shape

- One package, standing alone: parse, five lint layers, format, and
  render need nothing installed but the tool. gnt is an optional peer,
  loaded only by the traceability layer to read scenario tags. Coupling
  to gnt is by stable ids, declared formats, lint-admission tests, and
  message doctrine — never by import. [ruled: D41]
- Four exported functions — `parseDocket`, `lintDocket`, `formatDocket`,
  `renderDocket` — and a thin CLI over them with subcommands of the same
  names. [ruled: D42]
- Three declared surfaces: the docket text; its parse as an addressable
  graph (`{"docket":1}`); findings with entry-and-slot keys
  (`{"docket-findings":1}`). Findings point into the docket; consumers
  read findings first and open the docket only where a finding points.
  The README, the tool's help text, and the scope workflow each
  recommend running the lint every chat cycle, a continuous-integration
  test of the record, not only at handoff. [ruled: D12, N2, D218]
- Six lint layers — form, provenance, resolution, coverage, consistency,
  traceability — each a group in the report; a layer with no input
  reports dark, never zero. The content layer is judgment and stays
  outside. [ruled: D6, D22]
- Two modes, one bit: default reports everything and exits zero; strict
  exits one on any finding; nothing is ever hidden or demoted in either
  mode. Exit family: 0 ran, 1 strict findings, 2 could not run.
  [ruled: D10, D11, D26]
- Read-only and stateless: the lint never writes an input and keeps
  nothing between runs, so any cadence works. The formatter is the one
  deliberate writer, only when invoked. Render emits to a new path or
  standard output, never over an existing file. [ruled: D8, D30, D29,
  D40, D42]
- The docket is append-only and dated; effective state is derived by
  walking typed relations (amends, reverses, reaffirms, ratifies),
  optionally as of a date. An entry carrying a relation needs no
  resolution. An amends entry restates its target in full and that
  restatement is the target's effective shape for every layer; the
  parse carries it on the amended node. Relations point backward only;
  an entry is in effect unless an in-effect entry reverses it; the
  default as-of date is the docket's latest entry date, never the clock.
  Only a ratifies entry tagged V silences a provenance finding.
  [ruled: D16, D43, D47, D57, D65, D71, D72]
- A hash line inside an entry is a note on that node, kept by the parse
  and ignored by the lint; between entries it is a dropped file comment.
  [ruled: D70]
- A sib-none reason is tested by a word floor of three, nothing more.
  [ruled: D45, D69]
- Kind implies destination: triggered entries land in scenarios by tag,
  needs in the ledger, fence kinds in the fence, structural and means in
  this document's `ruled` tags. A resolved entry is never counted as
  triggered; only fence kinds may carry a trigger, and there it is the
  reopening or failure condition. The renderer writes those citations;
  traceability checks them. [ruled: D23, D24, D68]
- The resolution set is seven kinds: boundary, structural, means, need,
  fence-declined, fence-deferred, fence-assumption. Need, means, and the
  fence kinds carry a reference; boundary and structural carry none, and
  a reference in the wrong place is a form finding; a fence kind may
  carry a label the lint ignores. A kind outside the seven refuses the
  docket. [ruled: D15, D28, D64, D67, D76]
- The docket id is the only join key, in both directions: scenario tag,
  fence parenthetical, ledger N id, ruled tag. A ruling id is one
  uppercase letter other than N plus digits, one letter per docket; ids
  outside the pattern are listed as not counted. Fence entries, ledger
  rows, and ruled tags citing a missing, reversed, or mis-kinded id are
  traceability findings; an untagged scenario is one too. Declined,
  Deferred, and Named-assumption entries are kind-strict; Roads-not-taken
  and Out-of-reach cite any in-effect id; a citation of any entry in an
  amendment chain joins the chain. [ruled: D23, D77, D80, D88]
- Electives are the means rulings D49 to D53; the E numbering is a
  prose alias, never a key. [ruled: D117]
- Without a corpus, spread lines are reported unverified, never cleared.
  [ruled: D118]
- Five provenance tags: V, I>V (accepted as drafted), I+V (corrected
  then accepted), I, ?. [ruled: D15, D119, D120]
- An amends or reverses entry tagged below its target is a consistency
  finding: an interviewer may not rewrite the visionary. Dates never
  decrease in file order. A scenario may cite a triggered, structural, or
  means ruling, never a need, a boundary, or a fence kind. Boundary
  rulings, like structural ones, name the need they serve. A digit run
  joined to a letter prefix by nothing, a hyphen, or a dot is a token.
  [ruled: D146, D147, D148, D149, D162, D163]
- A relation entry compares against the highest tag on its target's
  chain, ratified amenders counting as visionary; visionary-tagged
  relation entries are listed by id. Reversals of triggered entries join
  the de-triggered line, emitted on every run. A scenario may not cite a
  ruling that resolves to a need. An amender restates the whole chain,
  never the root alone. [ruled: D165, D166, D167, D168–D171]
- A spread is confirmed only by an outline carrying the entry's tag. The
  trailing entry is incomplete only when it lacks response, touches, or
  trigger-or-resolution-or-relation, and only the missing-line findings
  are held. The precondition fix says "add the trigger". Every report
  lists its ratifications by id, target, and date. [ruled: D151, D152,
  D153, D154]
- The parse derives a SHA-256 hash per entry and a chain hash over the
  docket, never written into it; built-in crypto. [ruled: D155]
- Every report lists de-triggering amendments; the scope skill's handoff
  reads the counted lines aloud. What the lint counts but cannot judge
  is named on the fence and routed to audit. [ruled: D156, D157, D158,
  D159]
- A Deferred or Named-assumption skeleton carries the entry's trigger
  as its reopening condition. [ruled: D160]
- A `serves:` line on any ruling names the needs it serves; a triggered
  ruling keeps its trigger. A need nothing serves, and a structural
  ruling serving nothing, are coverage findings; a need served only by
  fence kinds is listed as fenced. [ruled: D108, D109]
- A chain of amendments resolves to the last amender still in effect;
  reversing an amendment restores what stood before it. [ruled: D65,
  D113]
- An unwanted entry no wanted entry names is a coverage finding; a
  sibling carrying inferred or lost slots is counted on a
  covered-by-inferred line. [ruled: D114, D115]
- N entries admit the four relations and a `tension:` line; the ledger's
  tensions are rendered from it. [ruled: D116]
- `touches` is the re-examination set: the entries a change to this one
  would disturb. The parse exposes it inbound; the lint infers nothing
  from it. [ruled: D110]
- The ledger row of a need is the destination of every ruling resolving
  to that need; boundary rulings have none, and the not-counted list is
  a declared surface with a per-kind count. [ruled: D111]
- A quantity in a need slot is spread like any other; N entries admit
  spread lines; one spread line names one outline. A braced island with
  pipe separators is a list node, spread like a quantity, rendered one
  outline row per member. [ruled: D20, D66, D91, D121]
- A keyword line is a single word followed by a colon at slot indent;
  any other indented line is stray. An unknown member of any closed set
  refuses the docket; a missing member is a finding. The trailing entry
  is incomplete when it lacks response, touches, or resolution-or-
  relation, and only that finding fires on it. [ruled: D28, D34, D78]
- Finding keys are the entry id, a space, and the slot word; report
  lines are specified by content, and only the declared machine formats
  are exact. [ruled: D22, D33, D79]
- Every failure-case scenario is tagged with an entry marked unwanted;
  a wanted entry's tag covers only wanted behaviour. [ruled: D80, D81,
  D82, D83, D84, D85]
- A precondition requires a trigger; an inferred or lost slot is a
  provenance finding until the visionary ratifies; an untriggered,
  unrelated entry must resolve. [ruled: D74]
- The header tag is the entry's summary and equals its lowest slot tag;
  mark and relation are accepted in either order. [ruled: D21, D73]
- Skeleton outlines carry two placeholder rows and skeleton scenarios
  take their trigger text as title, the id appended only on a clash.
  [ruled: D42, D75, D84]
- A backticked span is a literal node the lint never reads; a token of
  one uppercase letter plus digits is exempt by pattern; every other
  digit run outside braces and backticks is a near-miss, decimals and
  glued units included. No letter, hyphen, or dot heuristics.
  [ruled: D20, D173]
- The package is `docketry`, published as `@bingh/docketry`; the bin is
  `docketry`, and `docket` is an alias the operator may add. It lives in
  its own repository and the scope skill grounds against its version.
  [ruled: D54, D107, D143, D145]
- The aBDD destination table is a profile over the core; the core never
  imports it. [ruled: D144]
- The docket of a scoped project lives at `features/DOCKET.md`, a fifth
  surface beside fence, ledger, and design doc; the scope validation
  script runs the docket lint strict as a fifth refusal. [ruled: D31]

- The one-screen grammar reference ships as `GRAMMAR.md` in this
  repository, explanatory where the features bind; its closed sets and
  rule words are typed from the docket and held equal to the parser's by
  scenario; the scope companion points at it by version. [ruled: D182]
- Rule words are a closed set per layer, declared in the findings format
  and frozen within its major. [ruled: D183]
- Lexical floor: UTF-8; a byte-order mark dropped; CRLF read as LF and
  written as LF; slot indent is two spaces and any other indent is a
  stray line; a blank line ends an entry. [ruled: D184]
- The canonical text a hash covers is the formatter's output; canonical
  form is frozen within a grammar major; formatting moves no hash.
  [ruled: D185]
- A refusal collects every tree-breaking defect one pass can find; a
  version-line defect is reported alone. [ruled: D186]
- The gamed probes and the house docket are acceptance specimens under
  `specimens/`, outside the corpus root, asserted by key and firing
  ruling, never by count. [ruled: D187]
- The parser is hand-written and line-oriented — a classifier of line
  kinds and a small state machine per entry — with no parser generator,
  since the grammar has no nesting and no expressions. [chosen]

- The syntactic specification is its own feature file: every production
  has a positive and a negative scenario with the docket inline as a
  one-column step table, indent written as one open-box glyph per space
  and an arrow glyph for a tab; the step layer constructs nothing there.
  [ruled: D194]
- Finding keys: entry id plus slot word whenever a slot applies, a need
  slot included; a reversed citation is keyed by the entry; a missing or
  mis-kinded citation by its location. A destination with no input is
  named dark on the traceability row. [ruled: D195]
- Canonical form: slot text begins at the tenth column, or after one
  space when the keyword is longer; mark before relation. [ruled: D196]
- The not-counted line carries every docket-settled kind on every run;
  deliverable-settled kinds only when that deliverable was read.
  [ruled: D197]
- Fence sections: Declined, Deferred, Named assumptions kind-strict;
  Out of reach, Roads not taken, Sanctioned changes existence-only. A
  scenario with no ruling-id tag is untagged whatever else it carries.
  [ruled: D198]
- Notes are part of an entry's canonical text and hash; ledger rows are
  rendered with the need id in bold, read bold or plain. [ruled: D199]
- A braced island carrying `TBD` or `TBR` is an unresolved quantity: the
  parse marks the node, the coverage layer counts it on its own line,
  never a finding, and no outline clears it while the token stands; with
  or without a corpus it sits on the spread-unverified line. The owner
  and date of its resolution live in the fence's Deferred entry.
  [ruled: D220, D221]
- The relation set is five: amends, reverses, reaffirms, ratifies,
  signs. Any target tag may be ratified; only a `[V]` ratifies entry
  silences. A `[V]` signs entry marks every entry in effect as of its
  date signed; the as-of parse at that date is the signed state and the
  chain hash at that date its fingerprint; a signs entry under any other
  tag is a consistency finding and signs nothing; every report carries a
  signed line beside the ratified line. The scope skill's handoff writes
  the signs entry after the read, never before. [ruled: D222, D223]
- A `why` slot, one tag, holds the origin of a quantity in the entry's
  own slots: owed where a braced island sits in a slot tagged below V,
  admitted beside a visionary quantity as the visionary's own account,
  counted when missing and never a finding, rendered beside the ruling
  in the ledger and design skeletons. The header tag equals the lowest
  slot tag, the why included. [ruled: D225]
- Hash-pinned citations are deferred to the next grammar; until the
  first stale citation a scoped corpus shows, a citing surface is
  re-read by hand after each amendment. [ruled: D233]

## Constraints the build must not cross

- No inference in any check: siblings by explicit link, quantities by
  braced syntax, provenance by tag. A bare digit run or a vacuous reason
  is a form finding, not a guess. [ruled: D14, D20, D45]
- Every finding states its line, what was found, and the one correct
  form. [ruled: D33]
- A new check enters only through gnt's four lint-admission tests with a
  field specimen, additively within a grammar major; a breaking grammar
  change bumps the major and ships a migration the operator runs
  deliberately. [ruled: D37, D39, D59]
- Slot prose is inert to the lint; no check reads meaning from it.
  [ruled: D36]
- Docket ids as citations extend the scope skill's `ruled` tag grammar:
  a tag may cite a docket entry (`D41`) beside an elective (`E1`) or a
  need (`N0`), and the post-draft pass checks docket citations against
  `DOCKET.md`. [ruled: D77]

## Toolchain (electives)

- TypeScript; the typed tree is the deterministic surface; publishes
  JavaScript plus declaration files. [ruled: D49]
- vitest, through gnt's shipped vitest binding for the feature corpus,
  and for unit tests beside it. [ruled: D50]
- zod at the declared-format boundary only — findings JSON, tree JSON,
  the version line — the sole runtime dependency. [ruled: D51]
- oxlint with correctness, suspicious, and pedantic as deny; restriction
  as warn, rules promoted into deny as they earn it, never demoted; the
  type-aware backend's state checked at build. [ruled: D52]
- Latest versions at pinning, then pinned exactly and bumped
  deliberately; node engine floor equals gnt's. [ruled: D53]
- A compiler, not a bundler: plain tsc unless dual module output forces
  a thin build tool. [chosen]

## Changelog

- 2026-09-04 — initial draft (scope interview; electives E1–E5; docket
  D1–D53). Reviewed interactively at handoff.
- 2026-09-05 — review rulings D57 (a relation stands in for a resolution), D58 and D59 (D9 to boundary, D39 to structural).
- 2026-09-05 — review rulings D60–D62 (D54–D56 ratified), D63 (no road-not-taken kind until D55 reopens), D64 (the seven resolution kinds enumerated).
- 2026-09-05 — pre-build ruling pass after the cold review: D65 (amends restates in full; effective shape on the parse), D66 (letter-prefixed digit runs are tokens), D67 (means carries a need reference; misplaced references are form findings), D68 (resolution wins over trigger; only fence kinds carry a trigger), D69 (vacuous reason = word floor), D70 (hash lines are notes), D71 (in-effect algorithm; latest-date default), D72 (only V ratifies).
- 2026-09-05 — D73 (header order either way; header tag = lowest slot), D74 (pre needs trig; layer rules stated), D75/D84 (skeleton rows and titles), D76 (fence label optional), D77 (the id is the only join key, both directions), D78 (lexing and severity policy; incomplete defined), D79 (finding keys; strings are contents), D80 (unwanted scenarios need unwanted entries), D81–D83 (missing-path and overwrite siblings), D85 (D10 is a mode, not a failure case), D86–D87 (fence entries given rulings, inferred).
- 2026-09-05 — D88 (fence sections: three kind-strict, two existence-only; chain citations), D89–D90 (D86–D87 ratified), D91 (needs spread too), D92–D106 (the fifteen Declined fence entries as fence-declined rulings).
- 2026-09-05 — D107 (the package is docketry; the package-name deferral leaves the fence).
- 2026-09-05 — second ruling pass after the AST review: D108 (serves line; unserved need is a finding), D109 (structural without a need is a finding), D110 (touches defined as the re-examination edge, exposed inbound), D111 (ledger row is the need-kind destination; not-counted is a declared surface), D112 (shape gains serves), D113 (effective shape follows the last in-effect amender), D114 (orphan unwanted entries are findings), D115 (covered-by-inferred line), D116 (needs admit relations and a tension line).
- 2026-09-06 — D117 (electives are docket rulings; E is an alias), D118 (spread unverified without a corpus), D119 (fifth tag I+V), D120 (shape and rank updated).
- 2026-09-06 — D121 (pipe-separated braced lists), D122–D132 (serves lines on every structural ruling, mapping ratified), D133–D135 (wanted parents for the three orphan failure cases).
- 2026-09-06 — D136 (a ledger row cites what resolves to or serves its need), D137–D142 (serves lines on the rulings the ledger cites as evidence).
- 2026-09-06 — D143 (own repository, own package), D144 (the aBDD destination table is a profile over the core; second profile deferred).
- 2026-09-06 — D145 (published under the @bingh scope; npm refused the bare name).
- 2026-09-06 — third ruling pass after the gaming review: D146 (rewrite rank), D147 (date monotonicity), D148 (boundary requires serves), D149 (scenario mis-kind), D150 (D4 gains its serves line).
- 2026-09-06 — D151 (spread joins by tag), D152 (incomplete redefined; suppression narrowed), D153 (one remedy for a bare precondition), D154 (ratified line on every report).
- 2026-09-06 — D155 (derived SHA-256 hashes on the parse), D156 (de-triggered line), D157 (handoff reads the counts), D158–D159 (claims and the deferred escape named), D160 (deferred skeletons carry the trigger).
- 2026-09-06 — D161 and D164 (D58 and D44 ratified under D146), D162 (hyphen and dot tokens), D163 (D149 narrowed: structural and means citations are legal).
- 2026-09-06 — fourth pass: D165 (comparand = highest tag on the chain), D166 (reversals on the de-triggered line), D167 (need-kind rulings not citable), D168–D171 (chains consolidated: D15, D21, D22, D28), D172 (boundary wording).
- 2026-09-07 — D173 (escaping replaces token heuristics), D174 (D170 ratified), D175–D176 (the house's own bare tokens backticked).
- 2026-09-07 — D177 (a ratification reaches the earlier amenders of its root), D178–D180 (D63, D123, D137 ratified).
- 2026-09-07 — D181 (near-misses read effective text only).
- 2026-09-07 — D182–D187 drafted [I] after the DSL-lens review (grammar reference in-repo, closed rule words, lexical floor, canonical text, refusal collection, acceptance specimens); the house docket is red on provenance until the visionary ratifies them.
- 2026-09-07 — D188–D193 (D182–D187 ratified by the visionary; the house docket is clean again).
- 2026-09-07 — walk-through rulings D194 (syntax file with inline dockets), D195 (keys and dark destinations), D196 (aligned canonical form), D197 (not-counted every run), D198 (sanctioned changes; ruling-id tags), D199 (notes hashed; bold ledger rows).
- 2026-10-05 — the September hold lifted for a proof-of-concept alpha: D220–D223 and D225 ratified as drafted (D228–D232) and built — unresolved quantities `TBD`/`TBR`, the `signs` relation and the signed line, the `why` slot and its counted line; D224, D226, D227 lifted unratified to `docs/lifted-drafts-20260909.md`; pins fenced as Deferred (D233).
- 2026-09-09 — the nine needs drafted 2026-09-08 put to the visionary: D203–D209 and D217 (N4–N8, N10–N12 and N6 ratified as written), N9 corrected by the visionary (opportunity cost; the docs recommend a run per chat cycle), D210–D216 and D219 (serves lines re-pointed to the needs split out of N0), D218 (the per-cycle recommendation in README, help, and the scope workflow).
