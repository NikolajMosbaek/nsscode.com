# nsscode.com Personal Site Redesign Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Phase 0 and Phase 1 need the owner in the loop; do not start Phase 2 before a design direction has been chosen.

**Date:** 2026-09-05
**Status:** Draft, awaiting answers to the questions in Phase 0
**Owner:** Nikolaj Søgaard Simonsen
**Supersedes:** the purpose section of `docs/superpowers/specs/2026-08-19-nsscode-playground-design.md`. The build, deploy and DNS sections of that spec still apply unchanged.

**Goal:** Turn nsscode.com from an empty tools playground into a personal site that presents who Nikolaj is, what he does, and how he likes to work, at a level of craft that holds up against the best personal engineering sites of 2026.

**Architecture:** Static Astro site, one long page plus a handful of thin routes. No framework islands by default; interactivity is a few hundred bytes of vanilla script. All content is typed TypeScript data or prose written directly into components. Design tokens live in Tailwind 4's `@theme`. Deployed to GitHub Pages on push to `main`, exactly as today.

**Tech Stack:** Astro 7, Tailwind CSS 4, TypeScript, Biome 2, Vitest 4, Playwright with axe-core for accessibility checks, satori + resvg for the build-time social image. Self-hosted variable fonts via Fontsource.

---

## Why the current site is ugly, honestly

It is not the palette. Three things make it read as ugly and uninteresting:

1. **It has nothing to say.** Two cards and a footer link. No person, no point of view. No amount of styling fixes an empty page.
2. **It uses the default shapes.** Centered column, rounded cards with a soft shadow, a serif headline. Every AI-generated landing page in 2025 looked like this. It has no author.
3. **No hierarchy or rhythm.** One type size for the title, one for body, uniform spacing. Nothing pulls the eye anywhere.

The warm café palette committed on 2026-09-02 was a restyle of an empty page. It could survive into the new design, but it should not be assumed. Phase 1 decides that.

## What "state-of-the-art UI/UX" means here

The phrase is vague, so this plan pins it to things that can be checked. A personal site in 2026 is state of the art when:

| Property | Bar |
|---|---|
| Typography | A deliberate pairing, fluid scale via `clamp()`, optical sizing, real hierarchy. Self-hosted, subset, no layout shift. |
| Colour | Tokens in `oklch`, light and dark themes of equal quality, system preference honoured, a toggle that never flashes. |
| Motion | Purposeful, fast, mostly CSS. Scroll-driven reveals via `animation-timeline`. Everything gated on `prefers-reduced-motion`. No cursor-following blobs, no parallax hero, no 3D scene. |
| Performance | Lighthouse 100 in all four categories. Zero JavaScript shipped except the theme toggle. LCP under 1 s on a throttled 4G profile. |
| Accessibility | WCAG 2.2 AA everywhere, AAA contrast for body text. Skip link, landmarks, visible focus, keyboard-complete. Enforced by axe in CI, not by good intentions. |
| Responsiveness | Designed mobile-first, checked on an actual iPhone in Safari. Container queries where a component needs them. |
| Sharing | A generated Open Graph image, JSON-LD `Person`, a sitemap, correct canonical URLs. The link looks right when pasted into Slack or LinkedIn. |
| Character | The page could only belong to this person. Opinions on the page, not adjectives about them. |

What is deliberately excluded because it is trend noise, not quality: command palettes on a five-section site, 3D or WebGL, animated gradient meshes, typewriter effects, "scroll to explore" hints, glassmorphism cards, testimonial carousels.

## What changes from the 2026-08-19 spec

