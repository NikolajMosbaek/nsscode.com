<script lang="ts">
import Barbell from "../plates/Barbell.svelte";
import { formatKg, ramp, standardStock } from "../plates/logic";
import {
	build,
	decode,
	defaultState,
	encode,
	type Lift,
	lifts,
	programmes,
	type Rack,
	type State,
} from "./logic";

let state = $state<State>({
	...defaultState,
	maxes: { ...defaultState.maxes },
});
let showPlates = $state(true);
let ready = $state(false);

$effect(() => {
	state = decode(location.search.slice(1));
	ready = true;
});
$effect(() => {
	if (!ready) return;
	const q = encode(state);
	history.replaceState(null, "", `${location.pathname}?${q}${location.hash}`);
});

const programme = $derived(
	programmes.find((p) => p.id === state.programme) ?? programmes[0],
);
const rack = $derived<Rack>({
	bar: state.bar,
	stock: standardStock.map((p) => ({ ...p })),
});
const sessions = $derived(
	build(state.programme, state.maxes, rack, state.weeks),
);
const weeks = $derived(
	Array.from(new Set(sessions.map((s) => s.week))).map((w) => ({
		week: w,
		sessions: sessions.filter((s) => s.week === w),
	})),
);
const name = (lift: Lift) => lifts.find((l) => l.id === lift)?.name ?? lift;

