<script lang="ts">
import { ramp, toCustomProperties } from "./logic";

let hue = $state(28);
let chroma = $state(0.16);
let steps = $state(9);
let prefix = $state("accent");
let copied = $state(false);

const swatches = $derived(ramp({ hue, chroma, steps }));
const css = $derived(toCustomProperties(prefix.trim() || "color", swatches));
const hueStrip = Array.from(
	{ length: 13 },
	(_, i) => `oklch(0.7 0.15 ${i * 30})`,
).join(", ");

async function copy() {
	try {
		await navigator.clipboard.writeText(css);
		copied = true;
		setTimeout(() => (copied = false), 1600);
	} catch {
		copied = false;
	}
}
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-12 lg:gap-x-10">
  <form class="grid min-w-0 gap-6 lg:col-span-4" onsubmit={(e) => e.preventDefault()}>
    <label class="grid gap-2">
      <span class="eyebrow flex justify-between"><span>Hue</span><span class="text-ink tabular-nums">{hue}°</span></span>
      <input type="range" min="0" max="360" step="1" bind:value={hue} class="accent-accent" />
      <span class="hue-strip" style="background: linear-gradient(90deg, {hueStrip})" aria-hidden="true"></span>
    </label>
    <label class="grid gap-2">
      <span class="eyebrow flex justify-between"><span>Chroma</span><span class="text-ink tabular-nums">{chroma.toFixed(3)}</span></span>
      <input type="range" min="0" max="0.3" step="0.005" bind:value={chroma} class="accent-accent" />
      <span class="text-small text-ink-muted">0 is grey. Above 0.2 most screens start clipping.</span>
    </label>
    <label class="grid gap-2">
      <span class="eyebrow flex justify-between"><span>Steps</span><span class="text-ink tabular-nums">{steps}</span></span>
      <input type="range" min="3" max="12" step="1" bind:value={steps} class="accent-accent" />
    </label>
    <label class="grid gap-2">
      <span class="eyebrow">Variable prefix</span>
      <input
        type="text"
        bind:value={prefix}
        spellcheck="false"
        class="card-flat focus:border-accent min-w-0 rounded-xl px-3 py-2.5 font-mono text-sm outline-none"
      />
    </label>
  </form>

  <div class="grid min-w-0 gap-6 lg:col-span-8">
    <ol class="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6" aria-label="Swatches">
      {#each swatches as swatch (swatch.name)}
        <li class="grid min-w-0 gap-1.5">
          <span class="border-line block aspect-[4/3] rounded-xl border-3" style="background: {swatch.css}"></span>
          <span class="eyebrow truncate text-[11px]">{swatch.name} <span class="text-ink-faint">·</span> L {swatch.lightness}</span>
        </li>
      {/each}
    </ol>

    <div class="card-flat min-w-0 overflow-hidden">
      <div class="border-line flex items-center justify-between gap-3 border-b-3 px-4 py-2.5">
        <span class="eyebrow">CSS</span>
        <button type="button" onclick={copy} class="pill min-h-9 px-3.5">{copied ? "Copied" : "Copy"}</button>
      </div>
      <pre tabindex="0" class="m-0 overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">{css}</pre>
    </div>
    <p class="text-small text-ink-muted max-w-[60ch]">
      Lightness is spaced evenly; chroma is tapered towards both ends so the extremes stay inside the display gamut. Browsers clip anything that does not, which is why a flat chroma looks wrong at the ends.
    </p>
  </div>
</div>

<style>
  .hue-strip {
    display: block;
    height: 6px;
    border-radius: 999px;
    border: 1px solid var(--line-soft);
  }
</style>
