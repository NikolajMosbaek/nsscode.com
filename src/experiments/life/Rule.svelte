<script lang="ts">
/*
 * One rule of Life as a three by three neighbourhood before and after.
 * `before` is nine characters, row by row, `O` alive. Only the centre
 * cell's fate is shown on the right; the neighbours are faded because
 * the rule says nothing about them.
 */
interface Props {
	title: string;
	text: string;
	before: string;
	survives: boolean;
}

const { title, text, before, survives }: Props = $props();

const cells = Array.from({ length: 9 }, (_, i) => ({
	x: (i % 3) * 22 + 2,
	y: Math.floor(i / 3) * 22 + 2,
	alive: before[i] === "O",
	centre: i === 4,
}));
const neighbours = cells.filter((c) => !c.centre && c.alive).length;
</script>

<div class="card-flat grid content-start gap-3 p-4">
  <p class="m-0"><span class="eyebrow">{title}</span></p>
  <svg viewBox="0 0 156 70" class="w-full max-w-[200px]" role="img" aria-label="{title}: centre cell with {neighbours} live neighbours {survives ? 'is alive' : 'is dead'} in the next generation">
    {#each cells as c, i (i)}
      <rect x={c.x} y={c.y} width="20" height="20" rx="3" class={c.centre ? 'centre' : 'cell'} fill={c.alive ? (c.centre ? 'var(--accent)' : 'var(--ink)') : 'var(--ground)'} />
    {/each}
    <path d="M76 35h14m-4-4l4 4-4 4" class="arrow" />
    {#each cells as c, i (i)}
      <rect x={c.x + 88} y={c.y} width="20" height="20" rx="3" class={c.centre ? 'centre' : 'cell faded'} fill={c.centre ? (survives ? 'var(--yellow)' : 'var(--ground)') : c.alive ? 'var(--ink)' : 'var(--ground)'} />
    {/each}
  </svg>
  <p class="text-small text-ink-muted m-0">{text}</p>
</div>

<style>
  .cell,
  .centre {
    stroke: var(--line-soft);
    stroke-width: 1.5;
  }
  .centre {
    stroke: var(--line);
    stroke-width: 2.5;
  }
  .faded {
    opacity: 0.25;
  }
  .arrow {
    fill: none;
    stroke: var(--ink-muted);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
