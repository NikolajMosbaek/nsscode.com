<script lang="ts">
import { doneCount, progress, type Step, toggle } from "./progress.svelte";

interface Props {
	steps: Step[];
	title?: string;
}
const { steps, title = "Do it now" }: Props = $props();
const done = $derived(doneCount(steps));
</script>

<section class="card grid gap-4 p-5 sm:p-6" aria-labelledby="steps-{steps[0]?.id}">
  <div class="flex flex-wrap items-baseline justify-between gap-2">
    <h3 id="steps-{steps[0]?.id}" class="m-0 text-h3 font-extrabold tracking-[-0.02em]">{title}</h3>
    <span class="eyebrow tabular-nums">{done} of {steps.length} done</span>
  </div>
  <p class="text-small text-ink-muted m-0">In your own terminal, on your practice repo. Tick each one when you have seen the result. Ticks are saved in this browser only.</p>
  <ol class="m-0 grid list-none gap-2.5 p-0">
    {#each steps as s, i (s.id)}
      <li class="card-flat grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 px-4 py-3 {progress.done[s.id] ? 'bg-surface-strong' : ''}">
        <input
          id={s.id}
          type="checkbox"
          checked={progress.done[s.id] ?? false}
          onchange={() => toggle(s.id)}
          class="accent-accent mt-1 size-5 cursor-pointer"
        />
        <label for={s.id} class="cursor-pointer text-body font-medium {progress.done[s.id] ? 'text-ink-muted line-through decoration-2' : ''}">
          <span class="eyebrow mr-2">{String(i + 1).padStart(2, "0")}</span>{s.text}
        </label>
        {#if s.expect}
          <p class="text-small text-ink-muted col-start-2 m-0"><span class="text-ink font-bold">You should see:</span> {s.expect}</p>
        {/if}
      </li>
    {/each}
  </ol>
</section>
