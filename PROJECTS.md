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
| `life` | Life | toy |
| `claude-code` | Claude Code, from zero | tool |
| `spring` | Spring | tool |
| `boids` | Boids | toy |
| `topskat` | Topskat 2026 | tool |
| `programme` | Programme | tool |

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

#### Danish Mortgage Lab · `realkredit` · tool · L

Realkredit compared properly. Fixed 30-year vs F5 vs FlexKort, with
afdragsfrihed, bidragssats by LTV band, kursskæring and kurstab, and the
conversion game: op- and nedkonvertering when the bond price moves.
Drag a rate path, see restgæld and total cost over time, and a
"rates go to X in year 5" slider. Bond math has to be right; that is the
whole value. Assumptions stated on the page, never hidden.

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

## Order worth considering

1. Swift Concurrency Playground (the showcase)
2. Danish Mortgage Lab
3. The rest as needed

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
