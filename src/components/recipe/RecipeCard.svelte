<script lang="ts">
import { formatMinutes, totalMinutes } from "../../lib/recipe/scale";
import type { Recipe } from "../../lib/recipe/types";
import Stars from "./Stars.svelte";

let {
	recipe,
	href,
	badge = null,
}: { recipe: Recipe; href: string; badge?: string | null } = $props();

const time = $derived(totalMinutes(recipe));
</script>

<a
  {href}
  class="bg-surface border-line shadow-card hover:border-accent group flex h-full flex-col rounded-2xl border p-5 transition-colors"
>
  <div class="mb-2 flex items-center justify-between gap-3">
    <Stars rating={recipe.rating} size={13} />
    {#if badge}
      <span class="bg-chip text-ink-muted rounded px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase">
        {badge}
      </span>
    {:else if recipe.tags[0]}
      <span class="bg-chip text-accent-deep rounded px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase">
        {recipe.tags[0]}
      </span>
    {/if}
  </div>

  <span class="mb-1.5 text-[15.5px] font-semibold leading-snug">{recipe.title}</span>
  <span class="text-ink-muted mb-4 flex-1 text-[13.5px] leading-relaxed">{recipe.description}</span>

  <ul class="text-ink-faint flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] tracking-[0.04em] uppercase">
    <li class="text-ink-muted tabular-nums">{recipe.macros.calories} kcal</li>
    <li aria-hidden="true">&middot;</li>
    <li class="tabular-nums">{recipe.macros.protein} g protein</li>
    {#if time !== null}
      <li aria-hidden="true">&middot;</li>
      <li class="tabular-nums">{formatMinutes(time)}</li>
    {/if}
    <li aria-hidden="true">&middot;</li>
    <li class="tabular-nums">serves {recipe.servings}</li>
  </ul>
</a>
