<script lang="ts">
import { deleteDraft, getDraft } from "../../lib/recipe/drafts";
import RecipeView from "./RecipeView.svelte";

const slug = new URLSearchParams(window.location.search).get("recipe") ?? "";

let draft = $state(slug === "" ? null : getDraft(slug));

function remove(): void {
	deleteDraft(slug);
	window.location.href = "/recipes/";
}
</script>

{#if draft}
  <div class="border-line bg-chip mb-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-3.5">
    <p class="text-ink-soft text-[13px] leading-snug">
      A draft saved in this browser only. Commit
      <code class="font-mono text-[12.5px]">src/recipes/{draft.slug}.json</code> to publish it.
    </p>
    <button
      type="button"
      onclick={remove}
      class="text-ink-faint hover:text-danger-ink text-[12.5px] underline decoration-dotted underline-offset-3 transition-colors"
    >
      delete draft
    </button>
  </div>

  <RecipeView recipe={draft.recipe} />
{:else}
  <p class="text-ink-muted text-[15px] leading-relaxed">
    No draft called <code class="font-mono text-[13px]">{slug || "—"}</code> in this browser.
    <a
      href="/tools/recipe-upload/"
      class="text-accent hover:text-accent-deep underline decoration-dotted underline-offset-3 transition-colors"
      >Paste one in</a
    >, or <a href="/recipes/" class="text-accent hover:text-accent-deep underline decoration-dotted underline-offset-3 transition-colors">go back to the shelf</a>.
  </p>
{/if}
