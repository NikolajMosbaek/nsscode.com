# nsscode.com

Personal site of Nikolaj Søgaard Simonsen, deployed as a static site at
[nsscode.com](https://nsscode.com). Built with Astro, hosted on GitHub Pages.

The site is being rebuilt from a tools playground into a personal site. The plan lives
in `docs/superpowers/plans/2026-09-05-personal-site-redesign.md`.

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
