<script lang="ts">
import { onDestroy } from "svelte";
import {
	createWorld,
	isFinished,
	type Scenario,
	scenarios,
	step,
	type World,
} from "./logic";

let scenario = $state<Scenario>(scenarios[1]);
let world = $state<World>(createWorld(scenarios[1]));
let playing = $state(false);
let speed = $state(1);
let timer: ReturnType<typeof setInterval> | undefined;

const colours = [
	"var(--accent)",
	"var(--blue)",
	"var(--yellow)",
	"var(--green)",
	"var(--ink)",
	"var(--surface-strong)",
];
const finished = $derived(isFinished(world));
const recent = $derived(world.log.slice(-6).reverse());

/* Geometry. Rooms sit in a row; the door is the gap on the left wall. */
const W = 720;
const H = 330;
const roomW = 200;
const roomH = 170;
const roomY = 46;
const queueGap = 30;

const rooms = $derived(
	world.actors.map((actor, i) => {
		const count = world.actors.length;
		const span = W / count;
		const x = span * i + (span - roomW) / 2 + 40;
		return { ...actor, x, y: roomY };
	}),
);

interface Dot {
	id: number;
	x: number;
	y: number;
	label: string;
	phase: string;
}

const dots = $derived<Dot[]>(
	world.tasks.map((task) => {
		const base = { id: task.id, label: String(task.id + 1), phase: task.phase };
		if (task.phase === "pending") {
			return { ...base, x: 30 + task.id * 26, y: H - 24 };
		}
		if (task.phase === "done") {
			return { ...base, x: W - 30 - task.id * 26, y: H - 24 };
		}
		const room = rooms.find((r) => r.id === task.steps[task.index].actor);
		if (!room) return { ...base, x: 0, y: 0 };
		if (task.phase === "running") {
			return { ...base, x: room.x + roomW / 2, y: room.y + roomH / 2 };
		}
		const slot = room.queue.indexOf(task.id);
		return { ...base, x: room.x - 22 - slot * queueGap, y: room.y + roomH / 2 };
	}),
);

function reset(next: Scenario = scenario) {
	scenario = next;
	world = createWorld(next);
	pause();
}

function advance() {
	if (isFinished(world)) {
		pause();
		return;
	}
	world = step(world);
}

function play() {
	if (isFinished(world)) world = createWorld(scenario);
	playing = true;
	clearInterval(timer);
	timer = setInterval(advance, 900 / speed);
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
		timer = setInterval(advance, 900 / speed);
	}
});

onDestroy(() => clearInterval(timer));
</script>

<div class="grid gap-8">
  <div class="flex flex-wrap gap-2.5" role="group" aria-label="Scenario">
    {#each scenarios as s (s.slug)}
      <button
        type="button"
        class="pill {s.slug === scenario.slug ? 'pill-active' : ''}"
        aria-pressed={s.slug === scenario.slug}
        onclick={() => reset(s)}
      >
        {s.title}
      </button>
    {/each}
  </div>

  <p class="text-body text-ink-soft max-w-[62ch] font-medium text-pretty">{scenario.summary}</p>

  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
    <div class="grid gap-4">
      <svg viewBox="0 0 {W} {H}" class="stage border-line bg-surface w-full rounded-2xl border-3" role="img" aria-label="Rooms for each actor with tasks inside or queued at the door">
        <text x="30" y={H - 50} class="caption">waiting to start</text>
        <text x={W - 30} y={H - 50} class="caption" text-anchor="end">returned</text>
        {#each rooms as room (room.id)}
          <g>
            <rect x={room.x} y={room.y} width={roomW} height={roomH} rx="18" class="room" />
            <rect x={room.x - 3} y={room.y + roomH / 2 - 26} width="8" height="52" rx="3" class={room.occupant === null ? 'door door-open' : 'door'} />
            <text x={room.x + roomW / 2} y={room.y - 16} text-anchor="middle" class="room-label">{room.id}</text>
            <text x={room.x + roomW / 2} y={room.y + roomH - 16} text-anchor="middle" class="caption">
              {room.occupant === null ? 'empty' : `Task ${room.occupant + 1} inside`}{room.queue.length ? ` · ${room.queue.length} at the door` : ''}
            </text>
          </g>
        {/each}
        {#each dots as dot (dot.id)}
          <g class="dot" style="transform: translate({dot.x}px, {dot.y}px); opacity: {dot.phase === 'done' ? 0.45 : 1}">
            <circle r="13" fill={colours[dot.id % colours.length]} class="dot-fill" />
            <text y="4" text-anchor="middle" class="dot-label">{dot.label}</text>
          </g>
        {/each}
      </svg>

      <div class="flex flex-wrap items-center gap-2.5">
        <button type="button" class="pill pill-solid" onclick={toggle}>
          {playing ? 'Pause' : finished ? 'Replay' : 'Play'}
        </button>
        <button type="button" class="pill" onclick={advance} disabled={finished}>Step</button>
        <button type="button" class="pill" onclick={() => reset()}>Reset</button>
        <label class="ml-auto flex items-center gap-3">
          <span class="eyebrow">Speed</span>
          <input type="range" min="0.5" max="3" step="0.5" bind:value={speed} class="accent-accent" />
          <span class="eyebrow text-ink w-8 text-right">{speed}×</span>
        </label>
        <span class="eyebrow">tick {world.tick}</span>
      </div>

      <ol class="grid gap-1.5 font-mono text-sm" aria-label="Log" aria-live="polite">
        {#each recent as event (event.tick + '-' + event.task + '-' + event.text)}
          <li class="flex gap-3 {event.reentry ? 'text-ink font-medium' : 'text-ink-muted'}">
            <span class="text-ink-faint w-10 shrink-0 tabular-nums">t{event.tick}</span>
            <span class="flex-1">
              {#if event.reentry}<span class="bg-yellow text-accent-ink mr-2 rounded-md px-1.5 py-0.5 text-xs">reentrancy</span>{/if}{event.text}
            </span>
          </li>
        {/each}
        {#if recent.length === 0}
          <li class="text-ink-muted">Press play.</li>
        {/if}
      </ol>
    </div>

    <pre tabindex="0" class="card-flat bg-surface-strong m-0 overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed" aria-label="Swift">{scenario.swift}</pre>
  </div>

  <p class="text-small text-ink-muted max-w-[62ch]">
    An actor serialises access to its state. A suspension point inside an actor method is not a lock held across the await: the actor is free while you wait, and someone else may run. Read your state again after every await, or do not await in the middle.
  </p>
</div>

<style>
  .stage {
    aspect-ratio: 720 / 330;
    height: auto;
  }
  .room {
    fill: var(--ground);
    stroke: var(--line);
    stroke-width: 3;
  }
  .door {
    fill: var(--line);
    transition: transform 300ms var(--ease-out);
    transform-box: fill-box;
    transform-origin: top center;
  }
  .door-open {
    transform: rotate(-70deg);
  }
  .room-label {
    fill: var(--ink);
    font-family: var(--font-sans);
    font-weight: 800;
    font-size: 18px;
    letter-spacing: -0.02em;
  }
  .caption {
    fill: var(--ink-muted);
    font-family: var(--font-mono);
    font-size: 11px;
  }
  .dot {
    transition: transform 700ms var(--ease-out), opacity 400ms ease;
  }
  .dot-fill {
    stroke: var(--line);
    stroke-width: 3;
  }
  .dot-label {
    fill: var(--accent-ink);
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 12px;
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