| 2026-08-19 | Now |
|---|---|
| Purpose: a playground for small browser tools | Purpose: present the person. Tools are gone (removed in commit `dd9b768`). |
| Per-tool framework choice, Svelte and React installed | No framework islands. Both integrations are removed in Phase 2. Reintroduce one only when a real island exists. |
| Non-goal: no blog, feed or writing pipeline | Still a non-goal. See the open question on writing below; the default is no. |
| Non-goal: no analytics, comments, newsletter, CMS, server, persistence | All still non-goals. |
| Non-goal: no component or end-to-end tests | Changed. One Playwright run that loads every page, runs axe, and checks both themes. Accessibility regressions on a personal site are embarrassing and cheap to catch. |
| Content-collection API avoided because the payload was a three-field object | Still avoided. Structured content (principles, timeline, stack) is typed TypeScript in `src/data/`. Prose is written directly in components. A schema layer buys nothing at this size. |
| Google Fonts via `<link>` | Self-hosted from Fontsource. Removes a third-party request, fixes layout shift, and stops a US CDN from logging visitors' IPs. |

---

## What the public profiles say

Source: search-engine snippets of the LinkedIn profile at `linkedin.com/in/nikolaj-mos` and the X account `@NikolajMosb`, retrieved 2026-09-05. The profile pages themselves could not be opened from the build environment, so every line below is unverified and must be confirmed in Phase 0. Nothing here is copied into the site until it is.

| Fact | As found | Confidence |
|---|---|---|
| Name | Nikolaj Søgaard Simonsen | High: LinkedIn page title and X display name agree. The GitHub handle `NikolajMosbaek` and X handle `NikolajMosb` are unexplained, see Q1. |
| Location | Copenhagen, Denmark | Medium |
| Current role | Senior Software Engineer at FOSS, iOS | Medium: from a snippet announcing the hire |
| Before that | External consultant from Capgemini, Lead Solution Designer and Developer for an internal iPadOS application, apparently at FOSS before joining | Medium |
| Earlier | Co-founder, owner and director of ZyborgApps IVS, June 2018 to December 2020 | Medium: company-registry snippet |
| Experience | "A decade of experience", "building apps for various purposes" | High, and stale: preferences say 11 years |
| Public voice | Active on X since 2015, around 2,400 followers, posts about iOS development | Medium |
| Self-description | "Seasoned iOS developer", "very patient and helpful", "works both in teams and independently" | High that it is on the profile, low that it should be on the site |

**Use the profile for facts, not for voice.** The self-description above is standard LinkedIn register: adjectives about the person. The site's how-I-work section should be written in the opposite register, claims that could be disagreed with. A visitor who reads "patient and helpful" learns nothing. A visitor who reads "strict concurrency is a design constraint, not a compiler setting" learns how you think.

Three things the profile suggests for the site that were not in the first draft of this plan:

1. **A founder chapter.** Two and a half years running your own app company is the most distinctive line in the timeline. It says more than any job title.
2. **The consultant-to-employee arc.** Designing and building an internal iPadOS app as an external consultant, then being hired to own it, is a concrete story about trust and delivery. Worth one paragraph, if the employer agrees to be named.
3. **iPadOS, not just iOS.** If internal iPad apps for instrumentation or lab work are part of the job, that is a niche worth claiming explicitly. Most iOS CVs never mention iPad.

## Phase 0: Questions only you can answer

Content is the bottleneck in this project, not code. Every task after Phase 1 is blocked on the answers here. Each question has a default; if you do not answer, the default is used and the copy is written as a clearly marked placeholder for you to replace.

### Identity

