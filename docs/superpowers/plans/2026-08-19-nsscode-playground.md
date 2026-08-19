# nsscode.com Tools Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Simply.com-hosted nsscode.com with an Astro site on GitHub Pages where each personal browser tool is a self-contained folder.

**Architecture:** Static Astro site, islands architecture. Every tool lives in `src/tools/<slug>/` and exposes four files: metadata, pure logic, an `.astro` hydration wrapper, and a UI component in whatever framework suits it. A build-time glob turns those folders into the index page and the routes. No server, no database, no persistence.

**Tech Stack:** Astro 7, Svelte 5, React 19, Tailwind CSS 4, Biome 2, Vitest 4, TypeScript. Deployed by GitHub Actions to GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-08-19-nsscode-playground-design.md`

## Global Constraints

- Repository is **public** — GitHub Pages from a private repo requires Pro. No secrets may ever enter this repo.
- Every tool is **pure client-side**. No server, no API, no database, no `localStorage`, no cookies, no analytics.
- `logic.ts` in any tool **must not touch the DOM** and must not import from any UI framework.
- Tool logic returns `Result<T>` and never throws for expected failure.
- Astro `client:*` directives work **only** on framework components imported directly into an `.astro` file. Never attempt to hydrate a glob-resolved component.
- DNS: only the `@` and `www` records may change. `MX`, the SPF `TXT`, `_dmarc`, `autoconfig`, and the `mail` / `webmail` / `autodiscover` A records (`185.20.205.18`) must be left exactly as they are. Breaking them disrupts live mailboxes.
- Do not cancel the Simply subscription as part of this plan. It is the only irreversible action and is explicitly out of scope.
- Pinned versions as of 2026-08-19: `astro@7.2.3`, `vite@8.2.1`, `tailwindcss@4.3.3`, `svelte@5.56.9`, `react@19.2.8`, `@biomejs/biome@2.5.9`, `vitest@4.1.11`.
- Working directory for every task: `~/Documents/Workspace/nsscode.com` (already a git repo with the spec committed).

---

### Task 1: Scaffold the Astro project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `biome.json`, `vitest.config.ts`, `src/pages/index.astro`, `src/styles/global.css`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: nothing — this is the first task.
- Produces: a working `npm run build`, `npm run test`, and `npx biome ci .`. All later tasks assume these three commands exist and pass.

- [ ] **Step 1: Scaffold Astro into the existing repo**

The directory already contains `docs/` and `.git`, so use the current directory rather than creating a new one. Choose the **Empty** template, **Yes** to TypeScript, **Strict**, and **No** to installing git (it is already a repo).

```bash
cd ~/Documents/Workspace/nsscode.com
npm create astro@latest . -- --template minimal --typescript strict --no-git --install
```

- [ ] **Step 2: Verify the scaffold builds**

```bash
npm run build
```

Expected: `Complete!` and a `dist/` directory containing `index.html`.

- [ ] **Step 3: Add the Svelte and Tailwind integrations**

```bash
npx astro add svelte --yes
npx astro add tailwind --yes
```

Tailwind 4 is wired as a Vite plugin, not an Astro integration. Confirm `astro.config.mjs` now contains a `vite.plugins` entry for `@tailwindcss/vite`, and that `src/styles/global.css` contains `@import "tailwindcss";`. If `astro add` did not create the stylesheet, create it:

```css
@import "tailwindcss";
```

- [ ] **Step 4: Add Biome and Vitest**

```bash
npm install --save-dev @biomejs/biome@2 vitest@4
npx biome init
```

- [ ] **Step 5: Configure Vitest to use Astro's Vite config**

Create `vitest.config.ts`:

```ts
import { getViteConfig } from 'astro/config'

export default getViteConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
})
```

- [ ] **Step 6: Add npm scripts**

In `package.json`, add to `"scripts"`:

```json
{
  "test": "vitest run",
  "lint": "biome ci .",
  "format": "biome check --write ."
}
```

- [ ] **Step 7: Verify all three commands work**

```bash
npm run build && npm run test && npm run lint
```

Expected: build succeeds; `vitest` reports "No test files found" and exits 0 (pass `--passWithNoTests` in the script if it exits non-zero); `biome ci` reports no errors. Fix any Biome complaints with `npm run format` before continuing.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "build: scaffold Astro project with Svelte, Tailwind, Biome and Vitest"
```

---

