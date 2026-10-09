Feature: archive
  @R1
  Scenario: a file is stored
    Given a file
    When it is dropped
    Then it is stored

  @R2
  Scenario: listing
    Given a file
    When it is dropped
    Then it is listed
