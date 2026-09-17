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
	type Session,
	type State,
} from "./logic";

let state = $state<State>({
	...defaultState,
	maxes: { ...defaultState.maxes },
});
let week = $state(1);
let day = $state(1);
let ready = $state(false);
let narrow = $state(false);
let initial = "";

$effect(() => {
	const q = new URLSearchParams(location.search);
	state = decode(location.search.slice(1));
	const s = q.get("s")?.match(/^w(\d+)d(\d+)$/);
	if (s) {
		week = Number(s[1]);
		day = Number(s[2]);
	}
	initial = `${encode(state)}&s=w${week}d${day}`;
	ready = true;
	const media = window.matchMedia("(max-width: 640px)");
	const apply = () => {
		narrow = media.matches;
	};
	apply();
	media.addEventListener("change", apply);
	return () => media.removeEventListener("change", apply);
});
$effect(() => {
	if (!ready) return;
	const q = `${encode(state)}&s=w${week}d${day}`;
	/* Leave the address alone until something actually changes. */
	if (q === initial) return;
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
const weekCount = $derived(Math.max(...sessions.map((s) => s.week)));
const dayCount = $derived(programme.days);

/* Keep the selection inside the programme when it changes shape. */
$effect(() => {
	if (week > weekCount) week = weekCount;
	if (day > dayCount) day = dayCount;
});

const current = $derived<Session>(
	sessions.find((s) => s.week === week && s.day === day) ?? sessions[0],
);
const index = $derived(sessions.indexOf(current));
const name = (lift: Lift) => lifts.find((l) => l.id === lift)?.name ?? lift;
const short: Record<Lift, string> = {
	squat: "Sq",
	bench: "Bn",
	deadlift: "Dl",
	press: "Pr",
};

function go(i: number) {
	const s = sessions[Math.max(0, Math.min(sessions.length - 1, i))];
	week = s.week;
	day = s.day;
	document.getElementById("session")?.scrollIntoView({ block: "start" });
}
function bump(lift: Lift, delta: number) {
	state.maxes[lift] = Math.max(
		20,
		Math.round((state.maxes[lift] + delta) * 2) / 2,
	);
}
function pick(id: State["programme"]) {
	state.programme = id;
	week = 1;
	day = 1;
}

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

<div class="grid grid-cols-[minmax(0,1fr)] gap-10">
  <!-- Setup -->
  <div class="no-print grid gap-8">
    <fieldset class="grid gap-3">
      <legend class="eyebrow mb-3">Programme</legend>
      <div class="grid gap-3 sm:grid-cols-3">
        {#each programmes as p (p.id)}
          <button
            type="button"
            class="card-flat grid content-start gap-1.5 p-4 text-left transition-colors {state.programme === p.id ? 'bg-ink text-ground' : 'hover:bg-surface-strong'}"
            aria-pressed={state.programme === p.id}
            onclick={() => pick(p.id)}
          >
            <span class="text-h3 font-extrabold tracking-[-0.02em]">{p.name}</span>
            <span class="text-small {state.programme === p.id ? 'text-ground/80' : 'text-ink-muted'}">{p.days} days a week{p.fixedWeeks ? `, ${p.fixedWeeks} weeks` : ""}</span>
          </button>
        {/each}
      </div>
      <p class="text-body text-ink-soft m-0 max-w-[70ch] font-medium text-pretty">{programme.blurb}</p>
    </fieldset>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
      <fieldset class="grid gap-3">
        <legend class="eyebrow mb-3">Your one-rep maxes</legend>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {#each lifts as l (l.id)}
            <div class="card-flat grid gap-2 p-3">
              <label for="max-{l.id}" class="eyebrow">{l.name}</label>
              <div class="flex items-baseline gap-1">
                <input id="max-{l.id}" type="number" min="20" max="500" step="2.5" bind:value={state.maxes[l.id]} class="w-full min-w-0 bg-transparent font-sans text-[30px] leading-none font-extrabold tracking-[-0.03em] tabular-nums outline-none" />
                <span class="eyebrow">kg</span>
              </div>
              <div class="flex gap-1.5">
                <button type="button" class="stepper" onclick={() => bump(l.id, -2.5)} aria-label="{l.name} minus 2.5 kg">−</button>
                <button type="button" class="stepper" onclick={() => bump(l.id, 2.5)} aria-label="{l.name} plus 2.5 kg">+</button>
              </div>
            </div>
          {/each}
        </div>
        <p class="text-small text-ink-muted m-0">A recent, honest single. Only know a five? Multiply it by 1,17.</p>
      </fieldset>

      <div class="grid content-start gap-5">
        <fieldset class="grid gap-2">
          <legend class="eyebrow mb-2">Bar</legend>
          <div class="flex flex-wrap gap-2">
            {#each [25, 20, 15, 10] as kg (kg)}
              <button type="button" class="pill {state.bar === kg ? 'pill-active' : ''}" aria-pressed={state.bar === kg} onclick={() => (state.bar = kg)}>{kg} kg</button>
            {/each}
          </div>
        </fieldset>
        {#if programme.fixedWeeks === null}
          <label class="grid gap-2">
            <span class="eyebrow flex justify-between"><span>Weeks</span><span class="text-ink tabular-nums">{state.weeks}</span></span>
            <input type="range" min="1" max="12" step="1" bind:value={state.weeks} class="accent-accent" />
          </label>
        {/if}
        <div class="flex flex-wrap gap-2">
          <button type="button" class="pill {state.ramp ? 'pill-active' : ''}" aria-pressed={state.ramp} onclick={() => (state.ramp = !state.ramp)}>Warm-up ramps</button>
        </div>
      </div>
    </div>
  </div>

  <!-- One session, large -->
  <section id="session" class="grid gap-5 scroll-mt-6" aria-labelledby="session-title">
    <div class="no-print flex flex-wrap items-center gap-x-6 gap-y-3">
      <div class="flex items-center gap-2" role="group" aria-label="Week">
        <span class="eyebrow">Week</span>
        {#each Array.from({ length: weekCount }, (_, i) => i + 1) as w (w)}
          <button type="button" class="pill min-h-8 min-w-8 px-2.5 tabular-nums {week === w ? 'pill-active' : ''}" aria-pressed={week === w} onclick={() => (week = w)}>{w}</button>
        {/each}
      </div>
      <div class="flex items-center gap-2" role="group" aria-label="Day">
        <span class="eyebrow">Day</span>
        {#each Array.from({ length: dayCount }, (_, i) => i + 1) as d (d)}
          <button type="button" class="pill min-h-8 min-w-8 px-2.5 tabular-nums {day === d ? 'pill-active' : ''}" aria-pressed={day === d} onclick={() => (day = d)}>{d}</button>
        {/each}
      </div>
      <div class="ml-auto flex gap-2">
        <button type="button" class="pill" onclick={() => go(index - 1)} disabled={index === 0}>← Previous</button>
        <button type="button" class="pill pill-solid" onclick={() => go(index + 1)} disabled={index === sessions.length - 1}>Next session →</button>
      </div>
    </div>

    <article class="card grid gap-6 p-5 sm:p-8">
      <header class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="session-title" class="m-0 text-h2 font-extrabold tracking-[-0.03em]">Week {current.week}, day {current.day}</h2>
        <p class="eyebrow m-0">{programme.name}{current.title !== programme.name ? ` · ${current.title}` : ""} · {state.bar} kg bar</p>
      </header>

      {#each current.exercises as ex (ex.lift)}
        <div class="grid gap-4 border-t-3 border-line pt-5">
          <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">{name(ex.lift)}</h3>
            {#if ex.note}<span class="eyebrow">{ex.note}</span>{/if}
          </div>

          {#if state.ramp}
            {@const steps = ramp(ex.sets[0].weight, rack.bar, rack.stock).slice(0, -1)}
            {#if steps.length}
              <ol class="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Warm-up">
                {#each steps as st (st.label)}
                  <li class="card-flat bg-surface-strong flex items-baseline gap-3 px-3 py-2 font-mono text-[12.5px]">
                    <span class="text-ink-muted">{st.label}</span>
                    <span class="tabular-nums"><strong>{formatKg(st.loading.total)}</strong> kg × {st.reps}</span>
                  </li>
                {/each}
              </ol>
            {/if}
          {/if}

          <ol class="m-0 grid list-none gap-3 p-0">
            {#each ex.sets as set, i (i)}
              <li class="card-flat grid items-center gap-x-6 gap-y-3 p-4 sm:grid-cols-[7rem_minmax(0,1fr)_minmax(0,260px)]">
                <div>
                  <span class="eyebrow">Sets × reps</span>
                  <span class="block font-mono text-[22px] font-bold tabular-nums">{set.sets} × {set.reps}{set.amrap ? "+" : ""}</span>
                  {#if set.amrap}<span class="text-small text-ink-muted">as many as you have</span>{/if}
                </div>
                <div>
                  <span class="eyebrow">On the bar</span>
                  <span class="block text-h2 font-extrabold tracking-[-0.03em] tabular-nums">{formatKg(set.weight)} <span class="text-h3">kg</span></span>
                  <span class="text-small text-ink-muted block">
                    {#if set.perSide.length}per side, collar outwards: <strong class="text-ink font-mono">{set.perSide.map(formatKg).join(" · ")}</strong>{:else}empty bar{/if}
                    {#if Math.abs(set.weight - set.target) >= 0.25}<span> · rounded from {formatKg(Math.round(set.target * 4) / 4)}</span>{/if}
                  </span>
                </div>
                <Barbell perSide={set.perSide} bar={rack.bar} compact half />
              </li>
            {/each}
          </ol>
        </div>
      {/each}
    </article>
  </section>

  <!-- Whole cycle at a glance -->
  <section class="grid gap-4" aria-labelledby="overview-title">
    <div class="flex flex-wrap items-baseline justify-between gap-3">
      <h2 id="overview-title" class="m-0 text-h3 font-extrabold tracking-[-0.02em]">The whole cycle</h2>
      <div class="no-print flex gap-2">
        <button type="button" class="pill" onclick={() => window.print()}>Print</button>
        <button type="button" class="pill" onclick={share}>{copied ? "Link copied" : "Copy link"}</button>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full min-w-[340px] border-separate border-spacing-1.5 font-mono text-[12px]">
        <thead>
          <tr>
            <th scope="col" class="eyebrow text-left font-normal">Week</th>
            {#each Array.from({ length: dayCount }, (_, i) => i + 1) as d (d)}
              <th scope="col" class="eyebrow text-left font-normal">Day {d}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each Array.from({ length: weekCount }, (_, i) => i + 1) as w (w)}
            <tr>
              <th scope="row" class="eyebrow text-left font-normal tabular-nums">{w}</th>
              {#each sessions.filter((s) => s.week === w) as s (s.day)}
                <td class="p-0">
                  <button
                    type="button"
                    class="card-flat grid w-full content-start gap-0.5 px-2.5 py-2 text-left {s === current ? 'bg-ink text-ground' : 'hover:bg-surface-strong'}"
                    aria-pressed={s === current}
                    aria-label="Week {s.week}, day {s.day}"
                    onclick={() => go(sessions.indexOf(s))}
                  >
                    {#each s.exercises as ex (ex.lift)}
                      {@const top = ex.sets[ex.sets.length - 1]}
                      <span class="flex justify-between gap-2 tabular-nums"><span class="{s === current ? 'text-ground/70' : 'text-ink-muted'}">{narrow ? short[ex.lift] : name(ex.lift)}</span><span>{formatKg(top.weight)}{top.amrap ? "+" : ""}</span></span>
                    {/each}
                  </button>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="text-small text-ink-muted m-0 max-w-[62ch]">Top set of each lift per session. Click one to open it. The link in your address bar holds everything, including the session you are on.</p>
  </section>

  <!-- Print: every session, compact -->
  <section class="print-only hidden">
    <p class="eyebrow m-0">{programme.name} · bar {state.bar} kg · {lifts.map((l) => `${l.name} ${state.maxes[l.id]}`).join(" · ")}</p>
    <div class="mt-4 grid grid-cols-2 gap-3">
      {#each sessions as s (`${s.week}-${s.day}`)}
        <div class="break-inside-avoid rounded-xl border p-3 font-mono text-[11px]">
          <p class="m-0 mb-1 font-bold">Week {s.week} · Day {s.day} · {s.title}</p>
          {#each s.exercises as ex (ex.lift)}
            <p class="m-0"><strong>{name(ex.lift)}</strong> {ex.sets.map((x) => `${x.sets}×${x.reps}${x.amrap ? "+" : ""} @ ${formatKg(x.weight)}`).join(", ")}</p>
            {#each ex.sets as x, i (i)}
              <p class="m-0 text-[10px] opacity-70">{formatKg(x.weight)} kg: {x.perSide.length ? x.perSide.map(formatKg).join(" · ") : "bar"}</p>
            {/each}
          {/each}
        </div>
      {/each}
    </div>
  </section>
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
  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
  input[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
  @media print {
    :global(header),
    :global(footer),
    :global(nav) {
      display: none !important;
    }
    :global(main) {
      max-width: none !important;
      padding: 0 !important;
    }
    .no-print,
    #session {
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
