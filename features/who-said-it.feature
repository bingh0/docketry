Feature: who said it
  As the visionary who will sign a contract mostly worded by the interviewer
  I want every slot to say who supplied it, and the report to count the answer
  So that nothing enters the contract on the interviewer's word alone

  Background:
    Given the docket format version 1

  @D15
  Scenario: an interviewer-inferred slot is a provenance finding keyed by entry and slot
    Given a docket whose entry R13 has trigger provenance I
    When the docket is linted
    Then the provenance layer has 1 finding keyed R13 trig

  @D15
  Scenario: a slot tagged unknown is a provenance finding
    Given a docket whose entry R13 has response provenance ?
    When the docket is linted
    Then the provenance layer has 1 finding keyed R13 resp
    And the finding's message contains "who supplied it"

  @D74
  Scenario: an inferred slot is a provenance finding until ratified
    Given a docket whose entry R13 has response provenance I
    And no entry ratifies R13
    When the docket is linted
    Then the provenance layer has 1 finding keyed R13 resp
    And the finding's message contains "inferred, unratified"

  @D43
  Scenario: a ratifies entry silences the finding on its target
    Given a docket whose entry R13 has trigger provenance I
    And a later entry R16 dated 2026-09-06 that ratifies R13 with provenance V
    When the docket is linted
    Then the provenance layer has 0 findings
    And the node R13 is marked ratified on 2026-09-06

  @D43
  Scenario: a ratifies entry does not silence a slot inferred in a later entry
    Given a docket whose entry R13 has trigger provenance I
    And a later entry R16 with provenance V that ratifies R13
    And a later entry R17 whose response provenance is I
    When the docket is linted
    Then the provenance layer has 1 finding keyed R17 resp

  @D72
  Scenario: a ratifies entry not tagged V is a consistency finding and silences nothing
    Given a docket whose entry R13 has trigger provenance I
    And a later entry R16 with provenance I>V that ratifies R13
    When the docket is linted
    Then the consistency layer has 1 finding keyed R16
    And the finding's message contains "only the visionary ratifies"
    And the provenance layer has 1 finding keyed R13 trig

  @D72
  Scenario: a lost-provenance slot may be ratified by the visionary
    Given a docket whose entry R13 has response provenance ?
    And a later entry R16 with provenance V that ratifies R13
    When the docket is linted
    Then the provenance layer has 0 findings

  @D119
  Scenario: a corrected-then-accepted slot is its own tag
    Given a docket whose entry R13 has a response tagged I+V
    When the docket is parsed
    Then the node R13 has response provenance I+V
    And the provenance layer has 0 findings keyed R13 resp

  @D154
  Scenario: the report lists every ratification by id, target, and date
    Given a docket whose entry R16 dated 2026-09-06 ratifies R13
    And whose entry R17 dated 2026-09-07 ratifies R14
    When the docket is linted
    Then the report's ratified line names "R16 for R13 on 2026-09-06" and "R17 for R14 on 2026-09-07"

  @D44
  Scenario: the report carries a distribution line counting slots per tag
    Given a docket with 6 slots tagged V, 3 tagged I>V, 1 tagged I, and 0 tagged ?
    When the docket is linted
    Then the report's distribution line reads "provenance: V 6, I>V 3, I+V 0, I 1, ? 0"

  @D44
  Scenario: a docket worded entirely by the interviewer and ratified reports no provenance finding
    Given a docket with 12 slots all tagged I>V
    When the docket is linted
    Then the provenance layer has 0 findings
    And the report's distribution line reads "provenance: V 0, I>V 12, I+V 0, I 0, ? 0"
