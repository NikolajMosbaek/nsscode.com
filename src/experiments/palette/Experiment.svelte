<script lang="ts">
import { ramp, toCustomProperties } from "./logic";

let hue = $state(28);
let chroma = $state(0.16);
let steps = $state(9);
let prefix = $state("accent");
let copied = $state(false);

const swatches = $derived(ramp({ hue, chroma, steps }));
const css = $derived(toCustomProperties(prefix.trim() || "color", swatches));

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

<div class="grid gap-10 lg:grid-cols-12 lg:gap-x-10">
  <form class="lg:col-span-4 grid gap-6" onsubmit={(e) => e.preventDefault()}>
    <label class="grid gap-2">
      <span class="eyebrow flex justify-between"><span>Hue</span><span class="text-ink">{hue}°</span></span>
      <input type="range" min="0" max="360" step="1" bind:value={hue} class="accent-accent" />
    </label>
    <label class="grid gap-2">
      <span class="eyebrow flex justify-between"><span>Chroma</span><span class="text-ink">{chroma.toFixed(3)}</span></span>
      <input type="range" min="0" max="0.3" step="0.005" bind:value={chroma} class="accent-accent" />
    </label>
    <label class="grid gap-2">
      <span class="eyebrow flex justify-between"><span>Steps</span><span class="text-ink">{steps}</span></span>
      <input type="range" min="3" max="12" step="1" bind:value={steps} class="accent-accent" />
    </label>
    <label class="grid gap-2">
      <span class="eyebrow">Prefix</span>
      <input
        type="text"
        bind:value={prefix}
        spellcheck="false"
        class="bg-surface border-line focus:border-accent text-small rounded-md border px-3 py-2 font-mono outline-none transition-colors"
      />
    </label>
  </form>

  <div class="lg:col-span-8 grid gap-6">
    <ol class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6" aria-label="Swatches">
      {#each swatches as swatch (swatch.name)}
        <li class="grid gap-1.5">
          <span class="border-line-soft block aspect-[4/3] rounded-md border" style="background: {swatch.css}"></span>
          <span class="eyebrow">{swatch.name} · L {swatch.lightness}</span>
        </li>
      {/each}
    </ol>

    <div class="relative">
      <pre class="bg-surface border-line text-small overflow-x-auto rounded-md border p-4 font-mono leading-relaxed">{css}</pre>
      <button
        type="button"
        onclick={copy}
        class="eyebrow bg-ground border-line hover:border-accent hover:text-ink absolute top-3 right-3 rounded-md border px-2.5 py-1.5 transition-colors"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
    <p class="text-small text-ink-muted max-w-[60ch]">
      Lightness is spaced evenly; chroma is tapered towards both ends so the extremes stay inside the display gamut. Browsers clip anything that does not, which is why a flat chroma looks wrong at the ends.
    </p>
  </div>
</div>
