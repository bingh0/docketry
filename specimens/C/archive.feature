Feature: archive
  @R1
  Scenario: read-only
    Given a host
    When the archive runs
    Then the host is unchanged
