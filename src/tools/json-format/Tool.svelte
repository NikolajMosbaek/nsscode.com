<script lang="ts">
import { formatJson } from "./logic";

let input = $state("");
let indent = $state(2);
const result = $derived(formatJson(input, indent));

const indents = [2, 4];
</script>

<div class="flex flex-col gap-[18px]">
  <label class="block">
    <span class="text-ink-soft mb-[7px] block text-[13px] font-medium">Input</span>
    <textarea
      bind:value={input}
      rows="5"
      spellcheck="false"
      placeholder={'{"hello":"world"}'}
      class="bg-surface border-line shadow-inset-field placeholder:text-ink-faint focus:border-accent w-full resize-y rounded-xl border px-4 py-3.5 font-mono text-[13.5px] leading-relaxed outline-none transition-colors"
    ></textarea>
  </label>

  <div class="flex items-center gap-2.5">
    <span class="text-ink-soft text-[13px] font-medium">Indent</span>
    <div class="bg-chip flex rounded-full p-[3px]">
      {#each indents as value (value)}
        <button
          type="button"
          onclick={() => (indent = value)}
          aria-pressed={indent === value}
          class="rounded-full px-4 py-1.5 text-[13px] transition-colors {indent === value
            ? 'bg-accent font-semibold text-white'
            : 'text-ink-muted hover:text-ink font-medium'}"
        >
          {value}
        </button>
      {/each}
    </div>
  </div>

  {#if input.trim() !== ""}
    {#if result.ok}
      <pre class="bg-surface border-line shadow-card overflow-x-auto rounded-xl border px-4 py-3.5 font-mono text-[13.5px] leading-relaxed">{result.value}</pre>
    {:else}
      <p class="bg-danger-ground border-danger-line text-danger-ink flex items-start gap-[11px] rounded-xl border px-4 py-3.5 text-[13.5px] leading-snug">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          class="text-danger-icon mt-0.5 shrink-0"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M12 8v5"></path>
          <path d="M12 16.5v.01"></path>
        </svg>
        {result.error}
      </p>
    {/if}
  {/if}
</div>
