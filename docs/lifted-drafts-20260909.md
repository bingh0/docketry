# Lifted drafts — 2026-09-09, lifted 2026-10-05

Three entries drafted `[I]` after the INCOSE walk (agent-bdd-research/paper/notes-incose-20260909.md, W14 and W16) were never committed to the house docket. The visionary ruled on 2026-10-05 that the 0.1.0 alpha ships D220–D223 and D225 and defers these three; they are kept here verbatim so the next grammar can take them up as new dated entries. Their ids D224, D226, D227 stay unused in the docket. Pins are fenced as Deferred by D233; the house-numbers pass runs at the release cycle that ships pins (W17).

D226 names counted lines for pins; when it returns, it is redrafted against the lines that then exist.

```
D224 2026-09-09 [I] amends D172
  resp:  a ruling id is one uppercase letter other than N followed by digits, one letter per docket, and N followed by digits is a need; the id is the only join key — the scenario tag, the fence entry's trailing parenthetical, the ledger row's bold N id and its evidence citations, and the design doc's ruled tag, whose grammar is ruled; one ruling may land in several fence entries; ids outside the docket's own patterns, such as an elective label, are listed as not counted; the Declined, Deferred, and Named-assumption sections are kind-strict — each entry cites at least one entry whose effective kind is that section's fence kind — while Roads-not-taken and Out-of-reach entries cite any entry in effect; a parenthetical may also cite the relation entries on its target, and a reversed entry beside its reverser; a citation of any entry in an amendment chain joins the whole chain; the ledger row for a need is the destination of every in-effect ruling resolving to need or means that need, and the row must cite each; a row may also cite any ruling that serves the need, so the evidence column is the rulings that serve it; a row citing a ruling that neither resolves to nor serves the need is the mis-cite; a boundary ruling has no deliverable of its own, and one that serves a need may be cited as that need's evidence; the not-counted list is a declared surface carrying a per-kind count; in the reverse direction a scenario with no ruling tag, any citation of a missing id, and a citation of a reversed id without its reverser are traceability findings; every citation of a ruling id outside the docket carries a pin — the id, a hyphen, and the first `6 hex` characters of the cited chain's effective entry hash, as `D41-3f9a10` — the pin a version qualifier on the same key and never a second key; a pin that no longer matches the chain's effective hash, because an amendment or a reversal changed the effective shape, is a stale-pin traceability finding naming the citing location and the entry, so every citing surface goes stale at once and the list of stale pins is the re-examination set on the deliverable side; a citation with no pin joins by id, is counted on an unpinned-citations line, and under strict refuses the handoff; pins refreshed since the last signs entry are counted, since a pin refreshed without the text re-read is the laundering case and judgment's; hashes remain derived and never written into the docket [I]
  ->     structural
  serves: N12 N3
  touches: D172 D155 D88 D80 D136 D223 D185
# roads not taken: pins optional and counted only; a gloss slot rendered into the design doc; a derived-file-equals-render check; every citing bullet re-read by hand after each amendment

D226 2026-09-09 [I] amends D213
  resp:  the scope skill's handoff step reads the report's counted lines to the visionary in words — of the slots, how many are in the visionary's words, how many were corrected, how many inferred and unratified, how many wanted behaviours carry no sibling by reason, how many ratifications and de-triggerings, how many quantities unresolved, how many interviewer-supplied quantities carry no why, how many citations unpinned and how many pins refreshed since the last signature, and the signed line — because under an optimising interviewer those lines are the lint's whole residual defence and the visionary is their only reader; a protocol amendment to the scope skill at build time, recorded here as the docket's expectation of its first caller [I]
  ->     boundary
  serves: N0 N11
  touches: D213 D220 D223 D224 D225

D227 2026-09-09 [I]
  resp:  the house docket braces its own numbers and lists, as any docket must: a threshold is a braced quantity with a spread line naming an outline; an enumeration of a closed set is a braced pipe list spread one row per member; a fixed constant of a format — a hash length, an exit code, an indent — is a backticked literal; a figure quoted as evidence stays a word; an amendment pass over the effective entries restates each such ruling, and the house becomes the live specimen of its own quantity rules, which until this entry were exercised by fixtures alone [I]
  ->     boundary
  serves: N6
  touches: D219 D121 D175 D220 D225
# roads not taken: the house fenced as a docket of rule thresholds with no edges; only the thresholds braced and the cardinalities left as words

```
