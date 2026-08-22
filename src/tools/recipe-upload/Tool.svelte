<script lang="ts">
import RecipeView from "../../components/recipe/RecipeView.svelte";
import {
	claudePrompt,
	RECIPE_CONTRACT,
	RECIPE_EXAMPLE,
} from "../../lib/recipe/contract";
import { saveDraft } from "../../lib/recipe/drafts";
import { prepareUpload } from "./logic";

let dish = $state("");
let json = $state("");
let slugOverride = $state("");
let copied: string | null = $state(null);
let saved: string | null = $state(null);
let saveFailed = $state(false);

const pasted = $derived(json.trim() !== "");
const prepared = $derived(prepareUpload(json, slugOverride));
const problems = $derived(prepared.ok ? [] : prepared.error.split("\n"));

async function copy(what: string, text: string): Promise<void> {
	try {
		await navigator.clipboard.writeText(text);
		copied = what;
		setTimeout(() => {
			if (copied === what) copied = null;
		}, 2000);
	} catch {
		copied = null;
	}
}

function download(): void {
	if (!prepared.ok) return;
	const url = URL.createObjectURL(
		new Blob([prepared.value.fileText], { type: "application/json" }),
	);
	const link = document.createElement("a");
	link.href = url;
	link.download = `${prepared.value.slug}.json`;
	link.click();
	URL.revokeObjectURL(url);
}

function keep(): void {
	if (!prepared.ok) return;
	const ok = saveDraft(prepared.value.slug, prepared.value.recipe, Date.now());
	saveFailed = !ok;
	saved = ok ? prepared.value.slug : null;
}

// A fresh paste invalidates the last save notice.
$effect(() => {
	void json;
	void slugOverride;
	saved = null;
	saveFailed = false;
});
</script>

