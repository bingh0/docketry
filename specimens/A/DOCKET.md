docket: 1
N0 2026-09-06 [I>V] user 5
  need:  I need my files to be safe [I>V]

R1 2026-09-06 [I>V]
  resp:  files are stored [I>V]
  ->     boundary
  serves: N0
  touches: none

R2 2026-09-06 [I>V]
  resp:  when a file is dropped it appears in the listing within two seconds [I>V]
  ->     boundary
  touches: none

R3 2026-09-06 [I>V]
  resp:  when a duplicate is dropped it is kept [I>V]
  ->     boundary
  touches: none

R4 2026-09-06 [I>V]
  resp:  the archive is read-only toward the host [I>V]
  ->     boundary
  touches: none
