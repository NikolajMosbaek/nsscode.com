<script lang="ts">
import Code from "../../components/Code.svelte";
import {
	compose,
	css,
	derive,
	formatNumber,
	framer,
	fromBounce,
	overshoot,
	presets,
	samples,
	settleTime,
	swift,
	toLinear,
} from "./logic";

let response = $state(0.55);
let dampingFraction = $state(0.825);
let mode = $state<"response" | "bounce">("response");
let demo = $state<"slide" | "scale">("slide");

const spec = $derived({ response, dampingFraction });
const d = $derived(derive(spec));
const settle = $derived(settleTime(spec));
const peak = $derived(overshoot(spec));
const linear = $derived(toLinear(spec));
const active = $derived(
	presets.find(
		(p) =>
			Math.abs(p.spec.response - response) < 1e-6 &&
			Math.abs(p.spec.dampingFraction - dampingFraction) < 1e-6,
	)?.slug,
);

/* Bounce-mode sliders write through to response and damping. */
const bounce = $derived(d.bounce);
function setBounce(b: number) {
	const s = fromBounce(response, b);
	dampingFraction = Math.round(s.dampingFraction * 1000) / 1000;
}

/* Curve geometry. Time runs to the settle time; y runs from 0 to a bit past the peak. */
const W = 420;
const H = 220;
const PAD = 28;
const yMax = $derived(Math.max(1.3, peak + 0.1));
const sx = (t: number) => PAD + (t / settle) * (W - PAD * 2);
const sy = (y: number) => H - PAD - (y / yMax) * (H - PAD * 2);
const path = $derived(
	samples(spec, 160, settle)
		.map(
			([t, y], i) =>
				`${i === 0 ? "M" : "L"} ${sx(t).toFixed(1)} ${sy(y).toFixed(1)}`,
		)
		.join(" "),
);