<div class="flex flex-col gap-8">
  <!-- 1 — get the JSON out of Claude -->
  <section class="flex flex-col gap-3">
    <h2 class="eyebrow">1 &middot; Ask Claude</h2>
    <p class="text-ink-muted text-[13.5px] leading-relaxed">
      Copy the prompt below into Claude and it answers with one JSON object in the shape this
      site expects. Working in Claude Code instead? Say <em>add a recipe for &hellip;</em> and the
      <code class="font-mono text-[12.5px]">add-recipe</code> skill writes the file straight into
      <code class="font-mono text-[12.5px]">src/recipes/</code>.
    </p>

    <div class="flex flex-wrap items-end gap-3">
      <label class="block flex-1 min-w-[15rem]">
        <span class="text-ink-soft mb-[7px] block text-[13px] font-medium">Dish</span>
        <input
          bind:value={dish}
          placeholder="green shakshuka"
          class="bg-surface border-line shadow-inset-field placeholder:text-ink-faint focus:border-accent w-full rounded-xl border px-4 py-2.5 text-[13.5px] outline-none transition-colors"
        />
      </label>
      <button
        type="button"
        onclick={() => copy("prompt", claudePrompt(dish.trim() === "" ? undefined : dish.trim()))}
        class="bg-accent hover:bg-accent-deep rounded-xl px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors"
      >
        {copied === "prompt" ? "Copied" : "Copy prompt"}
      </button>
    </div>

    <details class="border-line bg-surface rounded-xl border px-4 py-3">
      <summary class="text-ink-soft cursor-pointer text-[13px] font-medium">
        The format, in full
      </summary>
      <pre class="text-ink-muted mt-3 overflow-x-auto font-mono text-[12px] leading-relaxed whitespace-pre-wrap">{RECIPE_CONTRACT}</pre>
      <pre class="border-line-soft text-ink-muted mt-3 overflow-x-auto border-t border-dashed pt-3 font-mono text-[12px] leading-relaxed">{RECIPE_EXAMPLE}</pre>
    </details>
  </section>

  <!-- 2 — paste it back -->
  <section class="flex flex-col gap-3">
    <h2 class="eyebrow">2 &middot; Paste it back</h2>
    <textarea
      bind:value={json}
      rows="8"
      spellcheck="false"
      placeholder={'{ "title": "Green Shakshuka", … }'}
      class="bg-surface border-line shadow-inset-field placeholder:text-ink-faint focus:border-accent w-full resize-y rounded-xl border px-4 py-3.5 font-mono text-[13px] leading-relaxed outline-none transition-colors"
    ></textarea>

    {#if pasted && !prepared.ok}
      <div class="bg-danger-ground border-danger-line text-danger-ink rounded-xl border px-4 py-3.5">
        <p class="mb-2 flex items-center gap-[11px] text-[13.5px] font-semibold">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            class="text-danger-icon shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 8v5"></path>
            <path d="M12 16.5v.01"></path>
          </svg>
          {problems.length === 1 ? "One thing to fix" : `${problems.length} things to fix`}
        </p>
        <ul class="flex flex-col gap-1 pl-[28px]">
          {#each problems as problem (problem)}
            <li class="font-mono text-[12.5px] leading-snug">{problem}</li>
          {/each}
        </ul>
      </div>
    {/if}
  </section>

  <!-- 3 — put it somewhere -->
  {#if prepared.ok}
    {@const upload = prepared.value}
    <section class="flex flex-col gap-3">
      <h2 class="eyebrow">3 &middot; Put it somewhere</h2>

      <label class="block max-w-sm">
        <span class="text-ink-soft mb-[7px] block text-[13px] font-medium">File name</span>
        <input
          bind:value={slugOverride}
          placeholder={upload.slug}
          class="bg-surface border-line shadow-inset-field placeholder:text-ink-faint focus:border-accent w-full rounded-xl border px-4 py-2.5 font-mono text-[13px] outline-none transition-colors"
        />
        <span class="text-ink-faint mt-1.5 block font-mono text-[12px]">{upload.fileName}</span>
      </label>

      <div class="flex flex-wrap gap-2.5">
        <button
          type="button"
          onclick={keep}
          class="bg-accent hover:bg-accent-deep rounded-xl px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors"
        >
          Keep in this browser
        </button>
        <button
          type="button"
          onclick={() => copy("file", upload.fileText)}
          class="border-line bg-surface hover:border-accent rounded-xl border px-5 py-2.5 text-[13.5px] font-medium transition-colors"
        >
          {copied === "file" ? "Copied" : "Copy file"}
        </button>
        <button
          type="button"
          onclick={download}
          class="border-line bg-surface hover:border-accent rounded-xl border px-5 py-2.5 text-[13.5px] font-medium transition-colors"
        >
          Download .json
        </button>
      </div>

      {#if saved}
        <p class="border-line bg-chip text-ink-soft rounded-xl border px-4 py-3 text-[13px] leading-snug">
          Saved in this browser.
          <a
            href={`/recipes/draft/?recipe=${encodeURIComponent(saved)}`}
            class="text-accent hover:text-accent-deep underline decoration-dotted underline-offset-3 transition-colors"
            >Open it</a
          >, or find it under <em>saved in this browser</em> on the
          <a
            href="/recipes/"
            class="text-accent hover:text-accent-deep underline decoration-dotted underline-offset-3 transition-colors"
            >recipe shelf</a
          >. To publish it for good, commit
          <code class="font-mono text-[12.5px]">{upload.fileName}</code>.
        </p>
      {:else if saveFailed}
        <p class="bg-danger-ground border-danger-line text-danger-ink rounded-xl border px-4 py-3 text-[13px] leading-snug">
          This browser refused to store the draft — private windows and blocked site data both
          do that. Copy or download the file instead.
        </p>
      {/if}
    </section>

    <!-- 4 — see it -->
    <section class="flex flex-col gap-3">
      <h2 class="eyebrow">4 &middot; How it reads</h2>
      <div class="border-line bg-ground rounded-2xl border border-dashed p-5 sm:p-7">
        {#key upload.fileText}
          <RecipeView recipe={upload.recipe} headingOffset={1} />
        {/key}
      </div>
    </section>
  {/if}
</div>
