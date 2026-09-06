<script lang="ts">
/*
 * A barbell seen from the side. Plates are drawn per side, heaviest at the
 * collar, mirrored left and right. Plate height follows weight; colour
 * follows the competition convention where the site palette allows it.
 */
import { formatKg } from "./logic";

interface Props {
	perSide: number[];
	bar: number;
	compact?: boolean;
	/** Show only the right side, collar at the left edge. For narrow screens. */
	half?: boolean;
}

const { perSide, bar, compact = false, half = false }: Props = $props();

const W = 720;
const H = compact ? 110 : 200;
const mid = H / 2;
const sleeveLen = 250;
const collarW = 14;
const shaftY = mid - 6;

function height(kg: number): number {
	if (kg >= 10) return compact ? 88 : 140;
	if (kg >= 5) return compact ? 64 : 100;
	if (kg >= 2.5) return compact ? 48 : 72;
	return compact ? 36 : 52;
}
function width(kg: number): number {
	if (kg >= 20) return 26;
	if (kg >= 10) return 20;
	if (kg >= 5) return 16;
	return 12;
}
function colour(kg: number): string {
	if (kg >= 25) return "var(--accent)";
	if (kg >= 20) return "var(--blue)";
	if (kg >= 15) return "var(--yellow)";
	if (kg >= 10) return "var(--green)";
	if (kg >= 5) return "var(--surface)";
	if (kg >= 2.5) return "var(--accent)";
	return "var(--surface-strong)";
}

interface Drawn {
	kg: number;
	x: number;
	w: number;
	h: number;
	fill: string;
}

const gap = 3;
const right = $derived.by(() => {
	const out: Drawn[] = [];
	let x = W / 2 + sleeveLen / 2 + collarW;
	for (const kg of perSide) {
		const w = width(kg);
		out.push({ kg, x, w, h: height(kg), fill: colour(kg) });
		x += w + gap;
	}
	return out;
});
const left = $derived(right.map((p) => ({ ...p, x: W - p.x - p.w })));
</script>

<svg viewBox="{half ? W / 2 + sleeveLen / 2 - 40 : 0} 0 {half ? W / 2 - sleeveLen / 2 + 40 : W} {H}" class="w-full" role="img" aria-label={perSide.length ? `Per side, from the collar outwards: ${perSide.map(formatKg).join(', ')} kg${bar ? ` on a ${bar} kg bar` : ', bar not counted'}` : bar ? `Empty ${bar} kg bar` : 'Empty bar'}>
  <!-- shaft -->
  <rect x="0" y={shaftY} width={W} height="12" rx="6" class="steel" />
  <!-- sleeves, thicker -->
  <rect x="0" y={mid - 10} width={W / 2 - sleeveLen / 2} height="20" rx="4" class="steel" />
  <rect x={W / 2 + sleeveLen / 2} y={mid - 10} width={W / 2 - sleeveLen / 2} height="20" rx="4" class="steel" />
  <!-- collars -->
  <rect x={W / 2 - sleeveLen / 2 - collarW} y={mid - 22} width={collarW} height="44" rx="4" class="collar" />
  <rect x={W / 2 + sleeveLen / 2} y={mid - 22} width={collarW} height="44" rx="4" class="collar" />
  {#each [...left, ...right] as plate, i (i)}
    <g class="plate">
      <rect x={plate.x} y={mid - plate.h / 2} width={plate.w} height={plate.h} rx="4" fill={plate.fill} class="plate-fill" />
      {#if !compact && plate.h >= 72}
        <text x={plate.x + plate.w / 2} y={mid + plate.h / 2 + 18} text-anchor="middle" class="label">{formatKg(plate.kg)}</text>
      {/if}
    </g>
  {/each}
  {#if !compact && !half}
    <text x={W / 2} y={mid + 28} text-anchor="middle" class="label">{bar ? `${bar} kg bar` : 'bar not counted'}</text>
  {/if}
</svg>

<style>
  .steel {
    fill: var(--surface-strong);
    stroke: var(--line);
    stroke-width: 3;
  }
  .collar {
    fill: var(--ink);
  }
  .plate-fill {
    stroke: var(--line);
    stroke-width: 3;
  }
  .plate {
    animation: slide 500ms var(--ease-out) both;
  }
  .label {
    fill: var(--ink-muted);
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
  }
  @keyframes slide {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
</style>
