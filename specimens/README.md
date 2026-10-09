# Specimens — the gamed dockets of the pre-build reviews

Acceptance fixtures for `features/the-probes-still-fire.feature` (D187).
Each directory is one docket with the corpus it was gamed against —
`DOCKET.md`, `archive.feature`, `DESIGN.md`, `OUT-OF-SCOPE.md`,
`USER-NEEDS.md` — copied verbatim from the owner's research record
(the pre-build review record of 2026-09-05 to 2026-09-07, its third and
fourth addenda). They live outside `features/` so the runner
never reads their feature files as the corpus.

| Specimen | What it games | Expected findings (key, layer, firing ruling) |
|---|---|---|
| A | the boundary sink — every ruling resolved to boundary to escape a destination | R2, R3, R4 coverage (D148); scenarios "a file is stored" and "listing" traceability (D163) |
| B | the realistic hollow — a backdated ratification, an interviewer rewriting the visionary, a borrowed outline, one boundary | R9 form (D147); R8 coverage (D148); R7 consistency (D177); R5 traceability (D151) |
| C | the controls — one deliberate defect per check | R4 form (D68); R4, R6 coverage (D148); R5 coverage (D114); N0 coverage (D108); R2 consistency (D177); R5 traceability (D24); "read-only" and the design tag citing reversed R1 (D24, D77) |
| D | the second hollow — five edits and one decimal point against lint-r4 | "R1 resp" form (D181); R7 on the visionary-tagged relations line; "R11 for R10" on the de-triggered line |

The expectations were first produced by the throwaway `lint-r6.py`, a
reading of the rulings and not the rulings. Where the built lint
disagrees with a row here, the ruling named in the row decides, and this
table is corrected with a dated note — never the ruling.
