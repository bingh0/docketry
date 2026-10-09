Feature: rendering and formatting
  As the interviewer who drafts deliverables from the docket
  I want skeletons rendered from the tree and a canonical form written on request
  So that citations exist from birth and the record's shape never depends on hand spacing

  Background:
    Given the docket format version 1

  @D42
  Scenario: a triggered entry renders to a scenario skeleton tagged with its id
    Given a docket whose entry R12 has pre "a folder is open", trig "a file is dropped onto it", and resp "the file appears in the folder's listing"
    When the docket is rendered
    Then the scenario output contains a scenario tagged @R12
    And that scenario's steps read "Given a folder is open", "When a file is dropped onto it", "Then the file appears in the folder's listing"

  @D84
  Scenario: an entry with a spread renders to an outline skeleton that parses
    Given a docket whose entry R13 response contains the quantity {2 seconds}
    And R13 has the line "spread: duplicate-timing"
    When the docket is rendered
    Then the scenario output contains a scenario outline titled "duplicate-timing" tagged @R13
    And that outline has an Examples table with 1 column and 2 placeholder rows
    And the rendered file is scope-clean under the dialect's strict lint

  @D121
  Scenario: a list's outline skeleton carries one row per member
    Given a docket whose entry R13 response contains the list {never-run | orphan | dark | unrefined}
    And R13 has the line "spread: the readiness faces"
    When the docket is rendered
    Then the scenario output contains a scenario outline titled "the readiness faces" tagged @R13
    And that outline has an Examples table with 4 rows reading never-run, orphan, dark, unrefined

  @D84
  Scenario: a skeleton's title is its trigger text, made unique by the id
    Given a docket whose entries R12 and R14 both have the trigger "a file is dropped onto it"
    When the docket is rendered
    Then the scenario output contains a scenario titled "a file is dropped onto it" tagged @R12
    And the scenario output contains a scenario titled "a file is dropped onto it (R14)" tagged @R14

  @D42
  Scenario: a need entry renders to a ledger row
    Given a docket whose entry N4 is a need for user with weight 5 reading "I need to find any document again when I actually need it"
    When the docket is rendered
    Then the ledger output contains the row "**N4** (user, wt 5) — I need to find any document again when I actually need it"
    And that row's coverage status is blank

  @D160
  Scenario: a deferred entry's skeleton carries its trigger as the reopening condition
    Given a docket whose entry R3 has the trigger "the docket becomes a runner" and resolves to fence-deferred
    When the docket is rendered
    Then the fence output's Deferred entry for R3 contains "Reopens when the docket becomes a runner"

  @D77
  Scenario: a fence-kind resolution renders to a dated fence entry keyed by id
    Given a docket whose entry R3 dated 2026-09-04 resolves to fence-deferred
    When the docket is rendered
    Then the fence output contains an entry under Deferred ending "(R3, 2026-09-04)"

  @D42
  Scenario: a structural resolution renders to a ruled design line
    Given a docket whose entry R8 resolves to structural
    When the docket is rendered
    Then the design output contains a constraint line ending "[ruled: R8]"
    And the design output contains a Changelog heading with 1 line

  @D82
  Scenario: render never overwrites an existing deliverable
    Given a corpus directory already containing "archive.feature"
    When the docket is rendered to that directory
    Then "archive.feature" is byte-identical to before
    And the rendered skeletons are written under a new path the output names

  @D40
  Scenario: the formatter rewrites a docket into canonical form
    Given a docket whose entry R13 has one space after "pre:" and its slots in the order resp, pre, trig
    When the docket is formatted
    Then the entry R13 has its slot text beginning at the tenth column
    And its slots are in the order pre, trig, resp

  @D40
  Scenario: formatting a canonical docket changes nothing
    Given a docket already in canonical form
    When the docket is formatted twice
    Then the file is byte-identical after each run

  @D40
  Scenario: only the formatter writes
    Given a docket with recorded checksums
    When the docket is linted, parsed, and rendered to standard output
    Then the docket's checksum is unchanged

  @D42
  Scenario: the four functions are callable in-process
    Given a script that imports the package
    When the script calls parseDocket, lintDocket, formatDocket, and renderDocket on a docket
    Then each call returns without spawning a child process
    And lintDocket's result carries the same findings the command line reports

  @D185
  Scenario: formatting changes no hash
    Given a docket whose entry R13 has one space after "pre:" and its slots out of order
    When the docket is parsed, formatted, and parsed again
    Then the hash of R13 is the same in both parses
    And the chain hash is the same in both parses

  @D185
  Scenario: the parse of a formatted docket agrees with the parse of the original
    Given a docket whose entry R13 has one space after "pre:" and its slots out of order
    When the docket is parsed, formatted, and parsed again
    Then the two trees agree on every field of R13 except line

  @D225
  Scenario: a why renders beside its ruling in the design skeleton
    Given a docket whose entry R8 resolves to structural
    And R8 has a why tagged I>V
    When the docket is rendered
    Then the design output contains a constraint line containing "(why: the figure was read off the field test of the archive)"