- [ ] **Q1. Name.** LinkedIn and X say Nikolaj Søgaard Simonsen. The GitHub handle is `NikolajMosbaek` and the X handle `NikolajMosb`. Which name goes on the site, and should the middle name be shown? Is "Mosbæk" a former name that should be mentioned anywhere? *Default: Nikolaj Søgaard Simonsen, no mention of Mosbæk.*
- [ ] **Q2. Title.** LinkedIn says Senior Software Engineer. Preferences say senior iOS engineer. The site can be more specific than the employer's title. *Default: Senior iOS Engineer.*
- [ ] **Q3. Location line.** Search results say Copenhagen. City, or just "Denmark"? *Default: Copenhagen, Denmark.*
- [ ] **Q4. Photo.** Do you want a portrait on the site? If yes, supply one at 1600 px or wider, and say whether you want it treated (monochrome, duotone) or left natural. *Default: no photo, a typographic monogram instead.*
- [ ] **Q5. Employer.** LinkedIn names FOSS. Do you want it named and linked on the site, or only described ("a Danish analytical-instruments company")? Naming it also unlocks the consultant-to-employee story above. *Default: not named.*
- [ ] **Q6. Language.** English only, or English with a Danish version? A second language doubles content work and adds i18n routing. *Default: English only.*

### Content

- [ ] **Q7. The one-paragraph version.** Write, badly if necessary, who you are and what you do in four sentences. Everything else is derived from this. No default; a placeholder will be written from what is known (11 years iOS, Copenhagen, Swift 6 strict concurrency, TCA, iPadOS at work, a founder chapter).
- [ ] **Q8. Timeline.** The profile gives three entries: FOSS (Senior Software Engineer, iOS, start year?), Capgemini (external consultant, lead on an internal iPadOS app, years?), ZyborgApps IVS (co-founder, 2018 to 2020). What came before 2018 to make eleven years? Add one line per role on what you shipped. Include education if you want it shown. *Default: the three entries above, years marked as unconfirmed.*
- [ ] **Q9. Shipped work.** What did ZyborgApps ship, and is any of it still on the App Store? Anything from the consulting years you can name publicly? Open source? Talks? *Default: none shown.*
- [ ] **Q10. How you like working.** Below is a first draft of principles inferred from how you already work. Strike what is wrong, add what is missing. This section is the one that makes the site yours.
  - Strict concurrency is not a setting, it is a design constraint. Sendable and actor isolation decided at design time, not fixed at compile time.
  - One architecture per app. TCA, unless there is a reason not to, and the reason is written down.
  - Tests use the same seams the code uses. TestStore and dependency injection, never a mock of the framework.
  - Documentation belongs on interfaces. Implementation should not need comments, and never section markers.
  - Direct feedback, both ways. Say when an idea is weak. Do not soften it and do not apologise for it.
  - Answer the question that was asked.
- [ ] **Q11. Stack and tools.** A "what I use" list: languages, frameworks, editor, hardware, apps. *Default: Swift 6, SwiftUI, TCA, Swift Testing, Xcode. Nothing else.*
- [ ] **Q12. Outside work.** Strength training? Coffee? Anything else you want on the page, or nothing personal at all? *Default: omitted.*
- [ ] **Q13. Contact.** A visible email invites spam on a public site. Options: LinkedIn, X and GitHub links only; a mailto with the address assembled in script; a plain address. *Default: GitHub, LinkedIn (`linkedin.com/in/nikolaj-mos`) and X (`@NikolajMosb`).*
- [ ] **Q14. CV.** A downloadable PDF, a `/cv` page with a print stylesheet, or neither? *Default: neither.*
- [ ] **Q15. Writing.** Do you intend to publish posts? If there is any chance, the layout should reserve a place for it now. *Default: no, and the non-goal stands.*
- [ ] **Q16. Availability.** Should the site say whether you are open to new roles, contract work, or neither? *Default: say nothing.*

### Taste

- [ ] **Q17. Three sites you think are good.** Personal or otherwise. This calibrates Phase 1 better than any adjective.
- [ ] **Q18. Three sites you think are bad or overdone.** Same reason.
- [ ] **Q19. Light, dark, or both.** *Default: both, system preference first.*
- [ ] **Q20. Where to review designs.** The repo already has a design canvas under `design/`. Figma is also available via MCP. *Default: the design canvas, since it is versioned with the code.*

---

## Phase 1: Design direction

**Files:**
- Replace: `design/*.dc.html`, `design/canvas.json`

