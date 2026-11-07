# Changelog

Each release is named by the rulings it built; the ids are entries in
`features/DOCKET.md`, the record of the interview that scoped this tool.
Before 1.0 a grammar or findings-format major may bump between package
minors; the bump ships its migration (D39, D59).

## Unreleased

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
