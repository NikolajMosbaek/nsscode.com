<script lang="ts">
import {
	brackets,
	compute,
	type Input,
	kr,
	marginal,
	marginalCurve,
	pct,
	rates2026 as r,
} from "./logic";
import { kommuner } from "./rates-2026";

let monthly = $state(true);
let narrow = $state(false);
$effect(() => {
	const media = window.matchMedia("(max-width: 640px)");
	const apply = () => {
		narrow = media.matches;
	};
	apply();
	media.addEventListener("change", apply);
	return () => media.removeEventListener("change", apply);
});
let salaryYear = $state(600_000);
let pensionPct = $state(0);
let kommuneskat = $state(25.0);
let kirke = $state(false);
let kirkeskat = $state(0.87);

const input = $derived<Input>({
	salary: salaryYear,
	pensionShare: pensionPct / 100,
	kommuneskat: kommuneskat / 100,
	kirkeskat: kirkeskat / 100,
	kirke,
});
const b = $derived(compute(input));
const m = $derived(marginal(input));
const bs = $derived(brackets(input.pensionShare));
const next = $derived(bs.find((x) => x.from > salaryYear && x.id !== "bund"));
const div = $derived(monthly ? 12 : 1);
const show = (v: number) => kr(v / div);

function setSalary(v: number) {
	salaryYear = Math.max(0, Math.round(monthly ? v * 12 : v));
}

/* Where each krone goes, as segments of one bar. Labels carry identity; colour helps. */
const segments = $derived(
	[
		{ id: "net", label: "til dig", value: b.net, colour: "var(--green)" },
		{
			id: "pension",
			label: "pension",
			value: b.pension,
			colour: "var(--blue)",
		},
		{
			id: "am",
			label: "AM-bidrag",
			value: b.am,
			colour: "var(--surface-strong)",
		},
		{
			id: "kommune",
			label: "kommune",
			value: b.kommune + b.kirke,
			colour: "var(--yellow)",
		},
		{
			id: "bund",
			label: "bundskat",
			value: b.bund,
			colour: "oklch(0.82 0.1 30)",
		},
		{
			id: "mellem",
			label: "mellemskat",
			value: b.mellem,
			colour: "oklch(0.72 0.17 30)",
		},
		{
			id: "top",
			label: "topskat",
			value: b.top,
			colour: "oklch(0.58 0.19 30)",
		},
		{
			id: "topTop",
			label: "top-topskat",
			value: b.topTop,
			colour: "oklch(0.42 0.16 30)",
		},
	].filter((s) => s.value > 0),
);