**Interfaces:**
- Consumes: Phase 0 answers.
- Produces: one chosen direction, mocked at desktop and mobile, with tokens (type scale, colour, spacing) written down. Phase 2 implements exactly this.

### Task 1.1: Three directions on the canvas

- [ ] **Step 1: Remove the three café directions and the two "today" artboards.** They were directions for a tools index. None of them were designed to carry a person.
- [ ] **Step 2: Draft three directions, each as a full home page at 1200 px wide, using the placeholder copy from Phase 0.**

  **A. Engineering monograph (recommended).** Near-monochrome, high contrast, a strict grid you can feel. Large grotesk display type with optical sizes, mono for labels and metadata, one restrained accent used for exactly one purpose (links and the current state). Feels like a printed monograph of someone's work, with the precision of Apple's developer documentation. Light and dark of equal weight. This fits a person whose stated values are strictness, clarity and no decoration.

  **B. Dark studio.** Dark by default, one luminous accent, fine grain texture, oversized type, motion-forward. The most immediately impressive. Also the most common personal-site look of the last three years, so the weakest on "could only belong to this person".

  **C. Editorial warm.** Evolves the current palette with real hierarchy and content. Cheapest path. Included so the decision to leave the café palette is made against a real alternative rather than by default.

- [ ] **Step 3: Annotate each with the type pairing, palette tokens and what it optimises for.** Type candidates, all with full Danish glyph coverage (æ ø å): Geist and Geist Mono; Inter with `opsz` and JetBrains Mono; Bricolage Grotesque for display with Commit Mono; Instrument Serif kept for display over a neutral sans. Decide on the canvas, not here.
- [ ] **Step 4: Owner picks one direction, or one direction with specific changes.**

### Task 1.2: Mock the chosen direction fully

- [ ] **Step 1: Home page at 1200 px and 390 px, every section, real placeholder lengths.**
- [ ] **Step 2: Both themes.**
- [ ] **Step 3: Hover, focus and reduced-motion states for interactive elements (nav links, theme toggle, contact links).**
- [ ] **Step 4: Open Graph image at 1200 x 630.**
- [ ] **Step 5: Write the tokens into a `design/tokens.md`: type scale with `clamp()` values, spacing scale, colour tokens in `oklch` for both themes, radii, motion durations and easings.** This file is the contract Phase 2 implements.
- [ ] **Step 6: Commit.**

```bash
git add design docs
git commit -m "design: mock the chosen direction for the personal site"
```

---

## Phase 2: Foundation

**Files:**
- Modify: `package.json`, `astro.config.mjs`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `biome.json`, `tsconfig.json`
- Delete: `svelte.config.js`
- Create: `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/ThemeToggle.astro`, `src/components/Seo.astro`, `src/pages/og.png.ts`, `src/pages/robots.txt.ts`, `src/data/site.ts`

### Task 2.1: Remove the framework integrations

- [ ] **Step 1: Uninstall.**

```bash
npm uninstall @astrojs/react @astrojs/svelte react react-dom @types/react @types/react-dom svelte
rm svelte.config.js
```

- [ ] **Step 2: Drop `svelte()` and `react()` from `astro.config.mjs`.** Remove the `*.svelte` entry from the Biome override; keep the `*.astro` one.
- [ ] **Step 3: Check `tsconfig.json` for a `jsx` or `jsxImportSource` setting from the React integration and remove it.**
- [ ] **Step 4: Verify.** `npm run lint && npm run typecheck && npm run test && npm run build` all pass and `dist/_astro/` contains no `.js` files.
- [ ] **Step 5: Commit.** `build: remove the React and Svelte integrations`

### Task 2.2: Self-hosted fonts

