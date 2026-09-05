# nsscode.com

Personal site of Nikolaj Søgaard Simonsen, deployed as a static site at
[nsscode.com](https://nsscode.com). Built with Astro, hosted on GitHub Pages.

Two things live here: a presentation of who I am and how I work, and a lab for
experiments, listed or not.

## Running it

```sh
npm install
npm run dev      # local dev server
npm run build    # production build to ./dist
npm run preview  # serve ./dist
```

## Gates

```sh
npm run lint       # Biome
npm run typecheck  # astro check
npm run test       # Vitest, unit tests next to the code
npm run test:e2e   # Playwright + axe against ./dist (build first)
```

All four run in CI on every pull request, and again before every deploy to `main`.
The end-to-end suite loads every built page in both themes and fails on any
WCAG 2.2 AA violation.

## Editing content

Facts about me live in `src/data/`:

| File | What |
|---|---|
| `site.ts` | Name, title, location, description, links |
| `principles.ts` | The "How I work" list |
| `timeline.ts` | Roles, newest first |
| `stack.ts` | What I use, grouped |

Prose that is not a list is written directly in the section component under
`src/components/sections/`. The section order is set in `src/pages/index.astro`.

## Adding an experiment

Create `src/experiments/<slug>/` containing:

- `meta.ts`, a default export satisfying `ExperimentMeta`: title, summary, ISO date, `listed`, optional tags
- `Experiment.astro`, which renders the experiment. For an interactive island, import a `.svelte` or `.tsx` component here and hydrate it with `client:load`; for a static experiment, write the markup directly.
- optionally `logic.ts` with the pure logic and `logic.test.ts` next to it

The experiment builds at `/lab/<slug>/`. With `listed: true` it appears on the lab
index and in the sitemap. With `listed: false` it still builds, but is not linked
anywhere, is excluded from the sitemap and carries a `noindex` meta tag. The
repository is public, so unlisted means unlisted, not secret.

## Design

Tokens (colour in `oklch`, fluid type scale, motion) are in `src/styles/global.css`
and rendered live at `/lab/tokens/`. Fonts are Schibsted Grotesk and Commit Mono,
self-hosted from Fontsource. The social image is generated at build time by
`src/pages/og.png.ts`. The redesign plan and its open questions are in
`docs/superpowers/plans/2026-09-05-personal-site-redesign.md`.
