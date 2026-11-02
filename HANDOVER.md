# Handover

State of nsscode.com on 2 November 2026, for whoever picks it up next.
`README.md` explains the site and its layout, `AGENTS.md` (also read as
`CLAUDE.md`) holds the working rules and the traps already hit, and
`PROJECTS.md` is the backlog.

## What is live

| Address | Source | Notes |
|---|---|---|
| nsscode.com `/` | this repo, `src/pages/index.astro` | Studio page for the two apps: always dark, CSS phone mockups, scroll tilt and pointer lean |
| nsscode.com `/lab/`, `/lab/all/`, `/lab/<slug>/` | this repo | 11 listed experiments, `tokens` unlisted, 3 planned tiles |
| nsscode.com `/colophon/`, `/demo/` | this repo | `/demo/` is the archive of unchosen designs, noindex |
| dbf.nsscode.com | `NikolajMosbaek/dontbreakfast-site` | Don't Break Fast's product, support, privacy and terms pages, English and Danish. Plain static files in `dist/`; its README covers asset versioning |

Both deploy to GitHub Pages from their `main` branch. DNS for both is at
Simply.com: the apex points at GitHub Pages, and `dbf` is a CNAME to
`nikolajmosbaek.github.io`. The dontbreakfast-site repository must stay
public, or GitHub Pages turns off on the current plan.

The apps themselves live in the private `NikolajMosbaek/SimpleFastingTimer`
and `NikolajMosbaek/Meal-Planner` repositories. Their design files are the
source for the phone mockups here.

## Recent work

- **Front page:** studio redesign (PR #23), 3D scroll tilt (#24) and
  hover states (#25). On 31 October a direct commit to `main` brought the
  Don't Break Fast mockups in line with the app's redesign: indigo instead
  of teal, a 24-hour day strip instead of the ring, and a new icon.
- **Lab moved** from `/` to `/lab/`; experiment URLs did not change.
- **Plates (#26):** the 25 and 15 kg plates are gone and the default is
  four of each remaining size per side. The weight field no longer freezes
  the tool when it is cleared or given a Danish comma.
- **dbf.nsscode.com:** restyled to match the front page, then migrated
  from Sites to GitHub Pages. Its certificate is issued.

## Waiting on the owner

These need a decision or a fact only the owner has. Nothing here is
blocked on code.

1. **Meal Planner's name.** The front page shows "Meal Planner" with a
   "working title" tag (`nameNote` in `src/data/apps.ts`). Names under
   consideration in the app repo: Måltal, Fremmad, Forkant.
2. **Meal Planner's privacy policy URL.** The app plans to use
   `https://nsscode.com/mealplanner/privacy`, and that page does not
   exist. App Store submission needs it. Either add the page here, or give
   the app its own subdomain site the way Don't Break Fast has one, and
   change the app to match.
3. **Don't Break Fast's App Store link.** Once the listing is live, set
   `appStoreUrl` in `src/data/apps.ts`; the "Coming to the App Store" pill
   becomes a button.
4. **The maker line on the front page** ("The apps are made in the
   evenings, one at a time, and kept small on purpose.") was written for
   the owner, not by them. Confirm it or replace it in
   `src/pages/index.astro`.
5. **Enforce HTTPS on dbf.nsscode.com.** Check that the box is ticked in
   the dontbreakfast-site repository's Pages settings now that the
   certificate exists.

## Recurring upkeep

- **January:** Topskat's thresholds and percentages live in
  `src/experiments/topskat/rates-2026.ts`; copy it to the new year and
  update the numbers with their sources. Realkredit's example rates and
  bidragssatser are in its `logic.ts`.
- **When Claude Code changes:** the Claude Code course was fact-checked in
  September 2026. Its model list, effort levels and commands
  (`src/experiments/claude-code/Models.svelte` and friends) go stale when
  Claude Code changes; check them against the docs.
- **When an app's look changes:** the phone screens in
  `src/components/studio/` are drawn by hand from the app's design files.
  Update them, and the matching pages on the app's own site.

## Small things noticed, not done

- Plates announces its result to screen readers on every keystroke,
  because the result box is a live region. Delaying only the announcement
  would make typing "140" read once instead of three times.
- `docs/superpowers/` holds the August and September plans. They describe
  an earlier site (profile sections, a home-page shelf) and are kept as a
  record only.

## Working in a Claude Code cloud session

- After a container restart `node_modules` may be gone: run `npm ci`.
- The session's network proxy has blocked nsscode.com and dbf.nsscode.com,
  so the live sites could not be fetched from inside a session. Check
  them from a phone or laptop instead.
- See "Traps already hit" in `AGENTS.md` for the Playwright browser path
  and the background preview server.