- [ ] **Step 1: Install the Fontsource variable packages chosen in Phase 1**, for example `@fontsource-variable/geist` and `@fontsource-variable/geist-mono`. Check the current package names on npm; the naming moved to `@fontsource-variable/*` for variable fonts.
- [ ] **Step 2: Import the Latin and Latin Extended subsets only in `global.css`.** Danish needs Latin Extended for `æ`, `ø`, `å`. Do not import Cyrillic, Greek or Vietnamese.
- [ ] **Step 3: Remove the Google Fonts `<link>` and both `preconnect`s from `BaseLayout.astro`.**
- [ ] **Step 4: Add `<link rel="preload" as="font">` for the two files used above the fold.** Astro hashes the filenames; use the imported URL from the Fontsource package, do not hard-code a hash.
- [ ] **Step 5: Verify no layout shift.** Build, preview, open DevTools Performance with a fresh cache, confirm CLS is 0 and the fonts are served from the same origin.
- [ ] **Step 6: Commit.** `feat: self-host fonts and drop the Google Fonts request`

### Task 2.3: Design tokens and theming

- [ ] **Step 1: Rewrite the `@theme` block in `global.css` from `design/tokens.md`.** Colour tokens reference CSS custom properties so they can flip per theme:

```css
@theme {
	--color-ground: var(--ground);
	--color-ink: var(--ink);
	/* one line per token */
}

:root {
	color-scheme: light dark;
	--ground: oklch(0.985 0.004 90);
	--ink: oklch(0.2 0.01 60);
	/* light values */
}

:root[data-theme="dark"] {
	color-scheme: dark;
	--ground: oklch(0.16 0.008 60);
	/* dark values */
}

@media (prefers-color-scheme: dark) {
	:root:not([data-theme="light"]) {
		/* same dark values */
	}
}
```

- [ ] **Step 2: Fluid type scale.** Define `--text-*` tokens with `clamp()` between a 390 px and a 1280 px viewport. Use the values from `design/tokens.md` verbatim.
- [ ] **Step 3: Theme toggle.** `ThemeToggle.astro` renders a `<button aria-pressed>` and an inline `<script is:inline>` in `<head>` that reads `localStorage.theme` and sets `data-theme` before first paint. Wrap every storage access in `try/catch`. This is the only JavaScript the site ships.
- [ ] **Step 4: Motion tokens.** `--duration-*` and `--ease-*` tokens. A single `@media (prefers-reduced-motion: reduce)` block at the end of `global.css` sets every animation and transition duration to `0.01ms`. Nothing else on the site needs to remember to check.
- [ ] **Step 5: Verify contrast.** For every ink token on every ground token, in both themes, check the ratio with a contrast tool. Body text AAA (7:1), everything else AA (4.5:1, 3:1 for large text and UI).
- [ ] **Step 6: Commit.** `feat(design): implement the token system with light and dark themes`

### Task 2.4: Page shell and metadata

- [ ] **Step 1: `src/data/site.ts`.** One typed object: name, title, location, description, URL, social links (GitHub, LinkedIn, X). Every component reads from here; nothing is hard-coded twice.
- [ ] **Step 2: `Seo.astro`.** Title, description, canonical, `og:*` and `twitter:*` tags, and a JSON-LD `Person` block built from `site.ts`.
- [ ] **Step 3: `Header.astro` and `Footer.astro`** as designed. Skip link as the first focusable element in `BaseLayout.astro`. `<main id="main">`.
- [ ] **Step 4: Sitemap and robots.** `npx astro add sitemap --yes`. `robots.txt.ts` returns `User-agent: *`, `Allow: /`, and the sitemap URL.
- [ ] **Step 5: Open Graph image.** `src/pages/og.png.ts` is a static endpoint that renders the design from Task 1.2 Step 4 with `satori` and rasterises it with `@resvg/resvg-js` at build time. Font files are read from the Fontsource package in `node_modules`. Verify `dist/og.png` exists and looks right after `npm run build`.
- [ ] **Step 6: Commit.** `feat: page shell, metadata, sitemap and generated social image`

---

## Phase 3: Sections

