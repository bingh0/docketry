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

  @D24
  Scenario: a spread naming an outline the corpus lacks is a traceability finding
    Given a docket whose entry R13 has the line "spread: duplicate-timing"
    And a corpus with no scenario outline titled "duplicate-timing"
    When the docket is linted with the corpus
    Then the traceability layer has 1 finding keyed R13
    And the finding's message contains "duplicate-timing"

  @D24
  Scenario: a guarded-by scenario lacking the guarding tag is a traceability finding
    Given a docket whose entry R14 resolves to fence-declined
    And a fence entry citing R14 with Guarded by: "a diff handed back as evidence is refused"
    And a corpus where "a diff handed back as evidence is refused" carries no tag @R14
    When the docket is linted with the deliverables
    Then the traceability layer has 1 finding keyed R14
    And the finding's message names "a diff handed back as evidence is refused"

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
