# `guard-untagged` tells you to do what `scenario-mis-kinded` forbids

**Found:** 2026-11-07, drafting the fence for switchyard under `--strict`.
**Version:** docketry 0.1.0 (repo at `748c5e3`), gherkin-node-test 0.11.0, scope 5.3.1.
**Severity:** low. A strict-clean form exists, and this repo's own fence already uses it. But the lint's fix hint leads
away from that form, and neither `GRAMMAR.md` nor the scope skill mentions it.

## What happens

A declined fence entry cites only its own fence ruling and names a guardian scenario:

```
- **Opening to strangers.** Never. Guarded by: "A stranger finds the door shut" (D1, 2026-11-07)
```

If the scenario is tagged with the ruling it proves, `guard-untagged` fires and hints at adding the fence id:

```
D1 L5 [guard-untagged] fence entry is guarded by "A stranger finds the door shut", which carries no tag @D1
— fix: @D1 on "A stranger finds the door shut"
```

If you follow the hint, `scenario-mis-kinded` fires and tells you to remove the tag:

```
door.feature "A stranger finds the door shut" L3 [scenario-mis-kinded] scenario "A stranger finds the door shut"
cites D1, a fence-declined entry — fix: cite a triggered, structural, or means ruling
```

Strict exits 1 either way. Following each fix hint in turn just loops between the two.

## The form that passes

The entry also cites the ruling the scenario carries, and the scenario keeps only that tag:

```
- **Opening to strangers.** Never. Guarded by: "A stranger finds the door shut" (D1, D2, 2026-11-07)
```

Strict exits 0. This works for two reasons, both in `src/lint/traceability.ts`:

- The `guard-untagged` check passes when **any** id the entry cites is on the scenario (`fe.cites.some`).
- The kind-strict check needs only one cited ruling of the section's kind.

This repo's fence does the same, for example `features/OUT-OF-SCOPE.md:13-14`, cited `(D92, D14, 2026-09-04)`.

So I was wrong when I first told the owner that declined entries can't name guardians in strict mode. They can. The
form just isn't discoverable from the lint's output.

## Reproduce

Five files in one directory, then `docketry lint DOCKET.md --corpus . --strict`.

`DOCKET.md`:

```
docket: 1

N1 2026-11-07 [V] user 3
  need: I need the door to stay shut to strangers [V]

D1 2026-11-07 [V]
  resp: the door is never opened to strangers [V]
  -> fence-declined open-door
  serves: N1
  touches: none

D2 2026-11-07 [V]
  trig: a stranger knocks [V]
  resp: the door stays shut [V]
  sib: none -- nothing else can happen here
  serves: N1
  touches: D1
```

`OUT-OF-SCOPE.md`:

```
# Out of scope

## Declined

- **Opening to strangers.** Never. Guarded by: "A stranger finds the door shut" (D1, 2026-11-07)

## Deferred

## Named assumptions

## Out of reach by construction

## Roads not taken
```

`USER-NEEDS.md`:

```
# User needs

- **N1** (user, wt 3) — *I need the door to stay shut to strangers* Evidence: D1, D2. Coverage: `scenario` — door.feature.
```

`DESIGN.md`:

```
# Design

- Door. [ruled: D2]

## Changelog
- 2026-11-07 initial
```

`door.feature`, changing only the tag line:

```
Feature: door
  @D2
  Scenario: A stranger finds the door shut
    Given a stranger at the door
    When the stranger knocks
    Then the stranger sees the door shut
```

| Fence parenthetical | Scenario tags | Result | Exit |
|---|---|---|---|
| `(D1, 2026-11-07)` | `@D2` | `guard-untagged` | 1 |
| `(D1, 2026-11-07)` | `@D1 @D2` | `scenario-mis-kinded` | 1 |
| `(D1, D2, 2026-11-07)` | `@D2` | clean | 0 |

## Why it slipped through

