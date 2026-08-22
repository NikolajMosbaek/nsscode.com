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

## Adding a recipe

Recipes are JSON files in `src/recipes/`, one per recipe. `src/lib/recipe/contract.ts`
describes the format; `src/lib/recipe/parse.ts` enforces it at build time, so a
recipe missing its ingredients, steps, serving count, macros or rating fails the
build rather than shipping a half-empty page.

Three ways in:

- **Claude Code** — say "add a recipe for …". The `add-recipe` skill writes the
  file.
- **Claude anywhere else** — open [/tools/recipe-upload/](https://nsscode.com/tools/recipe-upload/),
  copy the prompt it gives you into Claude, and paste the answer back. It checks
  the recipe, previews it, and either keeps it in your browser or hands you the
  file to commit.
- **By hand** — copy an existing file in `src/recipes/` and edit it.

## Adding a new tool

Create `src/tools/<slug>/` containing:

- `meta.ts` — title, description, and tags (a `ToolMeta`)
- `logic.ts` — the tool's pure logic; no DOM access, no UI framework import
- `Tool.astro` — imports the island component and renders it with `client:load`
- `Tool.svelte` or `Tool.tsx` — the UI, driven entirely by `logic.ts`

Nothing else needs editing — the tool index and its route are generated from
this registry at build time.
