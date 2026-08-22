<script lang="ts">
import { macroSplit, scaleMacros } from "../../lib/recipe/scale";
import type { Macros } from "../../lib/recipe/types";

let {
	macros,
	people,
	headingTag = "h2",
}: { macros: Macros; people: number; headingTag?: string } = $props();

let basis: "serving" | "total" = $state("serving");

const shown = $derived(
	basis === "serving" ? macros : scaleMacros(macros, people),
);
const split = $derived(macroSplit(macros));

const grams = $derived([
	{
		key: "protein",
		label: "Protein",
		value: shown.protein,
		bar: "bg-macro-protein",
		share: split.protein,
	},
	{
		key: "carbs",
		label: "Carbs",
		value: shown.carbs,
		bar: "bg-macro-carbs",
		share: split.carbs,
	},
	{
		key: "fat",
		label: "Fat",
		value: shown.fat,
		bar: "bg-macro-fat",
		share: split.fat,
	},
]);

/** Trailing `.0` reads like false precision on a gram figure. */
function g(value: number): string {
	return `${Number.isInteger(value) ? value : value.toFixed(1)} g`;
}
</script>

<section class="border-line bg-surface shadow-card rounded-2xl border p-5">
  <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
    <svelte:element this={headingTag} class="eyebrow">Macros</svelte:element>
    <div class="bg-chip flex rounded-full p-[3px]">
      {#each [{ id: "serving", label: "Per serving" }, { id: "total", label: `All ${people}` }] as option (option.id)}
        <button
          type="button"
          onclick={() => (basis = option.id as "serving" | "total")}
          aria-pressed={basis === option.id}
          class="rounded-full px-3 py-1 text-[12px] transition-colors {basis === option.id
            ? 'bg-accent font-semibold text-white'
            : 'text-ink-muted hover:text-ink font-medium'}"
        >
          {option.label}
        </button>
      {/each}
    </div>
  </div>

  <div class="mb-4 flex items-baseline gap-1.5">
    <span class="font-display text-[38px] leading-none tabular-nums">{shown.calories}</span>
    <span class="text-ink-muted text-[13px]">kcal</span>
  </div>

  <div class="bg-chip mb-4 flex h-2 overflow-hidden rounded-full" aria-hidden="true">
    {#each grams as macro (macro.key)}
      <div class={macro.bar} style="width: {macro.share}%"></div>
    {/each}
  </div>

  <dl class="grid grid-cols-3 gap-3">
    {#each grams as macro (macro.key)}
      <div>
        <dt class="text-ink-muted mb-1 flex items-center gap-1.5 text-[12px]">
          <span class="h-2 w-2 shrink-0 rounded-full {macro.bar}"></span>
          {macro.label}
        </dt>
        <dd class="font-mono text-[15px] tabular-nums">{g(macro.value)}</dd>
      </div>
    {/each}
  </dl>

  {#if shown.fiber !== null}
    <p class="border-line-soft text-ink-muted mt-4 border-t border-dashed pt-3 text-[12.5px]">
      Fibre <span class="text-ink font-mono tabular-nums">{g(shown.fiber)}</span>
    </p>
  {/if}
</section>
