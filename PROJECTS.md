# Projects

Ideas for the lab at nsscode.com. Each entry names the kind (tool or toy),
a rough size, and what it has to do to be worth shipping. Shipped
experiments live in `src/experiments/<slug>/`; the shelf on the home page
shows the ones listed under "Announced" as `soon` tiles until they land.

Sizes: **S** an evening, **M** a few evenings, **L** a couple of weeks,
**XL** an ongoing project.

## Shipped

| Slug | Title | Kind |
| --- | --- | --- |
| `palette` | Palette | tool |
| `easing` | Easing | tool |
| `actors` | Actors | toy |
| `plates` | Plates | tool |

## Announced (shown as "soon" on the shelf)

Slugs are fixed by `src/lib/shelf.ts`; a real experiment with the same
slug replaces its placeholder.

### Topskat 2026 · `topskat` · tool · M

Where the Danish tax brackets bite. DKK in, DKK out. Gross salary and
pension contribution in, a stacked bar of AM-bidrag, bundskat,
kommuneskat, top-, mellem- and top-topskat as they apply from 2026, plus
marginal rate at the current income. Must handle beskæftigelsesfradrag
and personfradrag correctly and state the kommune it assumes. Rates as a
data file with the year in the name so 2027 is a copy, not a rewrite.

### Life · `life` · toy · S

Conway's game, because every lab needs one. Canvas, click or drag to
paint, a handful of named patterns (glider gun, acorn, R-pentomino),
speed and wrap toggles. Fun comes from the palette and the shelf
miniature actually running.

### Timestamp · `timestamp` · tool · S

Unix seconds and milliseconds, ISO 8601, RFC 2822 and Copenhagen local,
in every direction. Paste anything, get all forms; "now" button; relative
time ("in 3 days"). Could merge into the Cron and Date Format Decoder
below rather than sit beside it.

## Proposed

### Bigger projects

#### Swift Concurrency Playground · `concurrency` · toy · XL

The general version of Actors. Write a small pseudo-Swift program with
tasks, `await`, actors, task groups and cancellation; it is parsed and
run as a discrete simulation with the rooms-and-doors visualisation, a
timeline per task, and detectors for reentrancy and priority inversion.
Real parser, real scheduler, program state encoded in the URL so a
scenario can be shared. Actors' `logic.ts` is the seed. This is the one
that makes the site something to show people.

#### Danish Mortgage Lab · `realkredit` · tool · L

Realkredit compared properly. Fixed 30-year vs F5 vs FlexKort, with
afdragsfrihed, bidragssats by LTV band, kursskæring and kurstab, and the
conversion game: op- and nedkonvertering when the bond price moves.
Drag a rate path, see restgæld and total cost over time, and a
"rates go to X in year 5" slider. Bond math has to be right; that is the
whole value. Assumptions stated on the page, never hidden.

#### Programme Builder · `programme` · tool · L

Plates answers "how do I load 100 kg". This answers "what do I lift this
week": 5/3/1, Texas Method or a linear progression from training maxes,
every set pre-loaded through the Plates engine with a warm-up ramp,
printable per session, state in the URL so there is no backend. Reuses
`src/experiments/plates/logic.ts` and `Barbell.svelte` as is.

### Tools

#### Regex Explainer · `regex` · tool · M

Paste a pattern, get a railroad diagram and live match highlighting
against sample text. Toggle between Swift `Regex` literal syntax,
`NSRegularExpression` and JavaScript, because the escaping differs and
that is where the hour goes. Only worth it if the diagram is clearly
nicer than regex101.

#### CPR, CVR and Kontonummer Validator · `modulus` · tool · S

Modulus 11 checks with the digit-by-digit weights shown, plus generation
of valid test numbers for fixtures. Small, useful for Danish app work,
and nobody has a pleasant version. Never store or send anything; say so
on the page.

#### Package.resolved Diff · `resolved` · tool · S

Paste two `Package.resolved` files, get what moved and by how much
(major, minor, patch), with links to the GitHub compare pages. Handles
both v1 and v2/v3 file formats.

#### Cron and Date Format Decoder · `cron` · tool · M

Cron expression to plain English and the next ten firings in
Europe/Copenhagen, plus a `DateFormatter` pattern sandbox that shows why
`YYYY` bites around New Year. Natural home for Timestamp above.

### Toys

#### Boids · `boids` · toy · S

Flocking on canvas with separation, alignment and cohesion sliders,
drawn in the Toybox palette. Cheap, looks alive on the shelf tile, and
people play with it for two minutes.

#### Spring Designer · `spring` · tool · M

Same shape as Easing, for `spring(response:dampingFraction:)`. Drag
damping and response, see the curve and the bouncing ball, copy the
exact SwiftUI initialiser and the CSS `linear()` approximation. Easing
covers cubic-bezier; springs are what ships on iOS. Highest value per
hour on this list.

#### Dither · `dither` · toy · M

Drop an image, get Floyd-Steinberg, Bayer and Atkinson dithering to a
2 to 8 colour palette taken from the site tokens. Runs in a worker,
downloads a PNG, never uploads anything. Strong tile, and a real test of
file handling in a static site.

## Order worth considering

1. Spring Designer (small, immediately useful, completes Easing)
2. Life and Boids (cheap shelf filler that moves)
3. Topskat 2026 (announced, seasonal relevance)
4. Programme Builder (builds on Plates)
5. Swift Concurrency Playground (the showcase)
6. Danish Mortgage Lab
7. The rest as needed

## Adding an experiment

`src/experiments/<slug>/` with `meta.ts`, `Experiment.astro`, `logic.ts`,
`logic.test.ts` and a `.svelte` or `.tsx` component. Set `listed: false`
in `meta.ts` to build it at its URL without linking it, indexing it or
adding it to the sitemap. Give it a miniature in
`src/components/TilePreview.astro` before listing it.
