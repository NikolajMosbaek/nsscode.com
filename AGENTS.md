# Working on nsscode.com

Read `README.md` for what the site is and how it is laid out, and
`HANDOVER.md` for the current state, open decisions and known traps.
`PROJECTS.md` is the backlog.

## Before you call a change done

Run the gates, in this order, and say which ones you ran:

```sh
npm run lint
npm run typecheck
npm run test
npm run build      # the e2e suite reads ./dist, so build first
npm run test:e2e
```

A change to an interactive island needs a browser check, not only unit
tests: a Svelte component can pass every unit test and still freeze in the
page. `tests/interaction.spec.ts` is where such checks live.

## Shipping

Work on a branch and open a pull request to `main`; CI runs every gate.
Merging to `main` deploys to nsscode.com through
`.github/workflows/deploy.yml`, which runs every gate again first. There
is no staging site, so a merge is a release.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and
`astro dev logs`. `astro preview` backgrounds itself the same way in an
agent shell; stop it with `astro preview stop` before `npm run test:e2e`,
or Playwright's own server start fails with "Process from
config.webServer exited early".

## Conventions

- **Facts live once.** The owner in `src/data/site.ts`, the apps in
  `src/data/apps.ts`. Pages read from there and never hard-code a name, a
  link or a year.
- **Copy:** British spelling, plain short sentences, no em dashes, no
  marketing words. Danish context: kroner, kilograms, Copenhagen time,
  Danish tax and mortgage rules.
- **Comments** explain why, in block comments. Keep them where the code
  surprises a reader; skip them where it does not.
- **Experiments** keep their maths in `logic.ts` with tests beside it, run
  entirely in the browser, send nothing anywhere, and keep shareable state
  in the URL. `localStorage` is for conveniences only (theme, course
  progress).
- **Accessibility is a gate, not a goal.** One `h1` per page, `main#main`,
  the skip link first, and zero axe violations in both themes.
- **Motion** runs only under `prefers-reduced-motion: no-preference`;
  scroll-driven motion also under `@supports (animation-timeline: view())`.

## Traps already hit

Each of these cost a debugging session. Check here before guessing.

- **Svelte effect loops.** An `$effect` that writes state and then reads it
  re-runs forever: the page renders but stops answering clicks. Read
  initial state once outside the effect (Programme does this).
- **A throw during render freezes a Svelte island for the rest of the
  visit.** Plates froze because an empty `type="number"` field bound to a
  number becomes `null`, and formatting `null` threw. Use a text field with
  `inputmode="decimal"` and parse it yourself (`parseKg` in Plates).
  Safari also reads a Danish comma in a number field as empty.
- **Svelte drops keyframes it thinks are unused.** Keyframes used only from
  Tailwind classes or other components need the `-global-` prefix.
- **The CSS minifier folds `animation-timeline` into the `animation`
  shorthand, and browsers then drop the rule.** Write scroll-driven
  animations with longhands: `animation-name`, `animation-timing-function`,
  `animation-fill-mode`, `animation-timeline`.
- **Class names clash with Tailwind utilities.** `card`, `ring`, `rounded`,
  `eyebrow`, `pill`, `link` and similar names pick up utility styles
  (borders, shadows, outlines). Prefix component classes or pick other
  names.
- **`preserve-3d` lets overlapping phones cut through each other.** The
  tilt wrapper uses its own `perspective` instead.
- **A container query element cannot style itself.** Put
  `container-type` on the outer element and style an inner one (see
  `Tile.astro`).
- **Safari throttles `history.replaceState`** to about 100 calls in 30
  seconds. Debounce URL writes and wrap them in `try`.
- **The studio tokens must outrank the theme selectors** in `global.css`;
  that is why `StudioLayout.astro` uses `html:root.studio`.
- **Playwright in a cloud container** may find a newer Chromium than it
  expects. Point `launchOptions.executablePath` at `/opt/pw-browsers/chromium`
  in a throwaway config rather than running `playwright install`.

## Astro documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
