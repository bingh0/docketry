docket: 1
N0 2026-09-06 [V] user 5
  need:  I need my files to be safe [V]

R1 2026-09-06 [V]
  resp:  the archive never writes into the host repository [V]
  ->     structural
  serves: N0
  touches: none

R2 2026-09-06 [I>V] reverses R1
  resp:  the read-only constraint is withdrawn [I>V]
  touches: R1

R3 2026-09-06 [I>V]
  trig:  a bare invocation [I>V]
  resp:  the invoker is guessed [I>V]
  ->     fence-deferred
  touches: none

R4 2026-09-06 [I>V]
  trig:  a report is rendered [I>V]
  resp:  the header lists everything [I>V]
  ->     boundary
  touches: none

R5 2026-09-06 [I>V] !
  trig:  the invoker is undecidable [I>V]
  resp:  the run stops [I>V]
  touches: none

R6 2026-09-06 [I>V]
  resp:  the end [I>V]
  ->     boundary
  touches: none
