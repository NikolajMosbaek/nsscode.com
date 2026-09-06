/*
 * Conway's Game of Life on a fixed grid. Cells carry their age so the
 * drawing can colour newborns differently from survivors: 0 is dead,
 * anything above is how many generations the cell has been alive.
 */

export interface Grid {
	width: number;
	height: number;
	cells: Uint16Array;
}

export interface Pattern {
	slug: string;
	name: string;
	note: string;
	cells: [number, number][];
}

export function createGrid(width: number, height: number): Grid {
	return { width, height, cells: new Uint16Array(width * height) };
}

export function population(grid: Grid): number {
	let n = 0;
	for (const c of grid.cells) if (c) n++;
	return n;
}

/** One generation, B3/S23. Returns a new grid; the old one is untouched. */
export function step(grid: Grid, wrap: boolean): Grid {
	const { width, height, cells } = grid;
	const next = new Uint16Array(width * height);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let n = 0;
			for (let dy = -1; dy <= 1; dy++) {
				for (let dx = -1; dx <= 1; dx++) {
					if (!dx && !dy) continue;
					let nx = x + dx;
					let ny = y + dy;
					if (wrap) {
						nx = (nx + width) % width;
						ny = (ny + height) % height;
					} else if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
						continue;
					}
					if (cells[ny * width + nx]) n++;
				}
			}
			const i = y * width + x;
			const age = cells[i];
			if (age && (n === 2 || n === 3)) next[i] = Math.min(age + 1, 65535);
			else if (!age && n === 3) next[i] = 1;
		}
	}
	return { width, height, cells: next };
}

export function set(grid: Grid, x: number, y: number, alive: boolean): Grid {
	if (x < 0 || y < 0 || x >= grid.width || y >= grid.height) return grid;
	const cells = grid.cells.slice();
	cells[y * grid.width + x] = alive ? 1 : 0;
	return { ...grid, cells };
}

export function isAlive(grid: Grid, x: number, y: number): boolean {
	return grid.cells[y * grid.width + x] > 0;
}

export function clear(grid: Grid): Grid {
	return createGrid(grid.width, grid.height);
}

export function randomize(
	grid: Grid,
	density: number,
	random: () => number = Math.random,
): Grid {
	const cells = new Uint16Array(grid.width * grid.height);
	for (let i = 0; i < cells.length; i++) cells[i] = random() < density ? 1 : 0;
	return { ...grid, cells };
}

/** Copy a grid into a new size, keeping the centre. Cells that no longer fit are lost. */
export function resize(grid: Grid, width: number, height: number): Grid {
	if (grid.width === width && grid.height === height) return grid;
	const next = createGrid(width, height);
	const ox = Math.floor((width - grid.width) / 2);
	const oy = Math.floor((height - grid.height) / 2);
	for (let y = 0; y < grid.height; y++) {
		const ny = y + oy;
		if (ny < 0 || ny >= height) continue;
		for (let x = 0; x < grid.width; x++) {
			const nx = x + ox;
			if (nx < 0 || nx >= width) continue;
			next.cells[ny * width + nx] = grid.cells[y * grid.width + x];
		}
	}
	return next;
}

/** Parse pattern art: `O` alive, anything else dead, one row per line. */
export function fromArt(art: string): [number, number][] {
	const out: [number, number][] = [];
	art
		.trim()
		.split("\n")
		.forEach((row, y) => {
			for (let x = 0; x < row.length; x++) {
				if (row[x] === "O") out.push([x, y]);
			}
		});
	return out;
}

/** Stamp a pattern with its bounding box centred on (cx, cy). */
export function place(
	grid: Grid,
	pattern: [number, number][],
	cx: number,
	cy: number,
): Grid {
	if (pattern.length === 0) return grid;
	const xs = pattern.map((p) => p[0]);
	const ys = pattern.map((p) => p[1]);
	const w = Math.max(...xs) - Math.min(...xs) + 1;
	const h = Math.max(...ys) - Math.min(...ys) + 1;
	const ox = Math.round(cx - w / 2) - Math.min(...xs);
	const oy = Math.round(cy - h / 2) - Math.min(...ys);
	const cells = grid.cells.slice();
	for (const [x, y] of pattern) {
		const gx = x + ox;
		const gy = y + oy;
		if (gx >= 0 && gy >= 0 && gx < grid.width && gy < grid.height) {
			cells[gy * grid.width + gx] = 1;
		}
	}
	return { ...grid, cells };
}

export const patterns: Pattern[] = [
	{
		slug: "glider",
		name: "Glider",
		note: "Walks diagonally, one cell every four generations.",
		cells: fromArt(`
.O.
..O
OOO`),
	},
	{
		slug: "gun",
		name: "Glider gun",
		note: "Gosper's gun. Fires a glider every 30 generations, forever.",
		cells: fromArt(`
........................O...........
......................O.O...........
............OO......OO............OO
...........O...O....OO............OO
OO........O.....O...OO..............
OO........O...O.OO....O.O...........
..........O.....O.......O...........
...........O...O....................
............OO......................`),
	},
	{
		slug: "acorn",
		name: "Acorn",
		note: "Seven cells that take 5206 generations to settle.",
		cells: fromArt(`
.O.....
...O...
OO..OOO`),
	},
	{
		slug: "r-pentomino",
		name: "R-pentomino",
		note: "Five cells, chaos for 1103 generations.",
		cells: fromArt(`
.OO
OO.
.O.`),
	},
	{
		slug: "pulsar",
		name: "Pulsar",
		note: "The common period-3 oscillator.",
		cells: fromArt(`
..OOO...OOO..
.............
O....O.O....O
O....O.O....O
O....O.O....O
..OOO...OOO..
.............
..OOO...OOO..
O....O.O....O
O....O.O....O
O....O.O....O
.............
..OOO...OOO..`),
	},
	{
		slug: "lwss",
		name: "Spaceship",
		note: "Lightweight spaceship, moving left two cells every four generations.",
		cells: fromArt(`
O..O.
....O
O...O
.OOOO`),
	},
	{
		slug: "diehard",
		name: "Diehard",
		note: "Vanishes completely after 130 generations.",
		cells: fromArt(`
......O.
OO......
.O...OOO`),
	},
];
