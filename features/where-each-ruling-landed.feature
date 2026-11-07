Feature: where each ruling landed
  As the visionary who ratified rulings and will review deliverables
  I want every ruling joined to the deliverable its kind implies, and every deliverable joined back
  So that a ruling cannot vanish between the interview and the build

  Background:
    Given the docket format version 1

  @D23
  Scenario: a scenario tagged with a ruling id is joined to the entry
    Given a docket whose entry R12 is a wanted ruling in effect
    And a corpus where the scenario "a dropped file is listed" carries the tag @R12
    When the docket is linted with the corpus
    Then the traceability layer has 0 findings

  @D24
  Scenario: a triggered entry in effect with no scenario citing it is a traceability finding
    Given a docket whose entry R15 is a triggered ruling in effect
    And a corpus where no scenario carries the tag @R15
    When the docket is linted with the corpus
    Then the traceability layer has 1 finding keyed R15
    And the finding's message contains "no scenario cites it"

  @D24
  Scenario: a scenario citing a reversed entry is a traceability finding
    Given a docket whose entry R15 reverses R13
    And a corpus where the scenario "a duplicate is kept" carries the tag @R13
    When the docket is linted with the corpus
    Then the traceability layer has 1 finding keyed R13
    And the finding's message names "a duplicate is kept" and R15

  @D24
  Scenario: a scenario tagged with an id the docket lacks is a traceability finding
    Given a docket with no entry R99
    And a corpus where the scenario "a folder is renamed" carries the tag @R99
    When the docket is linted with the corpus
    Then the traceability layer has 1 finding at the scenario "a folder is renamed"
    And the finding's message contains "R99"

  @D163
  Scenario: a scenario citing a boundary ruling is a mis-kinded citation
    Given a docket whose entry R2 resolves to boundary
    And a corpus where the scenario "a folder is renamed" carries the tag @R2
    When the docket is linted with the corpus
    Then the traceability layer has 1 finding at the scenario "a folder is renamed"
    And the finding's message contains "boundary"

  @D163
  Scenario: a scenario citing a deferred entry is a mis-kinded citation
    Given a docket whose entry R3 resolves to fence-deferred
    And a corpus where the scenario "a folder is renamed" carries the tag @R3
    When the docket is linted with the corpus
    Then the traceability layer has 1 finding at the scenario "a folder is renamed"
    And the finding's message contains "fence-deferred"

  @D167
  Scenario: a scenario citing a ruling that resolves to a need is a mis-kinded citation
    Given a docket whose entry R1 resolves to need N0
    And a corpus where the scenario "a folder is renamed" carries the tag @R1
    When the docket is linted with the corpus
    Then the traceability layer has 1 finding at the scenario "a folder is renamed"
    And the finding's message contains "resolves to need N0"

  @D163
  Scenario: a scenario citing a structural ruling is joined
    Given a docket whose entry R8 resolves to structural
    And a corpus where the scenario "the parse exposes touches" carries the tag @R8
    When the docket is linted with the corpus
    Then the traceability layer has 0 findings

  @D149
  Scenario: a scenario citing the amender of a triggered ruling joins the chain
    Given a docket whose entry R13 has a trigger and whose entry R16 amends R13 keeping the trigger
    And a corpus where the scenario "a file is dropped" carries the tag @R16
    When the docket is linted with the corpus
    Then the traceability layer has 0 findings

  @D77
  Scenario: a scenario carrying no ruling tag is a traceability finding
    Given a corpus where the scenario "a folder is renamed" carries no tag
    When the docket is linted with the corpus
    Then the traceability layer has 1 finding at the scenario "a folder is renamed"
    And the finding's message contains "no docket entry cited"

  @D24
  Scenario: a scenario tagged with a need id is a traceability finding
    Given a docket with need entry N4
    And a corpus where the scenario "a folder is renamed" carries the tag @N4
    When the docket is linted with the corpus
    Then the traceability layer has 1 finding at the scenario "a folder is renamed"
    And the finding's message contains "need"

  @D24
  Scenario: a need entry absent from the ledger is a traceability finding
    Given a docket with need entry N4
    And a ledger that names N0 through N3 and not N4
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding keyed N4
    And the finding's message contains "ledger"

  @D68
  Scenario: a fence-kind entry with a trigger lands in the fence, not in a scenario
    Given a docket whose entry R3 has a trigger and resolves to fence-deferred
    And a fence with an entry citing R3
    And a corpus where no scenario carries the tag @R3
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings keyed R3
    And the not-counted list names R3 with the reason "resolved; trigger is the reopening condition"

  @D68
  Scenario: a boundary entry is listed as not counted, never as a finding
    Given a docket whose entry R14 resolves to boundary
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings keyed R14
    And the not-counted list names R14 with the reason "resolves to boundary"

  @D24
  Scenario: a fence-kind resolution absent from the fence is a traceability finding
    Given a docket whose entry R3 resolves to fence-deferred
    And a fence with no entry citing R3
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding keyed R3
    And the finding's message contains "fence"

  @D24
  Scenario: a structural resolution absent from the design doc is a traceability finding
    Given a docket whose entry R8 resolves to structural
    And a design doc whose ruled tags cite no R8
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding keyed R8
    And the finding's message contains "DESIGN.md"

  @D151
  Scenario: a spread naming an outline tagged with another entry is a traceability finding
    Given a docket whose entry R13 has the line "spread: duplicate-timing"
    And a corpus whose outline "duplicate-timing" carries the tag @R12 and not @R13
    When the docket is linted with the corpus
    Then the traceability layer has 1 finding keyed R13
    And the finding's message contains "carries no tag @R13"

  @D238
  Scenario: an outline title the corpus holds twice is satisfied by the later file carrying the tag
    Given a docket whose entry R13 has the line "spread: duplicate-timing"
    And a corpus whose outline "duplicate-timing" carries the tag @R12
    And a second feature file where the outline "duplicate-timing" carries the tag @R13
    When the docket is linted with the corpus
    Then the traceability layer has 0 findings

  @D238
  Scenario: an outline title the corpus holds twice is satisfied by the earlier file carrying the tag
    Given a docket whose entry R13 has the line "spread: duplicate-timing"
    And a corpus whose outline "duplicate-timing" carries the tag @R13
    And a second feature file where the outline "duplicate-timing" carries the tag @R12
    When the docket is linted with the corpus
    Then the traceability layer has 0 findings

  @D238
  Scenario: an outline carrying the amender's tag satisfies the spread of the entry it amends
    Given a docket whose entry R13 has a trigger and whose entry R15 amends R13 keeping the trigger
    And a docket whose entry R15 has the line "spread: duplicate-timing"
    And a corpus whose outline "duplicate-timing" carries the tag @R15
    When the docket is linted with the corpus
    Then the traceability layer has 0 findings

  @D240
  Scenario: a scenario citing a root whose amender dropped the resolution line is the unresolved finding, not a mis-kinded tag
    Given a docket whose entry R13 resolves to structural
    And a docket whose entry R14 amends R13
    And R14 carries no trigger of its own
    And a corpus where the scenario "a duplicate is kept" carries the tag @R13
    When the docket is linted with the corpus
    Then the traceability layer has 0 findings
    And the resolution layer has 1 finding keyed R13

  @D240
  Scenario: the amender's tag reads as the root's does when the amender dropped the resolution line
    Given a docket whose entry R13 resolves to structural
    And a docket whose entry R14 amends R13
    And R14 carries no trigger of its own
    And a corpus where the scenario "a duplicate is kept" carries the tag @R14
    When the docket is linted with the corpus
    Then the traceability layer has 0 findings
    And the resolution layer has 1 finding keyed R13

  @D240
  Scenario: a scenario citing a relation entry with no trigger or resolution of its own is a mis-kinded citation
    Given a docket whose entry R15 reverses R13
    And R15 carries no trigger of its own
    And a corpus where the scenario "a duplicate is kept" carries the tag @R15
    When the docket is linted with the corpus
    Then the traceability layer has 1 finding at the scenario "a duplicate is kept"
    And the finding's message contains "no trigger or resolution of its own"

  @D240
  Scenario: a scenario citing the amender of a bare relation entry is a mis-kinded citation too
    Given a docket whose entry R15 reverses R13
    And R15 carries no trigger of its own
    And a docket whose entry R16 amends R15
    And R16 carries no trigger of its own
    And a corpus where the scenario "a duplicate is kept" carries the tag @R16
    When the docket is linted with the corpus
    Then the traceability layer has 1 finding at the scenario "a duplicate is kept"
    And the finding's message contains "whose root R15 is a reverses entry"

  @D240
  Scenario: a root whose amender dropped the resolution line enforces no decline
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 resolves to structural
    And a docket whose entry R3 amends R2
    And R3 carries no trigger of its own
    And a fence entry citing R14 and R2 with Guarded by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding keyed R14
    And the finding's message contains "no triggered, structural, or means ruling"

  @D24
  Scenario: a spread naming an outline the corpus lacks is a traceability finding
    Given a docket whose entry R13 has the line "spread: duplicate-timing"
    And a corpus with no scenario outline titled "duplicate-timing"
    When the docket is linted with the corpus
    Then the traceability layer has 1 finding keyed R13
    And the finding's message contains "duplicate-timing"

  @D234
  Scenario: a guardian carrying no tag of the entry's enforcing ruling is a traceability finding
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a docket whose entry R3 is a triggered ruling in effect
    And a fence entry citing R14 and R2 with Guarded by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R3
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the traceability layer has 1 finding keyed R14
    And the finding's message names "a diff handed back as evidence is refused" and R2
    And the finding's fix shows "@R2 on"
    And no finding's fix shows "@R14"

  @D234
  Scenario: a guarded entry citing only its fence ruling is a traceability finding whose fix names the citation to add, never the fence id as a tag
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 with Guarded by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the traceability layer has 1 finding keyed R14
    And the finding's message names "a diff handed back as evidence is refused"
    And the finding's fix shows "cite beside R14"
    And no finding's fix shows "@R14"

  @D234
  Scenario: a guarded entry citing its fence ruling and the enforcing ruling its guardian carries is a clean strict run
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 with Guarded by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables under strict
    Then the traceability layer has 0 findings
    And the exit code is 0

  @D234
  Scenario: a guardian tagged with the fence id is the mis-kinded finding, not a satisfied guard
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 with Guarded by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tags @R14 and @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the traceability layer has 1 finding at the scenario "a diff handed back as evidence is refused"
    And the finding's message contains "a fence-declined entry"

  @D234
  Scenario: a guardian carrying the tag of the enforcing ruling's amender satisfies the guard
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R3 amends R2 and R2 has a trigger
    And a fence entry citing R14 and R2 with Guarded by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R3
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D234
  Scenario: an entry naming two guardians, one untagged, is one finding naming that guardian
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a docket whose entry R3 is a triggered ruling in effect
    And a fence entry citing R14 and R2 with Guarded by: "a diff handed back as evidence is refused", "a diff pasted as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    And a corpus where the scenario "a diff pasted as evidence is refused" carries the tag @R3
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding's message names "a diff pasted as evidence is refused" and R2

  @D234
  Scenario: an entry citing several enforcing rulings is satisfied by a guardian carrying any of them
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a docket whose entry R4 is a triggered ruling in effect
    And a fence entry citing R14 and R2 and R4 with Guarded by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R4
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D234
  Scenario: a reversed citation beside its bare reverser enforces nothing, so the fix names neither
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R15 reverses R13
    And R15 carries no trigger of its own
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R13 and R15 with Guarded by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding keyed R14
    And the finding's fix shows "cite beside R14"
    And no finding's fix shows "@R13"
    And no finding's fix shows "@R15"

  @D234
  Scenario: a bare ratifier cited beside the decline enforces nothing, so the fix never names it as a tag
    Given a docket whose entry R14 resolves to fence-declined and whose entry R16 ratifies R14
    And R16 carries no trigger of its own
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R16 with Guarded by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding keyed R14
    And the finding's message contains "no triggered, structural, or means ruling"
    And no finding's fix shows "@R16"

  @D235
  Scenario: a guardian title the corpus lacks is a traceability finding naming the scenario to write
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 with Guarded by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff pasted as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the traceability layer has 1 finding keyed R14
    And the finding is reported under the rule word "guard-no-scenario"
    And the finding's message names "a diff handed back as evidence is refused"
    And the finding's fix shows "a scenario titled"
    And the finding's fix shows "tagged @R2"

  @D235
  Scenario: the guard finding is keyed by the fence ruling whatever the citation order, at the entry's line
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R2 and R14 with Guarded by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff pasted as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding keyed R14
    And the finding sits at that fence entry's line

  @D235
  Scenario: a guardian title differing by a trailing space is a title the corpus lacks
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 with Guarded by: "a diff handed back as evidence is refused "
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding keyed R14
    And the finding's message contains "no scenario of that title"

  @D235
  Scenario: a guardian title the corpus lacks, on an entry citing only its decline, names both things to add
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 with Guarded by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff pasted as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the traceability layer has 1 finding keyed R14
    And the finding's fix shows "cited beside R14"
    And no finding's fix shows "@R14"

  @D235
  Scenario: the guardian join is by exact title
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 with Guarded by: "A diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding keyed R14
    And the finding's message contains "no scenario of that title"

  @D235
  Scenario: an entry naming two guardians, one the corpus lacks, is one finding naming the missing one
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 with Guarded by: "a diff handed back as evidence is refused", "a diff pasted as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding's message names "a diff pasted as evidence is refused"
    And the finding's message contains "no scenario of that title"

  @D235
  Scenario: a corpus holding the fence but no feature file yet leaves a guardian dark
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 with Guarded by: "a diff handed back as evidence is refused"
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D236
  Scenario: a lowercase guard phrase is a finding, never a silent non-guard
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose guard phrase is lowercase for "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff pasted as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the traceability layer has 1 finding at that fence entry
    And the finding is reported under the rule word "guard-near-miss"
    And the finding's fix shows "Guarded by:"

  @D236
  Scenario: a guardian in curly quotes is a finding, never a silent non-guard
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose guardian "a diff handed back as evidence is refused" is in curly quotes
    And a corpus where the scenario "a diff pasted as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the traceability layer has 1 finding at that fence entry
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: an and between two guardians no longer drops the second in silence
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 with Guarded by: "a diff handed back as evidence is refused" and "a diff pasted as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: the phrase without its colon, followed by a quoted title, is a claim the one form does not read
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff pasted as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: a title in single quotes is a claim the one form does not read
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by: 'a diff handed back as evidence is refused'
    And a corpus where the scenario "a diff pasted as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: a second title in single quotes after a straight-quoted first is read by the claim and not by the form
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by: "a diff handed back as evidence is refused", 'a diff pasted as evidence is refused'
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: a second title in curly quotes after a straight-quoted first is read by the claim and not by the form
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by: "a diff handed back as evidence is refused", “a diff pasted as evidence is refused”
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: a second title in backticks after a straight-quoted first is read by the claim and not by the form
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by: "a diff handed back as evidence is refused", `a diff pasted as evidence is refused`
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: a comma and an and between two titles is a run the claim reads and the form does not
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by: "a diff handed back as evidence is refused", and "a diff pasted as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: a space before the colon is a spelling the one form does not read
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by : "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: a no-break space inside the phrase is a spelling the one form does not read
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: a second claim later in the entry is read at its own position
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by: "a diff handed back as evidence is refused" and the lock is guarded by "the bolt"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: the words guarded by inside a named title are no second claim
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a docket whose entry R3 is a triggered ruling in effect
    And a fence entry citing R14 and R2 and R3 whose entry text reads Guarded by: "what the door is guarded by", "a diff handed back as evidence is refused"
    And a corpus where the scenario "what the door is guarded by" carries the tag @R3
    And a second feature file where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D236
  Scenario: an apostrophe in prose after a guard in the one form is no title
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by: "a diff handed back as evidence is refused", 'til the owner's return
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D236
  Scenario: a second title in single quotes before a period is read by the claim, its closing quote ending no word
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by: "a diff handed back as evidence is refused", 'a diff pasted as evidence is refused'.
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: a second title in single curly quotes after a straight-quoted first is read by the claim and not by the form
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by: "a diff handed back as evidence is refused", ‘a diff pasted as evidence is refused’
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: a space before the comma between two titles is not the one form
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by: "a diff handed back as evidence is refused" , "a diff pasted as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: the phrase without its colon, followed by a title in double-curly quotes, is a claim
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by “a diff handed back as evidence is refused”
    And a corpus where the scenario "a diff pasted as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: two spaces inside the phrase are a spelling the one form does not read
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded  by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: the words guarded by inside the second of two named titles are no second claim
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a docket whose entry R3 is a triggered ruling in effect
    And a fence entry citing R14 and R2 and R3 whose entry text reads Guarded by: "a diff handed back as evidence is refused", "what the door is guarded by"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    And a second feature file where the scenario "what the door is guarded by" carries the tag @R3
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D236
  Scenario: the bare phrase in prose followed by an apostrophe word opens no claim
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads The door is guarded by 'til dawn by the bolt. Guarded by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D236
  Scenario: a claim in another case before a later claim in the one form is read at its own position
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a docket whose entry R3 is a triggered ruling in effect
    And a fence entry citing R14 and R2 and R3 whose entry text reads guarded by: "a diff handed back as evidence is refused" and later Guarded by: "what the door is guarded by"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    And a second feature file where the scenario "what the door is guarded by" carries the tag @R3
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: the phrase without its colon, followed by a title in single curly quotes, is a claim
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by ‘a diff handed back as evidence is refused’
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: two titles with only a space between are the one form
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a docket whose entry R3 is a triggered ruling in effect
    And a fence entry citing R14 and R2 and R3 whose entry text reads Guarded by: "a diff handed back as evidence is refused" "what the door is guarded by"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    And a second feature file where the scenario "what the door is guarded by" carries the tag @R3
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D236
  Scenario: two titles with a comma and no space between are the one form
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a docket whose entry R3 is a triggered ruling in effect
    And a fence entry citing R14 and R2 and R3 whose entry text reads Guarded by: "a diff handed back as evidence is refused","what the door is guarded by"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    And a second feature file where the scenario "what the door is guarded by" carries the tag @R3
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D236
  Scenario: a closing single quote followed by a digit is an apostrophe
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by: "a diff handed back as evidence is refused", 'room'101 holds the rest
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D236
  Scenario: a closing single curly quote followed by a digit is an apostrophe
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by: "a diff handed back as evidence is refused", ‘room’01 holds the rest
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D236
  Scenario: an empty straight-quoted title is not the one form
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by: "", "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: the phrase with its colon and no quoted title is a claim with nothing in it
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by: the scenario above
    And a corpus where the scenario "a diff pasted as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: a guard in the one form followed by prose that quotes a word is no near-miss
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads Guarded by: "a diff handed back as evidence is refused" where the reply reads "refused" (and the door "shut")
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D236
  Scenario: prose that says guarded by and quotes something later is no claim
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose entry text reads The door is guarded by the bolt, whose state reads "shut".
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D236
  Scenario: a corpus holding the fence but no feature file yet still reports a near-miss
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a fence entry citing R14 and R2 whose guard phrase is lowercase for "a diff handed back as evidence is refused"
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding
    And the finding is reported under the rule word "guard-near-miss"

  @D236
  Scenario: a title the corpus holds twice is satisfied by the later file carrying the tag
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a docket whose entry R3 is a triggered ruling in effect
    And a fence entry citing R14 and R2 with Guarded by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R3
    And a second feature file where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D236
  Scenario: a title the corpus holds twice is satisfied by the earlier file carrying the tag
    Given a docket whose entry R14 resolves to fence-declined
    And a docket whose entry R2 is a triggered ruling in effect
    And a docket whose entry R3 is a triggered ruling in effect
    And a fence entry citing R14 and R2 with Guarded by: "a diff handed back as evidence is refused"
    And a corpus where the scenario "a diff handed back as evidence is refused" carries the tag @R2
    And a second feature file where the scenario "a diff handed back as evidence is refused" carries the tag @R3
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D24
  Scenario: entries that need no scenario are listed as not counted with the reason
    Given a docket whose entry R14 resolves to need N4
    When the docket is linted with the corpus
    Then the not-counted list names R14 with the reason "resolves to need N4"

  @D77
  Scenario: a fence entry citing a missing id is a traceability finding
    Given a docket with no entry R99
    And a fence whose Deferred entry cites R99
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding at that fence entry
    And the finding's message contains "R99"

  @D77
  Scenario: a fence entry citing a reversed entry is a traceability finding
    Given a docket whose entry R15 reverses R13
    And a fence whose Declined entry cites R13
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding at that fence entry
    And the finding's message names R13 and R15

  @D77
  Scenario: a fence entry citing a triggered ruling is a mis-kinded citation
    Given a docket whose entry R13 is a triggered ruling with no resolution
    And a fence whose Declined entry cites R13
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding at that fence entry
    And the finding's message contains "not a fence kind"

  @D77
  Scenario: a ledger row citing a need the docket lacks is a traceability finding
    Given a docket with needs N0 through N3
    And a ledger with a row for N9
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding at that ledger row
    And the finding's message contains "N9"

  @D77
  Scenario: a ruled tag citing an elective is listed as not counted
    Given a docket with ruling R13
    And a design doc whose ruled tag cites R13 and E3
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings
    And the not-counted list names E3 with the reason "outside the docket's id patterns"

  @D77
  Scenario: a ruled tag citing a reversed entry is a traceability finding
    Given a docket whose entry R15 reverses R13
    And a design doc whose ruled tag cites R13
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding at that design line
    And the finding's message names R13 and R15

  @D111
  Scenario: a need-kind ruling lands in its ledger row
    Given a docket whose entry R1 resolves to need N0
    And a ledger whose row N0 cites R1 in its evidence
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D111
  Scenario: a ledger row missing the citation of a ruling that resolves to it is a traceability finding
    Given a docket whose entry R1 resolves to need N0
    And a ledger whose row N0 cites no ruling
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding keyed R1
    And the finding's message contains "ledger row N0"

  @D111
  Scenario: a ledger row citing a ruling that does not resolve to it is a mis-cite
    Given a docket whose entry R13 is a triggered ruling
    And a ledger whose row N0 cites R13
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding at that ledger row
    And the finding's message names R13 and N0

  @D111
  Scenario: the not-counted list carries a per-kind count
    Given a docket with two boundary rulings and one ruling resolving to need N0
    And a ledger whose row N0 cites that ruling
    When the docket is linted with the deliverables
    Then the report's not-counted line reads "not counted: boundary 2"

  @D88
  Scenario: a Declined entry citing its fence-declined ruling and the ruling that declined it is joined
    Given a docket whose entry R14 has a trigger and whose entry R20 resolves to fence-declined
    And a fence whose Declined entry cites R20 and R14
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D88
  Scenario: a Roads-not-taken entry may cite a triggered ruling
    Given a docket whose entry R14 has a trigger
    And a fence whose Roads-not-taken entry cites R14
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D88
  Scenario: a fence entry may cite its target's ratifier beside the target
    Given a docket whose entry R3 resolves to fence-deferred and whose entry R16 ratifies R3
    And a fence whose Deferred entry cites R3 and R16
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D88
  Scenario: a reversed entry may be cited beside its reverser
    Given a docket whose entry R15 reverses R13 and whose entry R20 resolves to fence-declined
    And a fence whose Declined entry cites R20, R13, and R15
    When the docket is linted with the deliverables
    Then the traceability layer has 0 findings

  @D88
  Scenario: a scenario citing an amender joins the amended entry
    Given a docket whose entry R16 amends R13 and R13 has a trigger
    And a corpus where the scenario "a file is dropped" carries the tag @R16 and no scenario carries @R13
    When the docket is linted with the corpus
    Then the traceability layer has 0 findings keyed R13

  @D22
  Scenario: with no corpus given the traceability layer reports dark
    Given a docket with 5 entries
    When the docket is linted without a corpus
    Then the traceability row reads "dark" with the reason "no corpus given"
    And the findings count excludes traceability

  @D35
  Scenario: with a corpus given and no gnt parser the run exits two naming the parser
    Given a docket with 5 entries
    And a corpus directory
    And no gnt parser installed where the lint runs
    When the docket is linted with the corpus
    Then the exit code is 2
    And the refusal names the gnt parser
