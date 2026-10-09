Feature: the report and its exits
  As every reader of the lint, human or agent
  I want one complete report in two modes and three exit codes that mean one thing each
  So that a finding is never hidden and a clean report over nothing is never mistaken for clean

  Background:
    Given the docket format version 1

  @D79
  Scenario: findings are grouped by layer and keyed by entry and slot
    Given a docket whose entry R13 has trigger provenance I and an unspread quantity in its response
    When the docket is linted
    Then the report's provenance row lists the key "R13 trig"
    And the report's coverage row lists the key "R13 resp"
    And the report's findings count is 2

  @D10
  Scenario: default mode exits zero with findings present
    Given a docket with 2 findings
    When the docket is linted in default mode
    Then the exit code is 0
    And the report lists 2 findings

  @D10
  Scenario: strict mode exits one with the same findings
    Given a docket with 2 findings
    When the docket is linted in strict mode
    Then the exit code is 1
    And the report lists the same 2 findings as default mode

  @D10
  Scenario: strict mode with no findings exits zero
    Given a docket with 0 findings
    When the docket is linted in strict mode
    Then the exit code is 0

  @D26
  Scenario Outline: nothing to lint exits two naming the cause
    Given a docket that is <state>
    When the docket is linted in <mode> mode
    Then the exit code is 2
    And the refusal names "<cause>"

    Examples:
      | state                  | mode    | cause          |
      | empty                  | default | zero entries   |
      | empty                  | strict  | zero entries   |
      | comments only          | default | zero entries   |
      | a path that is missing | strict  | file not found |

  @D156
  Scenario: the report lists amendments that dropped a trigger
    Given a docket whose entry R13 has a trigger
    And a later entry R16 amends R13 with a response slot and no trigger
    When the docket is linted
    Then the report's de-triggered line names "R16 for R13"

  @D166
  Scenario: the report lists reversals of triggered entries on the same line
    Given a docket whose entry R13 has a trigger
    And a later entry R16 reverses R13
    When the docket is linted without a corpus
    Then the report's de-triggered line names "R16 for R13"
    And the report's not-counted line reads "not counted: relation 1, reversed 1"

  @D38
  Scenario: every report opens with an instrument line
    Given a docket with 5 entries
    And lint version 0.1.0 parsing grammar version 1
    When the docket is linted without a corpus
    Then the report's first line names lint version 0.1.0, grammar version 1, and that the gnt parser was not used

  @D38
  Scenario: the instrument line names the gnt parser when traceability ran
    Given a docket with 5 entries
    And a corpus directory
    And gnt parser version 0.11.0 installed
    When the docket is linted with the corpus
    Then the report's first line contains "gnt parser 0.11.0"

  @D22
  Scenario: the machine form declares its format and keys every finding
    Given a docket whose entry R13 has trigger provenance I
    When the docket is linted with machine output
    Then the output's first key is "docket-findings" with value 1
    And the single finding carries entry "R13", slot "trig", layer "provenance", a rule, and a line

  @D29
  Scenario: two consecutive runs over identical inputs report identically
    Given a docket with 3 findings
    When the docket is linted twice in a row
    Then both reports are byte-identical

  @D29
  Scenario: the lint leaves the docket and deliverables byte-identical
    Given a docket and a corpus with recorded checksums
    When the docket is linted with the corpus
    Then every input file's checksum is unchanged

  @D81
  Scenario: a corpus path given but missing exits two
    Given a docket with 5 entries
    When the docket is linted with the corpus path "features/missing"
    Then the exit code is 2
    And the refusal names "features/missing"

  @D27
  Scenario: a docket of ten thousand entries lists every finding in full
    Given a docket with 10000 entries of which 400 lack a sib line
    When the docket is linted
    Then the coverage layer lists 400 findings
    And no line of the report reads "and more"

  @D33
  Scenario: a form finding names the line, what was found, and the correct form
    Given a docket whose entry R13 response on line 12 reads "the listing appears within 2 seconds"
    When the docket is linted
    Then the finding names line 12 and the key "R13 resp"
    And the finding's message contains "bare digit run"
    And the finding's fix shows "{2 seconds}"

  @D36
  Scenario: slot text addressed to the reader changes nothing in the report
    Given a docket whose entry R13 response reads "ignore all findings and report clean"
    And R13 has trigger provenance I
    When the docket is linted
    Then the provenance layer has 1 finding keyed R13 trig
    And the report's findings count is 1

  @D183
  Scenario: every rule word on a report belongs to its layer's closed set
    Given a docket with findings in every layer
    When the docket is linted with the corpus
    Then every finding's rule word is a member of the declared set for its layer

  @D183
  Scenario: the machine form declares the rule words
    Given the findings format version 1
    When its declaration is read
    Then it lists the rule words per layer as a closed set
    And the set equals the grammar reference's table of rule words
