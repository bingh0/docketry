Feature: the docket grammar
  As the interviewer who writes the docket and the agents that walk its parse
  I want one closed grammar with one parse
  So that a docket means the same thing to every reader and nothing in it is guessed

  Background:
    Given the docket format version 1

  @D21
  Scenario: a five-entry docket parses into four rulings and one need
    Given a docket with rulings R12, R13, R14, R15 and need N4
    When the docket is parsed
    Then the tree holds 5 nodes
    And 4 nodes have kind ruling
    And 1 node has kind need

  @D25
  Scenario: every node carries its source line
    Given a docket whose entry R13 begins on line 9
    When the docket is parsed
    Then the node R13 has line 9

  @D155
  Scenario: every node carries a derived hash and the tree a chain hash
    Given a docket with entries R12 and R13
    When the docket is parsed
    Then the node R12 has a hash of 64 hex digits
    And the tree's chain hash changes when R13's response changes
    And the docket file contains no hash line

  @D25
  Scenario: the parse declares its format
    Given a docket with 5 entries
    When the docket is parsed
    Then the tree's first key is "docket" with value 1

  @D119
  Scenario Outline: each provenance tag is recorded on its slot
    Given a docket whose entry R13 has trigger provenance <tag>
    When the docket is parsed
    Then the node R13 has trigger provenance <tag>

    Examples:
      | tag |
      | V   |
      | I>V |
      | I+V |
      | I   |
      | ?   |

  @D67
  Scenario: a means resolution carries its need reference
    Given a docket whose entry R14 resolves to means N4
    And N4 is a need entry in the docket
    When the docket is parsed
    Then the node R14 resolves to means with reference N4

  @D70
  Scenario: a hash line inside an entry attaches to the node as a note
    Given a docket whose entry R13 contains the line "# roads not taken: a scaffold command" after its touches line
    When the docket is linted
    Then the form layer has 0 findings
    And the node R13 has 1 note reading "roads not taken: a scaffold command"

  @D70
  Scenario: a hash line between entries is dropped
    Given a docket with the line "# drafted in session two" between entries R13 and R14
    When the docket is parsed
    Then the node R13 has 0 notes
    And the node R14 has 0 notes

  @D112
  Scenario: a serves line parses as a list of need ids
    Given a docket with needs N4 and N5
    And an entry R13 with the line "serves: N4 N5"
    When the docket is parsed
    Then the node R13 serves N4 and N5

  @D73
  Scenario: a header tag above the lowest slot tag is a consistency finding
    Given a docket whose entry R13 header carries V
    And R13 has a trigger tagged I>V and a response tagged V
    When the docket is linted
    Then the consistency layer has 1 finding keyed R13
    And the finding's message contains "lowest slot is I>V"

  @D20
  Scenario: a braced quantity becomes a quantity node
    Given a docket whose entry R13 response reads "the listing shows both files within {2 seconds}"
    When the docket is parsed
    Then the node R13 has 1 quantity node under resp
    And that quantity node has text "2 seconds"

  @D121
  Scenario: a braced island with pipe separators is a list node
    Given a docket whose entry R13 response reads "only the readiness face is served — {never-run | orphan | dark | unrefined}"
    When the docket is parsed
    Then the node R13 has 1 list node under resp
    And that list node has 4 members

  @D121
  Scenario: a braced island with a comma stays a quantity
    Given a docket whose entry R13 response reads "the corpus holds {1,000 units}"
    When the docket is parsed
    Then the node R13 has 1 quantity node under resp
    And the node R13 has 0 list nodes

  @D181
  Scenario: a near-miss on a superseded line is not a finding once the chain restates it
    Given a docket whose entry R13 response reads "under v1.2 the listing appears"
    And a later entry R16 amends R13 with the response "under `v1.2` the listing appears"
    When the docket is linted
    Then the form layer has 0 findings

  @D57
  Scenario: an entry carrying a relation needs no resolution line
    Given a docket whose entry R16 header reads "R16 2026-09-06 [V] ratifies R13"
    And R16 has a response slot and no resolution line
    When the docket is linted
    Then the resolution layer has 0 findings
    And the node R16 has relation ratifies R13

  @D17
  Scenario: a need entry carries beneficiary, weight, and a need slot
    Given a docket whose entry N4 header reads "N4 2026-09-04 [V] user 5"
    And N4 has the need slot "I need to find any document again when I actually need it"
    When the docket is parsed
    Then the node N4 has beneficiary user
    And the node N4 has weight 5
    And the node N4 has need provenance V

  @D182
  Scenario: the grammar reference and the parser agree on every closed set
    Given the shipped file GRAMMAR.md
    When its tables of slot keywords, provenance tags, resolution kinds, relations, and rule words are read
    Then each table equals the parser's set of the same name

  @D220
  Scenario: a braced island carrying TBD is an unresolved quantity node
    Given a docket whose entry R13 response reads "the listing settles within {TBD seconds}"
    When the docket is parsed
    Then the node R13 has 1 quantity node under resp
    And that quantity node is unresolved as TBD

  @D220
  Scenario: a braced island carrying TBR is a quantity held with low confidence
    Given a docket whose entry R13 response reads "the listing settles within {2 seconds TBR}"
    When the docket is parsed
    Then the node R13 has 1 quantity node under resp
    And that quantity node is unresolved as TBR

  @D225
  Scenario: a why slot parses as a slot with its own provenance tag
    Given a docket whose entry R13 has a why tagged I>V
    When the docket is parsed
    Then the node R13 has why provenance I>V
    And the node R13 has 4 slots
