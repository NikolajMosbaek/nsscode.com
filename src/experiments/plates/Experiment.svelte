<script lang="ts">
import Barbell from "./Barbell.svelte";
import {
	bars,
	formatKg,
	load,
	nextAbove,
	type PlateStock,
	ramp,
	standardStock,
} from "./logic";

let target = $state(100);
let bar = $state(20);
let customBar = $state(false);
let stock = $state<PlateStock[]>(standardStock.map((p) => ({ ...p })));
let showRamp = $state(false);
let narrow = $state(false);
let stockOpen = $state(true);

$effect(() => {
	const media = window.matchMedia("(max-width: 640px)");
	const apply = () => {
		narrow = media.matches;
		stockOpen = !media.matches;
	};
	apply();
	media.addEventListener("change", apply);
	return () => media.removeEventListener("change", apply);
});

const stockSummary = $derived(
	stock
		.filter((p) => p.perSide > 0)
		.map((p) => `${p.perSide}×${formatKg(p.kg)}`)
		.join("  "),
);

const result = $derived(load(target, bar, stock));
const above = $derived(result.exact ? null : nextAbove(target, bar, stock));
const steps = $derived(showRamp ? ramp(target, bar, stock) : []);
const perSideText = $derived(
	result.perSide.length
		? result.perSide.map(formatKg).join(" · ")
		: "nothing, just the bar",
);

function bump(delta: number) {
	target = Math.max(bar, Math.round((target + delta) * 4) / 4);
}
function setStock(index: number, perSide: number) {
	stock = stock.map((p, i) =>
		i === index ? { ...p, perSide: Math.max(0, Math.min(10, perSide)) } : p,
	);
}
function pickBar(kg: number) {
	bar = kg;
	customBar = false;
	if (target < kg) target = kg;
}
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-8">
  <div class="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
    <div class="grid content-start gap-5">
      <div class="grid gap-2">
        <label for="plates-target" class="eyebrow">Target weight</label>
        <div class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5">
          <button type="button" class="pill" onclick={() => bump(-2.5)} aria-label="Minus 2.5 kg">−2.5</button>
          <div class="card-flat flex min-w-0 items-baseline justify-center gap-2 px-4 py-2">
            <input
              id="plates-target"
              type="number"
              inputmode="decimal"
              min={bar}
              step="0.25"
              bind:value={target}
              class="w-full min-w-0 bg-transparent text-center font-sans text-[40px] leading-none font-extrabold tracking-[-0.03em] outline-none"
            />
            <span class="eyebrow">kg</span>
          </div>
          <button type="button" class="pill" onclick={() => bump(2.5)} aria-label="Plus 2.5 kg">+2.5</button>
        </div>
      </div>

      <fieldset class="grid gap-2">
        <legend class="eyebrow mb-2">Bar</legend>
        <div class="flex flex-wrap items-center gap-2.5">
          {#each bars as b (b.kg)}
            <button type="button" class="pill {bar === b.kg && !customBar ? 'pill-active' : ''}" aria-pressed={bar === b.kg && !customBar} onclick={() => pickBar(b.kg)} title={b.note}>{b.label}</button>
          {/each}
          <button type="button" class="pill {customBar ? 'pill-active' : ''}" aria-pressed={customBar} onclick={() => (customBar = true)}>other</button>
          {#if customBar}
            <input type="number" min="0" step="0.5" bind:value={bar} class="card-flat w-24 px-3 py-2 font-mono text-sm" aria-label="Bar weight in kilograms" />
          {/if}
        </div>
      </fieldset>
    </div>

    <details class="card-flat grid min-w-0 content-start p-4" bind:open={stockOpen}>
      <summary class="eyebrow flex cursor-pointer list-none items-center justify-between gap-3">
        <span>Plates you have, per side</span>
        <span class="text-ink min-w-0 flex-1 truncate text-right font-mono text-[11px] tabular-nums">{stockOpen ? "" : stockSummary}</span>
      </summary>
      <div class="mt-3 grid gap-2">
      {#each stock as plate, i (plate.kg)}
        <div class="flex items-center justify-between gap-3">
          <span class="font-mono text-sm font-medium tabular-nums">{formatKg(plate.kg)} kg</span>
          <div class="flex items-center gap-1.5">
            <button type="button" class="stepper" onclick={() => setStock(i, plate.perSide - 1)} aria-label="One fewer {formatKg(plate.kg)} kg plate per side">−</button>
            <span class="w-6 text-center font-mono text-sm tabular-nums" aria-live="polite">{plate.perSide}</span>
            <button type="button" class="stepper" onclick={() => setStock(i, plate.perSide + 1)} aria-label="One more {formatKg(plate.kg)} kg plate per side">+</button>
          </div>
        </div>
      {/each}
      </div>
    </details>
  </div>

  <section class="card p-5 sm:p-7" aria-live="polite">
    <div class="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
      <p class="m-0">
        <span class="eyebrow">Per side, collar outwards</span>
        <span class="mt-1 block text-h2 font-extrabold tracking-[-0.03em]">{perSideText}</span>
      </p>
      <p class="m-0 text-right">
        <span class="eyebrow">On the bar</span>
        <span class="mt-1 block text-h3 font-extrabold tabular-nums">{formatKg(result.total)} kg</span>
      </p>
    </div>
    <Barbell perSide={result.perSide} bar={bar} half={narrow} />
    {#if narrow}
      <p class="eyebrow mt-2 text-center">one side shown, collar on the left</p>
    {/if}
    {#if !result.exact}
      <p class="bg-yellow text-accent-ink border-line mt-4 rounded-xl border-3 px-4 py-3 text-sm font-medium">
        {formatKg(target)} kg cannot be made from these plates. Nearest below is {formatKg(result.total)} kg{#if above}, nearest above is {formatKg(above)} kg{/if}.
      </p>
    {/if}
  </section>

  <div class="flex flex-wrap items-center gap-2.5">
    <button type="button" class="pill {showRamp ? 'pill-active' : ''}" aria-pressed={showRamp} onclick={() => (showRamp = !showRamp)}>Warm-up ramp</button>
    <span class="text-small text-ink-muted">Bar, then 50 / 70 / 85 / 93 percent, rounded to what loads.</span>
  </div>

  {#if showRamp}
    <ol class="grid gap-3" aria-label="Warm-up ramp">
      {#each steps as step (step.label)}
        <li class="card-flat grid items-center gap-x-6 gap-y-2 p-4 sm:grid-cols-[6rem_1fr_minmax(0,18rem)]">
          <div>
            <span class="eyebrow">{step.label}</span>
            <span class="block text-h3 font-extrabold tabular-nums">{formatKg(step.loading.total)} kg</span>
            <span class="text-small text-ink-muted">× {step.reps}</span>
          </div>
          <span class="font-mono text-sm">{step.loading.perSide.length ? step.loading.perSide.map(formatKg).join(" · ") : "empty bar"}</span>
          <Barbell perSide={step.loading.perSide} bar={bar} compact half={narrow} />
        </li>
      {/each}
    </ol>
  {/if}

  <p class="text-small text-ink-muted max-w-[62ch]">
    Heaviest plate at the collar, lightest furthest out, and the fewest plates that make the number exactly. When your rack cannot make it, you get the nearest weights it can.
  </p>
</div>

<style>
  .stepper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 3px solid var(--line);
    border-radius: 999px;
    background: var(--surface);
    color: var(--ink);
    font-family: var(--font-mono);
    font-weight: 700;
    cursor: pointer;
  }
  .stepper:hover {
    background: var(--surface-strong);
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
  input[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
</style>
