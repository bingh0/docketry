# The docket grammar, version 1 — on one screen

Explanatory where the feature files bind (D182). Every table below is typed
from `features/DOCKET.md`, never generated from the code; a scenario holds
each equal to the parser's own set.

A docket is UTF-8, LF-ended (CRLF read as LF, a byte-order mark dropped),
and begins with the version line `docket: 1`. It is a sequence of entries
separated by blank lines. A line starting `#` between entries is a file
comment the parse drops; inside an entry it is a note on that node. Every
other line is either a **header** at column zero or a **slot line**
indented by exactly two spaces; any other indent is a stray line. (D28,
D70, D78, D184)

**Header** — `ID DATE [TAG] (!) (RELATION TARGET)` for a ruling, the mark
and the relation in either order; `ID DATE [TAG] BENEFICIARY WEIGHT
(RELATION TARGET)` for a need. An ID is one uppercase letter plus digits;
`N` is the need letter and one other letter is the docket's ruling letter.
DATE is ISO. WEIGHT is 1 to 5. `!` marks an unwanted entry. A relation names
an earlier entry. (D15, D16, D17, D21, D73, D77, D147)

**Slot lines** — a keyword, a colon, one space, prose, one tag: `pre`,
`trig`, `resp`, `why` on rulings; `need`, `means` on needs. `why` holds
the origin of a quantity in the entry's own slots; the interviewer's
numbers owe it, the visionary's do not, and a missing one is counted,
never a finding. Prose may hold a braced quantity `{2 seconds}`, a
braced pipe list `{a | b}`, and a backticked literal; every other
whitespace token containing a digit is a near-miss unless it is
id-shaped. A braced island carrying `TBD` (a value nobody has) or `TBR`
(a value held with low confidence) is an unresolved quantity: counted,
never a finding, and never cleared by an outline while the token stands.
(D20, D121, D173, D181, D220, D221, D225)

**Other lines** — `-> KIND (REFERENCE|LABEL)`; `sib: ID` or `sib: none --
reason` (three words or more); `spread: outline title`; `serves: N…`;
`tension: N -- reason`; `touches: ID… | none`. (D14, D45, D69, D108, D110,
D116, D118)

Effect: an entry is in effect as of a date when dated on or before it and
no in-effect entry reverses it; an amends entry restates its target in
full and is the target's effective shape; only a `[V]` ratifies entry
silences provenance; a `[V]` signs entry marks every entry in effect at
its date signed, and the as-of parse at that date is the signed state.
Hashes are derived over the canonical (formatted) text and never
written. (D65, D71, D72, D113, D155, D185, D222, D223)

### Slot keywords

| word | on |
|---|---|
| `pre` | ruling |
| `trig` | ruling |
| `resp` | ruling |
| `why` | ruling |
| `need` | need |
| `means` | need |

### Line keywords

| word | takes |
|---|---|
| `sib` | an unwanted id, or `none -- reason` |
| `spread` | an outline title |
| `serves` | need ids |
| `tension` | a need id, `--`, a reason |
| `touches` | earlier ids, or `none` |

### Provenance tags

| tag | meaning |
|---|---|
| `V` | the visionary's words |
| `I>V` | interviewer-drafted, accepted as written |
| `I+V` | interviewer-drafted, corrected by the visionary |
| `I` | interviewer-inferred, unratified |
| `?` | provenance lost |

Rank, lowest first: `?`, `I`, `I>V`, `I+V`, `V` (D120).

### Resolution kinds

| kind | reference | destination |
|---|---|---|
| `boundary` | none | none (listed as not counted) |
| `structural` | none | a `[ruled: …]` tag in DESIGN.md |
| `means` | a need id | DESIGN.md and the need's ledger row |
| `need` | a need id | the need's ledger row |
| `fence-declined` | optional label | the fence, Declined |
| `fence-deferred` | optional label | the fence, Deferred |
| `fence-assumption` | optional label | the fence, Named assumptions |

### Relations

| relation | effect |
|---|---|
| `amends` | restates the target; becomes its effective shape |
| `reverses` | the target is no longer in effect |
| `reaffirms` | nothing changes |
| `ratifies` | under `[V]`, silences provenance on the target's chain |
| `signs` | under `[V]`, marks the record as of its date signed; any other tag signs nothing |

### Rule words

| layer | rule words |
|---|---|
| `form` | `stray-line` `missing-tag` `double-tag` `duplicate-slot` `bare-digit-run` `undated` `date-order` `touches-missing` `touches-later` `sib-wanted` `sib-missing` `sib-self` `sib-none-dash` `sib-none-vacuous` `pre-without-trigger` `weight-range` `reference-misplaced` `reference-missing` `trigger-with-resolution` `incomplete` `two-letters` `serves-not-need` `tension-form` `tension-vacuous` `missing-response` |
| `provenance` | `inferred` `lost` |
| `resolution` | `unresolved` |
| `coverage` | `no-sib` `unspread` `unserved-need` `unserved-ruling` `orphan-unwanted` |
| `consistency` | `header-above-slots` `no-touches` `missing-need` `rewrite` `ratifier-not-visionary` `signer-not-visionary` |
| `traceability` | `uncited-trigger` `scenario-cites-missing` `scenario-cites-reversed` `scenario-mis-kinded` `scenario-cites-need` `untagged-scenario` `need-not-in-ledger` `not-in-fence` `not-in-design` `spread-no-outline` `spread-untagged` `guard-untagged` `ledger-uncited` `ledger-mis-cite` `ledger-cites-missing` `fence-cites-missing` `fence-cites-reversed` `fence-mis-kinded` `design-cites-missing` `design-cites-reversed` |

A rule word never changes within findings-format major 1 (D183).