/* Marginal rate across the range, with the current salary marked. */
const MAX = 3_400_000;
const curve = $derived(marginalCurve(input, MAX, 170));
const CW = $derived(narrow ? 360 : 640);
const CH = $derived(narrow ? 220 : 220);
const PAD = { l: 40, r: 12, t: 16, b: 30 };
const cx = (s: number) => PAD.l + (s / MAX) * (CW - PAD.l - PAD.r);
const cy = (v: number) => CH - PAD.b - (v / 0.7) * (CH - PAD.t - PAD.b);
const curvePath = $derived(
	curve
		.map(
			([s, v], i) =>
				`${i === 0 ? "M" : "L"} ${cx(s).toFixed(1)} ${cy(v).toFixed(1)}`,
		)
		.join(" "),
);
let hover = $state<number | null>(null);
const hoverPoint = $derived(hover === null ? null : curve[hover]);
function onMove(e: PointerEvent) {
	const svg = e.currentTarget as SVGSVGElement;
	const rect = svg.getBoundingClientRect();
	const x = ((e.clientX - rect.left) / rect.width) * CW;
	const s = ((x - PAD.l) / (CW - PAD.l - PAD.r)) * MAX;
	hover = Math.max(
		0,
		Math.min(curve.length - 1, Math.round((s / MAX) * (curve.length - 1))),
	);
}
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-12 lg:gap-x-10">
  <form class="grid min-w-0 content-start gap-5 lg:col-span-4" onsubmit={(e) => e.preventDefault()}>
    <div class="grid gap-2">
      <div class="flex items-center justify-between gap-3">
        <label for="topskat-salary" class="eyebrow">Bruttoløn før skat</label>
        <div class="flex gap-1.5" role="group" aria-label="Periode">
          <button type="button" class="pill min-h-7 px-2.5 text-[11px] {monthly ? 'pill-active' : ''}" aria-pressed={monthly} onclick={() => (monthly = true)}>pr. måned</button>
          <button type="button" class="pill min-h-7 px-2.5 text-[11px] {!monthly ? 'pill-active' : ''}" aria-pressed={!monthly} onclick={() => (monthly = false)}>pr. år</button>
        </div>
      </div>
      <div class="card-flat flex items-baseline gap-2 px-4 py-2">
        <input
          id="topskat-salary"
          type="number"
          inputmode="numeric"
          min="0"
          step={monthly ? 500 : 5000}
          value={Math.round(salaryYear / div)}
          oninput={(e) => setSalary(Number(e.currentTarget.value))}
          class="w-full min-w-0 bg-transparent font-sans text-[34px] leading-none font-extrabold tracking-[-0.03em] tabular-nums outline-none"
        />
        <span class="eyebrow">kr.</span>
      </div>
      <input type="range" min="0" max={MAX} step="1000" bind:value={salaryYear} class="accent-accent" aria-label="Bruttoløn pr. år" />
      <span class="text-small text-ink-muted">Inklusive eget pensionsbidrag. Fri bil, aktier og kapitalindkomst er ikke med.</span>
    </div>

    <label class="grid gap-2">
      <span class="eyebrow flex justify-between"><span>Pension af lønnen</span><span class="text-ink tabular-nums">{pensionPct} %</span></span>
      <input type="range" min="0" max="30" step="1" bind:value={pensionPct} class="accent-accent" />
      <span class="text-small text-ink-muted">Egen ratepension eller livrente trukket før skat. Arbejdsgiverens bidrag oven i lønnen tæller ikke her.</span>
    </label>

    <fieldset class="grid gap-2">
      <legend class="eyebrow mb-2">Kommuneskat</legend>
      <div class="flex flex-wrap gap-2">
        {#each kommuner as k (k.name)}
          <button type="button" class="pill min-h-8 px-3 text-[11px] {Math.abs(kommuneskat - k.rate * 100) < 0.005 ? 'pill-active' : ''}" aria-pressed={Math.abs(kommuneskat - k.rate * 100) < 0.005} onclick={() => (kommuneskat = k.rate * 100)}>{k.name} {(k.rate * 100).toFixed(2)}</button>
        {/each}
      </div>
      <label class="flex items-center gap-2">
        <input type="number" min="20" max="28" step="0.01" bind:value={kommuneskat} class="card-flat w-24 px-3 py-1.5 font-mono text-sm" aria-label="Kommuneskat i procent" />
        <span class="text-small text-ink-muted">%. Din egen står på forskudsopgørelsen.</span>
      </label>
    </fieldset>

    <div class="flex flex-wrap items-center gap-2.5">
      <button type="button" class="pill {kirke ? 'pill-active' : ''}" aria-pressed={kirke} onclick={() => (kirke = !kirke)}>Kirkeskat</button>
      {#if kirke}
        <input type="number" min="0.3" max="1.5" step="0.01" bind:value={kirkeskat} class="card-flat w-20 px-3 py-1.5 font-mono text-sm" aria-label="Kirkeskat i procent" />
        <span class="text-small text-ink-muted">%</span>
      {:else}
        <span class="text-small text-ink-muted">Kun medlemmer af folkekirken.</span>
      {/if}
    </div>
  </form>

  <div class="grid min-w-0 gap-6 lg:col-span-8">
    <section class="card grid gap-5 p-5 sm:p-7" aria-live="polite">
      <div class="grid gap-x-8 gap-y-4 sm:grid-cols-3">
        <div>
          <p class="eyebrow m-0">Udbetalt {monthly ? "pr. måned" : "pr. år"}</p>
          <p class="m-0 text-h2 font-extrabold tracking-[-0.03em] tabular-nums">{show(b.net)}</p>
        </div>
        <div>
          <p class="eyebrow m-0">Skat i alt</p>
          <p class="m-0 text-h3 font-extrabold tabular-nums">{show(b.tax)}</p>
          <p class="text-small text-ink-muted m-0">{pct(b.effective)} af lønnen</p>
        </div>
        <div>
          <p class="eyebrow m-0">Af den næste krone</p>
          <p class="m-0 text-h3 font-extrabold tabular-nums">{pct(m)}</p>
          <p class="text-small text-ink-muted m-0">Af 1.000 kr. mere beholder du {kr(1000 * (1 - m))}</p>
        </div>
      </div>

      <div class="grid gap-2">
        <div class="flex h-9 w-full overflow-hidden rounded-xl border-3 border-line bg-ground" role="img" aria-label={segments.map((s) => `${s.label} ${kr(s.value / div)}`).join(", ")}>
          {#each segments as s (s.id)}
            <span class="h-full border-r-2 border-ground last:border-r-0" style="width: {(s.value / (b.salary || 1)) * 100}%; background: {s.colour}" title="{s.label}: {kr(s.value / div)}"></span>
          {/each}
        </div>
        <ul class="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0" aria-label="Fordeling">
          {#each segments as s (s.id)}
            <li class="eyebrow flex items-center gap-1.5">
              <span class="inline-block size-3 rounded-[3px] border-2 border-line" style="background: {s.colour}" aria-hidden="true"></span>
              {s.label} <span class="text-ink tabular-nums">{pct(s.value / (b.salary || 1), s.value / (b.salary || 1) < 0.01 ? 1 : 0)}</span>
            </li>
          {/each}
        </ul>
      </div>

      {#if next}
        <p class="bg-yellow text-accent-ink border-line m-0 rounded-xl border-3 px-4 py-3 text-sm font-medium">
          {kr((next.from - salaryYear) / div)} {monthly ? "mere om måneden" : "mere om året"} før {next.label} sætter ind, ved en bruttoløn på {show(next.from)}.
        </p>
      {:else}
        <p class="bg-yellow text-accent-ink border-line m-0 rounded-xl border-3 px-4 py-3 text-sm font-medium">Du er over alle grænser. Der er ikke flere trin.</p>
      {/if}
    </section>

    <div class="grid gap-2">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <span class="eyebrow">Marginalskat ved hver bruttoløn</span>
        <span class="eyebrow text-ink-muted tabular-nums">{hoverPoint ? `${kr(hoverPoint[0])} pr. år → ${pct(hoverPoint[1])}` : "peg på kurven"}</span>
      </div>
      <svg
        viewBox="0 0 {CW} {CH}"
        class="card-flat w-full touch-none"
        role="img"
        aria-label="Marginalskat fra 0 til 3,4 millioner kroner om året. Din løn er markeret."
        onpointermove={onMove}
        onpointerleave={() => (hover = null)}
      >
        {#each [0, 0.2, 0.4, 0.6] as v (v)}
          <line x1={PAD.l} y1={cy(v)} x2={CW - PAD.r} y2={cy(v)} stroke="var(--line-soft)" stroke-width="1" />
          <text x={PAD.l - 6} y={cy(v) + 4} text-anchor="end" class="tick">{Math.round(v * 100)}</text>
        {/each}
        {#each bs.filter((x) => x.id !== "bund") as br (br.id)}
          <line x1={cx(br.from)} y1={PAD.t} x2={cx(br.from)} y2={CH - PAD.b} stroke="var(--line-soft)" stroke-width="1.5" stroke-dasharray="3 4" />
          {#if !narrow}
            <text x={cx(br.from) + (br.id === "mellem" ? -4 : 4)} y={PAD.t + 10} text-anchor={br.id === "mellem" ? "end" : "start"} class="tick">{br.label}</text>
          {/if}
        {/each}
        {#each [0, 1, 2, 3] as mio (mio)}
          <text x={cx(mio * 1_000_000)} y={CH - PAD.b + 16} text-anchor="middle" class="tick">{mio} mio.</text>
        {/each}
        <path d={curvePath} fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round" />
        <line x1={cx(Math.min(salaryYear, MAX))} y1={PAD.t} x2={cx(Math.min(salaryYear, MAX))} y2={CH - PAD.b} stroke="var(--accent)" stroke-width="2.5" />
        <circle cx={cx(Math.min(salaryYear, MAX))} cy={cy(m)} r="6" fill="var(--accent)" stroke="var(--line)" stroke-width="3" />
        {#if hoverPoint}
          <circle cx={cx(hoverPoint[0])} cy={cy(hoverPoint[1])} r="5" fill="var(--ground)" stroke="var(--ink)" stroke-width="2.5" />
        {/if}
      </svg>
      <ul class="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0" aria-label="Trin">
        {#each bs.filter((x) => x.id !== "bund") as br (br.id)}
          <li class="eyebrow">{br.label} <span class="text-ink tabular-nums">fra {show(br.from)}</span></li>
        {/each}
      </ul>
      <p class="text-small text-ink-muted m-0 max-w-[62ch]">
        Marginalskatten er, hvad staten og kommunen tager af den næste krone. Den er lav i starten, fordi beskæftigelsesfradraget vokser med lønnen, og springer ved hvert trin. Det er de spring, folk kalder "at ramme topskatten".
      </p>
    </div>

    <details class="card-flat p-4">
      <summary class="eyebrow cursor-pointer">Regnestykket, linje for linje</summary>
      <table class="mt-3 w-full border-collapse font-mono text-[12.5px]">
        <tbody>
          {#each [
            ["Bruttoløn", b.salary],
            ["− pension", -b.pension],
            ["− AM-bidrag 8 %", -b.am],
            ["= personlig indkomst", b.personligIndkomst],
            ["beskæftigelsesfradrag 12,75 %, maks. 63.300", b.beskaeftigelsesfradrag],
            ["jobfradrag 4,5 % over 235.200, maks. 3.100", b.jobfradrag],
            ["personfradrag", r.personfradrag],
            ["= skattepligtig indkomst (kommune)", b.skattepligtigIndkomst],
            ["bundskat 12,01 % af personlig indkomst − personfradrag", b.bund],
            [`mellemskat ${pct(b.effectiveRates.mellem, 2)} over 641.200`, b.mellem],
            [`topskat ${pct(b.effectiveRates.top, 2)} over 777.900`, b.top],
            [`top-topskat ${pct(b.effectiveRates.topTop, 2)} over 2.592.700`, b.topTop],
            [`kommuneskat ${kommuneskat.toFixed(2)} %`, b.kommune],
            ...(kirke ? [[`kirkeskat ${kirkeskat.toFixed(2)} %`, b.kirke] as [string, number]] : []),
            ["= skat i alt", b.tax],
            ["= udbetalt", b.net],
          ] as [label, value] (label)}
            <tr class="border-b border-line-soft last:border-0">
              <th scope="row" class="py-1.5 pr-3 text-left font-medium text-ink-muted">{label}</th>
              <td class="py-1.5 text-right tabular-nums {String(label).startsWith('=') ? 'font-bold' : ''}">{show(Number(value))}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <p class="text-small text-ink-muted m-0 mt-3">Grænserne er i personlig indkomst efter AM-bidrag. Skatteloftet på {pct(r.loft.mellem, 2)} / {pct(r.loft.top, 2)} / {pct(r.loft.topTop, 2)} skærer mellem-, top- og top-topskatten ned i kommuner med høj skat.</p>
    </details>

    <p class="text-small text-ink-muted m-0 max-w-[70ch]">
      Satser for {r.year} fra Skatteministeriet. En forenklet lønmodtagermodel: ingen kapitalindkomst, aktieindkomst, befordring, fagforening eller overført personfradrag fra en ægtefælle. Tallene rammer forskudsopgørelsen tæt for de fleste, men de er ikke den.
    </p>
  </div>
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
