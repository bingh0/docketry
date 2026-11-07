# Changelog

Each release is named by the rulings it built; the ids are entries in
`features/DOCKET.md`, the record of the interview that scoped this tool.
Before 1.0 a grammar or findings-format major may bump between package
minors; the bump ships its migration (D39, D59).

## 0.2.0 — beta (2026-11)

Grammar 1, findings format 1, both unchanged; two rule words join the
traceability layer additively (D39). A corpus clean under 0.1.0 can fail
0.2.0 strict in three ways: a declined entry's guardian that the corpus
lacks, a guard phrase in a spelling the one form does not read, and a
scenario tagged with a bare ratifies, reaffirms, or reverses entry were
each silent and are now findings. The house fence itself had two such
guardians.

- **The guard contract** (D234, amends D68): a Declined entry's guardian
  joins through the ruling that enforces the decline, cited beside the
  fence ruling, never through the fence id, which no scenario may carry
  (D163). `guard-untagged` is one finding per guardian, keyed by the
  fence ruling; its fix names an enforcing ruling to tag, or the citation
  to add when the entry cites none. Before, the fix named the fence id,
  and following it produced `scenario-mis-kinded`
  (`docs/guard-untagged-vs-mis-kinded-2026-11-07.md`). The house fence has
  used the ruled form since 2026-09-04; no corpus in that form changes.
- **A guardian the corpus lacks** (D235): a `Guarded by:` title matching
  no scenario was silent, the one way to disable a guard with no finding.
  It is now `guard-no-scenario`, keyed by the fence ruling, by exact title
  as a spread's outline is; with no corpus the guard stays dark. Its
  first run over the house fence found two of its sixteen guardians
  disconnected since the 0.1.0 root commit: the fence said "the four"
  where the scenario reads "the five", and "a Gherkin keyword…" where
  the outline reads "each Gherkin keyword…". Both titles are corrected
  in `features/OUT-OF-SCOPE.md`, and the first entry now cites D78
  beside D15, since the renamed scenario proves D78's refusal.
- **One form for the guard phrase** (D236): `Guarded by:` with
  straight-quoted titles, one comma or none between, before the
  parenthetical. A guard claim, the phrase with its colon or the phrase
  followed by a quoted title, that the one form reads short — the
  phrase in another case or with other whitespace between its words, a
  missing colon or a space before it, double-curly, backtick, single,
  or single-curly quotes, a semicolon or an `and` between titles, a
  space before a comma, or no quoted title at all — was silent and is
  now `guard-near-miss`, keyed at the entry; prose that merely says
  guarded by is no claim, and the words inside a named title are no
  second claim. A title the corpus holds in two files is satisfied by
  either scenario carrying the tag, where before the last file read
  decided. A Declined entry in the one form on a bold-topic bullet,
  where gherkin-trace looks, with one `Guarded by:` phrase and
  single-spaced titles, reads the same in gherkin-trace. Outside the
  form the two differ: gherkin-trace reads the phrase in any case
  or whitespace, and a semicolon or an `and` between titles, as guards,
  which docketry reports; docketry reports the other quote styles, a
  missing colon or a space before it, and a claim with no quoted title,
  which gherkin-trace does not read; two `Guarded by:` phrases in one
  entry are two guardians in docketry and one in gherkin-trace, and a
  guard outside Declined is read here and not there.
- **`--help` and `--version` exit zero** (D237), with `-h` and `-v` as
  their short forms: a question the tool answered is a run that ran;
  both print to stdout, as the first argument; after a command the same
  words are that command's arguments. No command, an unknown command,
  or a command with no docket path still prints the usage to stderr and
  exits two, and a docket path that is not there is still refused by
  name.
- **A spread's outline held twice** (D238, amends D151): any outline of
  that title carrying the tag satisfies the spread, where before the
  last file read decided — the same correction D236 made for guardians.
- **A relation entry with no trigger or resolution of its own is a
  mis-kinded scenario tag** (D240, amends D163): the check had read
  "triggered, structural, or means" as "no resolution", so a bare
  ratifies, reaffirms, reverses, or signs entry, or an amender of one,
  could carry a scenario. A root whose amender dropped the resolution
  line is not this case: it is the resolution layer's `unresolved`
  finding already, and its tag is not reported twice; such a root also
  enforces no decline, so a guardian carrying only its tag is
  `guard-untagged`. No house or specimen scenario is affected; one field
  corpus had two scenarios tagged with a bare ratifies entry, and they
  are findings there now.
- **Deferred** (D239): guard spellings outside D236's enumeration, with
  the reopening condition in the fence and the list in the field report.
- **CI**: the lanes match gherkin-node-test's — Node 22.17 exact, 24
  and 26 — and the tarball smoke lints the house docket with its corpus,
  so the traceability layer runs in the installed binary. Dev
  dependencies: oxlint 1.92.0, vitest 5.1.0.

## 0.1.0 — beta (2026-10)

The first public release: grammar 1, findings format 1. A
proof-of-concept beta with no compatibility promise beyond the one above.

- **The grammar and the lint** (D1–D219, scoped 2026-09-04 to 2026-09-09):
  the entry shape, five provenance tags, seven resolution kinds, the
  relations, braced quantities and lists, six layers — form, provenance,
  resolution, coverage, consistency, traceability — counts, never
  verdicts; `parse`, `lint`, `format`, `render` in-process and on the
  command line; the one-screen `GRAMMAR.md`; the four gamed dockets as
  acceptance specimens; the house docket as the grammar's first specimen.
- **Unresolved quantities** (D220, D221): a braced island carrying `TBD`
  or `TBR` is a quantity nobody has yet; counted on its own line, never a
  finding, never cleared by an outline while the token stands.
- **The signs relation** (D222, D223): a `[V]` entry naming the last entry
  in effect when the visionary read the contract; every entry in effect
  at that date is marked signed, the report carries a signed line beside
  the ratified line, and a signs entry under any other tag is a
  consistency finding that signs nothing.
- **The why slot** (D225): the origin of a quantity in the entry's own
  slots, owed by the interviewer's numbers and not the visionary's;
  counted when missing, rendered beside the ruling in the ledger and
  design skeletons.
- **Deferred** (D233): hash-pinned citations, drafted after the INCOSE
  review and held for the next grammar; see the fence and
  `docs/lifted-drafts-20260909.md`.
