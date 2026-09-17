# Projects

Ideas for nsscode.com. Most are experiments for the lab: each entry names
the kind (tool or toy), a rough size, and what it has to do to be worth
shipping. Shipped experiments live in `src/experiments/<slug>/`; the shelf
on the home page shows the ones listed under "Announced" as `soon` tiles
until they land.

"Beyond the lab" at the bottom holds the two larger projects that do not
fit that shape at all: they are their own things that happen to live on
the domain.

Sizes: **S** an evening, **M** a few evenings, **L** a couple of weeks,
**XL** an ongoing project.

## Shipped

| Slug | Title | Kind |
| --- | --- | --- |
| `palette` | Palette | tool |
| `easing` | Easing | tool |
| `actors` | Actors | toy |
| `plates` | Plates | tool |
| `life` | Life | toy |
| `claude-code` | Claude Code, from zero | tool |
| `spring` | Spring | tool |
| `boids` | Boids | toy |
| `topskat` | Topskat 2026 | tool |
| `programme` | Programme | tool |
| `realkredit` | Realkredit | tool |

## Announced (shown as "soon" on the shelf)

Slugs are fixed by `src/lib/shelf.ts`; a real experiment with the same
slug replaces its placeholder.

### Timestamp · `timestamp` · tool · S

Unix seconds and milliseconds, ISO 8601, RFC 2822 and Copenhagen local,
in every direction. Paste anything, get all forms; "now" button; relative
time ("in 3 days"). Could merge into the Cron and Date Format Decoder
below rather than sit beside it.

## Proposed

### Claude Code, from zero · `claude-code` · tool · shipped

A step-by-step course for developers new to Claude Code: nine chapters
(install, first session, CLAUDE.md, prompts, workflow, project files,
models and effort, rules/skills/agents/hooks, ready) each with a
"do it now" checklist run on the reader's own practice repo, progress
saved in localStorage, a prompt grader, good-versus-bad prompt pairs, a
model and effort picker, a CLAUDE.md loading demo, a starter-file
generator, and a final readiness check with cheat sheet and glossary. Facts checked against the docs in September 2026; re-check
when Claude Code changes its model list or effort levels.

### Bigger projects

#### Swift Concurrency Playground · `concurrency` · toy · XL

The general version of Actors. Write a small pseudo-Swift program with
tasks, `await`, actors, task groups and cancellation; it is parsed and
run as a discrete simulation with the rooms-and-doors visualisation, a
timeline per task, and detectors for reentrancy and priority inversion.
Real parser, real scheduler, program state encoded in the URL so a
scenario can be shared. Actors' `logic.ts` is the seed. This is the one
that makes the site something to show people.

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

#### Dither · `dither` · toy · M

Drop an image, get Floyd-Steinberg, Bayer and Atkinson dithering to a
2 to 8 colour palette taken from the site tokens. Runs in a worker,
downloads a PNG, never uploads anything. Strong tile, and a real test of
file handling in a static site.

## Beyond the lab

Two projects that outgrow an experiment folder. Neither is a tile on the
shelf: each wants its own route (`/swift/`, `/penge/`), its own
navigation, and possibly its own build step. They do not replace the lab,
and they are not bound to its narrative.

### Swift in the browser · `/swift/` · XL

Compile Swift to WebAssembly with SwiftWasm and run **real Swift** on the
page. The reader edits an actual `actor`, presses run, and watches their
own code execute, rather than watching a hand-written scheduler simulate
it. Actors and the proposed Concurrency playground are the sketch; this
is the real thing, and it makes the two of them redundant.

Why it is worth it: nobody has a good version. An iOS engineer who finds
a page where they can paste a concurrency bug and watch it happen will
send it to their team. It is the one project here that travels on its own.

The work, roughly in order:

1. Get the SwiftWasm toolchain producing a `.wasm` that runs in a browser
   at all, from a fixed source file. Nothing interactive. This is the
   step that decides whether the project is viable.
2. Measure the bundle. The Swift runtime is the whole risk: if a hello
   world costs several megabytes, decide then whether to lazy-load it
   behind a "run" button, or stop.
3. A fixed set of editable examples rather than arbitrary input, so the
   compile step can happen server-side or ahead of time if in-browser
   compilation turns out to be impractical.
4. Instrument the concurrency runtime so task state can be drawn: which
   task is suspended, which actor is occupied, where an await handed
   control away. The drawing is the product; execution alone is a REPL.
5. Then the tutorials: reentrancy, priority inversion, `Sendable`,
   task groups, cancellation, each as a program the reader can break.

The honest risk: steps 1 and 2 are a month of toolchain plumbing before
anything is worth showing, and they may end in "this does not fit in a
web page". Time-box the first two and decide with real numbers rather
than hope.

### Danish personal finance · `/penge/` · XL

Topskat and Realkredit are two rooms. This is the house: one model of a
Danish salary and what happens to it, with the pieces that actually
interact rather than four calculators side by side.

What goes in the model:

- Løn, AM-bidrag and the four brackets. Topskat's engine already does
  this and moves over unchanged.
- **Pension**: ratepension against aldersopsparing against livrente, and
  the thing every calculator misses, that a contribution which drops you
  under the topskat threshold is worth far more than one that does not.
  This is the single most useful number on the site if it is right.
- **Realkredit**: the existing tool, with its interest feeding the same
  negative net capital income the rest of the model uses.
- **Aktiesparekonto against a normal depot**: 17 % running against 27/42 %
  on realisation, and where the crossover falls for a given horizon.
- Ejendomsværdiskat and grundskyld, which Realkredit deliberately leaves
  out and which change the answer on a house.
- Optionally fri bil, which is a large and badly understood number for
  the people who have it.

Everything client-side, state in the URL, no accounts and nothing stored,
like the rest of the site. Rates live in one data file per year
(`rates-2026.ts` already sets the pattern) so January is a copy and a
diff rather than a rewrite.

Why it is worth it: no honest version of this exists in Danish. Every
one that does is a bank's, and shaped accordingly. It would be genuinely
useful to a few hundred thousand people.

The honest risk: you own its correctness, and being wrong about someone's
pension is worse than being wrong about a colour ramp. Two rules from the
start: every number states its source and its year, and the page says
plainly what it is not. Budget a week each January.

## Order worth considering

1. Swift Concurrency Playground (the showcase), or skip it and go
   straight to Swift in the browser, which replaces it
2. Swift in the browser, after time-boxing the toolchain question
3. Danish personal finance, once Realkredit has been used in anger a few
   times and its model is trusted
4. The rest as needed

## Adding an experiment

`src/experiments/<slug>/` with `meta.ts`, `Experiment.astro`, `logic.ts`,
`logic.test.ts` and a `.svelte` or `.tsx` component. `meta.ts` must name
a `collection`: `software`, `finance`, `training` or `games`. The
collection decides which shelf
it lands on and which colour it wears; see `src/lib/collections.ts`. Set
`listed: false` to build it at its URL without linking it, indexing it
or adding it to the sitemap. Give it a miniature in
`src/components/TilePreview.astro` before listing it.

The home page shows the newest experiment large, then one row per
collection. The lab page is the dense index of everything, planned items
included. Adding an eleventh experiment should not make either page
worse: if a collection grows past about five, split it.
