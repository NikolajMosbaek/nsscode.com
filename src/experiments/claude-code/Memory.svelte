<script lang="ts">
import Code from "./Code.svelte";
import { exampleFiles, loadedFor } from "./logic";

const targets = [
	"README.md",
	"Sources/UI/Login/LoginView.swift",
	"Sources/Network/APIClient.swift",
	"Tests/CartTests.swift",
];
let target = $state(targets[1]);
const loaded = $derived(
	new Set(loadedFor(target, exampleFiles).map((f) => f.path)),
);

const kinds: Record<string, string> = {
	user: "you, every project",
	project: "everyone, this repo",
	local: "you, this repo, gitignored",
	directory: "loads when it works in that folder",
	rule: "rule",
};

const example = `# Shop app

Swift 6, strict concurrency, TCA. Xcode 26, iOS 18+.

## Commands

- Build: \`xcodebuild -scheme Shop build\`
- Test: \`swift test\` (unit) and \`make ui-test\` (UI)
- Lint: \`swiftlint --strict\`

## Rules

- Swift Testing and TestStore for reducer tests. No XCTest in new files.
- Never use MARK comments.
- Do not add a dependency without asking.
- Run the tests before saying something works. Paste the output.

## Read before larger changes

- @ARCHITECTURE.md
- @DESIGN.md`;
</script>

<div class="grid gap-8">
  <p class="text-body text-ink-soft m-0 max-w-[70ch] font-medium text-pretty">
    CLAUDE.md is a Markdown file Claude reads at the start of every session. It is the one place to put what it cannot guess from the code: how to build and test, the rules you keep repeating, the decisions you have made. Think of it as onboarding notes for a new colleague, rewritten every time they forget everything, which is every session.
  </p>

  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
    <div class="grid content-start gap-3">
      <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Which files load, and when</h3>
      <p class="text-small text-ink-muted m-0">Pick a file Claude is working on. Everything lit up is in its context.</p>
      <div class="flex flex-wrap gap-2" role="group" aria-label="File being edited">
        {#each targets as t (t)}
          <button type="button" class="pill font-mono text-[11px] {t === target ? 'pill-active' : ''}" aria-pressed={t === target} onclick={() => (target = t)}>{t}</button>
        {/each}
      </div>
      <ul class="m-0 grid list-none gap-2 p-0">
        {#each exampleFiles as f (f.path)}
          {@const on = loaded.has(f.path)}
          <li class="card-flat flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3.5 py-2.5 transition-opacity {on ? '' : 'opacity-40'}">
            <span class="font-mono text-sm font-medium">{f.path}</span>
            <span class="eyebrow">{f.glob ? `only for ${f.glob}` : kinds[f.kind]}{on ? " · loaded" : ""}</span>
          </li>
        {/each}
      </ul>
      <p class="text-small text-ink-muted m-0">
        Order: managed policy, then <span class="font-mono">~/.claude/CLAUDE.md</span>, then the project's, then <span class="font-mono">CLAUDE.local.md</span>. A CLAUDE.md in a subfolder loads only when Claude touches files there, so put the UI rules next to the UI code. Rules in <span class="font-mono">.claude/rules/</span> are the same idea with a glob instead of a folder; they get their own chapter.
      </p>
    </div>

    <div class="grid content-start gap-3">
      <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">What a good one looks like</h3>
      <Code code={example} file="CLAUDE.md" />
      <p class="text-small text-ink-muted m-0">
        <span class="font-mono">@ARCHITECTURE.md</span> pulls another file in. Keep the whole thing under about 200 lines; longer files get skimmed, and every line costs context on every prompt. For each line ask: would removing it cause a mistake? If not, cut it.
      </p>
    </div>
  </div>

  <div class="grid gap-3 sm:grid-cols-2">
    <div class="card-flat grid gap-2 p-4">
      <p class="eyebrow m-0 text-green">Put in</p>
      <ul class="text-small text-ink-muted m-0 grid gap-1 pl-4">
        <li>Build, test and lint commands, exactly as you type them.</li>
        <li>Conventions that differ from the language default.</li>
        <li>Decisions and their reasons. "We use X, not Y, because Z."</li>
        <li>Things that bit you: environment quirks, flaky tools, forbidden folders.</li>
        <li>Repository etiquette: branch names, commit style, when to ask.</li>
      </ul>
    </div>
    <div class="card-flat grid gap-2 p-4">
      <p class="eyebrow m-0 text-accent">Leave out</p>
      <ul class="text-small text-ink-muted m-0 grid gap-1 pl-4">
        <li>Anything it can read from the code in ten seconds.</li>
        <li>Standard language or framework conventions.</li>
        <li>API documentation. Link to it instead.</li>
        <li>Anything that changes weekly. It will be wrong by Friday.</li>
        <li>Essays. If a rule needs a paragraph, it is probably two rules.</li>
      </ul>
    </div>
  </div>

  <div class="grid gap-2">
    <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Getting started</h3>
    <p class="text-body text-ink-soft m-0 max-w-[70ch] font-medium text-pretty">
      Run <span class="font-mono">/init</span> in a project and it drafts a CLAUDE.md from what it finds. Treat that as a first draft: delete half of it, then add the rules you actually care about. When Claude does something you dislike, fix the instruction, not just the code, or you will be correcting it again next session. <span class="font-mono">/memory</span> shows every file it loaded and lets you edit them.
    </p>
  </div>
</div>
