<script lang="ts">
import { assess, type IngredientId, ingredients } from "./logic";
import { pairs } from "./prompts";

let index = $state(0);
let highlight = $state<IngredientId | null>(null);
const pair = $derived(pairs[index]);

let draft = $state("");
const graded = $derived(assess(draft));
const byId = Object.fromEntries(ingredients.map((i) => [i.id, i])) as Record<
	IngredientId,
	(typeof ingredients)[number]
>;

function pick(i: number) {
	index = i;
	highlight = null;
}
</script>

<div class="grid gap-8">
  <p class="text-body text-ink-soft m-0 max-w-[70ch] font-medium text-pretty">
    A prompt is a work order for a colleague who cannot ask you questions until they have already started. The bad ones below are not stupid; they are how everyone talks to a search box. The good ones carry the same six ingredients, and you can see which words do which job.
  </p>

  <div class="flex flex-wrap gap-2" role="group" aria-label="Ingredients">
    {#each ingredients as ing (ing.id)}
      <button
        type="button"
        class="pill min-h-8 gap-2 px-3 text-[11px] {highlight === ing.id ? 'pill-active' : ''}"
        aria-pressed={highlight === ing.id}
        onclick={() => (highlight = highlight === ing.id ? null : ing.id)}
        title={ing.question}
      >
        <span class="inline-block size-2.5 rounded-full border-2 border-line" style="background: {ing.colour}" aria-hidden="true"></span>
        {ing.label}
      </button>
    {/each}
  </div>

  <div class="grid gap-4">
    <div class="flex flex-wrap gap-2" role="group" aria-label="Example">
      {#each pairs as p, i (p.slug)}
        <button type="button" class="pill {i === index ? 'pill-active' : ''}" aria-pressed={i === index} onclick={() => pick(i)}>{p.kind}</button>
      {/each}
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="card-flat grid content-start gap-3 p-5">
        <p class="eyebrow text-accent m-0">Bad</p>
        <p class="m-0 font-mono text-[15px] leading-relaxed">“{pair.bad}”</p>
        <p class="text-small text-ink-muted m-0">{pair.badWhy}</p>
      </div>
      <div class="card grid content-start gap-3 p-5">
        <p class="eyebrow text-green m-0">Good</p>
        <p class="m-0 font-mono text-[15px] leading-relaxed">
          “{#each pair.good as seg, i (i)}<span
              class="transition-opacity {highlight !== null && seg.i !== highlight ? 'opacity-30' : ''}"
              style={seg.i ? `text-decoration: underline; text-decoration-thickness: 3px; text-underline-offset: 4px; text-decoration-color: ${byId[seg.i].colour}` : ""}
              title={seg.i ? byId[seg.i].label : undefined}
            >{seg.t}</span>{/each}”
        </p>
        <p class="text-small text-ink-muted m-0">{pair.goodWhy}</p>
      </div>
    </div>
  </div>

  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
    <div class="grid content-start gap-3">
      <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Grade your own</h3>
      <textarea
        bind:value={draft}
        rows="6"
        placeholder="Paste or type the prompt you were about to send."
        spellcheck="false"
        class="card-flat focus:border-accent min-w-0 resize-y rounded-xl px-4 py-3 font-mono text-sm leading-relaxed outline-none"
        aria-label="Your prompt"
      ></textarea>
      <p class="text-small text-ink-muted m-0">A heuristic, not a judge: it looks for the words that usually carry each ingredient. A high score with a wrong goal is still a wrong goal.</p>
    </div>
    <div class="card-flat grid content-start gap-3 p-4" aria-live="polite">
      <p class="m-0 flex items-baseline justify-between"><span class="eyebrow">Ingredients</span><span class="font-mono text-sm tabular-nums">{Object.values(graded.found).filter(Boolean).length} / 6</span></p>
      <ul class="m-0 grid list-none gap-1.5 p-0">
        {#each ingredients as ing (ing.id)}
          <li class="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-2 text-sm {graded.found[ing.id] ? 'text-ink' : 'text-ink-muted'}">
            <span class="inline-block size-3 translate-y-0.5 rounded-full border-2 border-line" style="background: {graded.found[ing.id] ? ing.colour : 'transparent'}" aria-hidden="true"></span>
            <span class="font-medium">{ing.label} <span class="sr-only">{graded.found[ing.id] ? 'found' : 'missing'}</span></span>
            <span class="text-small text-ink-muted col-start-2">{ing.question}</span>
          </li>
        {/each}
      </ul>
      {#if graded.notes.length}
        <ul class="m-0 grid list-none gap-1 border-t-2 border-line-soft p-0 pt-3">
          {#each graded.notes as n (n)}
            <li class="text-small text-ink-soft font-medium">{n}</li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</div>
