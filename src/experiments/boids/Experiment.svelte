<script lang="ts">
import {
	type Boid,
	defaults,
	type Params,
	polarisation,
	spawn,
	step,
} from "./logic";

/*
 * The simulation runs in logical units on a fixed-size world and the
 * canvas scales it to whatever width it gets. Wide screens get a
 * landscape world, phones a squarer one.
 */
let narrow = $state(false);
const W = $derived(narrow ? 360 : 720);
const H = $derived(narrow ? 420 : 400);

let count = $state(90);
let params = $state<Params>({ ...defaults });
let boids = $state<Boid[]>(spawn(90, 720, 400));
let playing = $state(true);
let trails = $state(false);
let pointer = $state<{ x: number; y: number } | null>(null);
let canvas: HTMLCanvasElement | undefined = $state();
let order = $state(0);
let frame = 0;
let tick = 0;

const colours = [
	"var(--accent)",
	"var(--blue)",
	"var(--yellow)",
	"var(--green)",
];

$effect(() => {
	const media = window.matchMedia("(max-width: 640px)");
	const apply = () => {
		if (media.matches === narrow) return;
		narrow = media.matches;
		boids = spawn(count, media.matches ? 360 : 720, media.matches ? 420 : 400);
	};
	if (media.matches) {
		narrow = true;
		boids = spawn(count, 360, 420);
	}
	media.addEventListener("change", apply);
	return () => media.removeEventListener("change", apply);
});

function scatter() {
	boids = spawn(count, W, H);
}
function setCount(n: number) {
	count = n;
	if (n < boids.length) boids = boids.slice(0, n);
	else boids = [...boids, ...spawn(n - boids.length, W, H)];
}

function loop() {
	if (playing) {
		boids = step(
			boids,
			params,
			W,
			H,
			pointer
				? { x: pointer.x, y: pointer.y, fear: params.perception * 1.6 }
				: null,
		);
		tick++;
		if (tick % 15 === 0) order = polarisation(boids);
	}
	draw();
	frame = requestAnimationFrame(loop);
}

function toWorld(event: PointerEvent): { x: number; y: number } | null {
	if (!canvas) return null;
	const r = canvas.getBoundingClientRect();
	return {
		x: ((event.clientX - r.left) / r.width) * W,
		y: ((event.clientY - r.top) / r.height) * H,
	};
}

function draw() {
	const el = canvas;
	if (!el) return;
	const ctx = el.getContext("2d");
	if (!ctx) return;
	const dpr = window.devicePixelRatio || 1;
	const cssW = el.clientWidth || W;
	const cssH = (cssW * H) / W;
	const pxW = Math.round(cssW * dpr);
	const pxH = Math.round(cssH * dpr);
	if (el.width !== pxW || el.height !== pxH) {
		el.width = pxW;
		el.height = pxH;
	}
	const style = getComputedStyle(el);
	const token = (v: string) => style.getPropertyValue(v).trim();
	const k = pxW / W;
	if (trails) {
		ctx.globalAlpha = 0.18;
		ctx.fillStyle = token("--ground");
		ctx.fillRect(0, 0, pxW, pxH);
		ctx.globalAlpha = 1;
	} else {
		ctx.fillStyle = token("--ground");
		ctx.fillRect(0, 0, pxW, pxH);
	}
	const palette = colours.map((c) => token(c.slice(4, -1)));
	const line = token("--line");
	const size = 7 * k;
	for (const b of boids) {
		const a = Math.atan2(b.vy, b.vx);
		/* Colour by heading: four sectors, four accents. */
		const sector = Math.floor((((a + Math.PI) / (Math.PI * 2)) * 4) % 4);
		ctx.save();
		ctx.translate(b.x * k, b.y * k);
		ctx.rotate(a);
		ctx.beginPath();
		ctx.moveTo(size * 1.3, 0);
		ctx.lineTo(-size * 0.9, size * 0.75);
		ctx.lineTo(-size * 0.5, 0);
		ctx.lineTo(-size * 0.9, -size * 0.75);
		ctx.closePath();
		ctx.fillStyle = palette[sector];
		ctx.strokeStyle = line;
		ctx.lineWidth = 1.5 * k;
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}
	if (pointer) {
		ctx.beginPath();
		ctx.arc(
			pointer.x * k,
			pointer.y * k,
			params.perception * 1.6 * k,
			0,
			Math.PI * 2,
		);
		ctx.strokeStyle = token("--line-soft");
		ctx.setLineDash([6 * k, 6 * k]);
		ctx.lineWidth = 2 * k;
		ctx.stroke();
		ctx.setLineDash([]);
	}
}

