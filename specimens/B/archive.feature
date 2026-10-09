Feature: archive
  @R1
  Scenario: a file is dropped onto the folder
    Given a folder
    When a file is dropped onto the folder
    Then the file appears in the listing within two seconds

  @R2
  Scenario Outline: a folder is renamed
    Given a folder named <name>
    When it is renamed
    Then every file inside keeps its path

    Examples:
      | name |
      | a    |
      | b    |

  @R3
  Scenario: a folder is not renamed
    Given a folder
    When it is not renamed
    Then every file inside does not keep its path

  @R4
  Scenario: the archive is read-only
    Given a host
    When the archive runs
    Then the host is unchanged

  @R5
  Scenario: the corpus is large
    Given a large corpus
    When the listing renders
    Then every file shows