Each section is one component in `src/components/sections/`, composed in `src/pages/index.astro` in this order. Structured content lives in `src/data/`, prose lives in the component. Each task ends with the gates passing and a commit.

### Task 3.1: Intro

- [ ] Name, title, location, the four-sentence paragraph from Q7. Monogram or portrait per Q4. Primary links per Q13. This is the only section above the fold on a phone; it has to carry the whole site if nothing else loads into view.
- [ ] Commit: `feat(sections): intro`

### Task 3.2: What I do

- [ ] Three to five short blocks: the kind of work, the kind of problems, the platform depth. Written as claims that can be disagreed with, not as a skills cloud.
- [ ] Commit: `feat(sections): what I do`

### Task 3.3: How I work

- [ ] `src/data/principles.ts`: `{ title: string; body: string }[]` from Q10. Rendered as a numbered list with the title set in display type. This section gets the most typographic attention on the page.
- [ ] Commit: `feat(sections): how I work`

### Task 3.4: Experience

- [ ] `src/data/timeline.ts`: `{ from: number; to: number | "now"; role: string; org?: string; summary: string; link?: string }[]` from Q8. Skipped entirely if Q8 stays at its default.
- [ ] Commit: `feat(sections): experience timeline`

### Task 3.5: Stack

- [ ] `src/data/stack.ts`: grouped `{ group: string; items: { name: string; note?: string }[] }[]` from Q11. Rendered densely in mono. Notes are one clause, opinionated ("Swift Testing. XCTest only where a dependency forces it.").
- [ ] Commit: `feat(sections): stack`

### Task 3.6: Outside work

- [ ] Only if Q12 is answered. One short paragraph, no icons, no grid of hobbies.
- [ ] Commit: `feat(sections): outside work`

### Task 3.7: Contact and footer

- [ ] Links per Q13. Footer: source link, a "last built" date injected at build time, theme toggle if it is not in the header.
- [ ] Commit: `feat(sections): contact and footer`

### Task 3.8: Optional routes

- [ ] `/cv` with a print stylesheet, only if Q14 asks for it. `@page` margins, no header or footer chrome, black on white regardless of theme.
- [ ] Commit: `feat: printable CV route`

---

## Phase 4: Motion and polish

### Task 4.1: Scroll-driven reveals

- [ ] **Step 1:** Sections below the fold get a `reveal` utility: `animation: rise linear both; animation-timeline: view(); animation-range: entry 0% entry 30%;`. Pure CSS, no observer.
- [ ] **Step 2:** Progressive enhancement. `@supports not (animation-timeline: view())` shows everything static. Safari support for scroll-driven animations must be checked on the actual iOS version in use at implementation time; if it is missing, the fallback is the static state, not a JavaScript polyfill.
- [ ] **Step 3:** Confirm every animation is disabled under reduced motion via the block from Task 2.3 Step 4.
- [ ] Commit: `feat(motion): scroll-driven section reveals`

### Task 4.2: Micro-interactions

- [ ] Link underline that draws on hover using `background-size`, not `text-decoration` transitions. Theme toggle icon crossfade. Focus rings using the accent token with `outline-offset`. Durations under 200 ms.
- [ ] Commit: `feat(motion): link, focus and toggle interactions`

### Task 4.3: View transitions

- [ ] Only if Phase 3 produced more than one route. Add `<ClientRouter />` from `astro:transitions` to `BaseLayout.astro`, name the header with `transition:persist`. If the site is a single page, skip this task; it would ship JavaScript for nothing.
- [ ] Commit: `feat: view transitions between routes`

---

## Phase 5: Quality gates

### Task 5.1: Accessibility check in CI

