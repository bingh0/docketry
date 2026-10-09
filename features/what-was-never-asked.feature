Feature: what was never asked
  As the interviewer who cannot see the question I did not ask
  I want the record's gaps counted from its structure
  So that the missing failure case, the unspread quantity, and the unresolved wish become the next questions

  Background:
    Given the docket format version 1

  @D14
  Scenario: a wanted entry with a trigger and no sib line is a coverage finding
    Given a docket whose wanted entry R12 has a trigger and no sib line
    When the docket is linted
    Then the coverage layer has 1 finding keyed R12
    And the finding's fix names the sib line

  @D14
  Scenario: a wanted entry naming an unwanted sibling has no coverage finding
    Given a docket whose wanted entry R12 has sib R13
    And R13 is an unwanted entry
    When the docket is linted
    Then the coverage layer has 0 findings

  @D14
  Scenario: a sib line naming a wanted entry is a form finding
    Given a docket whose wanted entry R12 has sib R14
    And R14 is a wanted entry
    When the docket is linted
    Then the form layer has 1 finding keyed R12 sib

  @D14
  Scenario: a sib line naming the entry itself is a form finding
    Given a docket whose wanted entry R12 has sib R12
    When the docket is linted
    Then the form layer has 1 finding keyed R12 sib

  @D45
  Scenario: sib none with a reason is counted, not a finding
    Given a docket whose wanted entry R12 has the line "sib: none -- the drop is idempotent by construction"
    When the docket is linted
    Then the coverage layer has 0 findings
    And the report's no-sibling line reads "no sibling by reason: 1"

  @D45
  Scenario: sib none with a vacuous reason is a form finding
    Given a docket whose wanted entry R12 has the line "sib: none -- ok"
    When the docket is linted
    Then the form layer has 1 finding keyed R12 sib
    And the finding's message contains "states nothing checkable"

  @D69
  Scenario: a two-word reason is under the floor
    Given a docket whose wanted entry R12 has the line "sib: none -- not needed"
    When the docket is linted
    Then the form layer has 1 finding keyed R12 sib
    And the finding's message contains "fewer than three words"

  @D69
  Scenario: a three-word reason passes and is counted
    Given a docket whose wanted entry R12 has the line "sib: none -- idempotent by construction"
    When the docket is linted
    Then the form layer has 0 findings
    And the report's no-sibling line reads "no sibling by reason: 1"

  @D68
  Scenario: a resolved entry with a trigger is not asked for a sibling
    Given a docket whose wanted entry R3 has a trigger, no sib line, and resolves to fence-deferred binding-side-lint
    When the docket is linted
    Then the coverage layer has 0 findings

  @D46
  Scenario: an unwanted entry without a sib line has no coverage finding
    Given a docket whose unwanted entry R13 has a trigger and no sib line
    When the docket is linted
    Then the coverage layer has 0 findings

  @D46
  Scenario: an unwanted entry may name its own unwanted sibling
    Given a docket whose unwanted entry R13 has sib R17
    And R17 is an unwanted entry
    When the docket is linted
    Then the form layer has 0 findings
    And the node R13 has sib R17

  @D20
  Scenario: a quantity node referenced by no spread is a coverage finding
    Given a docket whose entry R13 response contains the quantity {2 seconds}
    And R13 has no spread line
    When the docket is linted
    Then the coverage layer has 1 finding keyed R13 resp
    And the finding's message contains "2 seconds"

  @D118
  Scenario: without a corpus a spread line is counted as unverified, not cleared
    Given a docket whose entry R13 response contains the quantity {2 seconds}
    And R13 has the line "spread: duplicate-timing"
    When the docket is linted without a corpus
    Then the coverage layer has 0 findings
    And the report's spread-unverified line names R13

  @D118
  Scenario: with a corpus confirming the outline the quantity is cleared
    Given a docket whose entry R13 response contains the quantity {2 seconds}
    And R13 has the line "spread: duplicate-timing"
    And a corpus with a scenario outline titled "duplicate-timing"
    When the docket is linted with the corpus
    Then the coverage layer has 0 findings
    And the report's spread-unverified line is absent

  @D121
  Scenario: a list node referenced by no spread is a coverage finding
    Given a docket whose entry R13 response contains the list {never-run | orphan | dark | unrefined}
    And R13 has no spread line
    When the docket is linted
    Then the coverage layer has 1 finding keyed R13 resp
    And the finding's message contains "never-run"

  @D91
  Scenario: a quantity in a need slot spread by an outline has no coverage finding
    Given a docket whose need N4 reads "I need the {244} done units graded" and N4 has the line "spread: graded-units"
    And a corpus with a scenario outline titled "graded-units"
    When the docket is linted with the corpus
    Then the coverage layer has 0 findings

  @D91
  Scenario: a quantity in a need slot with no spread is a coverage finding
    Given a docket whose need N4 reads "I need the {244} done units graded" and N4 has no spread line
    When the docket is linted
    Then the coverage layer has 1 finding keyed N4 need
    And the finding's message contains "244"

  @D108
  Scenario: a need nothing serves is a coverage finding
    Given a docket with need entry N4
    And no in-effect ruling names N4 in a serves line, a need resolution, or a means resolution
    When the docket is linted
    Then the coverage layer has 1 finding keyed N4 need
    And the finding's fix contains "ask what behaviour meets it, or fence it"

  @D108
  Scenario: a triggered ruling serves a need and stays triggered
    Given a docket with need entry N4
    And a wanted entry R12 with a trigger, a sib line, and the line "serves: N4"
    When the docket is linted
    Then the coverage layer has 0 findings
    And the node R12 has a trigger and serves N4
    And the node N4 is served by R12

  @D108
  Scenario: a need served only by a fence kind is listed as fenced
    Given a docket with need entry N4
    And an entry R3 resolving to fence-deferred with the line "serves: N4"
    When the docket is linted
    Then the coverage layer has 0 findings
    And the report's fenced-needs line names N4

  @D108
  Scenario: a serves line naming a ruling id is a form finding
    Given a docket whose entry R12 has the line "serves: R13"
    When the docket is linted
    Then the form layer has 1 finding keyed R12 serves
    And the finding's message contains "serves names needs only"

  @D114
  Scenario: an unwanted entry no wanted entry names is a coverage finding
    Given a docket whose unwanted entry R13 has a trigger
    And no in-effect entry has a sib line naming R13
    When the docket is linted
    Then the coverage layer has 1 finding keyed R13
    And the finding's fix contains "name the wanted behaviour this fails, or record it"

  @D114
  Scenario: an unwanted fence-kind entry is not an orphan
    Given a docket whose unwanted entry R3 has a trigger and resolves to fence-deferred
    And no entry has a sib line naming R3
    When the docket is linted
    Then the coverage layer has 0 findings

  @D115
  Scenario: a sibling with an inferred slot is counted as covered by inferred
    Given a docket whose wanted entry R12 has sib R13
    And R13 is an unwanted entry whose response provenance is I
    When the docket is linted
    Then the coverage layer has 0 findings
    And the report's covered-by-inferred line reads "covered by inferred: 1 (R12 by R13)"

  @D109
  Scenario: a structural ruling with no serves line is a coverage finding
    Given a docket whose entry R8 resolves to structural and has no serves line
    When the docket is linted
    Then the coverage layer has 1 finding keyed R8
    And the finding's fix contains "name the need or reclassify"

  @D148
  Scenario: a boundary ruling with no serves line is a coverage finding
    Given a docket whose entry R2 resolves to boundary and has no serves line
    When the docket is linted
    Then the coverage layer has 1 finding keyed R2
    And the finding's fix contains "name the need or reclassify"

  @D109
  Scenario: a structural ruling serving a need has no coverage finding
    Given a docket with need entry N4
    And an entry R8 resolving to structural with the line "serves: N4"
    When the docket is linted
    Then the coverage layer has 0 findings

  @D21
  Scenario: an entry with no precondition, no trigger, and no resolution is a resolution finding
    Given a docket whose entry R14 has only a response slot and no resolution line
    When the docket is linted
    Then the resolution layer has 1 finding keyed R14
    And the finding's fix lists the resolution kinds

  @D21
  Scenario: an entry with no trigger resolved to a need has no resolution finding
    Given a docket whose entry R14 has only a response slot and resolves to need N4
    And N4 is a need entry in the docket
    When the docket is linted
    Then the resolution layer has 0 findings

  @D17
  Scenario: a resolution naming a need id the docket lacks is a consistency finding
    Given a docket whose entry R14 resolves to need N9
    And no entry N9 exists
    When the docket is linted
    Then the consistency layer has 1 finding keyed R14

  @D220
  Scenario: an unresolved quantity is counted on its own line, never a finding
    Given a docket whose entry R13 response contains the quantity {TBD seconds}
    And R13 has the line "spread: duplicate-timing"
    When the docket is linted without a corpus
    Then the coverage layer has 0 findings
    And the report's unresolved line reads "unresolved quantities: 1 (R13 resp {TBD seconds})"

  @D220
  Scenario: an unresolved quantity with no spread line is still an unspread finding
    Given a docket whose entry R13 response contains the quantity {TBD seconds}
    And R13 has no spread line
    When the docket is linted
    Then the coverage layer has 1 finding keyed R13 resp
    And the report's unresolved line reads "unresolved quantities: 1 (R13 resp {TBD seconds})"

  @D221
  Scenario: an outline never clears an unresolved quantity while the token stands
    Given a docket whose entry R13 response contains the quantity {TBD seconds}
    And R13 has the line "spread: duplicate-timing"
    And a corpus with a scenario outline titled "duplicate-timing"
    When the docket is linted with the corpus
    Then the coverage layer has 0 findings
    And the report's spread-unverified line names R13

  @D225
  Scenario: an interviewer-supplied quantity with no why is counted, not a finding
    Given a docket whose entry R13 response contains the quantity {2 seconds}
    And R13 has the line "spread: duplicate-timing"
    And R13 has no why slot
    When the docket is linted without a corpus
    Then the coverage layer has 0 findings
    And the report's without-why line reads "quantities without why: 1 (R13 resp)"

  @D225
  Scenario: a why slot clears the count
    Given a docket whose entry R13 response contains the quantity {2 seconds}
    And R13 has the line "spread: duplicate-timing"
    And R13 has a why tagged I>V
    When the docket is linted without a corpus
    Then the report's without-why line reads "quantities without why: 0"

  @D225
  Scenario: the visionary's own quantity owes no why
    Given a docket whose entry R13 response contains the quantity {2 seconds}
    And R13 has the line "spread: duplicate-timing"
    And R13 has a response tagged V
    When the docket is linted without a corpus
    Then the report's without-why line reads "quantities without why: 0"