const timing = $derived(`linear(${linear.stops})`);
const duration = $derived(`${linear.duration}s`);
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-12 lg:gap-x-10">
  <div class="grid min-w-0 content-start gap-6 lg:col-span-4">
    <fieldset class="grid gap-2.5">
      <legend class="eyebrow mb-2">Presets</legend>
      <div class="flex flex-wrap gap-2">
        {#each presets as p (p.slug)}
          <button
            type="button"
            class="pill min-h-9 px-3.5 font-mono text-[12px] {active === p.slug ? 'pill-active' : ''}"
            aria-pressed={active === p.slug}
            title={p.note}
            onclick={() => {
              response = p.spec.response;
              dampingFraction = Math.round(p.spec.dampingFraction * 1000) / 1000;
            }}
          >{p.name}</button>
        {/each}
      </div>
    </fieldset>

    <div class="flex flex-wrap gap-2" role="group" aria-label="Parameterisation">
      <button type="button" class="pill min-h-8 px-3 text-[11px] {mode === 'response' ? 'pill-active' : ''}" aria-pressed={mode === "response"} onclick={() => (mode = "response")}>response · damping</button>
      <button type="button" class="pill min-h-8 px-3 text-[11px] {mode === 'bounce' ? 'pill-active' : ''}" aria-pressed={mode === "bounce"} onclick={() => (mode = "bounce")}>duration · bounce</button>
    </div>

    <label class="grid gap-2">
      <span class="eyebrow flex justify-between"><span>{mode === "response" ? "Response" : "Duration"} <span class="text-ink-muted">seconds</span></span><span class="text-ink tabular-nums">{formatNumber(response)} s</span></span>
      <input type="range" min="0.1" max="2" step="0.01" bind:value={response} class="accent-accent" />
      <span class="text-small text-ink-muted">One full swing of the undamped spring. Lower is stiffer and faster.</span>
    </label>

    {#if mode === "response"}
      <label class="grid gap-2">
        <span class="eyebrow flex justify-between"><span>Damping fraction</span><span class="text-ink tabular-nums">{formatNumber(dampingFraction, 3)}</span></span>
        <input type="range" min="0.1" max="1.5" step="0.005" bind:value={dampingFraction} class="accent-accent" />
        <span class="text-small text-ink-muted">Below 1 it overshoots. At 1 it just kisses the target. Above 1 it is slow and never bounces.</span>
      </label>
    {:else}
      <label class="grid gap-2">
        <span class="eyebrow flex justify-between"><span>Bounce</span><span class="text-ink tabular-nums">{formatNumber(bounce, 3)}</span></span>
        <input type="range" min="-0.5" max="0.9" step="0.01" value={bounce} oninput={(e) => setBounce(Number(e.currentTarget.value))} class="accent-accent" />
        <span class="text-small text-ink-muted">Apple's iOS 17 knob. 0 is no bounce, 0.3 is a lot, negative is sluggish.</span>
      </label>
    {/if}

    <dl class="card-flat m-0 grid grid-cols-2 gap-x-4 gap-y-3 p-4">
      <div><dt class="eyebrow">Settles in</dt><dd class="m-0 font-mono text-sm font-bold tabular-nums">{formatNumber(settle)} s</dd></div>
      <div><dt class="eyebrow">Overshoot</dt><dd class="m-0 font-mono text-sm font-bold tabular-nums">{peak > 1.001 ? `${formatNumber((peak - 1) * 100, 1)} %` : "none"}</dd></div>
      <div><dt class="eyebrow">Stiffness</dt><dd class="m-0 font-mono text-sm font-bold tabular-nums">{formatNumber(d.stiffness, 1)}</dd></div>
      <div><dt class="eyebrow">Damping</dt><dd class="m-0 font-mono text-sm font-bold tabular-nums">{formatNumber(d.damping, 2)}</dd></div>
    </dl>
  </div>

  <div class="grid min-w-0 gap-6 lg:col-span-8">
    <div class="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div class="grid content-start gap-2">
        <span class="eyebrow">Position over time</span>
        <svg viewBox="0 0 {W} {H}" class="card-flat w-full" role="img" aria-label="Spring position over {formatNumber(settle)} seconds, peaking at {formatNumber(peak)}">
          <line x1={PAD} y1={sy(1)} x2={W - PAD} y2={sy(1)} stroke="var(--line-soft)" stroke-width="2" stroke-dasharray="4 4" />
          <line x1={PAD} y1={sy(0)} x2={W - PAD} y2={sy(0)} stroke="var(--line-soft)" stroke-width="2" />
          <text x={PAD} y={sy(1) - 6} class="tick">target</text>
          <text x={W - PAD} y={sy(0) + 18} text-anchor="end" class="tick">{formatNumber(settle)} s</text>
          <text x={PAD} y={sy(0) + 18} class="tick">0</text>
          <path d={path} fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx={sx(settle)} cy={sy(1)} r="6" fill="var(--accent)" stroke="var(--line)" stroke-width="3" />
        </svg>
      </div>

      <div class="grid content-start gap-3">
        <div class="flex items-center justify-between gap-3">
          <span class="eyebrow">Preview</span>
          <div class="flex gap-1.5" role="group" aria-label="Demo">
            <button type="button" class="pill min-h-7 px-2.5 text-[11px] {demo === 'slide' ? 'pill-active' : ''}" aria-pressed={demo === "slide"} onclick={() => (demo = "slide")}>slide</button>
            <button type="button" class="pill min-h-7 px-2.5 text-[11px] {demo === 'scale' ? 'pill-active' : ''}" aria-pressed={demo === "scale"} onclick={() => (demo = "scale")}>scale</button>
          </div>
        </div>
        <div class="card-flat relative h-24 overflow-hidden [container-type:inline-size]">
          {#if demo === "slide"}
            <span aria-hidden="true" class="bg-accent border-line absolute top-1/2 left-3 size-9 -translate-y-1/2 rounded-xl border-3 motion-safe:animate-[springslide_var(--dur)_infinite_alternate]" style="--dur: {duration}; animation-timing-function: {timing}; animation-delay: 0s;"></span>
          {:else}
            <span aria-hidden="true" class="bg-blue border-line absolute top-1/2 left-1/2 size-9 -translate-1/2 rounded-xl border-3 motion-safe:animate-[springscale_var(--dur)_infinite_alternate]" style="--dur: {duration}; animation-timing-function: {timing};"></span>
          {/if}
        </div>
        <p class="text-small text-ink-muted m-0">
          The preview runs on the CSS below, not on JavaScript, so what you see here is what the browser will do with it. Back and forth, each way on the spring.
        </p>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <Code code={swift(spec)} file="SwiftUI" />
      <Code code={css(spec)} file="CSS" />
      <Code code={compose(spec)} file="Jetpack Compose" />
      <Code code={framer(spec)} file="Framer Motion" />
    </div>

    <p class="text-small text-ink-muted m-0 max-w-[62ch]">
      All four describe the same physical spring with unit mass: stiffness is (2π / response)², damping is 2 · ζ · 2π / response. CSS has no spring, so the curve is sampled into <span class="font-mono">linear()</span> stops over the settle time, dropping points a straight line already covers. Apple's <span class="font-mono">bounce</span> is 1 − ζ, and its <span class="font-mono">duration</span> is the same number as <span class="font-mono">response</span>.
    </p>
  </div>
</div>

<style>
  .tick {
    fill: var(--ink-muted);
    font-family: var(--font-mono);
    font-size: 11px;
  }
  @keyframes -global-springslide {
    to {
      transform: translate(calc(100cqw - 3.75rem), -50%);
    }
  }
  @keyframes -global-springscale {
    from {
      transform: translate(-50%, -50%) scale(0.4);
    }
    to {
      transform: translate(-50%, -50%) scale(1.6);
    }
  }
</style>