### Task 2: Put the site live on nsscode.com

This task deliberately comes before any real content. The site is disposable, and going live early lets the Let's Encrypt certificate provision while the rest is built.

**Files:**
- Create: `public/CNAME`, `.github/workflows/deploy.yml`
- Modify: `astro.config.mjs`

**Interfaces:**
- Consumes: a working `npm run build` from Task 1.
- Produces: a live site at `https://nsscode.com`, redeployed on every push to `main`.

- [ ] **Step 1: Pin the custom domain**

Create `public/CNAME` containing exactly one line and no trailing content:

```
nsscode.com
```

- [ ] **Step 2: Set the site URL**

In `astro.config.mjs`, add `site` to the config object. Do **not** add a `base` — the site is served from the domain apex, and a `base` would break every internal link.

```js
export default defineConfig({
  site: 'https://nsscode.com',
  // ...existing integrations and vite config
})
```

- [ ] **Step 3: Add the deploy workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7
      - name: Build
        uses: withastro/action@v6

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 4: Commit and create the public repository**

```bash
git add -A
git commit -m "ci: deploy to GitHub Pages on push to main"
gh repo create nsscode.com --public --source=. --remote=origin --push
```

- [ ] **Step 5: Enable Pages with the Actions source**

In the repository on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**. This must be set to Actions, not "Deploy from a branch" — the site requires a build step.

- [ ] **Step 6: Watch the first deploy**

```bash
gh run watch
```

Expected: both jobs green. The site is now live at the `github.io` URL.

- [ ] **Step 7: Change the two DNS records at Simply**

This step is manual, in Simply's control panel. Replace the single `@` A record with four:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Change `www` from an A record to a CNAME pointing at:

```
nikolajmosbaek.github.io.
```

**Change nothing else.** In particular leave the `mail`, `webmail` and `autodiscover` A records pointing at `185.20.205.18`. They share that address with the old website; repointing them breaks live mail.

- [ ] **Step 8: Set the custom domain in Pages**

**Settings → Pages → Custom domain** → `nsscode.com` → Save. GitHub will verify DNS, which can take several minutes.

- [ ] **Step 9: Verify DNS and mail together**

```bash
dig +short nsscode.com A          # expect the four 185.199.x addresses
dig +short www.nsscode.com        # expect nikolajmosbaek.github.io.
dig +short nsscode.com MX         # MUST still be: 10 mx.simply.com.
dig +short nsscode.com TXT        # MUST still be: v=spf1 include:spf.simply.com -all
dig +short mail.nsscode.com       # MUST still be: 185.20.205.18
```

If any of the last three changed, restore them in Simply's panel immediately before continuing.

- [ ] **Step 10: Enforce HTTPS**

Once the certificate is issued (the checkbox stops being greyed out, typically within an hour), tick **Enforce HTTPS** in Settings → Pages. Then:

```bash
curl -sSI https://nsscode.com | head -3
```

Expected: `HTTP/2 200`.

- [ ] **Step 11: Send a round-trip test email**

From an external account, send a message to your nsscode.com address and reply to it. Both directions must work before this task is considered done.

---

### Task 3: The Result type and the first tool's logic

Pure logic only — no UI in this task. This establishes the contract every later tool follows.

**Files:**
- Create: `src/lib/result.ts`, `src/lib/result.test.ts`, `src/tools/json-format/logic.ts`, `src/tools/json-format/logic.test.ts`

**Interfaces:**
- Consumes: the `npm run test` command from Task 1.
- Produces:
  - `type Result<T> = { ok: true; value: T } | { ok: false; error: string }`
  - `ok<T>(value: T): Result<T>`
  - `err<T = never>(error: string): Result<T>`
  - `formatJson(input: string, indent?: number): Result<string>`

- [ ] **Step 1: Write the failing test for Result**

Create `src/lib/result.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { err, ok } from './result'

describe('Result', () => {
  it('wraps a success value', () => {
    const r = ok(42)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toBe(42)
  })

  it('wraps a failure message', () => {
    const r = err('broken')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('broken')
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npm run test
```

Expected: FAIL — cannot resolve `./result`.

- [ ] **Step 3: Implement Result**

Create `src/lib/result.ts`:

```ts
export type Result<T> = { ok: true; value: T } | { ok: false; error: string }

export function ok<T>(value: T): Result<T> {
  return { ok: true, value }
}

export function err<T = never>(error: string): Result<T> {
  return { ok: false, error }
}
```

