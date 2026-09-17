<script lang="ts">
import type { Step } from "./progress.svelte";
import { doneCount, progress, resetProgress, toggle } from "./progress.svelte";
import { allSteps } from "./steps";

const checks: Step[] = [
	{
		id: "ready.context",
		text: "I can explain in one sentence why Claude only knows what is in its context.",
	},
	{
		id: "ready.plan",
		text: "I start anything bigger than one file in plan mode and read the plan before saying go.",
	},
	{
		id: "ready.prompt",
		text: "My prompts name a file, say what done looks like, and name the test or command that proves it.",
	},
	{
		id: "ready.diff",
		text: "I read the diff before it lands, every time, with git diff or in the editor.",
	},
	{
		id: "ready.clear",
		text: "I /clear between tasks, and rewrite the prompt after two corrections instead of correcting a third time.",
	},
	{
		id: "ready.claudemd",
		text: "My repo has a CLAUDE.md under 40 lines with the real test and lint commands.",
	},
	{
		id: "ready.commit",
		text: "I ask for one commit per task and never let it commit unasked.",
	},
	{
		id: "ready.effort",
		text: "I know which model and effort I am on, and when to turn them down.",
	},
	{
		id: "ready.tests",
		text: 'I make it run the tests and paste the output; "it should work" is not a result.',
	},
	{
		id: "ready.docs",
		text: "I end a session by asking what it learned and putting the good parts in the docs.",
	},
];
const done = $derived(doneCount(checks));
const stepsDone = $derived(doneCount(allSteps));

const cheats = [
	["Start", "claude in the repo folder"],
	["Look, do not touch", "Shift+Tab until plan mode"],
	["Stop it", "Esc, then say what to do instead"],
	["Point at a file", "@path/to/file"],
	["Run a command", "!npm test"],
	["New task", "/clear"],
	["Long session", "/compact keep the API decisions"],
	["Model and effort", "/model · /effort medium"],
	["What it read", "/memory"],
	["What it cost", "/usage"],
	["First CLAUDE.md", "/init, then cut half"],
	["Leave", "/exit"],
];

const glossary = [
	[
		"Context",
		"Everything Claude can see right now: your prompt, the files it read, command output, CLAUDE.md. It has a size limit and it empties on /clear.",
	],
	[
		"Token",
		"The unit context is measured in, roughly three quarters of a word. Cost and limits are in tokens.",
	],
	[
		"Model",
		"Which Claude is answering. Sonnet is fast and cheap, Opus is stronger, Fable is strongest where available.",
	],
	[
		"Effort",
		"How long the model thinks before acting. low to max. high is the default.",
	],
	[
		"Plan mode",
		"Read only. Claude explores and proposes; nothing changes until you leave it.",
	],
	[
		"CLAUDE.md",
		"The Markdown file it reads at the start of every session. Your rules and commands.",
	],
	[
		"Rule",
		"A CLAUDE.md fragment in .claude/rules/ that can apply only to some paths.",
	],
	[
		"Skill",
		"A saved procedure in .claude/skills/<name>/SKILL.md, run with /name or picked up automatically.",
	],
	[
		"Subagent",
		"A separate Claude with its own context that does a job and reports back a summary.",
	],
	[
		"Hook",
		"A shell command that runs at a fixed point, every time, regardless of what Claude remembers.",
	],
	[
		"MCP",
		"Model Context Protocol. How Claude connects to outside tools: your issue tracker, a database, a browser.",
	],
	[
		"Permission mode",
		"How much it asks before acting: ask me, accept edits, plan, auto.",
	],
];
</script>

<div class="grid gap-8">
  <section class="card grid gap-4 p-5 sm:p-7" aria-labelledby="ready-title">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <h3 id="ready-title" class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Ready when you can tick all ten</h3>
      <span class="eyebrow tabular-nums">{done} / {checks.length}</span>
    </div>
    <ol class="m-0 grid list-none gap-2 p-0">
      {#each checks as c (c.id)}
        <li class="card-flat grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 px-4 py-3 {progress.done[c.id] ? 'bg-surface-strong' : ''}">
          <input id={c.id} type="checkbox" checked={progress.done[c.id] ?? false} onchange={() => toggle(c.id)} class="accent-accent mt-1 size-5 cursor-pointer" />
          <label for={c.id} class="cursor-pointer text-body font-medium {progress.done[c.id] ? 'text-ink-muted' : ''}">{c.text}</label>
        </li>
      {/each}
    </ol>
    {#if done === checks.length}
      <p class="bg-green text-accent-ink border-line m-0 rounded-xl border-3 px-4 py-3 text-sm font-medium">
        That is the whole job. Tomorrow, on real work: plan mode, one task, a test, read the diff, commit, /clear. Everything else is refinement.
      </p>
    {:else}
      <p class="text-small text-ink-muted m-0">Honest ticks only. Each one maps to a chapter; go back to the one you cannot tick. You have done {stepsDone} of {allSteps.length} practice steps so far.</p>
    {/if}
  </section>

  <section class="grid gap-3" aria-labelledby="cheat-title">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <h3 id="cheat-title" class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Cheat sheet</h3>
      <button type="button" class="pill no-print" onclick={() => window.print()}>Print this page</button>
    </div>
    <dl class="m-0 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {#each cheats as [k, v] (k)}
        <div class="card-flat grid gap-0.5 px-3.5 py-2.5">
          <dt class="eyebrow m-0">{k}</dt>
          <dd class="m-0 font-mono text-sm font-bold">{v}</dd>
        </div>
      {/each}
    </dl>
  </section>

  <section class="grid gap-3" aria-labelledby="glossary-title">
    <h3 id="glossary-title" class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Words people use</h3>
    <dl class="m-0 grid gap-x-8 gap-y-3 sm:grid-cols-2">
      {#each glossary as [k, v] (k)}
        <div class="grid gap-0.5">
          <dt class="font-bold">{k}</dt>
          <dd class="text-small text-ink-muted m-0">{v}</dd>
        </div>
      {/each}
    </dl>
  </section>

  <div class="no-print flex flex-wrap items-center gap-3">
    <button type="button" class="pill" onclick={resetProgress}>Reset all ticks</button>
    <span class="text-small text-ink-muted">Ticks live in this browser only. Nothing is sent anywhere.</span>
  </div>
</div>

<style>
  @media print {
    :global(header),
    :global(footer),
    :global(nav) {
      display: none !important;
    }
    .no-print {
      display: none !important;
    }
  }
</style>
