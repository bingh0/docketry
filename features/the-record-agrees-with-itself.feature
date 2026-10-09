Feature: the record agrees with itself
  As a consumer walking the docket's relations
  I want touches, relations, and effective dates to resolve without guessing
  So that what a ruling touches and whether it still stands are facts of the tree

  Background:
    Given the docket format version 1

  @D21
  Scenario: a ruling with no touches line is a consistency finding
    Given a docket whose entry R13 has no touches line
    When the docket is linted
    Then the consistency layer has 1 finding keyed R13
    And the finding's fix names "touches: none"

  @D28
  Scenario: touches naming an id not in the docket is a form finding
    Given a docket whose entry R13 has touches R99
    And no entry R99 exists
    When the docket is linted
    Then the form layer has 1 finding keyed R13 touches

  @D28
  Scenario: touches naming a later id is a form finding
    Given a docket whose entry R13 has touches R15
    And R15 appears after R13 in the docket
    When the docket is linted
    Then the form layer has 1 finding keyed R13 touches
    And the finding's message contains "later"

  @D16
  Scenario: a reversed entry is not in effect after the reversal
    Given a docket whose entry R15 dated 2026-09-06 reverses R13 dated 2026-09-04
    When the docket is parsed
    Then the node R13 is not in effect
    And the node R13 has relation reversedBy R15

  @D47
  Scenario: as of a date before the reversal the entry is in effect
    Given a docket whose entry R15 dated 2026-09-06 reverses R13 dated 2026-09-04
    When the docket is parsed as of 2026-09-05
    Then the node R13 is in effect
    And the node R15 is not in effect

  @D47
  Scenario: as of a date before every entry nothing is in effect
    Given a docket whose earliest entry is dated 2026-09-04
    When the docket is parsed as of 2026-09-01
    Then 0 nodes are in effect

  @D71
  Scenario: reversing a reversal restores the original
    Given a docket whose entry R15 reverses R13 and whose later entry R17 reverses R15
    When the docket is parsed
    Then the node R13 is in effect
    And the node R15 is not in effect

  @D71
  Scenario: a same-date reversal takes effect by file order
    Given a docket whose entry R13 dated 2026-09-04 is reversed by R15 dated 2026-09-04
    When the docket is parsed as of 2026-09-04
    Then the node R13 is not in effect
    And the node R15 is in effect

  @D71
  Scenario: the default as-of date is the docket's latest entry date
    Given a docket whose latest entry is dated 2026-09-20
    And the clock reads 2026-09-05
    When the docket is parsed
    Then the tree's as-of date is 2026-09-20
    And the node dated 2026-09-20 is in effect

  @D71
  Scenario: reaffirms and ratifies change nothing about effect
    Given a docket whose entry R16 reaffirms R13 and whose entry R17 ratifies R14
    When the docket is parsed
    Then the nodes R13, R14, R16, R17 are all in effect

  @D65
  Scenario: an amended entry stays in effect and names its amendment
    Given a docket whose entry R16 dated 2026-09-06 amends R13
    When the docket is parsed
    Then the node R13 is in effect
    And the node R13 has relation amendedBy R16

  @D65
  Scenario: the amender's restatement is the target's effective shape
    Given a docket whose entry R13 has a trigger, a sib line, and no resolution
    And a later entry R16 amends R13 with a response slot, no trigger, and the resolution structural
    When the docket is parsed
    Then the node R13 has effective shape from R16
    And the effective shape of R13 has no trigger
    And the effective shape of R13 resolves to structural

  @D65
  Scenario: a chain of amendments resolves to the last amender
    Given a docket whose entry R16 amends R13 and whose entry R18 amends R13
    And R18 appears after R16
    When the docket is parsed
    Then the node R13 has effective shape from R18

  @D113
  Scenario: a reversed amendment drops out of the chain
    Given a docket whose entry R16 amends R13 and whose later entry R18 reverses R16
    When the docket is parsed
    Then the node R13 is in effect
    And the node R13 has effective shape from R13

  @D113
  Scenario: reversing the last of two amenders restores the first
    Given a docket whose entries R16 and R18 both amend R13, in that order
    And a later entry R20 reverses R18
    When the docket is parsed
    Then the node R13 has effective shape from R16

  @D146
  Scenario: an interviewer-tagged amendment of a visionary ruling is a consistency finding
    Given a docket whose entry R13 has every slot tagged V
    And a later entry R16 tagged I>V that amends R13
    When the docket is linted
    Then the consistency layer has 1 finding keyed R16
    And the finding's message contains "may not rewrite the visionary"

  @D146
  Scenario: a visionary ratification of the amender clears the rewrite finding
    Given a docket whose entry R13 has every slot tagged V
    And a later entry R16 tagged I>V that amends R13
    And a later entry R17 tagged V that ratifies R16
    When the docket is linted
    Then the consistency layer has 0 findings

  @D165
  Scenario: amending the last amender instead of the root is still a rewrite
    Given a docket whose entry R13 has every slot tagged V
    And a later entry R16 tagged V that amends R13
    And a later entry R17 tagged I>V that amends R16
    When the docket is linted
    Then the consistency layer has 1 finding keyed R17

  @D165
  Scenario: reversing the visionary's amender of an interviewer ruling is a rewrite
    Given a docket whose entry R13 has every slot tagged I>V
    And a later entry R16 tagged V that amends R13
    And a later entry R17 tagged I>V that reverses R16
    When the docket is linted
    Then the consistency layer has 1 finding keyed R17

  @D165
  Scenario: a ratified amender counts as visionary for every later amender
    Given a docket whose entry R13 has every slot tagged V
    And a later entry R16 tagged I>V that amends R13, ratified by R17 tagged V
    And a later entry R18 tagged I>V that amends R13
    When the docket is linted
    Then the consistency layer has 1 finding keyed R18

  @D177
  Scenario: ratifying an amender ratifies the earlier amenders of its root
    Given a docket whose entry R13 has every slot tagged V
    And later entries R16 and R17, each tagged I>V, each amending R13
    And a later entry R18 tagged V that ratifies R17
    When the docket is linted
    Then the consistency layer has 0 findings

  @D165
  Scenario: the report lists visionary-tagged relation entries by id
    Given a docket whose entry R16 tagged V amends R13
    When the docket is linted
    Then the report's visionary-relations line names R16

  @D146
  Scenario: a reaffirmation below rank is not a rewrite
    Given a docket whose entry R13 has every slot tagged V
    And a later entry R16 tagged I>V that reaffirms R13
    When the docket is linted
    Then the consistency layer has 0 findings

  @D116
  Scenario: a need may be amended and restates its weight
    Given a docket whose need N4 has weight 3
    And a later entry N6 dated 2026-09-06 amends N4 with weight 5 and the same need slot
    When the docket is parsed
    Then the node N4 has effective weight 5
    And the node N4 has relation amendedBy N6

  @D116
  Scenario: a tension line is a typed edge between needs
    Given a docket with needs N4 and N5
    And N5 has the line "tension: N4 -- the agent surface stays smaller than the human's"
    When the docket is parsed
    Then the node N5 has tension with N4
    And the node N4 is in tension with N5

  @D116
  Scenario: a tension reason under the floor is a form finding
    Given a docket with needs N4 and N5
    And N5 has the line "tension: N4 -- capped"
    When the docket is linted
    Then the form layer has 1 finding keyed N5 tension

  @D65
  Scenario: coverage and traceability read the effective shape
    Given a docket whose entry R13 has a trigger and no sib line
    And a later entry R16 amends R13 with a response slot, no trigger, and the resolution boundary
    When the docket is linted with the corpus
    Then the coverage layer has 0 findings keyed R13
    And the traceability layer has 0 findings keyed R13

  @D110
  Scenario: the parse exposes touches in both directions
    Given a docket whose entry R13 has touches R12
    When the docket is parsed
    Then the node R13 touches R12
    And the node R12 is touched by R13

  @D17
  Scenario: touches may name a need id
    Given a docket with need entry N4 and whose entry R13 has touches N4
    When the docket is linted
    Then the form layer has 0 findings
    And the node R13 touches N4

  @D78
  Scenario: a relation keyword outside the five refuses the docket
    Given a docket whose entry R16 header reads "R16 2026-09-06 [V] supersedes R13"
    When the docket is linted
    Then the exit code is 2
    And the refusal names the relation supersedes

  @D222
  Scenario: signs is a relation the parse admits beside the four
    Given a docket whose entry R16 header reads "R16 2026-09-06 [V] signs R13"
    And R16 has a response slot and no resolution line
    When the docket is linted
    Then the resolution layer has 0 findings
    And the node R16 has relation signs R13

  @D223
  Scenario: a visionary signs entry marks every entry in effect at its date signed
    Given a docket whose entry R16 dated 2026-09-06 signs R13 dated 2026-09-04
    When the docket is parsed
    Then the node R13 is marked signed on 2026-09-06 by R16
    And the node R16 is marked signed on 2026-09-06 by R16

  @D223
  Scenario: an entry dated after the signature is not signed
    Given a docket whose entry R16 dated 2026-09-06 signs R13 dated 2026-09-04
    And the next entry R17 is dated 2026-09-07
    When the docket is parsed
    Then the node R17 is not signed

  @D223
  Scenario: the as-of parse at the signing date is the signed state
    Given a docket whose entry R16 dated 2026-09-06 signs R13 dated 2026-09-04
    And the next entry R17 is dated 2026-09-07
    When the docket is parsed as of 2026-09-06
    Then the nodes in effect are exactly the nodes marked signed

  @D223
  Scenario: a signs entry under any other tag is a consistency finding and signs nothing
    Given a docket whose entry R13 has every slot tagged V
    And a later entry R16 tagged I>V that signs R13
    When the docket is linted
    Then the consistency layer has 1 finding keyed R16
    And the finding's message contains "only the visionary signs"
    And the node R13 is not signed

  @D223
  Scenario: the report carries a signed line beside the ratified line
    Given a docket whose entry R16 dated 2026-09-06 signs R13 dated 2026-09-04
    When the docket is linted
    Then the report's signed line reads "signed: R16 for R13 on 2026-09-06"
    And the report's signed line follows its ratified line
