Feature: the docket's syntax
  As the interviewer who writes the docket by hand
  I want every production of the grammar spelled out over the text that proves it
  So that a line I write is admitted, or refused at its own line with the one correct form

  # Every docket below is written out in full. Leading indent is visible: one
  # open box per space, one arrow for a tab, since a table cell is trimmed. A
  # pipe inside a cell is escaped. Nothing else is transformed.

  @D135
  Scenario: a docket declaring a known version parses under it
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then the exit code in default mode is 0
    And the report's instrument line names grammar version 1

  @D37
  Scenario: a docket declaring an unknown format version is refused naming both versions
    Given the docket
      | docket: 7                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then the exit code is 2
    And the refusal names version 7 and version 1

  @D37
  Scenario: a docket with no version line is refused
    Given the docket
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then the exit code is 2
    And the refusal names the missing version line

  @D186
  Scenario: a bad version line is refused alone
    Given the docket
      | docket: 7                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then the refusal names version 7 and version 1
    And the refusal does not mention R13

  @D186
  Scenario: one refusal names every tree-breaking defect
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
      |                                                         |
      | R15 2026-09-05 [I>V]                                    |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣->     wish                                           |
      | ␣␣touches: none                                         |
      |                                                         |
      | R16 2026-09-06 [I>V] amends R99                         |
      | ␣␣resp:  the folder is watched again [I>V]              |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then the exit code is 2
    And the refusal names "duplicate id R13: declared on line 3 and line 8"
    And the refusal names R15 and the kind wish
    And the refusal names R16 and R99

  @D184
  Scenario: a byte-order mark and carriage returns parse as if absent
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
      |                                                         |
      | R14 2026-09-05 [I>V]                                    |
      | ␣␣trig:  the folder is renamed [I>V]                    |
      | ␣␣resp:  the listing follows the folder [I>V]           |
      | ␣␣touches: none                                         |
    And the file is saved with a leading byte-order mark and CRLF line endings
    When the docket is parsed and then formatted
    Then the tree is identical to the parse of the same docket saved plain
    And the formatted file begins with "docket: 1" and contains no carriage return

  @D184
  Scenario: a slot line indented by a tab is a stray line
    Given the docket
      | docket: 1                                              |
      |                                                        |
      | R13 2026-09-05 [I>V]                                   |
      | ␣␣trig:  a file is dropped onto the folder [I>V]       |
      | ⇥resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                        |
      |                                                        |
      | R14 2026-09-05 [I>V]                                   |
      | ␣␣trig:  the folder is renamed [I>V]                   |
      | ␣␣resp:  the listing follows the folder [I>V]          |
      | ␣␣touches: none                                        |
    When the docket is linted
    Then form fires stray-line at line 5 keyed R13
    And the finding's message contains "stray line"
    And the fix reads "indent by two spaces"
    And the form layer has 1 finding keyed R13

  @D184
  Scenario: a slot line indented by three spaces is a stray line
    Given the docket
      | docket: 1                                                |
      |                                                          |
      | R13 2026-09-05 [I>V]                                     |
      | ␣␣trig:  a file is dropped onto the folder [I>V]         |
      | ␣␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                          |
      |                                                          |
      | R14 2026-09-05 [I>V]                                     |
      | ␣␣trig:  the folder is renamed [I>V]                     |
      | ␣␣resp:  the listing follows the folder [I>V]            |
      | ␣␣touches: none                                          |
    When the docket is linted
    Then form fires stray-line at line 5 keyed R13
    And the fix reads "indent by two spaces"

  @D184
  Scenario: a blank line ends the entry and orphans the slot lines below it
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      |                                                         |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
      |                                                         |
      | R14 2026-09-05 [I>V]                                    |
      | ␣␣trig:  the folder is renamed [I>V]                    |
      | ␣␣resp:  the listing follows the folder [I>V]           |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires missing-response at line 3 keyed "R13 resp"
    And the fix reads "resp: <text> [tag]"
    And form fires stray-line at line 6 keyed R13
    And form fires stray-line at line 7 keyed R13
    And the fix reads "remove the blank line inside the entry, or start a new entry with a header"

  @D133
  Scenario: a well-formed entry produces no form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R12 2026-09-05 [I>V] !                                  |
      | ␣␣trig:  the folder is not watched [I>V]                |
      | ␣␣resp:  the file never appears in the listing [I>V]    |
      | ␣␣touches: none                                         |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣pre:   the folder is being watched [I>V]              |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣sib:   R12                                            |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then the docket parses with 0 form findings
    And the node R13 has 3 slots

  @D73
  Scenario: the unwanted mark and the relation are accepted in either order
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
      |                                                         |
      | R16 2026-09-06 [I>V] amends R13 !                       |
      | ␣␣resp:  the file never appears in the listing [I>V]    |
      | ␣␣touches: R13                                          |
      |                                                         |
      | R17 2026-09-06 [I>V] ! amends R13                       |
      | ␣␣resp:  the file never appears in the sidebar [I>V]    |
      | ␣␣touches: R13                                          |
    When the docket is linted
    Then the docket parses with 0 form findings
    And the nodes R16 and R17 are both unwanted with relation amends R13

  @D17
  Scenario Outline: a need header carries a beneficiary and a weight inside the range
    Given the docket
      | docket: 1                                                              |
      |                                                                        |
      | N1 2026-09-04 [V] user <weight>                                        |
      | ␣␣need:  I need to find any document again when I actually need it [V] |
    When the docket is linted
    Then the docket parses with 0 form findings

    Examples:
      | weight |
      | 1      |
      | 3      |
      | 5      |

  @D17
  Scenario: a need weight outside one to five is a form finding
    Given the docket
      | docket: 1                                                              |
      |                                                                        |
      | N1 2026-09-04 [V] user 7                                               |
      | ␣␣need:  I need to find any document again when I actually need it [V] |
    When the docket is linted
    Then form fires weight-range at line 3 keyed N1
    And the fix reads "weight is an integer from 1 to 5"
    And the form layer has 1 finding keyed N1

  @D16
  Scenario: an undated entry is a form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 [I>V]                                               |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires undated at line 3 keyed R13
    And the fix reads "header: id YYYY-MM-DD [tag]"
    And the form layer has 1 finding keyed R13

  @D16
  Scenario: a header date that is not ISO is an undated form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-9-5 [I>V]                                      |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires undated at line 3 keyed R13
    And the fix reads "header: id YYYY-MM-DD [tag]"

  @D147
  Scenario: a date earlier than the entry above is a form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-06 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
      |                                                         |
      | R14 2026-09-01 [I>V]                                    |
      | ␣␣trig:  the folder is renamed [I>V]                    |
      | ␣␣resp:  the listing follows the folder [I>V]           |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires date-order at line 8 keyed R14
    And the finding's message contains "earlier than the entry above"
    And the fix reads "today's date, or the entry's proper position"
    And the form layer has 1 finding keyed R14

  @D78
  Scenario: a header line that is not an id refuses the docket
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | ruling thirteen 2026-09-05 [I>V]                        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then the exit code is 2
    And the refusal at line 3 names "unmatched header line"

  @D28
  Scenario: an id used twice refuses the docket
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then the exit code is 2
    And the refusal names "duplicate id R13: declared on line 3 and line 8"

  @D77
  Scenario: two ruling letters in one docket is a form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
      |                                                         |
      | D14 2026-09-05 [I>V]                                    |
      | ␣␣trig:  the folder is renamed [I>V]                    |
      | ␣␣resp:  the listing follows the folder [I>V]           |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires two-letters at line 8 keyed D14
    And the finding's message contains "one ruling letter per docket"
    And the fix reads "use R"
    And the form layer has 1 finding keyed D14

  @D134
  Scenario: a docket whose last entry is complete has no incomplete node
    Given the docket
      | docket: 1                                                       |
      |                                                                 |
      | R13 2026-09-05 [I>V]                                            |
      | ␣␣trig:  a file is dropped onto the folder [I>V]                |
      | ␣␣resp:  the file appears in the folder's listing [I>V]         |
      | ␣␣touches: none                                                 |
      |                                                                 |
      | R16 2026-09-06 [I>V]                                            |
      | ␣␣resp:  the file appears in the folder's listing at once [I>V] |
      | ␣␣->     boundary                                               |
      | ␣␣touches: R13                                                  |
    When the docket is linted
    Then no node is marked incomplete
    And the form layer has 0 findings keyed R16

  @D34
  Scenario: a trailing incomplete entry is kept and named as the resume point
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
      |                                                         |
      | R16 2026-09-06 [I>V]                                    |
      | ␣␣pre:   the folder is being watched [I>V]              |
    When the docket is linted
    Then the node R16 is marked incomplete
    And form fires incomplete at line 8 keyed R16
    And the finding's message contains "resume here"
    And the fix reads "finish the entry"
    And the exit code in default mode is 0

  @D152
  Scenario: a trailing entry lacking touches is incomplete and only the missing-line findings are held
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
      |                                                         |
      | R16 2026-09-06 [I]                                      |
      | ␣␣resp:  the listing follows the folder [I]             |
    When the docket is linted
    Then form fires incomplete at line 8 keyed R16
    And the fix reads "finish the entry"
    And the form layer has 1 finding keyed R16 whose message contains "resume here"
    And the consistency layer has 0 findings keyed R16
    And the provenance layer has 1 finding keyed R16 resp

  @D152
  Scenario: a session ending on a triggered entry is complete
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R12 2026-09-05 [I>V] !                                  |
      | ␣␣trig:  the folder is not watched [I>V]                |
      | ␣␣resp:  the file never appears in the listing [I>V]    |
      | ␣␣touches: none                                         |
      |                                                         |
      | R16 2026-09-06 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣sib:   R12                                            |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then no node is marked incomplete
    And the docket parses with 0 form findings

  @D119
  Scenario Outline: each provenance tag is admitted on a slot
    Given the docket
      | docket: 1                                                 |
      |                                                           |
      | R13 2026-09-05 [<tag>]                                    |
      | ␣␣trig:  a file is dropped onto the folder [<tag>]        |
      | ␣␣resp:  the file appears in the folder's listing [<tag>] |
      | ␣␣touches: none                                           |
    When the docket is linted
    Then the docket parses with 0 form findings

    Examples:
      | tag |
      | V   |
      | I>V |
      | I+V |
      | I   |
      | ?   |

  @D78
  Scenario: a provenance tag outside the five refuses the docket naming the line
    Given the docket
      | docket: 1                                             |
      |                                                       |
      | R13 2026-09-05 [I>V]                                  |
      | ␣␣trig:  a file is dropped onto the folder [I>V]      |
      | ␣␣resp:  the file appears in the folder's listing [X] |
      | ␣␣touches: none                                       |
    When the docket is linted
    Then the exit code is 2
    And the refusal names line 5 and the tag X

  @D15
  Scenario: a slot carrying two provenance tags is a form finding
    Given the docket
      | docket: 1                                                 |
      |                                                           |
      | R13 2026-09-05 [I>V]                                      |
      | ␣␣trig:  a file is dropped onto the folder [I>V]          |
      | ␣␣resp:  the file appears in the folder's listing [V] [I] |
      | ␣␣touches: none                                           |
    When the docket is linted
    Then form fires double-tag at line 5 keyed "R13 resp"
    And the fix reads "exactly one tag per slot"
    And the form layer has 1 finding keyed R13 resp

  @D15
  Scenario: a slot carrying no provenance tag is a form finding
    Given the docket
      | docket: 1                                         |
      |                                                   |
      | R13 2026-09-05 [I>V]                              |
      | ␣␣trig:  a file is dropped onto the folder [I>V]  |
      | ␣␣resp:  the file appears in the folder's listing |
      | ␣␣touches: none                                   |
    When the docket is linted
    Then form fires missing-tag at line 5 keyed "R13 resp"
    And the fix reads "resp: ... [V]"

  @D15
  Scenario: a second slot under one keyword is a form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣resp:  the file also appears in the sidebar [I>V]     |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires duplicate-slot at line 6 keyed "R13 resp"
    And the fix reads "one slot per keyword"

  @D73 @D108 @D116
  Scenario Outline: each keyword of the grammar is admitted at slot indent
    Given the docket
      | docket: 1                                                              |
      |                                                                        |
      | N1 2026-09-04 [V] user 5                                               |
      | ␣␣need:  I need to find any document again when I actually need it [V] |
      | ␣␣means: the folder is watched by a background process [V]             |
      | ␣␣tension: N2 -- the two needs pull against each other                 |
      |                                                                        |
      | N2 2026-09-04 [V] user 4                                               |
      | ␣␣need:  I need the listing to settle before I look away [V]           |
      |                                                                        |
      | R12 2026-09-05 [I>V] !                                                 |
      | ␣␣trig:  the folder is not watched [I>V]                               |
      | ␣␣resp:  the file never appears in the listing [I>V]                   |
      | ␣␣touches: none                                                        |
      |                                                                        |
      | R13 2026-09-05 [I>V]                                                   |
      | ␣␣pre:   the folder is being watched [I>V]                             |
      | ␣␣trig:  a file is dropped onto the folder [I>V]                       |
      | ␣␣resp:  the file appears in the folder's listing [I>V]                |
      | ␣␣sib:   R12                                                           |
      | ␣␣spread: the listing settles under load                               |
      | ␣␣serves: N1                                                           |
      | ␣␣touches: R12                                                         |
    When the docket is linted
    Then the docket parses with 0 form findings
    And the <word> line of <id> is on the parse

    Examples:
      | word    | id  |
      | pre     | R13 |
      | trig    | R13 |
      | resp    | R13 |
      | need    | N1  |
      | means   | N1  |
      | sib     | R13 |
      | spread  | R13 |
      | serves  | R13 |
      | tension | N1  |
      | touches | R13 |

  @D78
  Scenario: a word-colon keyword outside the set refuses the docket
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣wish:  a thing worth remembering                      |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then the exit code is 2
    And the refusal names the keyword wish
    And the refusal at line 5 names "wish"

  @D18
  Scenario Outline: each Gherkin keyword used as a slot keyword refuses the docket
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣<keyword>: a file is dropped onto the folder          |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then the exit code is 2
    And the refusal names the slot keyword <keyword>
    And the refusal at line 4 names "<keyword>"

    Examples:
      | keyword |
      | Given   |
      | When    |
      | Then    |
      | And     |
      | But     |

  @D28
  Scenario: a stray line inside an entry is a form finding naming the line
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣pre:   the folder is being watched [I>V]              |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣note to self: check this later                        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣sib:   none -- the drop is idempotent by construction |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires stray-line at line 6 keyed R13
    And the fix reads "a slot line is a keyword, a colon, and its text"
    And the form layer has 1 finding at line 6
    And the node R13 still has 3 slots

  @D76
  Scenario Outline: each resolution kind is admitted after the arrow
    Given the docket
      | docket: 1                                                              |
      |                                                                        |
      | N1 2026-09-04 [V] user 5                                               |
      | ␣␣need:  I need to find any document again when I actually need it [V] |
      |                                                                        |
      | R13 2026-09-05 [I>V]                                                   |
      | ␣␣resp:  the file appears in the folder's listing [I>V]                |
      | ␣␣->     <resolution>                                                  |
      | ␣␣touches: none                                                        |
    When the docket is linted
    Then the docket parses with 0 form findings

    Examples:
      | resolution       |
      | boundary         |
      | structural       |
      | means N1         |
      | need N1          |
      | fence-declined   |
      | fence-deferred   |
      | fence-assumption |

  @D15
  Scenario: a resolution kind outside the fixed set refuses the docket
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣->     wish                                           |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then the exit code is 2
    And the refusal names R13 and the kind wish
    And the refusal at line 5 names "wish"

  @D15
  Scenario: a kind the grammar once named but never admitted refuses the docket
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣->     road-not-taken                                 |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then the exit code is 2
    And the refusal names R13 and the kind road-not-taken
    And the refusal at line 5 names "road-not-taken"

  @D67
  Scenario: a reference on a kind that admits none is a form finding
    Given the docket
      | docket: 1                                                              |
      |                                                                        |
      | N1 2026-09-04 [V] user 5                                               |
      | ␣␣need:  I need to find any document again when I actually need it [V] |
      |                                                                        |
      | R13 2026-09-05 [I>V]                                                   |
      | ␣␣resp:  the file appears in the folder's listing [I>V]                |
      | ␣␣->     structural N1                                                 |
      | ␣␣touches: none                                                        |
    When the docket is linted
    Then form fires reference-misplaced at line 8 keyed R13
    And the finding's message contains "structural carries no reference"
    And the fix reads "-> structural"
    And the form layer has 1 finding keyed R13

  @D67
  Scenario: a kind that requires a reference and lacks one is a form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣->     means                                          |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires reference-missing at line 5 keyed R13
    And the finding's message contains "means requires a need"
    And the fix reads "-> means N<n>"
    And the form layer has 1 finding keyed R13

  @D76
  Scenario: a fence kind's label is accepted and ignored
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣->     fence-deferred binding-side-lint               |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then the docket parses with 0 form findings
    And the node R13 resolves to fence-deferred with no reference

  @D72
  Scenario Outline: each relation is admitted on a header
    Given the docket
      | docket: 1                                                     |
      |                                                               |
      | R13 2026-09-05 [I>V]                                          |
      | ␣␣trig:  a file is dropped onto the folder [I>V]              |
      | ␣␣resp:  the file appears in the folder's listing [I>V]       |
      | ␣␣touches: none                                               |
      |                                                               |
      | R14 2026-09-06 [V] <relation> R13                             |
      | ␣␣resp:  the file appears in the folder's listing at once [V] |
      | ␣␣touches: R13                                                |
    When the docket is linted
    Then the docket parses with 0 form findings
    And the node R14 has relation <relation> R13

    Examples:
      | relation  |
      | amends    |
      | reverses  |
      | reaffirms |
      | ratifies  |

  @D78
  Scenario: a relation word outside the set refuses the docket
    Given the docket
      | docket: 1                                                       |
      |                                                                 |
      | R13 2026-09-05 [I>V]                                            |
      | ␣␣trig:  a file is dropped onto the folder [I>V]                |
      | ␣␣resp:  the file appears in the folder's listing [I>V]         |
      | ␣␣touches: none                                                 |
      |                                                                 |
      | R14 2026-09-06 [I>V] supersedes R13                             |
      | ␣␣resp:  the file appears in the folder's listing at once [I>V] |
      | ␣␣touches: R13                                                  |
    When the docket is linted
    Then the exit code is 2
    And the refusal names "is outside the set amends, reverses, reaffirms, ratifies"
    And the refusal at line 8 names "supersedes"

  @D28
  Scenario: a relation naming an id not in the docket refuses the docket
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
      |                                                         |
      | R15 2026-09-06 [I>V] reverses R99                       |
      | ␣␣resp:  the folder is no longer watched [I>V]          |
      | ␣␣touches: R13                                          |
    When the docket is linted
    Then the exit code is 2
    And the refusal names R15 and R99

  @D71
  Scenario: a relation naming a later entry refuses the docket
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-06 [I>V] reverses R15                       |
      | ␣␣resp:  the folder is no longer watched [I>V]          |
      | ␣␣touches: none                                         |
      |                                                         |
      | R15 2026-09-06 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then the exit code is 2
    And the refusal names R13 and R15 and says "later"

  @D68
  Scenario: a trigger beside a non-fence resolution is a form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣->     structural                                     |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires trigger-with-resolution at line 6 keyed R13
    And the finding's message contains "only a fence kind may carry a trigger"
    And the fix reads "drop the trigger or the resolution"
    And the form layer has 1 finding keyed R13

  @D78
  Scenario: a sib line naming a missing id is a form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣sib:   R99                                            |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires sib-missing at line 6 keyed "R13 sib"
    And the finding's message contains "R99"
    And the fix reads "sib names an unwanted entry, or none -- <reason>"
    And the form layer has 1 finding keyed R13 sib

  @D78
  Scenario: a sib line naming a wanted entry is a form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R12 2026-09-05 [I>V]                                    |
      | ␣␣trig:  the folder is renamed [I>V]                    |
      | ␣␣resp:  the listing follows the folder [I>V]           |
      | ␣␣touches: none                                         |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣sib:   R12                                            |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires sib-wanted at line 11 keyed "R13 sib"
    And the fix reads "sib names an unwanted entry (marked !)"

  @D78
  Scenario: a sib line naming the entry itself is a form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣sib:   R13                                            |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires sib-self at line 6 keyed "R13 sib"
    And the fix reads "sib names an unwanted entry, or none -- <reason>"

  @D78
  Scenario: sib none without the double dash is a form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣sib:   none the drop is idempotent by construction    |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires sib-none-dash at line 6 keyed "R13 sib"
    And the fix reads "sib: none -- <reason>"
    And the form layer has 1 finding keyed R13 sib

  @D69
  Scenario: sib none with a reason of fewer than three words is a form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣sib:   none -- obvious                                |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires sib-none-vacuous at line 6 keyed "R13 sib"
    And the fix reads "sib: none -- <a reason of three words or more>"

  @D78
  Scenario: touches naming an id not in the docket is a form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: R99                                          |
    When the docket is linted
    Then form fires touches-missing at line 6 keyed "R13 touches"
    And the fix reads "touches: <earlier ids> or none"

  @D78
  Scenario: touches naming a later entry is a form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: R14                                          |
      |                                                         |
      | R14 2026-09-05 [I>V]                                    |
      | ␣␣trig:  the folder is renamed [I>V]                    |
      | ␣␣resp:  the listing follows the folder [I>V]           |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires touches-later at line 6 keyed "R13 touches"
    And the fix reads "touches names earlier entries only"

  @D108
  Scenario: a serves line naming something that is not a need is a form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R12 2026-09-05 [I>V] !                                  |
      | ␣␣trig:  the folder is not watched [I>V]                |
      | ␣␣resp:  the file never appears in the listing [I>V]    |
      | ␣␣touches: none                                         |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣sib:   R12                                            |
      | ␣␣serves: R12                                           |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires serves-not-need at line 12 keyed "R13 serves"
    And the fix reads "serves: N<n> ..."

  @D116
  Scenario: a tension line naming something that is not a need is a form finding
    Given the docket
      | docket: 1                                                              |
      |                                                                        |
      | N1 2026-09-04 [V] user 5                                               |
      | ␣␣need:  I need to find any document again when I actually need it [V] |
      | ␣␣tension: R13 -- the two needs pull against each other                |
      |                                                                        |
      | R13 2026-09-05 [I>V]                                                   |
      | ␣␣trig:  a file is dropped onto the folder [I>V]                       |
      | ␣␣resp:  the file appears in the folder's listing [I>V]                |
      | ␣␣touches: none                                                        |
    When the docket is linted
    Then form fires tension-form at line 5 keyed "N1 tension"
    And the fix reads "tension: N<n> -- <reason>"

  @D116
  Scenario: a tension reason of fewer than three words is a form finding
    Given the docket
      | docket: 1                                                              |
      |                                                                        |
      | N1 2026-09-04 [V] user 5                                               |
      | ␣␣need:  I need to find any document again when I actually need it [V] |
      | ␣␣tension: N2 -- speed                                                 |
      |                                                                        |
      | N2 2026-09-04 [V] user 4                                               |
      | ␣␣need:  I need the listing to settle before I look away [V]           |
    When the docket is linted
    Then form fires tension-vacuous at line 5 keyed "N1 tension"
    And the fix reads "tension: N<n> -- <a reason of three words or more>"

  @D153
  Scenario: a precondition without a trigger is a form finding
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣pre:   the folder is being watched [I>V]              |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
      |                                                         |
      | R14 2026-09-05 [I>V]                                    |
      | ␣␣trig:  the folder is renamed [I>V]                    |
      | ␣␣resp:  the listing follows the folder [I>V]           |
      | ␣␣touches: none                                         |
    When the docket is linted
    Then form fires pre-without-trigger at line 4 keyed "R13 pre"
    And the fix reads "add the trigger"
    And the form layer has 1 finding keyed R13 pre

  @D70
  Scenario: a hash line inside an entry is not a stray line
    Given the docket
      | docket: 1                                               |
      |                                                         |
      | R13 2026-09-05 [I>V]                                    |
      | ␣␣trig:  a file is dropped onto the folder [I>V]        |
      | ␣␣resp:  the file appears in the folder's listing [I>V] |
      | ␣␣touches: none                                         |
      | # roads not taken: a scaffold command                   |
    When the docket is linted
    Then the docket parses with 0 form findings
    And the node R13 has 1 note reading "roads not taken: a scaffold command"

  @D121
  Scenario: a braced quantity and a braced list draw no form finding
    Given the docket
      | docket: 1                                                                                   |
      |                                                                                             |
      | R13 2026-09-05 [I>V]                                                                        |
      | ␣␣trig:  a file is dropped onto the folder [I>V]                                            |
      | ␣␣resp:  the listing shows both files within {2 seconds} and marks each {new \| seen} [I>V] |
      | ␣␣spread: the listing settles under load                                                    |
      | ␣␣touches: none                                                                             |
    When the docket is linted
    Then the docket parses with 0 form findings
    And the node R13 has 1 quantity node under resp
    And the node R13 has 1 list node under resp

  @D20
  Scenario: a bare digit run outside braces is a lexical near-miss finding
    Given the docket
      | docket: 1                                                    |
      |                                                              |
      | R13 2026-09-05 [I>V]                                         |
      | ␣␣trig:  a file is dropped onto the folder [I>V]             |
      | ␣␣resp:  the listing shows both files within 2 seconds [I>V] |
      | ␣␣touches: none                                              |
    When the docket is linted
    Then form fires bare-digit-run at line 5 keyed "R13 resp"
    And the fix reads "the listing shows both files within {2 seconds}"
    And the form layer has 1 finding keyed R13 resp

  @D173
  Scenario: backticked literals and id-shaped tokens are not near-misses
    Given the docket
      | docket: 1                                                                             |
      |                                                                                       |
      | R13 2026-09-05 [I>V]                                                                  |
      | ␣␣trig:  a file is dropped onto the folder [I>V]                                      |
      | ␣␣resp:  reaffirms R7 and E3 under `v1.2` with `SHA-256` and `UTF-8` as N4 asks [I>V] |
      | ␣␣touches: none                                                                       |
    When the docket is linted
    Then the docket parses with 0 form findings
    And the node R13 has 3 literal nodes under resp

  @D173
  Scenario: an unescaped version, decimal, or glued unit is a near-miss
    Given the docket
      | docket: 1                                                                 |
      |                                                                           |
      | R13 2026-09-05 [I>V]                                                      |
      | ␣␣trig:  a file is dropped onto the folder [I>V]                          |
      | ␣␣resp:  under v1.2 the listing appears within 1.5 seconds or 300ms [I>V] |
      | ␣␣touches: none                                                           |
    When the docket is linted
    Then form fires bare-digit-run at line 5 keyed "R13 resp"
    And the form layer has 3 findings keyed R13 resp

  @D66
  Scenario: a digit run followed by a unit word is still a near-miss
    Given the docket
      | docket: 1                                        |
      |                                                  |
      | R13 2026-09-05 [I>V]                             |
      | ␣␣trig:  a file is dropped onto the folder [I>V] |
      | ␣␣resp:  R7 answers within 2 seconds [I>V]       |
      | ␣␣touches: none                                  |
    When the docket is linted
    Then form fires bare-digit-run at line 5 keyed "R13 resp"
    And the fix reads "R7 answers within {2 seconds}"
    And the form layer has 1 finding keyed R13 resp

  @D196
  Scenario: a docket written loosely is rewritten in canonical form
    Given the docket
      | docket: 1                                                      |
      |                                                                |
      | R12 2026-09-05 [I>V]                                           |
      | ␣␣trig: a file is dropped onto the folder [I>V]                |
      | ␣␣resp: the file appears in the folder's listing [I>V]         |
      | ␣␣touches:     none                                            |
      |                                                                |
      | R13 2026-09-06 [I>V] amends R12 !                              |
      | ␣␣resp: the file appears in the folder's listing at once [I>V] |
      | ␣␣trig: a file is dropped onto the folder [I>V]                |
      | ␣␣touches:  R12                                                |
    When the docket is put into canonical form
    Then the formatted docket is
      | docket: 1                                                       |
      |                                                                 |
      | R12 2026-09-05 [I>V]                                            |
      | ␣␣trig:  a file is dropped onto the folder [I>V]                |
      | ␣␣resp:  the file appears in the folder's listing [I>V]         |
      | ␣␣touches: none                                                 |
      |                                                                 |
      | R13 2026-09-06 [I>V] ! amends R12                               |
      | ␣␣trig:  a file is dropped onto the folder [I>V]                |
      | ␣␣resp:  the file appears in the folder's listing at once [I>V] |
      | ␣␣touches: R12                                                  |

  @D225
  Scenario: a why slot line is admitted after the response
    Given the docket
      | docket: 1                                                                 |
      |                                                                           |
      | R13 2026-09-05 [I>V]                                                      |
      | ␣␣trig:  a file is dropped onto the folder [I>V]                          |
      | ␣␣resp:  the listing shows both files within {2 seconds} [I>V]            |
      | ␣␣why:   the figure was read off the field test of the archive [I>V]      |
      | ␣␣spread: the listing settles under load                                  |
      | ␣␣touches: none                                                           |
    When the docket is linted
    Then the docket parses with 0 form findings
    And the why line of R13 is on the parse

  @D220
  Scenario: a braced island carrying TBD is admitted with no form finding
    Given the docket
      | docket: 1                                                       |
      |                                                                 |
      | R13 2026-09-05 [I>V]                                            |
      | ␣␣trig:  a file is dropped onto the folder [I>V]                |
      | ␣␣resp:  the listing settles within {TBD seconds} [I>V]         |
      | ␣␣spread: the listing settles under load                        |
      | ␣␣touches: none                                                 |
    When the docket is linted
    Then the docket parses with 0 form findings
    And the node R13 has 1 quantity node under resp

  @D223
  Scenario: a signs header is admitted as a relation entry
    Given the docket
      | docket: 1                                                       |
      |                                                                 |
      | R13 2026-09-05 [I>V]                                            |
      | ␣␣trig:  a file is dropped onto the folder [I>V]                |
      | ␣␣resp:  the file appears in the folder's listing [I>V]         |
      | ␣␣touches: none                                                 |
      |                                                                 |
      | R16 2026-09-06 [V] signs R13                                    |
      | ␣␣resp:  I have read the contract as it stands today [V]        |
      | ␣␣touches: R13                                                  |
    When the docket is linted
    Then the docket parses with 0 form findings
    And the node R16 has relation signs R13