- `features/where-each-ruling-landed.feature:149-155` proves that a guardian lacking the tag is a finding, but no
  scenario follows the fix hint to a clean result. Each rule is tested alone, and the two only conflict together.
- `GRAMMAR.md` lists both rule words and doesn't describe the guard contract.
- The scope skill (`SKILL.md`, the `OUT-OF-SCOPE.md` section) says a Declined entry may name its guardians, and
  doesn't say the entry must also cite the enforcing ruling. A drafter working from the skill writes the failing
  form first.

## Options

1. **Correct the hint (smallest).** Change the `guard-untagged` fix to something like: cite in this entry's
   parenthetical a ruling the scenario carries. No behaviour changes.
2. **Exempt a named guardian from `scenario-mis-kinded`.** Allow a fence id as a tag when that entry's `Guarded by:`
   names the scenario. The hint then becomes true, but it loosens D80's rule about what a tag means, and it needs a
   ruling.
3. **Document the contract** in `GRAMMAR.md` and the scope skill, whichever of the above is chosen.

My preference is 1 plus 3: the two-citation form already exists, it's in use here, and it says something true, that
the entry is enforced by that ruling. Option 2 is for the owner to rule on. Whichever is chosen, add one scenario that
follows the hint through to a clean strict run.

## Where it surfaced

`switchyard/features/OUT-OF-SCOPE.md`, the D22 entry, now cited `(D22, D129, 2026-11-06)`, guarded by "The relay refuses
connections from off mini" in `credential-isolation.feature`, tagged `@D129`. Strict exits 0 there.

## Resolution (2026-11-07, owner review)

The report is right that the two findings loop, and right to prefer the two-citation form. It is one layer too
shallow: the conflict is between rulings, not between a rule and its hint. D24 (2026-09-04) said "the guarding tag"
meaning the fence entry's own id, and its one test cited a single id and expected exactly that; D149/D163
(2026-09-06) then made a fence-kind id on any scenario mis-kinded, and nobody amended D24. The two-citation form
passed only because the guard check accepted any cited id and kind-strict needs one of its kind; no ruling said a
Declined entry cites its enforcing ruling. All thirteen guarded house entries had done so since 2026-09-04.

Ruled as **D234** (amends D68): the guard joins through the enforcing ruling, never the fence id. The lint now
emits one `guard-untagged` per guardian, keyed by the fence ruling, with a fix that names an enforcing ruling to tag
or, when the entry cites none, the citation to add. An enforcing ruling is one scenarios prove — triggered,
structural, or means by effective shape — so a bare relation entry cited beside the decline (a ratifier, or the
reverser in `(D96, D19 reversed by D20)` had D20 no trigger of its own) is never the tag the fix names; the
adversarial review caught the first draft recommending exactly that. Nine scenarios under `@D234` in
`features/where-each-ruling-landed.feature` bind the contract, the two fix texts, one finding per guardian, the
chain join, any-of-several enforcers, reversed and bare-relation citations, and the two-citation form as a clean
strict run.

The review also named a pre-existing hole beside the fix: a `Guarded by:` title matching no scenario was silent,
so a misspelt or renamed title disabled a guard with no finding. Ruled as **D235**: `guard-no-scenario`, keyed by
the fence ruling, by exact title as a spread's outline is, dark with no corpus; seven scenarios under `@D235`.

Specimen, the rule's first run: the house fence itself had two of its sixteen guardians disconnected as of the
0.1.0 root commit, the earliest history visible. The D93 entry named "a provenance tag outside the four refuses
the docket naming the line" where the scenario reads "the five"; the D95 entry named "a Gherkin keyword used as a
slot keyword refuses the docket" where the scenario is the outline "each Gherkin keyword…". Every lint run was
clean throughout. That is the `cino:assertion` shape on the failure ladder: the fence asserted a guard existed,
and nothing on the far side checked. The first correction also cites D78 beside D15, because the renamed scenario
is tagged `@D78`, the unwanted ruling that states the refusal; without that citation the corrected title would
have fired `guard-untagged`.

