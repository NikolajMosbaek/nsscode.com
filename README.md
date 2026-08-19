# nsscode.com

A personal playground of small client-side tools, deployed as a static site at
[nsscode.com](https://nsscode.com). Built with Astro, hosted on GitHub Pages.

## Running it

```sh
npm install
npm run dev      # local dev server
npm run build    # production build to ./dist
```

## Gates

```sh
npm run lint       # Biome
npm run typecheck  # astro check
npm run test       # Vitest
```

All three run in CI on every pull request, and again before every deploy to `main`.

## Adding a new tool

Create `src/tools/<slug>/` containing:

- `meta.ts` — title, description, and tags (a `ToolMeta`)
- `logic.ts` — the tool's pure logic; no DOM access, no UI framework import
- `Tool.astro` — imports the island component and renders it with `client:load`
- `Tool.svelte` or `Tool.tsx` — the UI, driven entirely by `logic.ts`

Nothing else needs editing — the tool index and its route are generated from
this registry at build time.
