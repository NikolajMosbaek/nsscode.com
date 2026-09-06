<script lang="ts">
import { onDestroy, untrack } from "svelte";
import {
	clear,
	createGrid,
	type Grid,
	isAlive,
	type Pattern,
	patterns,
	place,
	population,
	randomize,
	resize,
	set,
	step,
} from "./logic";

/*
 * Wide screens get a landscape grid, phones a square one so cells stay big
 * enough to paint with a thumb. Crossing the breakpoint keeps the centre
 * of the grid and the generation count; only the edges are gained or lost.
 */
let narrow = $state(false);
const cols = $derived(narrow ? 36 : 72);
const rows = $derived(narrow ? 36 : 40);

let pattern = $state<Pattern | null>(patterns[1]);
let grid = $state<Grid>(place(createGrid(72, 40), patterns[1].cells, 36, 20));
let generation = $state(0);
let wrap = $state(true);
let playing = $state(false);
let speed = $state(8);
let timer: ReturnType<typeof setInterval> | undefined;
let canvas: HTMLCanvasElement | undefined = $state();
let redraw = $state(0);

const alive = $derived(population(grid));

const ages = [
	{ label: "newborn", colour: "var(--yellow)", min: 1 },
	{ label: "young", colour: "var(--accent)", min: 2 },
	{ label: "settled", colour: "var(--green)", min: 5 },
	{ label: "old", colour: "var(--blue)", min: 30 },
];
function colourFor(age: number): string {
	let c = ages[0].colour;
	for (const a of ages) if (age >= a.min) c = a.colour;
	return c;
}

$effect(() => {
	const media = window.matchMedia("(max-width: 640px)");
	const apply = () => {
		if (media.matches === untrack(() => narrow)) return;
		narrow = media.matches;
		grid = resize(
			untrack(() => grid),
			cols,
			rows,
		);
	};
	untrack(apply);
	media.addEventListener("change", apply);
	return () => media.removeEventListener("change", apply);
});

function restart(next: Pattern | null) {
	pause();
	pattern = next;
	generation = 0;
	const empty = createGrid(cols, rows);
	grid = next
		? place(empty, next.cells, Math.floor(cols / 2), Math.floor(rows / 2))
		: empty;
}

function random() {
	pause();
	pattern = null;
	generation = 0;
	grid = randomize(createGrid(cols, rows), 0.3);
}

function wipe() {
	pause();
	pattern = null;
	generation = 0;
	grid = clear(grid);
}

function advance() {
	grid = step(grid, wrap);
	generation += 1;
	if (population(grid) === 0) pause();
}

function play() {
	playing = true;
	clearInterval(timer);
	timer = setInterval(advance, 1000 / speed);
}
function pause() {
	playing = false;
	clearInterval(timer);
}
function toggle() {
	if (playing) pause();
	else play();
}
$effect(() => {
	if (playing) {
		clearInterval(timer);
		timer = setInterval(advance, 1000 / speed);
	}
});
onDestroy(() => clearInterval(timer));

/* Painting. The first cell decides whether the stroke paints or erases. */
let painting = $state<boolean | null>(null);
let last = -1;
function cellAt(event: PointerEvent): [number, number] | null {
	if (!canvas) return null;
	const rect = canvas.getBoundingClientRect();
	const x = Math.floor(((event.clientX - rect.left) / rect.width) * cols);
	const y = Math.floor(((event.clientY - rect.top) / rect.height) * rows);
	if (x < 0 || y < 0 || x >= cols || y >= rows) return null;
	return [x, y];
}
function down(event: PointerEvent) {
	const cell = cellAt(event);
	if (!cell) return;
	event.preventDefault();
	canvas?.setPointerCapture(event.pointerId);
	painting = !isAlive(grid, cell[0], cell[1]);
	last = cell[1] * cols + cell[0];
	grid = set(grid, cell[0], cell[1], painting);
}
function move(event: PointerEvent) {
	if (painting === null) return;
	const cell = cellAt(event);
	if (!cell) return;
	const index = cell[1] * cols + cell[0];
	if (index === last) return;
	last = index;
	if (isAlive(grid, cell[0], cell[1]) !== painting) {
		grid = set(grid, cell[0], cell[1], painting);
	}
}
function up() {
	painting = null;
	last = -1;
}

/* Drawing. Colours are read from the page so the theme toggle just works. */
$effect(() => {
	const observer = new MutationObserver(() => {
		redraw += 1;
	});
	observer.observe(document.documentElement, {
		attributeFilter: ["data-theme"],
	});
	return () => observer.disconnect();
});

$effect(() => {
	if (!canvas) return;
	const el = canvas;
	const resize = new ResizeObserver(() => {
		redraw += 1;
	});
	resize.observe(el);
	return () => resize.disconnect();
});

