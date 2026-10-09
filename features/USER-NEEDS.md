# User needs — docketry

The needs ledger of the docket grammar and its lint. Every need here is
an N entry in `DOCKET.md`, the ruling record of the interview that scoped
this tool, and this file is derived from those entries. The ledger says
who needs what and why. It never says how: the how is ruled in the
docket and explained in `DESIGN.md`. Terms are defined in the README's
glossary.

## Intended use

docketry serves a scoping interview between a human and an agent. The
interview produces rulings, and the ruling record is the one artifact
every later deliverable descends from: the needs, the design
constraints, the out-of-scope fence, and the feature files. The tool
exists so that the record's hidden failures are counted before a human
reviews the contract, and so that a human can trust that what they
ratified is what the build reads.

## Personas

| ID | Persona | Description |
|---|---|---|
| visionary | Visionary | The human whose intent the interview captures. The only one who can ratify a statement as their own. Reviews the contract before the build. |
| reviewer | Contract reviewer | A person reading the interview's deliverables to judge them, without having taken part in the interview. May be the visionary in a second sitting, a colleague, or an adopter evaluating the tool. |
| operator | Operator | The person or agent who runs the lint and reads its report, during the interview and at handoff. |

## User needs

One need per row, keyed by the id the docket first gave it: the persona,
a weight from 1 to 5, the need in the persona's own terms, the context
that made it a need, the docket entries that resolve to it or serve it,
and its coverage status with the feature files that assert it. A row
whose statement was amended names the amending entry; the amendments and
the new needs dated 2026-09-08 are drafted by the interviewer and await
the visionary's ratification.

- **N0** (visionary, wt 5) — *I need to know, for every statement in
  the ruling record, whether I said it or the interviewer supplied it,
  before I ratify the contract.* Context: in the first field test, who
  said what was lost for a fifth of the rulings of a real interview, and
  the loss could not be recovered afterwards. Evidence: D1, D2, D13,
  D49. Coverage: `scenario` — who-said-it.feature,
  the-report-and-its-exits.feature. Statement as amended by N4.
- **N5** (visionary, wt 5) — *I need every behaviour the interview
  ruled on to have been asked its failure case, and to see which were
  not.* Context: a reviewer can spot a wrong scenario and is structurally
  bad at spotting a missing one; the failure case never asked is the
  gap review cannot catch. Evidence: D14. Coverage: `scenario` —
  what-was-never-asked.feature.
- **N6** (visionary, wt 4) — *I need every quantity and enumeration I
  gave to be spread into its cases, and to see which were not.*
  Context: a number or a list stated once in conversation hides its
  edge cases until the build meets them. Evidence: D20, D121, D220,
  D221, D225.
  Coverage: `scenario` — what-was-never-asked.feature,
  rendering-and-formatting.feature.
- **N7** (visionary, wt 4) — *I need to see every statement from the
  interview that never became a need, a constraint, a scenario, or a
  fence entry.* Context: a statement that resolved to nothing is
  intent that leaked; the interview ends with each one either landed or
  fenced. Evidence: D64, D74. Coverage: `scenario` —
  where-each-ruling-landed.feature.
- **N1** (visionary, wt 5) — *I need every question the interview left
  open put in front of me before the build starts, so that I decide it
  and not the build agent.* Context: measure twice, cut once; an
  unsupervised build that meets an open question either stops or
  guesses, and the guess is the visionary's decision taken by someone
  else. Evidence: D50, D52, D53, D9, D10, D31. Coverage: `scenario` —
  the-report-and-its-exits.feature. Statement as amended by N8.
- **N2** (operator, wt 4) — *I need the record's findings to cost so
  little, in time and attention, to produce and to read that I run them
  on every change, every cycle, every question, and not only at
  handoff.* Context: an instrument that is expensive to run or
  to rule on is not run; observability that nobody reads is none.
  Evidence: D12, D51, D47, D22, D218. Coverage: `scenario` —
  the-report-and-its-exits.feature, the-docket-grammar.feature,
  where-each-ruling-landed.feature. Statement as amended by N9.
- **N3** (visionary, wt 3) — *I need every gap the record shows
  phrased as a question I can answer, so that the needs and the design
  grow from what the interview never asked.* Context: the needs that
  shaped one field project most were the ones the interview never asked
  about; a count tells the visionary something is missing, a question
  tells them what to answer. Evidence: D5, D108, D42, D17. Coverage:
  `scenario` — what-was-never-asked.feature,
  rendering-and-formatting.feature. Statement as amended by N10.
- **N11** (reviewer, wt 3) — *I need to understand what the record is,
  what was checked, and what was not, from the ledger and the README
  alone, without reading the record itself.* Context: the first readers
  outside the interview, on 2026-09-07, found the needs unreadable and
  could not tell the needs from the design; the README preamble and
  glossary are the response. Evidence: D157. Coverage: `partial` — the
  README carries the explanation; no scenario asserts readability.
- **N12** (visionary, wt 5) — *I need what I ratified to stay what I
  ratified, so that nothing changes between my review and the build
  without a new dated entry I can see.* Context: never elicited; the
  append-only record, the rule that an interviewer may not rewrite the
  visionary, and the derived hashes all serve it, and until this entry
  no need named it. Evidence: D16, D146, D155, D223, D233. Coverage: `scenario` —
  the-record-agrees-with-itself.feature, the-docket-grammar.feature.

## Tensions

- N9 with N8 — sufficiency is capped by opportunity cost. Everything the visionary
  should see competes with the operator's reason to run the lint at all;
  the declared surfaces are the trade-off.

## Superseded

N0 held four needs in one statement and is amended by N4, with N5, N6,
and N7 carrying the other three. N1 stated a principle and is amended by
N8, which states what the visionary sees. N2 is amended by N9 with its
persona named. N3 is amended by N10. The earlier statements remain in
the docket under their own ids; nothing is edited in place.
