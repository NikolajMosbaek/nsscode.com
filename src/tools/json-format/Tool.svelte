<script lang="ts">
import { formatJson } from "./logic";

let input = $state("");
let indent = $state(2);
const result = $derived(formatJson(input, indent));
</script>

<div class="space-y-4">
  <label class="block">
    <span class="mb-1 block text-sm text-zinc-400">Input</span>
    <textarea
      bind:value={input}
      rows="8"
      spellcheck="false"
      placeholder={'{"hello":"world"}'}
      class="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 font-mono text-sm"
    ></textarea>
  </label>

  <label class="flex items-center gap-2 text-sm text-zinc-400">
    Indent
    <select
      bind:value={indent}
      class="rounded border border-zinc-800 bg-zinc-900 px-2 py-1"
    >
      <option value={2}>2</option>
      <option value={4}>4</option>
    </select>
  </label>

  {#if input.trim() !== ''}
    {#if result.ok}
      <pre class="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 p-3 font-mono text-sm">{result.value}</pre>
    {:else}
      <p class="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-300">
        {result.error}
      </p>
    {/if}
  {/if}
</div>
