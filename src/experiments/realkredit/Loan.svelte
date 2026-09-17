<script lang="ts">
/* One of the two loans being compared: its inputs and its own numbers. */
import {
	type Deal,
	kr,
	type LoanKind,
	type Plan,
	pct,
	productOf,
	products,
} from "./logic";

interface Props {
	label: string;
	colour: string;
	deal: Deal;
	result: Plan;
	onpick: (kind: LoanKind) => void;
}
const { label, colour, deal = $bindable(), result, onpick }: Props = $props();
const product = $derived(productOf(deal.kind));
</script>

<section class="card grid content-start gap-5 p-5 sm:p-6" aria-label="Lån {label}">
  <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
    <span class="border-line inline-block size-4 shrink-0 rounded-md border-3" style="background: {colour}" aria-hidden="true"></span>
    <h2 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Lån {label}</h2>
    <span class="eyebrow">{product.variable ? "variabel rente" : "fast rente"}</span>
  </div>

  <div class="flex flex-wrap gap-2" role="group" aria-label="Låntype {label}">
    {#each products as p (p.id)}
      <button type="button" class="pill min-h-8 px-3 text-[12px] {deal.kind === p.id ? 'pill-active' : ''}" aria-pressed={deal.kind === p.id} onclick={() => onpick(p.id)}>{p.name}</button>
    {/each}
  </div>
  <p class="text-small text-ink-muted m-0">{product.note}</p>

  <div class="grid gap-3 sm:grid-cols-2">
    <label class="card-flat grid gap-1 px-3 py-2">
      <span class="eyebrow">Rente</span>
      <span class="flex items-baseline gap-1">
        <input type="number" min="0" max="15" step="0.05" bind:value={deal.rate} class="w-full min-w-0 bg-transparent font-sans text-[26px] leading-none font-extrabold tabular-nums outline-none" aria-label="Rente for lån {label}" />
        <span class="eyebrow">%</span>
      </span>
    </label>
    <label class="card-flat grid gap-1 px-3 py-2">
      <span class="eyebrow">Kurs</span>
      <span class="flex items-baseline gap-1">
        <input type="number" min="50" max="100" step="0.1" bind:value={deal.kurs} class="w-full min-w-0 bg-transparent font-sans text-[26px] leading-none font-extrabold tabular-nums outline-none" aria-label="Kurs for lån {label}" />
      </span>
    </label>
  </div>

  <label class="grid gap-2">
    <span class="eyebrow flex justify-between"><span>Afdragsfrihed</span><span class="text-ink tabular-nums">{deal.interestOnlyYears} år</span></span>
    <input type="range" min="0" max="10" step="1" bind:value={deal.interestOnlyYears} class="accent-accent" aria-label="Afdragsfrie år for lån {label}" />
  </label>

  <div class="border-line grid gap-3 border-t-3 pt-4">
    <p class="m-0">
      <span class="eyebrow">Ydelse pr. måned, efter skat</span>
      <span class="mt-1 block text-h2 font-extrabold tracking-[-0.03em] tabular-nums">{kr(result.firstMonthAfterTax)}</span>
      <span class="text-small text-ink-muted">{kr(result.firstMonth)} før skat, første år</span>
    </p>
    <dl class="m-0 grid grid-cols-2 gap-x-4 gap-y-2.5">
      <div><dt class="eyebrow">Hovedstol</dt><dd class="m-0 font-mono text-sm font-bold tabular-nums">{kr(result.hovedstol)}</dd></div>
      <div><dt class="eyebrow">Kurstab</dt><dd class="m-0 font-mono text-sm font-bold tabular-nums">{kr(result.kurstab)}</dd></div>
      <div><dt class="eyebrow">Bidragssats</dt><dd class="m-0 font-mono text-sm font-bold tabular-nums">{pct(result.startBidragssats)}</dd></div>
      <div><dt class="eyebrow">Samlet, efter skat</dt><dd class="m-0 font-mono text-sm font-bold tabular-nums">{kr(result.totalAfterTax)}</dd></div>
    </dl>
  </div>
</section>
