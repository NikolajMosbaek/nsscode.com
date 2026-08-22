<script lang="ts">
import {
	formatAmount,
	formatMinutes,
	scaleFactor,
	totalMinutes,
} from "../../lib/recipe/scale";
import type { Recipe } from "../../lib/recipe/types";
import MacroPanel from "./MacroPanel.svelte";
import ServingsPicker from "./ServingsPicker.svelte";
import Stars from "./Stars.svelte";

let {
	recipe,
	/** 1 when the view sits under another page heading, as in the upload preview. */
	headingOffset = 0,
}: { recipe: Recipe; headingOffset?: number } = $props();

const titleTag = $derived(`h${1 + headingOffset}`);
const sectionTag = $derived(`h${2 + headingOffset}`);

let people = $state(recipe.servings);

const factor = $derived(scaleFactor(recipe.servings, people));
const time = $derived(totalMinutes(recipe));
</script>

<article class="flex flex-col gap-7">
  <header class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <Stars rating={recipe.rating} size={16} />
      <span class="text-ink-muted font-mono text-[12.5px] tabular-nums">
        {recipe.rating.toFixed(1)}
      </span>
      {#each recipe.tags as tag (tag)}
        <span class="bg-chip text-accent-deep rounded px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase">
          {tag}
        </span>
      {/each}
    </div>

    <svelte:element this={titleTag} class="font-display text-[34px] leading-[1.1] font-normal"
      >{recipe.title}</svelte:element
    >
    <p class="text-ink-muted text-[15px] leading-relaxed">{recipe.description}</p>

    <ul class="text-ink-faint flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11.5px] tracking-[0.04em] uppercase">
      {#if recipe.prepMinutes !== null}
        <li>{formatMinutes(recipe.prepMinutes)} prep</li>
      {/if}
      {#if recipe.cookMinutes !== null}
        <li aria-hidden="true">&middot;</li>
        <li>{formatMinutes(recipe.cookMinutes)} cook</li>
      {/if}
      {#if time !== null}
        <li aria-hidden="true">&middot;</li>
        <li class="text-ink-muted">{formatMinutes(time)} total</li>
      {/if}
      <li aria-hidden="true">&middot;</li>
      <li>serves {recipe.servings}</li>
    </ul>
  </header>

  <ServingsPicker bind:people servings={recipe.servings} />

  <div class="grid gap-7 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:gap-8">
    <div class="flex flex-col gap-5">
      <section>
        <svelte:element this={sectionTag} class="eyebrow mb-3">Ingredients</svelte:element>
        <ul>
          {#each recipe.ingredients as ingredient, i (i)}
            {@const amount = formatAmount(ingredient, factor)}
            <li class="border-line-soft flex items-baseline gap-3 border-b border-dashed py-2 last:border-b-0">
              <span
                class="w-[4.75rem] shrink-0 font-mono text-[13px] tabular-nums {amount === ''
                  ? 'text-ink-faint'
                  : 'text-ink'}"
              >
                {amount === "" ? "—" : amount}
              </span>
              <span class="text-[14px] leading-snug">
                {ingredient.item}{#if ingredient.note}<span class="text-ink-faint">, {ingredient.note}</span>{/if}
              </span>
            </li>
          {/each}
        </ul>
      </section>

      <MacroPanel macros={recipe.macros} {people} headingTag={sectionTag} />
    </div>

    <section>
      <svelte:element this={sectionTag} class="eyebrow mb-3">Method</svelte:element>
      <ol class="flex flex-col gap-4">
        {#each recipe.steps as step, i (i)}
          <li class="flex gap-3.5">
            <span
              class="bg-chip text-accent-deep mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11.5px] font-medium tabular-nums"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div class="flex flex-col gap-1">
              <p class="text-[14.5px] leading-relaxed">{step.text}</p>
              {#if step.minutes !== null}
                <span class="eyebrow">{formatMinutes(step.minutes)}</span>
              {/if}
            </div>
          </li>
        {/each}
      </ol>
    </section>
  </div>

  {#if recipe.source}
    <footer class="border-line-soft text-ink-faint border-t border-dashed pt-4 text-[12.5px]">
      Source: {recipe.source}
    </footer>
  {/if}
</article>