let copied = $state(false);
async function share() {
	try {
		await navigator.clipboard.writeText(location.href);
		copied = true;
		setTimeout(() => (copied = false), 1600);
	} catch {
		copied = false;
	}
}
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-12 lg:gap-x-10">
  <form class="no-print grid min-w-0 content-start gap-5 lg:col-span-4" onsubmit={(e) => e.preventDefault()}>
    <fieldset class="grid gap-2">
      <legend class="eyebrow mb-2">Programme</legend>
      <div class="flex flex-wrap gap-2">
        {#each programmes as p (p.id)}
          <button type="button" class="pill {state.programme === p.id ? 'pill-active' : ''}" aria-pressed={state.programme === p.id} onclick={() => (state.programme = p.id)}>{p.name}</button>
        {/each}
      </div>
      <p class="text-small text-ink-muted m-0">{programme.blurb}</p>
    </fieldset>

    <fieldset class="grid gap-2">
      <legend class="eyebrow mb-2">Your one-rep maxes, kg</legend>
      <div class="grid grid-cols-2 gap-2">
        {#each lifts as l (l.id)}
          <label class="card-flat grid gap-0.5 px-3 py-2">
            <span class="eyebrow">{l.name}</span>
            <input type="number" min="20" max="500" step="2.5" bind:value={state.maxes[l.id]} class="w-full min-w-0 bg-transparent font-sans text-[22px] leading-none font-extrabold tabular-nums outline-none" />
          </label>
        {/each}
      </div>
      <p class="text-small text-ink-muted m-0">A recent, honest single. If you only know a five, multiply by 1,17. Everything below is derived from these.</p>
    </fieldset>

    {#if programme.fixedWeeks === null}
      <label class="grid gap-2">
        <span class="eyebrow flex justify-between"><span>Weeks</span><span class="text-ink tabular-nums">{state.weeks}</span></span>
        <input type="range" min="1" max="12" step="1" bind:value={state.weeks} class="accent-accent" />
      </label>
    {/if}

    <fieldset class="grid gap-2">
      <legend class="eyebrow mb-2">Bar</legend>
      <div class="flex flex-wrap gap-2">
        {#each [25, 20, 15, 10] as kg (kg)}
          <button type="button" class="pill {state.bar === kg ? 'pill-active' : ''}" aria-pressed={state.bar === kg} onclick={() => (state.bar = kg)}>{kg} kg</button>
        {/each}
      </div>
      <p class="text-small text-ink-muted m-0">Plates are the standard pair set: 25, 20, 15 (one), 10, 5, 2,5 and 1,25 per side. Weights are rounded to the nearest thing that loads.</p>
    </fieldset>

    <div class="flex flex-wrap gap-2">
      <button type="button" class="pill {state.ramp ? 'pill-active' : ''}" aria-pressed={state.ramp} onclick={() => (state.ramp = !state.ramp)}>Warm-up ramps</button>
      <button type="button" class="pill {showPlates ? 'pill-active' : ''}" aria-pressed={showPlates} onclick={() => (showPlates = !showPlates)}>Show plates</button>
    </div>

    <div class="flex flex-wrap gap-2">
      <button type="button" class="pill pill-solid" onclick={() => window.print()}>Print</button>
      <button type="button" class="pill" onclick={share}>{copied ? "Link copied" : "Copy link"}</button>
    </div>
    <p class="text-small text-ink-muted m-0">The link holds everything on this page. Nothing is stored anywhere else.</p>
  </form>

  <div class="grid min-w-0 content-start gap-6 lg:col-span-8">
    <div class="print-only hidden">
      <p class="eyebrow m-0">{programme.name} · bar {state.bar} kg</p>
      <p class="m-0 font-mono text-sm">{lifts.map((l) => `${l.name} ${state.maxes[l.id]}`).join(" · ")}</p>
    </div>
    {#each weeks as w (w.week)}
      <section class="grid gap-3 break-inside-avoid" aria-labelledby="week-{w.week}">
        <h2 id="week-{w.week}" class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Week {w.week}</h2>
        <div class="grid gap-3 {programme.days === 4 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}">
          {#each w.sessions as s (`${s.week}-${s.day}`)}
            <article class="card-flat grid min-w-0 content-start gap-3 p-4 break-inside-avoid">
              <p class="m-0 flex items-baseline justify-between gap-2"><span class="eyebrow">Day {s.day}</span><span class="eyebrow text-ink-muted">{s.title}</span></p>
              {#each s.exercises as ex (ex.lift)}
                <div class="grid gap-2">
                  <p class="m-0 flex items-baseline justify-between gap-2">
                    <span class="font-bold">{name(ex.lift)}</span>
                    {#if ex.note}<span class="text-small text-ink-muted">{ex.note}</span>{/if}
                  </p>
                  {#if state.ramp}
                    {@const steps = ramp(ex.sets[0].weight, rack.bar, rack.stock).slice(0, -1)}
                    {#if steps.length}
                      <ol class="m-0 grid list-none gap-0.5 p-0 font-mono text-[11.5px] text-ink-muted">
                        {#each steps as st (st.label)}
                          <li class="flex justify-between gap-2"><span>{st.label}</span><span class="tabular-nums">{formatKg(st.loading.total)} kg × {st.reps}</span></li>
                        {/each}
                      </ol>
                    {/if}
                  {/if}
                  <ol class="m-0 grid list-none gap-1.5 p-0">
                    {#each ex.sets as set, i (i)}
                      <li class="grid gap-1">
                        <div class="flex items-baseline justify-between gap-2 font-mono text-sm">
                          <span class="tabular-nums">{set.sets} × {set.reps}{set.amrap ? "+" : ""}</span>
                          <span class="font-bold tabular-nums">{formatKg(set.weight)} kg</span>
                        </div>
                        {#if showPlates}
                          <div class="grid grid-cols-[minmax(0,1fr)_88px] items-center gap-2">
                            <span class="text-ink-muted truncate font-mono text-[11px]">{set.perSide.length ? set.perSide.map(formatKg).join(" · ") : "empty bar"}</span>
                            <Barbell perSide={set.perSide} bar={rack.bar} compact half />
                          </div>
                        {/if}
                      </li>
                    {/each}
                  </ol>
                </div>
              {/each}
            </article>
          {/each}
        </div>
      </section>
    {/each}
    <p class="text-small text-ink-muted m-0 max-w-[62ch] no-print">
      Per side, collar outwards, one side drawn. A plus after the reps means as many as you have in you with good form. Weights that will not load exactly are moved to the nearest that will, so a 5/3/1 percentage may read 2,5 kg off. That is the plates, not the maths.
    </p>
  </div>
</div>

<style>
  @media print {
    :global(header),
    :global(footer),
    :global(.skip-link),
    :global(nav) {
      display: none !important;
    }
    :global(main) {
      max-width: none !important;
      padding: 0 !important;
    }
    .no-print {
      display: none !important;
    }
    .print-only {
      display: block !important;
    }
    :global(.card),
    :global(.card-flat) {
      box-shadow: none !important;
      border-width: 1px !important;
    }
  }
</style>
