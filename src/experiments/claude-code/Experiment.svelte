<script lang="ts">
import Docs from "./Docs.svelte";
import Extend from "./Extend.svelte";
import Memory from "./Memory.svelte";
import Models from "./Models.svelte";
import Prompts from "./Prompts.svelte";
import Start from "./Start.svelte";
import Workflow from "./Workflow.svelte";

const chapters = [
	{
		id: "start",
		n: "01",
		title: "Start here",
		blurb: "What it is, what it is not, the first session.",
	},
	{
		id: "claude-md",
		n: "02",
		title: "CLAUDE.md",
		blurb: "The file it reads every time. What goes in, what stays out.",
	},
	{
		id: "project-files",
		n: "03",
		title: "Project files",
		blurb: "ARCHITECTURE, DESIGN, SPECS, and a generator.",
	},
	{
		id: "extend",
		n: "04",
		title: "Rules, skills, agents, hooks",
		blurb: "Teach it once. Four tools, one picker.",
	},
	{
		id: "models",
		n: "05",
		title: "Models and effort",
		blurb: "Two dials and when to turn them.",
	},
	{
		id: "prompts",
		n: "06",
		title: "Prompts",
		blurb: "Bad versus good, and a grader for yours.",
	},
	{
		id: "workflow",
		n: "07",
		title: "Workflow",
		blurb: "The rhythm, ten habits, and what comes next.",
	},
] as const;
type Id = (typeof chapters)[number]["id"];

let current = $state<Id>("start");
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
	fromHash();
	addEventListener("hashchange", fromHash);
	return () => removeEventListener("hashchange", fromHash);
});
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-8" id="guide-top">
  <nav aria-label="Chapters" class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
    {#each chapters as c (c.id)}
      <a
        href="#{c.id}"
        class="card-flat grid content-start gap-1 px-3.5 py-3 no-underline transition-colors {c.id === current ? 'bg-ink text-ground' : 'hover:bg-surface-strong'}"
        aria-current={c.id === current ? "page" : undefined}
        onclick={(e) => { e.preventDefault(); go(c.id); }}
      >
        <span class="eyebrow {c.id === current ? 'text-ground' : ''}">{c.n}</span>
        <span class="text-sm font-bold leading-tight">{c.title}</span>
      </a>
    {/each}
  </nav>

  <section aria-labelledby="chapter-title" class="grid gap-6">
    <div class="grid gap-1">
      <p class="eyebrow m-0">Chapter {chapters[index].n} of {chapters.length}</p>
      <h2 id="chapter-title" class="m-0 text-h2 font-extrabold tracking-[-0.03em]">{chapters[index].title}</h2>
      <p class="text-ink-muted m-0">{chapters[index].blurb}</p>
    </div>

    {#if current === "start"}<Start />
    {:else if current === "claude-md"}<Memory />
    {:else if current === "project-files"}<Docs />
    {:else if current === "extend"}<Extend />
    {:else if current === "models"}<Models />
    {:else if current === "prompts"}<Prompts />
    {:else}<Workflow />{/if}

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
