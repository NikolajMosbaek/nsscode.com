# nsscode.com — personal tools playground

**Date:** 2026-08-19
**Status:** Approved design, not yet implemented

## Context

`nsscode.com` currently serves a static site hosted on Simply.com, editable only
through their web file manager. The existing content is disposable and will not be
migrated. The domain also carries live mailboxes, which must keep working.

This spec covers replacing the site with a new one whose source lives on GitHub and
deploys automatically to GitHub Pages.

## Purpose

A personal playground: a place to build small, self-contained browser tools that the
owner actually uses. Audience is incidental. Success is that it stays fun to add to.

A secondary and explicit goal: the site is an excuse to work with modern web tooling
that does not come up in day-to-day iOS work. This justifies build complexity that a
purely utilitarian site would not.

## Goals

- Adding a new tool costs one folder and no edits anywhere else
- Each tool is independent — no shared state, no cross-tool coupling
- Tools may each use a different UI framework
- The interesting logic of every tool is testable without a browser
- Deploys happen on push to `main` with no manual steps

## Non-goals

Deliberately excluded, and to be resisted later:

- No blog, feed, tags, or writing pipeline
- No server, database, or API — every tool is pure client-side
- No persistence: no localStorage, no cross-device sync, no accounts
- No CMS or browser-based editing
- No analytics, comments, or newsletter
- No component or end-to-end tests

## Approach

**Astro with islands architecture.** The site is static pages; each tool is an
interactive island hydrated on its own page. Pages that need no JavaScript ship none.

Chosen over two alternatives:

- *Vite + Svelte SPA* — wrong shape for a set of unrelated tools (one bundle, hand-
  maintained index) and locks the repo into a single framework, defeating the
  playground goal.
- *Vite multi-page + vanilla TypeScript* — viable and simple, but involves almost no
  new tooling, which is the stated reason for building this at all.

Astro's decisive advantage here is per-island framework choice: one tool in Svelte, the
next in React, a third in plain TypeScript, in one repo with no rewrites.

## Architecture

```
nsscode.com/
├── src/
│   ├── layouts/BaseLayout.astro     # shell: header, nav, footer, theme toggle
│   ├── pages/
│   │   ├── index.astro              # tool index — generated, never hand-edited
│   │   └── tools/[slug].astro       # one route per tool, via getStaticPaths
│   ├── tools/
│   │   └── <slug>/
│   │       ├── meta.ts              # { title, description, tags }
│   │       ├── logic.ts             # pure functions — no DOM access
│   │       └── Tool.svelte          # the island (framework is per-tool)
│   ├── components/
│   └── styles/global.css
├── public/CNAME                     # contains: nsscode.com
├── .github/workflows/
├── astro.config.mjs
└── package.json
```

### Tool registry

`import.meta.glob('./tools/*/meta.ts', { eager: true })` discovers tools at build time.
The index page maps over the result to render cards; `[slug].astro` maps over it to
generate routes. No list is maintained by hand.

This uses a Vite primitive rather than Astro content collections deliberately: the
content-collection API has changed across Astro majors, and the payload here is a
three-field object that gains nothing from schema validation.

### The tool contract

Every tool folder exposes the same three files. Nothing outside the folder knows which
framework the tool uses.

The island file is always named `Tool.<ext>`, where the extension picks the framework
(`Tool.svelte`, `Tool.tsx`, `Tool.ts`). The folder name is the tool's slug and its URL.

`logic.ts` holds all real work as pure functions and must not touch the DOM.
`Tool.<ext>` only binds those functions to inputs and buttons.

`[slug].astro` resolves the island through a second, non-eager glob
(`import.meta.glob('./tools/*/Tool.*')`) keyed by folder name, awaited in the page
frontmatter and rendered with a `client:load` directive. This keeps the island's code
out of the index page's bundle. The exact directive syntax is to be confirmed against
Astro 7 documentation at implementation time.

This split is the one structural rule the project enforces. It makes each tool's
substance testable without a browser, and lets a tool's UI be rewritten in another
framework without touching its logic.

### Error handling

Tool logic returns a discriminated union rather than throwing:

```ts
type Result<T> = { ok: true; value: T } | { ok: false; error: string }
```

Failure paths are therefore ordinary values — testable, and rendered as a message in
the UI instead of an unhandled exception and a blank page.

## Build and deploy

- GitHub repository `nsscode.com`, **public** (Pages from a private repo requires Pro)
- Pages source: **GitHub Actions**, not a branch — the site requires a build
- Deploy workflow: Astro's first-party action, then `actions/deploy-pages`, on push to
  `main`, with a `concurrency` group so rapid pushes cannot race onto the live site
- `astro.config.mjs` sets `site: 'https://nsscode.com'`; no `base`, as the site is
  served from the domain apex
- `public/CNAME` pins the custom domain independently of the repo settings UI

### Quality gates

On pull request and on push to `main`, before any deploy:

- `biome ci` — lint and format, one binary, replacing ESLint + Prettier
- `vitest run` — unit tests over `logic.ts` files only
- `astro build` — a meaningful gate, since Astro type-checks templates

A failing check blocks the deploy.

## DNS

DNS is repointed at GitHub **before** the first deploy. The domain 404s in the interim,
which is acceptable because the existing content is disposable, and it lets the
Let's Encrypt certificate provision while the site is being built. No TTL reduction and
no rollback plan, for the same reason.

Two records change:

| Host  | From                    | To                                                                     |
|-------|-------------------------|------------------------------------------------------------------------|
| `@`   | A `185.20.205.18`       | A `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `www` | A `185.20.205.18`       | CNAME `nikolajmosbaek.github.io.`                                      |

**Left untouched:** `MX` (`mx.simply.com`), the SPF `TXT`, `_dmarc`, `autoconfig`, and
the `mail` / `webmail` / `autodiscover` A records.

Those last three point at `185.20.205.18` — the same address the website uses. A bulk
replacement of that IP would take webmail and Outlook autodiscovery down with it. This
is the only genuinely destructive risk in the migration.

`Enforce HTTPS` is enabled in Pages once the certificate is issued.

Simply's web hosting is cancelled only after mail is confirmed working post-cutover,
and only once Simply confirms the mailboxes survive on a domain-and-mail-only plan.

## Dependency versions

Current as of 2026-08-19. Astro 7, Vite 8 and Vitest 4 postdate the assistant's
training data, so their documentation is to be consulted rather than recalled.

| Package          | Version  |
|------------------|----------|
| `astro`          | 7.2.3    |
| `vite`           | 8.2.1    |
| `tailwindcss`    | 4.3.3    |
| `svelte`         | 5.56.9   |
| `react`          | 19.2.8   |
| `@biomejs/biome` | 2.5.9    |
| `vitest`         | 4.1.11   |

Tailwind v4 is configured in CSS rather than a JavaScript config file.

## Risks

- **Astro major churn.** Astro is on version 7; upgrades may require template changes.
  Mitigated by keeping tool logic framework-free — a migration touches layouts and
  pages, never `logic.ts`.
- **Public repository.** Required by Pages on a free plan. Nothing secret may enter the
  repo; there is no server and no API key by design, so this is a constraint to
  maintain rather than a problem to solve.
- **Scope creep.** The non-goals list exists because a playground with a blog, a
  database, and accounts stops being a playground.
