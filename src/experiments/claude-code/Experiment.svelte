<script lang="ts">
import Docs from "./Docs.svelte";
import Extend from "./Extend.svelte";
import Install from "./Install.svelte";
import Memory from "./Memory.svelte";
import Models from "./Models.svelte";
import Prompts from "./Prompts.svelte";
import { doneCount, loadProgress, progress } from "./progress.svelte";
import Ready from "./Ready.svelte";
import Start from "./Start.svelte";
import { allSteps, steps } from "./steps";
import Workflow from "./Workflow.svelte";

const chapters = [
	{
		id: "install",
		n: "00",
		title: "Install",
		blurb: "Twenty minutes: install, sign in, pick a practice repo.",
	},
	{
		id: "start",
		n: "01",
		title: "First session",
		blurb: "What it is, what it is not, and the keys you press.",
	},
	{
		id: "claude-md",
		n: "02",
		title: "CLAUDE.md",
		blurb: "The file it reads every time. What goes in, what stays out.",
	},
	{
		id: "prompts",
		n: "03",
		title: "Prompts",
		blurb: "Bad versus good, and a grader for yours.",
	},
	{
		id: "workflow",
		n: "04",
		title: "Workflow",
		blurb: "The loop, done once for real on your repo.",
	},
	{
		id: "project-files",
		n: "05",
		title: "Project files",
		blurb: "ARCHITECTURE, DESIGN, SPECS, and a generator.",
	},
	{
		id: "models",
		n: "06",
		title: "Models and effort",
		blurb: "Two dials and when to turn them.",
	},
	{
		id: "extend",
		n: "07",
		title: "Rules, skills, agents, hooks",
		blurb: "Teach it once. Four tools, one picker.",
	},
	{
		id: "ready",
		n: "08",
		title: "Ready?",
		blurb: "Ten honest ticks, a cheat sheet, and the words.",
	},
] as const;
type Id = (typeof chapters)[number]["id"];

let current = $state<Id>("install");
const totalDone = $derived(doneCount(allSteps));
const index = $derived(chapters.findIndex((c) => c.id === current));

function isId(v: string): v is Id {
	return chapters.some((c) => c.id === v);
}
function go(id: Id, push = true) {
	current = id;
	if (push) history.replaceState(null, "", `#${id}`);
	document.getElementById("guide-top")?.scrollIntoView({ block: "start" });
}

$effect(() => {
	const fromHash = () => {
		const h = location.hash.slice(1);
		if (isId(h)) current = h;
	};
	loadProgress();
	fromHash();
	addEventListener("hashchange", fromHash);
	return () => removeEventListener("hashchange", fromHash);
});
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-8" id="guide-top">
  <div class="grid gap-3">
    <nav aria-label="Chapters" class="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
      {#each chapters as c (c.id)}
        {@const list = steps[c.id] ?? []}
        {@const n = doneCount(list)}
        <a
          href="#{c.id}"
          class="card-flat grid content-start gap-1 px-3 py-2.5 no-underline transition-colors {c.id === current ? 'bg-ink text-ground' : 'hover:bg-surface-strong'}"
          aria-current={c.id === current ? "page" : undefined}
          onclick={(e) => { e.preventDefault(); go(c.id); }}
        >
          <span class="flex items-baseline justify-between gap-1">
            <span class="eyebrow {c.id === current ? 'text-ground' : ''}">{c.n}</span>
            {#if list.length}
              <span class="eyebrow tabular-nums {c.id === current ? 'text-ground/70' : 'text-ink-muted'}">{n === list.length ? "✓ done" : `${n}/${list.length}`}</span>
            {/if}
          </span>
          <span class="text-[13px] font-bold leading-tight">{c.title}</span>
        </a>
      {/each}
    </nav>
    {#if progress.loaded}
      <div class="flex items-center gap-3">
        <div class="h-2.5 flex-1 overflow-hidden rounded-full border-2 border-line bg-ground" role="progressbar" aria-valuemin="0" aria-valuemax={allSteps.length} aria-valuenow={totalDone} aria-label="Practice steps done">
          <div class="h-full bg-green transition-[width]" style="width: {(totalDone / allSteps.length) * 100}%"></div>
        </div>
        <span class="eyebrow tabular-nums">{totalDone} / {allSteps.length} steps</span>
      </div>
    {/if}
  </div>

  <section aria-labelledby="chapter-title" class="grid gap-6">
    <div class="grid gap-1">
      <p class="eyebrow m-0">Chapter {chapters[index].n} of {chapters.length}</p>
      <h2 id="chapter-title" class="m-0 text-h2 font-extrabold tracking-[-0.03em]">{chapters[index].title}</h2>
      <p class="text-ink-muted m-0">{chapters[index].blurb}</p>
    </div>

    {#if current === "install"}<Install />
    {:else if current === "start"}<Start />
    {:else if current === "claude-md"}<Memory />
    {:else if current === "project-files"}<Docs />
    {:else if current === "extend"}<Extend />
    {:else if current === "models"}<Models />
    {:else if current === "prompts"}<Prompts />
    {:else if current === "workflow"}<Workflow />
    {:else}<Ready />{/if}

    <div class="flex flex-wrap items-center justify-between gap-3 border-t-3 border-line pt-5">
      {#if index > 0}
        <button type="button" class="pill" onclick={() => go(chapters[index - 1].id)}>← {chapters[index - 1].title}</button>
      {:else}<span></span>{/if}
      {#if index < chapters.length - 1}
        <button type="button" class="pill pill-solid" onclick={() => go(chapters[index + 1].id)}>{chapters[index + 1].title} →</button>
      {:else}
        <button type="button" class="pill pill-solid" onclick={() => go(chapters[0].id)}>Back to the start</button>
      {/if}
    </div>
  </section>
</div>