The second review found the closure incomplete one layer up: the fence parser read only `Guarded by:` with
straight quotes and commas, so a lowercase phrase, curly quotes, or an `and` between titles was no guard, or one
guard fewer, in silence — spellings gherkin-trace reads. Ruled as **D236**: one form, a guard claim in the listed
other spellings a `guard-near-miss` finding naming the form; and a title held twice in the corpus is satisfied by either scenario,
where the last file read used to decide.

The third review broke the first detector both ways: it read from any "guarded by" to the end of the entry, so
a correct guard followed by prose quoting a word failed strict, and it counted only double quotes, so single
quotes, backticks, and an unquoted title stayed silent against the ruling's "no spelling is silent". The detector
now reads a *claim* — the phrase with its colon, or the phrase followed by a quoted title — and the run of titles
right after it in straight, curly, single, or backtick quotes after commas, semicolons, or ands, against what the
one form reads at that position; prose that merely says guarded by is no claim. The fourth review then showed
the phrase search re-entering a title the claim had already read (a title ending in "guarded by" failed strict)
and an `and` after a comma stopping the run (the second guardian dropped in silence); a claim now consumes its
run. The divergence with gherkin-trace is stated in the changelog and the scope skill rather than closed: a Declined
entry in the one form reads the same in both, and outside it each tool reads spellings the other does not.

The fifth review found three edges of the same detector: a single-quoted second title before a period or a
closing paren was dropped by the apostrophe boundary, single curly quotes were silent under a word that promised
them, and the one form admitted a space before a comma that gherkin-trace does not. The boundary is now "no
letter or digit after the closing quote", single curly quotes are read, and the one form is straight-quoted titles
with one comma or none between, the same regex for the detector and the lint's own read.

The sixth review found the bare phrase followed by an apostrophe word opening an empty claim (a quote character
opened a claim; now only a title does), the empty title `""` inside the one form where gherkin-trace drops it (now
outside the form, a near-miss), and six ruled clauses with no scenario that went red; each has one now. Forty-one
scenarios sit under `@D235` and `@D236`.

## Residuals, and what became of each

Six reviews were run on this change, each on the increment the previous one produced. Each found smaller edges
of the same regex reader. The owner stopped after the sixth and ruled on what remained (2026-11-07): three
residuals were promoted — the spread outline map is any-of like the guardian map (D238), a bare relation entry
is a mis-kinded scenario tag under D163 as written, and strict exit codes are now driven through the spawned
binary (two scenarios under D10) — and the guard spellings outside the enumeration are deferred with their
reopening condition (D239). The list below is that deferral's record. None lies inside the spellings D236
enumerates.

- A fullwidth or other Unicode colon, guillemets with no colon, `or`, `&`, `+` between titles, and a zero-width
  space between titles are silent in both tools. Not listed spellings.
- A single-quoted title holding an apostrophe (`'A's door'`) is not read, by the ruling's own apostrophe clause;
  the fix is straight double quotes, as the grammar now says. A closing single quote before a space then prose
  (`'til the owners' return`) and a combining mark after a closing quote are rare false positives by the same
  letter.
- A claim inside the trailing parenthetical is read as a guard by both tools; "before the parenthetical" is
  prose, not checked.
- docketry reads a guard under any fence section and on any bullet; gherkin-trace only under Declined on a
  bold-topic bullet. Whitespace inside a title is kept here and collapsed there.
- The near-miss message names the section by its first word ("Out entry"), as `fence-mis-kinded` already did.
- ccr's table-form fence is not read by docketry at all; the fence's grammar is the bullet list the scope skill
  writes, now stated under Out of reach by construction.
- The need under the whole episode, one fence read alike by two instruments, is on no ledger row.
`GRAMMAR.md`, `DESIGN.md`, the fence's Roads not taken, and the scope skill's `OUT-OF-SCOPE.md` section state the
contract. Option 2 was refused: a fence id on a scenario proves no behaviour and holes kind-implies-destination.
