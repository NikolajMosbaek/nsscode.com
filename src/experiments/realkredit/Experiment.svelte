<script lang="ts">
import Loan from "./Loan.svelte";
import {
	type Deal,
	defaultDeal,
	kr,
	type LoanKind,
	pct,
	plan,
	productOf,
	shifted,
} from "./logic";

let price = $state(defaultDeal.price);
let udbetaling = $state(defaultDeal.udbetaling);
let couple = $state(true);
let bankRate = $state(defaultDeal.bankRate);
let years = $state(30);

let a = $state<Deal>({ ...defaultDeal, kind: "fast", rate: 4, kurs: 97 });
let b = $state<Deal>({ ...defaultDeal, kind: "f5", rate: 2.6, kurs: 99.5 });

/* The property is shared; each loan only owns its own terms. */
const shared = $derived({ price, udbetaling, couple, bankRate, years });
const dealA = $derived<Deal>({ ...a, ...shared });
const dealB = $derived<Deal>({ ...b, ...shared });
const planA = $derived(plan(dealA));
const planB = $derived(plan(dealB));

function pick(which: "a" | "b", kind: LoanKind) {
	const p = productOf(kind);
	const target = which === "a" ? a : b;
	target.kind = kind;
	target.rate = p.rate;
	target.kurs = p.kurs;
}

const share = $derived(price > 0 ? udbetaling / price : 0);
const monthlyGap = $derived(
	planB.firstMonthAfterTax - planA.firstMonthAfterTax,
);
const totalGap = $derived(planB.totalAfterTax - planA.totalAfterTax);
const cheaperNow = $derived(monthlyGap < 0 ? "B" : "A");
const cheaperAll = $derived(totalGap < 0 ? "B" : "A");

/* What a rate rise does to whichever loan can be repriced. */
let shock = $state(3);
const shockedA = $derived(
	productOf(a.kind).variable ? plan(shifted(dealA, shock)) : planA,
);
const shockedB = $derived(
	productOf(b.kind).variable ? plan(shifted(dealB, shock)) : planB,
);
const anyVariable = $derived(
	productOf(a.kind).variable || productOf(b.kind).variable,
);

/* Restgæld over the term, both loans on one axis. */
const W = 640;
const H = 240;
const PAD = { l: 56, r: 14, t: 14, b: 30 };
const maxDebt = $derived(
	Math.max(
		...planA.years.map((y) => y.debt),
		...planB.years.map((y) => y.debt),
		1,
	),
);
const cx = (y: number) =>
	PAD.l + ((y - 1) / Math.max(1, years - 1)) * (W - PAD.l - PAD.r);
