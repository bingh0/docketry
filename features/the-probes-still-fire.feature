Feature: the probes still fire
  As the visionary who watched four gamed dockets pass the early lints
  I want each specimen's findings asserted by key against the built lint, and the house docket held clean
  So that a repair to one check cannot silently reopen a hole another review closed

  Background:
    Given the docket format version 1

  @D187
  Scenario: probe A, the boundary sink, fires on three unserved boundaries and two mis-cited scenarios
    Given the specimen "A" and its corpus
    When the docket is linted with the corpus
    Then the coverage layer has 3 findings keyed R2, R3, and R4 by the rule of D148
    And the traceability layer has 2 findings at the scenarios "a file is stored" and "listing" by the rule of D163
    And the findings count is 5

  @D187
  Scenario: probe B, the realistic hollow, fires once in each of four layers
    Given the specimen "B" and its corpus
    When the docket is linted with the corpus
    Then the form layer has 1 finding keyed R9 by the rule of D147
    And the coverage layer has 1 finding keyed R8 by the rule of D148
    And the consistency layer has 1 finding keyed R7 by the rule of D177
    And the traceability layer has 1 finding keyed R5 by the rule of D151
    And the findings count is 4

  @D187
  Scenario: probe C, the controls, fires nine times across four layers
    Given the specimen "C" and its corpus
    When the docket is linted with the corpus
    Then the form layer has 1 finding keyed R4 by the rule of D68
    And the coverage layer has 2 findings keyed R4 and R6 by the rule of D148
    And the coverage layer has 1 finding keyed R5 by the rule of D114
    And the coverage layer has 1 finding keyed "N0 need" by the rule of D108
    And the consistency layer has 1 finding keyed R2 by the rule of D177
    And the traceability layer has 1 finding keyed R5 by the rule of D24
    And the traceability layer has 1 finding at the scenario "read-only" citing reversed R1
    And the traceability layer has 1 finding at the design document's ruled tag citing reversed R1
    And the findings count is 9

  @D187
  Scenario: probe D, the second hollow, fires once and is named twice on the counted lines
    Given the specimen "D" and its corpus
    When the docket is linted with the corpus
    Then the form layer has 1 finding keyed "R1 resp" by the rule of D181
    And the visionary-tagged relations line names R7
    And the de-triggered line names "R11 for R10"
    And the findings count is 1

  @D187
  Scenario: the house docket lints clean against its own corpus
    Given the repository's own docket and the corpus beside it
    When the docket is linted in strict mode with the corpus
    Then the exit code is 0
    And the findings count is 0