- [ ] **Step 1:** `npm install --save-dev @playwright/test @axe-core/playwright`. Chromium is already present in CI runners; in the GitHub Action use `npx playwright install --with-deps chromium`.
- [ ] **Step 2:** `tests/a11y.spec.ts`: build, `astro preview`, for every route in `dist/` and both themes, run axe and assert zero violations at `wcag2a`, `wcag2aa`, `wcag22aa`. Also assert exactly one `<h1>`, a skip link as the first focusable element, and that Tab reaches every link.
- [ ] **Step 3:** Add the job to `ci.yml` and gate `deploy.yml` on it, next to lint, typecheck and test.
- [ ] Commit: `ci: run axe accessibility checks against the built site`

### Task 5.2: Performance budget

- [ ] **Step 1:** Run Lighthouse against `astro preview` on mobile and desktop. All four categories 100. If anything is below, fix it; do not adjust the target.
- [ ] **Step 2:** Record the numbers in this document under a "Results" heading: total transfer size, LCP, CLS, JavaScript bytes.
- [ ] **Step 3:** Optional: add `@lhci/cli` with `assert` presets to CI if the budget ever regresses. Not added up front; a check with no history of failing is a cost with no benefit.

### Task 5.3: Manual pass

- [ ] Safari on an iPhone, both themes, portrait and landscape.
- [ ] Safari and Chrome on macOS, 1280 and 1920 px, both themes.
- [ ] Keyboard only, both themes.
- [ ] VoiceOver on iOS through the whole page once.
- [ ] Reduced motion enabled at the OS level.
- [ ] Paste `https://nsscode.com` into Slack, LinkedIn and iMessage and check the preview after deploy.
- [ ] Print preview of `/cv` if it exists.

---

## Phase 6: Launch

- [ ] **Step 1:** Update `docs/superpowers/specs/2026-08-19-nsscode-playground-design.md` status to "Superseded by the 2026-09-05 redesign for purpose and content; build, deploy and DNS sections remain current."
- [ ] **Step 2:** Rewrite `README.md`: what the site is, how to run it, how to edit content (`src/data/*.ts` and the section components), the gates.
- [ ] **Step 3:** Open a pull request from `claude/website-redesign-plan-1p7n32` into `main`. CI green. Merge. Watch the deploy job.
- [ ] **Step 4:** Verify on the live domain: HTTPS, both themes, `og.png`, `sitemap-index.xml`, `robots.txt`.
- [ ] **Step 5:** Run Task 5.3 against production, not preview.

---

## Risks

- **Unverified profile facts.** The LinkedIn and X pages could not be opened from the build environment; everything in "What the public profiles say" comes from search snippets. A wrong year or title on a personal site is worse than none. Every fact is confirmed by the owner before it appears in `src/data/`.
- **Content stalls the project.** Every section needs your words. The placeholders are written to be obviously placeholders so nothing half-finished ships by accident. If content is slow, ship the intro and how-I-work sections alone; a short page with a point of view beats a long one with gaps.
- **"State-of-the-art" drifts into gimmicks.** The exclusion list above is the guard. If a proposed effect is not on the bar table, it needs a reason before it goes in.
- **Scroll-driven animations in Safari.** Support has been uneven. The design must look finished in the static fallback, and the fallback is what is reviewed first.
- **Fonts and Danish glyphs.** Any candidate face is checked for `æ ø å` in both regular and display weights before it goes on the canvas.
- **Public repository.** Still required by Pages on a free plan. The CV, if present, is public. Do not put a phone number or street address anywhere in the repo.
- **DNS and mail.** Nothing in this plan touches DNS. The constraints from the 2026-08-19 spec stand: only `@` and `www` ever change, and they already point at GitHub.

## Estimated effort

| Phase | Work | Waits on |
|---|---|---|
| 0 | An hour of your time writing answers | You |
| 1 | Half a day for three directions, half a day for the full mock | Your pick |
| 2 | Half a day | Phase 1 |
| 3 | One to two days depending on how many sections survive Phase 0 | Content |
| 4 | Half a day | Phase 3 |
| 5 | Half a day plus a manual pass on your devices | Phase 4 |
| 6 | An hour | Everything |