$effect(() => {
	void redraw;
	const el = canvas;
	if (!el) return;
	const ctx = el.getContext("2d");
	if (!ctx) return;
	const dpr = window.devicePixelRatio || 1;
	const cssW = el.clientWidth || 720;
	const cssH = (cssW * rows) / cols;
	const pxW = Math.round(cssW * dpr);
	const pxH = Math.round(cssH * dpr);
	if (el.width !== pxW || el.height !== pxH) {
		el.width = pxW;
		el.height = pxH;
	}
	const style = getComputedStyle(el);
	const resolve = (v: string) =>
		v.startsWith("var(") ? style.getPropertyValue(v.slice(4, -1)).trim() : v;
	const cell = pxW / cols;
	ctx.clearRect(0, 0, pxW, pxH);
	ctx.fillStyle = resolve("var(--ground)");
	ctx.fillRect(0, 0, pxW, pxH);
	ctx.strokeStyle = resolve("var(--line-soft)");
	ctx.lineWidth = Math.max(1, dpr * 0.5);
	ctx.globalAlpha = 0.5;
	ctx.beginPath();
	for (let x = 1; x < cols; x++) {
		ctx.moveTo(x * cell, 0);
		ctx.lineTo(x * cell, pxH);
	}
	for (let y = 1; y < rows; y++) {
		ctx.moveTo(0, y * cell);
		ctx.lineTo(pxW, y * cell);
	}
	ctx.stroke();
	ctx.globalAlpha = 1;
	const palette = ages.map((a) => resolve(a.colour));
	const inset = Math.max(1, cell * 0.12);
	const radius = Math.max(1, cell * 0.2);
	const { cells } = grid;
	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < cols; x++) {
			const age = cells[y * cols + x];
			if (!age) continue;
			let i = 0;
			for (let k = 0; k < ages.length; k++) if (age >= ages[k].min) i = k;
			ctx.fillStyle = palette[i];
			ctx.beginPath();
			ctx.roundRect(
				x * cell + inset,
				y * cell + inset,
				cell - inset * 2,
				cell - inset * 2,
				radius,
			);
			ctx.fill();
		}
	}
});
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-8">
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-2.5" role="group" aria-label="Pattern">
      {#each patterns as p (p.slug)}
        <button type="button" class="pill {pattern?.slug === p.slug ? 'pill-active' : ''}" aria-pressed={pattern?.slug === p.slug} onclick={() => restart(p)}>{p.name}</button>
      {/each}
      <span class="border-line-soft mx-1 hidden h-6 border-l-2 sm:block" aria-hidden="true"></span>
      <button type="button" class="pill" onclick={random}>Random</button>
      <button type="button" class="pill" onclick={wipe}>Clear</button>
    </div>
    <p class="text-body text-ink-soft m-0 max-w-[62ch] font-medium text-pretty">
      {pattern ? pattern.note : "Your own soup. Click or drag on the grid to paint; drag over live cells to erase."}
    </p>
  </div>

  <div class="grid gap-4">
    <canvas
      bind:this={canvas}
      class="border-line w-full touch-none rounded-2xl border-3 {painting !== null ? 'cursor-crosshair' : 'cursor-cell'}"
      style="aspect-ratio: {cols} / {rows}"
      role="img"
      aria-label="Life grid, generation {generation}, {alive} cells alive"
      onpointerdown={down}
      onpointermove={move}
      onpointerup={up}
      onpointercancel={up}
    ></canvas>

    <div class="flex flex-wrap items-center gap-2.5">
      <button type="button" class="pill pill-solid" onclick={toggle} disabled={alive === 0 && !playing}>{playing ? 'Pause' : 'Play'}</button>
      <button type="button" class="pill" onclick={advance} disabled={alive === 0}>Step</button>
      <button type="button" class="pill {wrap ? 'pill-active' : ''}" aria-pressed={wrap} onclick={() => (wrap = !wrap)}>Wrap edges</button>
      <label class="ml-auto flex items-center gap-3">
        <span class="eyebrow">Speed</span>
        <input type="range" min="1" max="30" step="1" bind:value={speed} class="accent-accent w-28" />
        <span class="eyebrow text-ink w-14 text-right whitespace-nowrap">{speed}/s</span>
      </label>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
      <p class="eyebrow m-0 tabular-nums">gen {generation} <span class="text-ink-faint">·</span> {alive} alive</p>
      <ul class="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0" aria-label="Colour by age">
        {#each ages as a, i (a.label)}
          <li class="eyebrow flex items-center gap-1.5">
            <span class="border-line inline-block size-3 rounded-[3px] border-2" style="background: {a.colour}" aria-hidden="true"></span>
            {a.label}{#if i < ages.length - 1}<span class="text-ink-muted">&nbsp;{a.min}{i === 0 ? '' : `–${ages[i + 1].min - 1}`}</span>{:else}<span class="text-ink-muted">&nbsp;{a.min}+</span>{/if}
          </li>
        {/each}
      </ul>
    </div>
  </div>

  <p class="text-small text-ink-muted max-w-[62ch]">
    Three neighbours and a dead cell is born; two or three and a live cell survives; anything else and it dies. That is the whole rule. Colour is how long a cell has been alive, so gliders stay yellow and orange while still lifes turn blue.
  </p>
</div>

<style>
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
