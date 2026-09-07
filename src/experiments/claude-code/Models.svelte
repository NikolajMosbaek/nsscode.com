<script lang="ts">
import Code from "./Code.svelte";
import {
	efforts,
	type Novelty,
	type Risk,
	recommend,
	type TaskSize,
} from "./logic";

let size = $state<TaskSize>("medium");
let novelty = $state<Novelty>("some");
let risk = $state<Risk>("low");
const pick = $derived(recommend(size, novelty, risk));

const sizes: [TaskSize, string][] = [
	["tiny", "One file, minutes"],
	["medium", "A feature, an afternoon"],
	["large", "Many files, a day or more"],
];
const novelties: [Novelty, string][] = [
	["routine", "Done this a hundred times"],
	["some", "Familiar area, new twist"],
	["hard", "Unfamiliar, subtle, or concurrent"],
];
const risks: [Risk, string][] = [
	["low", "Easy to undo"],
	["high", "Data, money, auth, release"],
];

const models = [
	{
		name: "Sonnet",
		when: "Daily coding. Fast, cheap, and good enough for most changes you will read anyway.",
		alias: "sonnet",
	},
	{
		name: "Opus",
		when: "Complex reasoning, unfamiliar code, planning. The default on most paid plans.",
		alias: "opus",
	},
	{
		name: "Fable",
		when: "The strongest, where your plan includes it. Long, hard, autonomous work.",
		alias: "fable or best",
	},
	{
		name: "Haiku",
		when: "Trivial lookups and scripts. Rarely worth choosing by hand.",
		alias: "haiku",
	},
];

const cmds = `/model            # pick a model; Enter saves it, s = this session only
/model sonnet[1m] # same model, one million tokens of context
/effort high      # low · medium · high · xhigh · max
/fast             # Opus, up to 2.5× faster, costs more`;
</script>

<div class="grid gap-8">
  <p class="text-body text-ink-soft m-0 max-w-[70ch] font-medium text-pretty">
    Two dials. <strong class="text-ink">Model</strong> is how capable the brain is. <strong class="text-ink">Effort</strong> is how long it thinks before acting. Beginners tend to leave both on maximum and wait, or leave both on minimum and get sloppy work. The right setting depends on the task, and changing it is one command.
  </p>

  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
    <div class="grid content-start gap-3">
      <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Models</h3>
      <ul class="m-0 grid list-none gap-2 p-0">
        {#each models as m (m.name)}
          <li class="card-flat grid gap-1 px-4 py-3">
            <div class="flex items-baseline justify-between gap-4"><span class="font-bold">{m.name}</span><span class="eyebrow">/model {m.alias}</span></div>
            <span class="text-small text-ink-muted">{m.when}</span>
          </li>
        {/each}
      </ul>
      <Code code={cmds} label="terminal" />
    </div>
    <div class="grid content-start gap-3">
      <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Effort</h3>
      <ol class="m-0 grid list-none gap-2 p-0">
        {#each efforts as e, i (e.level)}
          <li class="card-flat grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-3 px-4 py-3 {e.level === 'high' ? 'border-accent' : ''}">
            <span class="font-mono text-sm font-bold">{e.level}</span>
            <span class="text-small text-ink-muted">{e.means}{i === 2 ? " Start here." : ""}</span>
          </li>
        {/each}
      </ol>
      <p class="text-small text-ink-muted m-0">More effort is more tokens and more waiting, not always a better answer. Max on a rename is a waste; low on a race condition is a bug.</p>
    </div>
  </div>

  <div class="card grid gap-5 p-5 sm:p-6">
    <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Which should I use right now?</h3>
    <div class="grid gap-4 sm:grid-cols-3">
      <fieldset class="grid content-start gap-2">
        <legend class="eyebrow mb-2">How big</legend>
        {#each sizes as [v, label] (v)}
          <button type="button" class="pill justify-start text-left {size === v ? 'pill-active' : ''}" aria-pressed={size === v} onclick={() => (size = v)}>{label}</button>
        {/each}
      </fieldset>
      <fieldset class="grid content-start gap-2">
        <legend class="eyebrow mb-2">How familiar</legend>
        {#each novelties as [v, label] (v)}
          <button type="button" class="pill justify-start text-left {novelty === v ? 'pill-active' : ''}" aria-pressed={novelty === v} onclick={() => (novelty = v)}>{label}</button>
        {/each}
      </fieldset>
      <fieldset class="grid content-start gap-2">
        <legend class="eyebrow mb-2">If it goes wrong</legend>
        {#each risks as [v, label] (v)}
          <button type="button" class="pill justify-start text-left {risk === v ? 'pill-active' : ''}" aria-pressed={risk === v} onclick={() => (risk = v)}>{label}</button>
        {/each}
      </fieldset>
    </div>
    <div class="card-flat bg-surface-strong grid gap-2 p-4" aria-live="polite">
      <p class="m-0 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span class="text-h3 font-extrabold tracking-[-0.02em]">{pick.model}</span>
        <span class="font-mono text-sm">/effort {pick.effort}</span>
        <span class="pill pill-active ml-auto min-h-7 px-3 text-[11px]">{pick.mode}</span>
      </p>
      <p class="text-small text-ink-muted m-0">{pick.why}</p>
    </div>
  </div>
</div>