const cy = (v: number) => H - PAD.b - (v / maxDebt) * (H - PAD.t - PAD.b);
const path = (p: typeof planA) =>
	p.years
		.map(
			(row, i) =>
				`${i === 0 ? "M" : "L"} ${cx(row.year).toFixed(1)} ${cy(row.debt).toFixed(1)}`,
		)
		.join(" ");
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-10">
  <section class="grid gap-5" aria-labelledby="bolig">
    <h2 id="bolig" class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Boligen</h2>
    <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
      <div class="grid content-start gap-4">
        <div class="grid gap-2">
          <label for="pris" class="eyebrow">Pris</label>
          <div class="card-flat flex items-baseline gap-2 px-4 py-2">
            <input id="pris" type="number" min="0" step="25000" bind:value={price} class="w-full min-w-0 bg-transparent font-sans text-[32px] leading-none font-extrabold tracking-[-0.03em] tabular-nums outline-none" />
            <span class="eyebrow">kr.</span>
          </div>
          <input type="range" min="500000" max="12000000" step="50000" bind:value={price} class="accent-accent" aria-label="Pris på boligen" />
        </div>
        <label class="grid gap-2">
          <span class="eyebrow flex justify-between"><span>Udbetaling</span><span class="text-ink tabular-nums">{kr(udbetaling)} · {pct(share * 100, 1)}</span></span>
          <input type="range" min="0" max={price} step="25000" bind:value={udbetaling} class="accent-accent" />
          <span class="text-small text-ink-muted">Mindst 5 % af prisen. Realkredit dækker højst 80 %, resten er et banklån.</span>
        </label>
        <div class="flex flex-wrap items-center gap-3">
          <button type="button" class="pill {couple ? 'pill-active' : ''}" aria-pressed={couple} onclick={() => (couple = !couple)}>To om lånet</button>
          <label class="flex items-center gap-2 text-sm">
            <span class="eyebrow">Bankrente</span>
            <input type="number" min="0" max="20" step="0.1" bind:value={bankRate} class="card-flat w-20 px-2.5 py-1.5 font-mono text-sm" aria-label="Rente på banklånet" />
            <span class="text-ink-muted">%</span>
          </label>
        </div>
      </div>

      <div class="card-flat grid content-start gap-3 p-4">
        <p class="eyebrow m-0">Sådan bliver prisen dækket</p>
        {#if planA.impossible}
          <p class="bg-yellow text-accent-ink border-line m-0 rounded-xl border-3 px-4 py-3 text-sm font-medium">
            Udbetalingen skal være mindst 5 % af prisen, altså {kr(price * 0.05)}.
          </p>
        {/if}
        <div class="flex h-9 w-full overflow-hidden rounded-xl border-3 border-line" role="img" aria-label="Udbetaling {kr(udbetaling)}, realkredit {kr(planA.provenu)}, banklån {kr(planA.bankLoan)}">
          <span class="h-full border-r-2 border-ground" style="width: {(udbetaling / (price || 1)) * 100}%; background: var(--green)"></span>
          <span class="h-full border-r-2 border-ground" style="width: {(planA.provenu / (price || 1)) * 100}%; background: var(--blue)"></span>
          <span class="h-full" style="width: {(planA.bankLoan / (price || 1)) * 100}%; background: var(--accent)"></span>
        </div>
        <dl class="m-0 grid gap-2">
          <div class="flex items-baseline justify-between gap-3"><dt class="eyebrow flex items-center gap-2"><span class="border-line inline-block size-3 rounded-[3px] border-2" style="background: var(--green)" aria-hidden="true"></span>Udbetaling</dt><dd class="m-0 font-mono text-sm tabular-nums">{kr(udbetaling)}</dd></div>
          <div class="flex items-baseline justify-between gap-3"><dt class="eyebrow flex items-center gap-2"><span class="border-line inline-block size-3 rounded-[3px] border-2" style="background: var(--blue)" aria-hidden="true"></span>Realkredit</dt><dd class="m-0 font-mono text-sm tabular-nums">{kr(planA.provenu)}</dd></div>
          <div class="flex items-baseline justify-between gap-3"><dt class="eyebrow flex items-center gap-2"><span class="border-line inline-block size-3 rounded-[3px] border-2" style="background: var(--accent)" aria-hidden="true"></span>Banklån</dt><dd class="m-0 font-mono text-sm tabular-nums">{kr(planA.bankLoan)}</dd></div>
        </dl>
        <p class="text-small text-ink-muted m-0">Banklånet er dyrere og kan ikke afdragsfrit. Det forsvinder, når udbetalingen når 20 %.</p>
      </div>
    </div>
  </section>

  <section class="grid gap-5 lg:grid-cols-2 lg:gap-6" aria-label="De to lån">
    <Loan label="A" colour="var(--accent)" bind:deal={a} result={planA} onpick={(k) => pick("a", k)} />
    <Loan label="B" colour="var(--blue)" bind:deal={b} result={planB} onpick={(k) => pick("b", k)} />
  </section>

  <section class="card grid gap-5 p-5 sm:p-7" aria-labelledby="forskel">
    <h2 id="forskel" class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Forskellen</h2>
    <div class="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      <p class="m-0">
        <span class="eyebrow">Pr. måned, efter skat</span>
        <span class="mt-1 block text-h2 font-extrabold tracking-[-0.03em] tabular-nums">{kr(Math.abs(monthlyGap))}</span>
        <span class="text-small text-ink-muted">billigere med lån {cheaperNow} i første år</span>
      </p>
      <p class="m-0">
        <span class="eyebrow">Over hele løbetiden, efter skat</span>
        <span class="mt-1 block text-h2 font-extrabold tracking-[-0.03em] tabular-nums">{kr(Math.abs(totalGap))}</span>
        <span class="text-small text-ink-muted">billigere med lån {cheaperAll}, hvis renten ikke flytter sig</span>
      </p>
    </div>

    <div class="grid gap-2">
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <span class="eyebrow">Restgæld over {years} år</span>
        <span class="flex gap-4">
          <span class="eyebrow flex items-center gap-1.5"><span class="border-line inline-block size-3 rounded-[3px] border-2" style="background: var(--accent)" aria-hidden="true"></span>lån A</span>
          <span class="eyebrow flex items-center gap-1.5"><span class="border-line inline-block size-3 rounded-[3px] border-2" style="background: var(--blue)" aria-hidden="true"></span>lån B</span>
        </span>
      </div>
      <svg viewBox="0 0 {W} {H}" class="card-flat w-full" role="img" aria-label="Restgælden for begge lån falder fra omkring {kr(maxDebt)} til nul over {years} år">
        {#each [0, 0.5, 1] as f (f)}
          <line x1={PAD.l} y1={cy(maxDebt * f)} x2={W - PAD.r} y2={cy(maxDebt * f)} stroke="var(--line-soft)" stroke-width="1" />
          <text x={PAD.l - 8} y={cy(maxDebt * f) + 4} text-anchor="end" class="tick">{(Math.round((maxDebt * f) / 100000) / 10).toLocaleString("da-DK")} mio.</text>
        {/each}
        {#each [1, 10, 20, years] as y (y)}
          <text x={cx(y)} y={H - PAD.b + 16} text-anchor="middle" class="tick">år {y}</text>
        {/each}
        <path d={path(planA)} fill="none" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round" />
        <path d={path(planB)} fill="none" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round" stroke-dasharray="7 5" />
      </svg>
      <p class="text-small text-ink-muted m-0">Afdragsfrihed er den flade start. Kurstabet er grunden til, at kurven begynder over det, du fik udbetalt.</p>
    </div>

    {#if anyVariable}
      <div class="border-line grid gap-3 border-t-3 pt-5">
        <div class="flex flex-wrap items-baseline justify-between gap-3">
          <span class="eyebrow">Hvis renten stiger på det variable lån</span>
          <span class="eyebrow text-ink tabular-nums">+{shock} procentpoint</span>
        </div>
        <input type="range" min="1" max="6" step="0.5" bind:value={shock} class="accent-accent" aria-label="Rentestigning i procentpoint" />
        <dl class="m-0 grid gap-2 sm:grid-cols-2">
          <div class="card-flat flex items-baseline justify-between gap-3 px-4 py-3">
            <dt class="eyebrow">Lån A pr. måned</dt>
            <dd class="m-0 font-mono text-sm font-bold tabular-nums">{kr(shockedA.firstMonthAfterTax)}{#if !productOf(a.kind).variable}<span class="text-ink-muted font-medium">&nbsp;· uændret</span>{/if}</dd>
          </div>
          <div class="card-flat flex items-baseline justify-between gap-3 px-4 py-3">
            <dt class="eyebrow">Lån B pr. måned</dt>
            <dd class="m-0 font-mono text-sm font-bold tabular-nums">{kr(shockedB.firstMonthAfterTax)}{#if !productOf(b.kind).variable}<span class="text-ink-muted font-medium">&nbsp;· uændret</span>{/if}</dd>
          </div>
        </dl>
        <p class="text-small text-ink-muted m-0 max-w-[70ch]">
          Det er hele handlen: det faste lån betaler for at ydelsen aldrig flytter sig. Til gengæld falder restgælden på et fast lån, når renten stiger, og den kan købes tilbage under kurs 100. Det variable lån har ingen af delene.
        </p>
      </div>
    {/if}
  </section>

  <p class="text-small text-ink-muted m-0 max-w-[72ch]">
    Renter og kurser er startværdier, ikke et tilbud: sæt dine egne ind fra lånetilbuddet. Bidraget beregnes i intervaller efter hvor højt i boligens værdi gælden ligger, og lægges oven på ydelsen. Rentefradraget regnes med {pct(33.6, 1)} af de første 50.000 kr. negativ nettokapitalindkomst ({couple ? "100.000 kr. for to" : "50.000 kr. for en"}) og {pct(25.6, 1)} derover. Tinglysning, gebyrer, kursskæring, ejendomsværdiskat og grundskyld er ikke med.
  </p>
</div>

<style>
  .tick {
    fill: var(--ink-muted);
    font-family: var(--font-mono);
    font-size: 10px;
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