- [ ] **Step 4: Run the test and watch it pass**

```bash
npm run test
```

Expected: 2 passing.

- [ ] **Step 5: Write the failing tests for the JSON formatter**

Create `src/tools/json-format/logic.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { formatJson } from './logic'

describe('formatJson', () => {
  it('pretty-prints valid JSON with two-space indent', () => {
    const r = formatJson('{"a":1}')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toBe('{\n  "a": 1\n}')
  })

  it('honours a custom indent', () => {
    const r = formatJson('{"a":1}', 4)
    if (r.ok) expect(r.value).toBe('{\n    "a": 1\n}')
    else throw new Error('expected success')
  })

  it('preserves nested structure', () => {
    const r = formatJson('{"a":{"b":[1,2]}}')
    if (r.ok) expect(r.value).toContain('"b": [')
    else throw new Error('expected success')
  })

  it('fails on malformed JSON without throwing', () => {
    const r = formatJson('{nope}')
    expect(r.ok).toBe(false)
  })

  it('reports empty input as a failure rather than an exception', () => {
    const r = formatJson('   ')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('Nothing to format')
  })
})
```

- [ ] **Step 6: Run them and watch them fail**

```bash
npm run test
```

Expected: FAIL — cannot resolve `./logic`.

- [ ] **Step 7: Implement the formatter**

Create `src/tools/json-format/logic.ts`:

```ts
import { type Result, err, ok } from '../../lib/result'

export function formatJson(input: string, indent = 2): Result<string> {
  if (input.trim() === '') return err('Nothing to format')
  try {
    return ok(JSON.stringify(JSON.parse(input), null, indent))
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Invalid JSON')
  }
}
```

- [ ] **Step 8: Run the tests and watch them pass**

```bash
npm run test
```

Expected: 7 passing.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add Result type and JSON formatter logic"
```

---

### Task 4: Quality gates on pull requests

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `npm run lint`, `npm run test`, `npm run build` from Task 1.
- Produces: a required-checks workflow that runs on every pull request.

- [ ] **Step 1: Add the CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

- [ ] **Step 2: Verify it locally first**

```bash
npm run lint && npm run test && npm run build
```

Expected: all three exit 0. A failure here would fail CI too.

- [ ] **Step 3: Commit and confirm the workflow is valid**

```bash
git add -A
git commit -m "ci: run lint, tests and build on pull requests"
git push
gh workflow list
```

Expected: both `CI` and `Deploy to GitHub Pages` are listed.

---

### Task 5: Layout, tool registry, and the generated index

**Files:**
- Create: `src/lib/registry.ts`, `src/lib/registry.test.ts`, `src/layouts/BaseLayout.astro`, `src/tools/json-format/meta.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `src/styles/global.css` (Task 1), `src/tools/json-format/logic.ts` (Task 3).
- Produces:
  - `interface ToolMeta { title: string; description: string; tags: string[] }`
  - `interface ToolEntry extends ToolMeta { slug: string }`
  - `slugFromPath(path: string): string`
  - `buildRegistry(modules: Record<string, { default: ToolMeta }>): ToolEntry[]` — returns entries sorted by title
  - `BaseLayout.astro` accepting props `{ title: string; description?: string }`

- [ ] **Step 1: Write the failing registry tests**

Create `src/lib/registry.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildRegistry, slugFromPath } from './registry'

describe('slugFromPath', () => {
  it('takes the folder name under tools/', () => {
    expect(slugFromPath('../tools/json-format/meta.ts')).toBe('json-format')
  })

  it('works for the deeper path used by dynamic routes', () => {
    expect(slugFromPath('../../tools/uuid-gen/Tool.astro')).toBe('uuid-gen')
  })

  it('throws when the path is not inside tools/', () => {
    expect(() => slugFromPath('../lib/result.ts')).toThrow()
  })
})

describe('buildRegistry', () => {
  const modules = {
    '../tools/zebra/meta.ts': {
      default: { title: 'Zebra', description: 'z', tags: ['x'] },
    },
    '../tools/apple/meta.ts': {
      default: { title: 'Apple', description: 'a', tags: ['y'] },
    },
  }

  it('derives a slug for every tool', () => {
    expect(buildRegistry(modules).map((t) => t.slug)).toEqual(['apple', 'zebra'])
  })

  it('sorts entries by title', () => {
    expect(buildRegistry(modules).map((t) => t.title)).toEqual(['Apple', 'Zebra'])
  })

  it('carries the metadata through', () => {
    const apple = buildRegistry(modules)[0]
    expect(apple.description).toBe('a')
    expect(apple.tags).toEqual(['y'])
  })

  it('returns an empty list when there are no tools', () => {
    expect(buildRegistry({})).toEqual([])
  })
})
```

