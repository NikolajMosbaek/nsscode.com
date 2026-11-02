# nsscode.com

Personal site of Nikolaj Søgaard Simonsen, a static Astro site on GitHub
Pages at [nsscode.com](https://nsscode.com).

It holds two things:

- **`/`, the studio page.** A dark front page for the iPhone apps, Don't
  Break Fast and Meal Planner, with CSS phone mockups, scroll and hover
  motion, and a small `lab →` link in the corner. Each app keeps its own
  site on a subdomain (Don't Break Fast is at dbf.nsscode.com, from the
  separate `dontbreakfast-site` repository).
- **`/lab/`, the lab.** Small tools and toys that run in the browser,
  grouped into four collections: Software development, Finance, Training
  and Games. `/lab/all/` is the dense index, planned items included.

Also built: `/colophon/`, the archived design directions under `/demo/`
(noindex), `/404`, `sitemap.xml`, `robots.txt` and two generated share
images (`og.png` for the lab, `og-studio.png` for the front page).

## Running it

Node 22.12 or newer (CI uses 24).

```sh
npm ci
npm run dev      # dev server; agents use `npx astro dev --background`
npm run build    # production build to ./dist
npm run preview  # serve ./dist on :4321
```

## Gates

```sh
npm run lint       # Biome (format and lint, CI mode)
npm run typecheck  # astro check
npm run test       # Vitest: logic.test.ts next to the code, plus src/lib
npm run test:e2e   # Playwright against ./dist: build first
```

All four run on every pull request (`.github/workflows/ci.yml`) and again
before every deploy from `main` (`.github/workflows/deploy.yml`).

- `tests/a11y.spec.ts` finds every page in `dist/`, loads it in light and
  dark, and fails on any axe violation (WCAG 2.2 AA plus best practice).
  It also requires one `h1`, a `main#main` and the skip link first in the
  tab order. Phone mockups (`[data-mockup]`) are skipped for colour
  contrast only, because they copy the apps' own iOS label colours.
- `tests/interaction.spec.ts` catches frozen islands: Programme, Life and
  Boids must keep rendering frames and answer their controls, and Plates
  must keep updating after its field is cleared or given a comma.

## Layout

| Path | What |
|---|---|
| `src/pages/index.astro` | The studio front page |
| `src/pages/lab/index.astro`, `lab/all.astro`, `lab/[slug].astro` | Lab shelf, dense index, one page per experiment |
| `src/layouts/StudioLayout.astro` | Front page shell: always dark, its own header and footer |
| `src/layouts/BaseLayout.astro` | Lab and colophon shell: light and dark themes, theme toggle |
| `src/components/studio/` | App icons and the phone mockups (`Phone.astro` frames each screen) |
| `src/data/apps.ts` | The apps on the front page: copy, status, links, accent |
| `src/data/site.ts` | Owner facts: name, title, location, links, first year of iOS work |
| `src/experiments/<slug>/` | One folder per experiment |
| `src/lib/registry.ts`, `collections.ts`, `shelf.ts` | Experiment registry, the four collections, planned shelf items |
| `src/styles/global.css` | Lab tokens (oklch colour, fluid type, motion) and Tailwind 4 setup |
| `PROJECTS.md` | Shipped, announced and proposed experiments, and two larger projects |
| `HANDOVER.md` | Current state, open decisions and known traps |
| `docs/superpowers/` | The original August and September plans; historical |

## Editing the front page

Change an app in `src/data/apps.ts`. When an App Store listing goes live,
set its `appStoreUrl`; the status pill becomes a "View on the App Store"
button. The phone screens are hand-built in `src/components/studio/` from
the apps' design files, so they have to be updated by hand when an app's
look changes.

## Adding an experiment

Create `src/experiments/<slug>/` with:

- `meta.ts`: a default export satisfying `ExperimentMeta` (title, summary,
  ISO date, `collection`, `listed`, `kind`, optional tags)
- `Experiment.astro`: renders it; hydrate a `.svelte` or `.tsx` island with
  `client:load`
- `logic.ts` with the pure logic and `logic.test.ts` beside it

It builds at `/lab/<slug>/`. `listed: true` puts it on the shelf and in the
sitemap; `listed: false` builds it with `noindex`, unlinked. The repository
is public, so unlisted is not secret. Give a listed experiment a miniature
in `src/components/TilePreview.astro`. If its slug matches a planned item
in `src/lib/shelf.ts`, it replaces that placeholder.

## Design

Two visual systems share the fonts (Bricolage Grotesque and JetBrains Mono,
self-hosted from Fontsource):

- **Lab ("Toybox")**: light and dark themes, outlined cards with hard
  offset shadows, four accent colours, one per collection. Tokens in
  `src/styles/global.css`, rendered at `/lab/tokens/`.
- **Studio**: always dark, large type, the app's colour as the accent.
  Tokens at the top of `StudioLayout.astro`. dbf.nsscode.com uses the same
  look in plain CSS.

Motion is extra everywhere. It runs only with `prefers-reduced-motion:
no-preference`; scroll effects additionally need
`@supports (animation-timeline: view())`.

## Deploying

Merge to `main`. The deploy workflow runs every gate, builds and publishes
`dist/` to GitHub Pages. `public/CNAME` holds the domain; DNS is at
Simply.com.
