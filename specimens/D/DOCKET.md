docket: 1
N0 2026-09-06 [I>V] user 5
  need:  I need my files to be safe [I>V]

R1 2026-09-06 [I>V]
  trig:  a file is dropped onto the folder [I>V]
  resp:  the file appears in the listing within 2.0 seconds [I>V]
  sib:   none -- not worth a scenario
  serves: N0
  touches: none

R2 2026-09-06 [I>V]
  trig:  a folder is renamed [I>V]
  resp:  every file inside keeps its path [I>V]
  sib:   R3
  touches: R1

R3 2026-09-06 [I>V] !
  trig:  a folder is not renamed [I>V]
  resp:  every file inside does not keep its path [I>V]
  touches: R2

R4 2026-09-06 [I>V]
  resp:  the archive is read-only toward the host [I>V]
  ->     structural
  serves: N0
  touches: none

R5 2026-09-06 [I>V]
  trig:  the corpus is large [I>V]
  resp:  the listing shows every file within {2 seconds} [I>V]
  sib:   none -- covered by R1 already
  spread: a folder is renamed
  touches: R1

R6 2026-09-06 [V]
  resp:  the archive never writes into the host repository [V]
  ->     structural
  serves: N0
  touches: R4

R7 2026-09-06 [V] amends R6
  resp:  the archive may refresh the host's watcher picture in place [V]
  ->     structural
  serves: N0
  touches: R6

R8 2026-09-06 [I]
  resp:  passkeys are the only login [I]
  ->     boundary
  serves: N0
  touches: none

R9 2026-09-06 [V] ratifies R8
  resp:  passkeys stand [V]
  touches: R8

R10 2026-09-06 [I>V]
  trig:  a file is locked [I>V]
  resp:  it is skipped and reported [I>V]
  sib:   none -- nothing to ask
  touches: none

R11 2026-09-06 [I>V] reverses R10
  resp:  the locked-file behaviour is withdrawn [I>V]
  touches: R10

R12 2026-09-06 [I>V]
  resp:  locked files are skipped [I>V]
  ->     structural
  serves: N0
  touches: R10 R11
