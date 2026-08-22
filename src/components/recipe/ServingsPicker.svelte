<script lang="ts">
const MIN = 1;
const MAX = 24;

let { people = $bindable(), servings }: { people: number; servings: number } =
	$props();

function step(delta: number): void {
	people = Math.min(MAX, Math.max(MIN, people + delta));
}
</script>

<div class="border-line bg-surface shadow-card flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border px-5 py-4">
  <span class="text-ink-soft text-[13px] font-medium">Cooking for</span>

  <div class="bg-chip flex items-center gap-1 rounded-full p-[3px]">
    <button
      type="button"
      onclick={() => step(-1)}
      disabled={people <= MIN}
      aria-label="One fewer person"
      class="text-ink-soft hover:text-ink hover:bg-surface disabled:hover:bg-transparent flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none transition-colors disabled:opacity-35"
    >
      &minus;
    </button>
    <output
      class="min-w-[4.5rem] text-center font-mono text-[15px] font-medium tabular-nums"
      aria-live="polite"
    >
      {people} {people === 1 ? "person" : "people"}
    </output>
    <button
      type="button"
      onclick={() => step(1)}
      disabled={people >= MAX}
      aria-label="One more person"
      class="text-ink-soft hover:text-ink hover:bg-surface disabled:hover:bg-transparent flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none transition-colors disabled:opacity-35"
    >
      +
    </button>
  </div>

  {#if people === servings}
    <span class="text-ink-faint text-[12.5px]">as written</span>
  {:else}
    <button
      type="button"
      onclick={() => (people = servings)}
      class="text-ink-faint hover:text-accent text-[12.5px] underline decoration-dotted underline-offset-3 transition-colors"
    >
      scaled from {servings} &mdash; reset
    </button>
  {/if}
</div>