- [ ] **Step 2: Run and watch them fail**

```bash
npm run test
```

Expected: FAIL — cannot resolve `./registry`.

- [ ] **Step 3: Implement the registry**

Create `src/lib/registry.ts`:

```ts
export interface ToolMeta {
  title: string
  description: string
  tags: string[]
}

export interface ToolEntry extends ToolMeta {
  slug: string
}

export function slugFromPath(path: string): string {
  const match = path.match(/\/tools\/([^/]+)\//)
  if (!match) throw new Error(`Cannot derive a tool slug from "${path}"`)
  return match[1]
}

export function buildRegistry(
  modules: Record<string, { default: ToolMeta }>,
): ToolEntry[] {
  return Object.entries(modules)
    .map(([path, mod]) => ({ ...mod.default, slug: slugFromPath(path) }))
    .sort((a, b) => a.title.localeCompare(b.title))
}
```

- [ ] **Step 4: Run and watch them pass**

```bash
npm run test
```

Expected: 14 passing.

- [ ] **Step 5: Create the base layout**

Create `src/layouts/BaseLayout.astro`:

```astro
---
import '../styles/global.css'

interface Props {
  title: string
  description?: string
}

const { title, description = 'Small tools I actually use.' } = Astro.props
---

<!doctype html>
<html lang="en" class="h-full">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={Astro.url.href} />
  </head>
  <body class="min-h-full bg-zinc-950 text-zinc-100 antialiased">
    <div class="mx-auto flex min-h-screen max-w-3xl flex-col px-6">
      <header class="py-8">
        <a href="/" class="font-mono text-sm text-zinc-400 hover:text-zinc-100">
          nsscode.com
        </a>
      </header>
      <main class="flex-1 pb-16">
        <slot />
      </main>
      <footer class="py-8 font-mono text-xs text-zinc-600">
        <a href="https://github.com/NikolajMosbaek/nsscode.com" class="hover:text-zinc-400">
          source
        </a>
      </footer>
    </div>
  </body>
</html>
```

- [ ] **Step 6: Add metadata for the JSON formatter**

Create `src/tools/json-format/meta.ts`:

```ts
import type { ToolMeta } from '../../lib/registry'

export default {
  title: 'JSON Formatter',
  description: 'Pretty-print and validate a blob of JSON.',
  tags: ['json', 'format'],
} satisfies ToolMeta
```

- [ ] **Step 7: Generate the index page from the registry**

Replace `src/pages/index.astro` entirely:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro'
import { buildRegistry, type ToolMeta } from '../lib/registry'

const modules = import.meta.glob<{ default: ToolMeta }>('../tools/*/meta.ts', {
  eager: true,
})
const tools = buildRegistry(modules)
---

<BaseLayout title="nsscode.com">
  <h1 class="mb-2 text-2xl font-semibold">Tools</h1>
  <p class="mb-8 text-zinc-400">Small things I got tired of looking up.</p>

  <ul class="space-y-3">
    {
      tools.map((tool) => (
        <li>
          <a
            href={`/tools/${tool.slug}/`}
            class="block rounded-lg border border-zinc-800 p-4 hover:border-zinc-600"
          >
            <span class="font-medium">{tool.title}</span>
            <span class="mt-1 block text-sm text-zinc-400">{tool.description}</span>
          </a>
        </li>
      ))
    }
  </ul>

  {tools.length === 0 && <p class="text-zinc-500">No tools yet.</p>}
