<script lang="ts">
import { listDrafts } from "../../lib/recipe/drafts";
import RecipeCard from "./RecipeCard.svelte";

// Rendered client-only: drafts live in this browser's storage, not in the build.
let drafts = $state(listDrafts());
</script>

{#if drafts.length > 0}
  <section class="mt-12">
    <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h2 class="eyebrow">Saved in this browser</h2>
      <span class="text-ink-faint text-[12.5px]">
        {drafts.length} draft{drafts.length === 1 ? "" : "s"} — not committed yet
      </span>
    </div>
    <ul class="grid gap-4 sm:grid-cols-2">
      {#each drafts as draft (draft.slug)}
        <li>
          <RecipeCard
            recipe={draft.recipe}
            href={`/recipes/draft/?recipe=${encodeURIComponent(draft.slug)}`}
            badge="draft"
          />
        </li>
      {/each}
    </ul>
  </section>
{/if}