$effect(() => {
	frame = requestAnimationFrame(loop);
	return () => cancelAnimationFrame(frame);
});

const rules: {
	key: "separation" | "alignment" | "cohesion";
	label: string;
	text: string;
}[] = [
	{
		key: "separation",
		label: "Separation",
		text: "Do not crowd your neighbours.",
	},
	{
		key: "alignment",
		label: "Alignment",
		text: "Fly the way your neighbours fly.",
	},
	{
		key: "cohesion",
		label: "Cohesion",
		text: "Drift towards the middle of the group.",
	},
];
</script>

<div class="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-12 lg:gap-x-10">
  <div class="grid min-w-0 gap-4 lg:col-span-8">
    <canvas
      bind:this={canvas}
      class="border-line w-full touch-none rounded-2xl border-3 cursor-crosshair"
      style="aspect-ratio: {W} / {H}"
      role="img"
      aria-label="{count} boids flocking. Order {Math.round(order * 100)} percent."
      onpointermove={(e) => (pointer = toWorld(e))}
      onpointerdown={(e) => (pointer = toWorld(e))}
      onpointerleave={() => (pointer = null)}
      onpointercancel={() => (pointer = null)}
    ></canvas>
    <div class="flex flex-wrap items-center gap-2.5">
      <button type="button" class="pill pill-solid" onclick={() => (playing = !playing)}>{playing ? "Pause" : "Play"}</button>
      <button type="button" class="pill" onclick={scatter}>Scatter</button>
      <button type="button" class="pill {trails ? 'pill-active' : ''}" aria-pressed={trails} onclick={() => (trails = !trails)}>Trails</button>
      <button type="button" class="pill {params.wrap ? 'pill-active' : ''}" aria-pressed={params.wrap} onclick={() => (params.wrap = !params.wrap)}>Wrap edges</button>
      <span class="eyebrow ml-auto tabular-nums">order {Math.round(order * 100)}%</span>
    </div>
    <p class="text-small text-ink-muted m-0 max-w-[62ch]">
      Move the pointer over the flock and it scatters; they treat it as a hawk. Order is how much of the flock points the same way: 100 is one heading, 0 is chaos. Colour is heading, so a flock that agrees turns one colour.
    </p>
  </div>

  <div class="grid min-w-0 content-start gap-5 lg:col-span-4">
    {#each rules as r (r.key)}
      <label class="grid gap-2">
        <span class="eyebrow flex justify-between"><span>{r.label}</span><span class="text-ink tabular-nums">{params[r.key].toFixed(1)}</span></span>
        <input type="range" min="0" max="3" step="0.1" bind:value={params[r.key]} class="accent-accent" />
        <span class="text-small text-ink-muted">{r.text}</span>
      </label>
    {/each}
    <label class="grid gap-2">
      <span class="eyebrow flex justify-between"><span>Sight</span><span class="text-ink tabular-nums">{params.perception}</span></span>
      <input type="range" min="15" max="150" step="5" bind:value={params.perception} class="accent-accent" />
      <span class="text-small text-ink-muted">How far a boid can see. Short sight makes many small flocks.</span>
    </label>
    <label class="grid gap-2">
      <span class="eyebrow flex justify-between"><span>Speed</span><span class="text-ink tabular-nums">{params.maxSpeed.toFixed(1)}</span></span>
      <input type="range" min="1.5" max="6" step="0.1" bind:value={params.maxSpeed} class="accent-accent" />
    </label>
    <label class="grid gap-2">
      <span class="eyebrow flex justify-between"><span>Boids</span><span class="text-ink tabular-nums">{count}</span></span>
      <input type="range" min="10" max="300" step="10" value={count} oninput={(e) => setCount(Number(e.currentTarget.value))} class="accent-accent" />
    </label>
    <div class="card-flat grid gap-2 p-4">
      <p class="eyebrow m-0">Try</p>
      <ul class="text-small text-ink-muted m-0 grid gap-1 pl-4">
        <li>Alignment to 0: a crowd, not a flock.</li>
        <li>Separation to 0: they collapse into a ball.</li>
        <li>Cohesion up, sight down: many tight little flocks.</li>
        <li>Trails on, then chase them.</li>
      </ul>
    </div>
  </div>

  <p class="text-small text-ink-muted m-0 max-w-[70ch] lg:col-span-12">
    Craig Reynolds, 1986. No boid knows about the flock; each one only looks at the few around it. The shapes you see, the splitting, the rejoining, the ripple when the hawk comes, are not programmed anywhere. That is the whole point of it.
  </p>
</div>