</BaseLayout>
```

- [ ] **Step 8: Verify the index renders the tool**

```bash
npm run build
grep -c 'JSON Formatter' dist/index.html
```

Expected: `1`. The link target `/tools/json-format/` will 404 until Task 6 — that is expected at this point.

- [ ] **Step 9: Commit**

```bash
npm run format
git add -A
git commit -m "feat: generate the tool index from a build-time registry"
```

---

### Task 6: Dynamic route, hydration wrapper, and the first live tool

**Files:**
- Create: `src/tools/json-format/Tool.svelte`, `src/tools/json-format/Tool.astro`, `src/pages/tools/[slug].astro`
- Modify: `src/lib/registry.ts`, `src/lib/registry.test.ts`

**Interfaces:**
- Consumes: `buildRegistry`, `slugFromPath`, `ToolEntry` (Task 5); `formatJson` (Task 3); `BaseLayout` (Task 5).
- Produces: `wrapperFor(modules: Record<string, { default: unknown }>, slug: string): unknown` in `src/lib/registry.ts`, and a working page at `/tools/json-format/`.

- [ ] **Step 1: Write the failing test for wrapper lookup**

Add `wrapperFor` to the existing import at the top of `src/lib/registry.test.ts`, so
the line reads `import { buildRegistry, slugFromPath, wrapperFor } from './registry'`,
then append this block to the end of the file:

```ts
describe('wrapperFor', () => {
  const wrappers = {
    '../../tools/json-format/Tool.astro': { default: 'JSON_WRAPPER' },
    '../../tools/uuid-gen/Tool.astro': { default: 'UUID_WRAPPER' },
  }

  it('finds the wrapper whose folder matches the slug', () => {
    expect(wrapperFor(wrappers, 'uuid-gen')).toBe('UUID_WRAPPER')
  })

  it('throws when no wrapper exists for the slug', () => {
    expect(() => wrapperFor(wrappers, 'missing')).toThrow(/missing/)
  })
})
```

- [ ] **Step 2: Run and watch it fail**

```bash
npm run test
```

Expected: FAIL — `wrapperFor` is not exported.

- [ ] **Step 3: Implement wrapper lookup**

Append to `src/lib/registry.ts`:

```ts
export function wrapperFor<T>(
  modules: Record<string, { default: T }>,
  slug: string,
): T {
  const hit = Object.entries(modules).find(([path]) => slugFromPath(path) === slug)
  if (!hit) throw new Error(`No Tool.astro found for tool "${slug}"`)
  return hit[1].default
}
```

- [ ] **Step 4: Run and watch it pass**

```bash
npm run test
```

Expected: 16 passing.

- [ ] **Step 5: Build the Svelte island**

Create `src/tools/json-format/Tool.svelte`. Note it imports only `./logic` — no DOM work happens outside this file, and no logic happens inside it.

```svelte
<script lang="ts">
  import { formatJson } from './logic'

  let input = $state('')
  let indent = $state(2)
  const result = $derived(formatJson(input, indent))
</script>

<div class="space-y-4">
  <label class="block">
    <span class="mb-1 block text-sm text-zinc-400">Input</span>
    <textarea
      bind:value={input}
      rows="8"
      spellcheck="false"
      placeholder={'{"hello":"world"}'}
      class="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 font-mono text-sm"
    ></textarea>
  </label>

  <label class="flex items-center gap-2 text-sm text-zinc-400">
    Indent
    <select
      bind:value={indent}
      class="rounded border border-zinc-800 bg-zinc-900 px-2 py-1"
    >
      <option value={2}>2</option>
      <option value={4}>4</option>
    </select>
  </label>

  {#if input.trim() !== ''}
    {#if result.ok}
      <pre class="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 p-3 font-mono text-sm">{result.value}</pre>
    {:else}
      <p class="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-300">
        {result.error}
      </p>
    {/if}
  {/if}
</div>
```

- [ ] **Step 6: Add the hydration wrapper**

Create `src/tools/json-format/Tool.astro`. This file exists solely because Astro's `client:*` directives only work on framework components imported directly into an `.astro` file:

```astro
---
import Island from './Tool.svelte'
---

<Island client:load />
```

- [ ] **Step 7: Add the dynamic route**

Create `src/pages/tools/[slug].astro`:

```astro
---
import type { AstroInstance } from 'astro'
import BaseLayout from '../../layouts/BaseLayout.astro'
import { buildRegistry, wrapperFor, type ToolMeta } from '../../lib/registry'

const metas = import.meta.glob<{ default: ToolMeta }>('../../tools/*/meta.ts', {
  eager: true,
})
const wrappers = import.meta.glob<AstroInstance>('../../tools/*/Tool.astro', {
  eager: true,
})

export function getStaticPaths() {
  return buildRegistry(metas).map((tool) => ({
    params: { slug: tool.slug },
    props: { tool },
  }))
}

const { tool } = Astro.props
const Tool = wrapperFor(wrappers, tool.slug)
---

<BaseLayout title={`${tool.title} — nsscode.com`} description={tool.description}>
  <h1 class="mb-1 text-2xl font-semibold">{tool.title}</h1>
  <p class="mb-8 text-zinc-400">{tool.description}</p>
  <Tool />
</BaseLayout>
```

- [ ] **Step 8: Verify the page builds and hydrates**

```bash
npm run build
test -f dist/tools/json-format/index.html && echo "page exists"
grep -o '/_astro/[^"]*\.js' dist/tools/json-format/index.html | sort -u
```

Expected: `page exists`, and at least one `/_astro/*.js` reference — that is the hydrated island.

- [ ] **Step 9: Confirm it actually works in a browser**

```bash
npm run dev
```

Open `http://localhost:4321/tools/json-format/`. Paste `{"a":{"b":[1,2]}}` and confirm it pretty-prints; type `{nope}` and confirm the red error box appears rather than a blank page or a console exception. Stop the dev server.

- [ ] **Step 10: Commit and ship**

```bash
npm run format
git add -A
git commit -m "feat: add JSON formatter tool with dynamic tool routing"
git push
gh run watch
```

Expected: deploy is green and `https://nsscode.com/tools/json-format/` is live.

---

### Task 7: A second tool in a different framework, and the bundle-isolation check

This task proves the two claims the architecture rests on: that tools can each use a different framework, and that one tool's page does not ship another tool's JavaScript.

**Files:**
- Create: `src/tools/uuid-gen/logic.ts`, `src/tools/uuid-gen/logic.test.ts`, `src/tools/uuid-gen/meta.ts`, `src/tools/uuid-gen/Tool.tsx`, `src/tools/uuid-gen/Tool.astro`
- Modify: `astro.config.mjs` (via `astro add react`)

**Interfaces:**
- Consumes: `Result`, `ok`, `err` (Task 3); the registry and routing from Tasks 5 and 6 — both are used unchanged, which is the point.
- Produces: `generateUuids(count: number): Result<string[]>`.

- [ ] **Step 1: Add the React integration**

```bash
npx astro add react --yes
```

- [ ] **Step 2: Write the failing tests**

Create `src/tools/uuid-gen/logic.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { generateUuids } from './logic'

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('generateUuids', () => {
  it('returns the requested number of v4 UUIDs', () => {
    const r = generateUuids(3)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value).toHaveLength(3)
      for (const id of r.value) expect(id).toMatch(UUID_V4)
    }
  })

  it('returns distinct values', () => {
    const r = generateUuids(50)
    if (r.ok) expect(new Set(r.value).size).toBe(50)
    else throw new Error('expected success')
  })

  it('rejects a count below one', () => {
    expect(generateUuids(0).ok).toBe(false)
  })

  it('rejects a count above one hundred', () => {
    expect(generateUuids(101).ok).toBe(false)
  })

  it('rejects a non-integer count', () => {
    expect(generateUuids(2.5).ok).toBe(false)
  })
})
```

- [ ] **Step 3: Run and watch them fail**

```bash
npm run test
```

Expected: FAIL — cannot resolve `./logic`.

- [ ] **Step 4: Implement the generator**

Create `src/tools/uuid-gen/logic.ts`:

```ts
import { type Result, err, ok } from '../../lib/result'

export function generateUuids(count: number): Result<string[]> {
  if (!Number.isInteger(count)) return err('Count must be a whole number')
  if (count < 1) return err('Count must be at least 1')
  if (count > 100) return err('Count must be 100 or fewer')
  return ok(Array.from({ length: count }, () => crypto.randomUUID()))
}
```

- [ ] **Step 5: Run and watch them pass**

```bash
npm run test
```

Expected: 21 passing.

- [ ] **Step 6: Add metadata**

Create `src/tools/uuid-gen/meta.ts`:

```ts
import type { ToolMeta } from '../../lib/registry'

export default {
  title: 'UUID Generator',
  description: 'Generate a batch of version 4 UUIDs.',
  tags: ['uuid', 'generate'],
} satisfies ToolMeta
```

- [ ] **Step 7: Build the React island**

Create `src/tools/uuid-gen/Tool.tsx`. The string `Generate UUIDs` is used as a marker in Step 10 — keep it exactly as written:

```tsx
import { useState } from 'react'
import { generateUuids } from './logic'

export default function Tool() {
  const [count, setCount] = useState(5)
  const [ids, setIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  function run() {
    const result = generateUuids(count)
    if (result.ok) {
      setIds(result.value)
      setError(null)
    } else {
      setIds([])
      setError(result.error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={count}
          min={1}
          max={100}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-24 rounded border border-zinc-800 bg-zinc-900 px-2 py-1"
        />
        <button
          type="button"
          onClick={run}
          className="rounded-lg bg-zinc-100 px-3 py-1 font-medium text-zinc-900 hover:bg-white"
        >
          Generate UUIDs
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {ids.length > 0 && (
        <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 p-3 font-mono text-sm">
          {ids.join('\n')}
        </pre>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Add the hydration wrapper**

Create `src/tools/uuid-gen/Tool.astro`:

```astro
---
import Island from './Tool.tsx'
---

<Island client:load />
```

- [ ] **Step 9: Verify both tools route without touching any shared file**

```bash
npm run build
grep -c 'UUID Generator' dist/index.html
test -f dist/tools/uuid-gen/index.html && echo "uuid page exists"
```

Expected: `1` and `uuid page exists`. No file outside `src/tools/uuid-gen/` was edited to achieve this — confirm with `git status` that only that folder and `astro.config.mjs`/`package.json` (from `astro add react`) changed.

- [ ] **Step 10: Run the bundle-isolation check**

This is the measurement the spec requires. Each tool page must not carry the other tool's JavaScript. String literals survive minification, so the UI marker strings are reliable probes.

```bash
npm run build

check_leak() {
  page="$1"; marker="$2"
  for chunk in $(grep -o '/_astro/[^"]*\.js' "$page" | sort -u); do
    if grep -q "$marker" "dist$chunk"; then
      echo "LEAK: $page pulls in $chunk containing '$marker'"
    fi
  done
}

check_leak dist/tools/json-format/index.html 'Generate UUIDs'
check_leak dist/tools/uuid-gen/index.html 'Nothing to format'
echo "check complete"
```

Expected: `check complete` with **no** `LEAK:` lines.

- [ ] **Step 11: Apply the fallback only if the check failed**

If Step 10 printed any `LEAK:` line, the single dynamic route is bundling every island into every tool page. Replace it with one page per tool:

1. Delete `src/pages/tools/[slug].astro`.
2. Create `src/pages/tools/json-format.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro'
import meta from '../../tools/json-format/meta'
import Island from '../../tools/json-format/Tool.svelte'
---

<BaseLayout title={`${meta.title} — nsscode.com`} description={meta.description}>
  <h1 class="mb-1 text-2xl font-semibold">{meta.title}</h1>
  <p class="mb-8 text-zinc-400">{meta.description}</p>
  <Island client:load />
</BaseLayout>
```

3. Create `src/pages/tools/uuid-gen.astro` with the same shape, importing `../../tools/uuid-gen/meta` and `../../tools/uuid-gen/Tool.tsx`.
4. Delete both `Tool.astro` wrappers and remove `wrapperFor` plus its tests from `src/lib/registry.ts` and `src/lib/registry.test.ts`.
5. Re-run Step 10. It must now report no leaks.
6. Update the spec's "Tool contract" section: adding a tool now costs a folder plus a page file.

If Step 10 passed, skip this step entirely and leave the dynamic route in place.

- [ ] **Step 12: Confirm both tools work in a browser**

```bash
npm run dev
```

Check `/tools/json-format/` and `/tools/uuid-gen/`. Confirm the UUID generator produces distinct IDs, and that entering `0` shows the error message rather than an empty list. Stop the dev server.

- [ ] **Step 13: Commit and ship**

```bash
npm run format
npm run lint && npm run test && npm run build
git add -A
git commit -m "feat: add UUID generator as a React island alongside the Svelte tool"
git push
gh run watch
```

Expected: green deploy, both tools live, and the index at `https://nsscode.com` listing both.

---

## Done when

- `https://nsscode.com` serves the tool index over HTTPS with a valid certificate
- Two tools work, written in two different frameworks
- `dig +short nsscode.com MX` still returns `10 mx.simply.com.` and mail round-trips
- `npm run lint && npm run test && npm run build` passes locally and in CI
- Adding a third tool requires creating exactly one folder (or one folder and one page file, if Task 7 Step 11 was applied)
