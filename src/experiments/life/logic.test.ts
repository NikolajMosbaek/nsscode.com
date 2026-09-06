import { describe, expect, it } from "vitest";
import {
	createGrid,
	fromArt,
	isAlive,
	patterns,
	place,
	population,
	randomize,
	resize,
	set,
	step,
} from "./logic";

const pattern = (slug: string) => {
	const p = patterns.find((x) => x.slug === slug);
	if (!p) throw new Error(slug);
	return p.cells;
};

describe("step", () => {
	it("keeps a block still and does not mutate the input", () => {
		let g = createGrid(6, 6);
		for (const [x, y] of fromArt("OO\nOO")) g = set(g, x + 2, y + 2, true);
		const before = Array.from(g.cells);
		const after = step(g, false);
		expect(Array.from(g.cells)).toEqual(before);
		expect(Array.from(after.cells).map((c) => (c ? 1 : 0))).toEqual(before);
		expect(after.cells[2 * 6 + 2]).toBe(2);
	});

	it("oscillates a blinker with period two", () => {
		let g = createGrid(5, 5);
		for (const x of [1, 2, 3]) g = set(g, x, 2, true);
		const one = step(g, false);
		expect([1, 2, 3].map((y) => isAlive(one, 2, y))).toEqual([
			true,
			true,
			true,
		]);
		expect(isAlive(one, 1, 2)).toBe(false);
		const two = step(one, false);
		expect(Array.from(two.cells).map((c) => (c ? 1 : 0))).toEqual(
			Array.from(g.cells),
		);
	});

	it("moves a glider one cell down and right every four generations", () => {
		let g = place(createGrid(12, 12), pattern("glider"), 3, 3);
		const start = Array.from(g.cells);
		for (let i = 0; i < 4; i++) g = step(g, false);
		const shifted = createGrid(12, 12);
		for (let y = 0; y < 12; y++) {
			for (let x = 0; x < 12; x++) {
				if (start[y * 12 + x]) shifted.cells[(y + 1) * 12 + x + 1] = 1;
			}
		}
		expect(Array.from(g.cells).map((c) => (c ? 1 : 0))).toEqual(
			Array.from(shifted.cells),
		);
	});

	it("wraps neighbours across the edge when asked", () => {
		let g = createGrid(5, 5);
		for (const x of [4, 0, 1]) g = set(g, x, 0, true);
		expect(population(step(g, false))).toBe(0);
		expect(population(step(g, true))).toBe(3);
	});

	it("lets diehard die", () => {
		let g = place(createGrid(80, 60), pattern("diehard"), 40, 30);
		for (let i = 0; i < 130; i++) g = step(g, false);
		expect(population(g)).toBe(0);
	});
});

describe("patterns", () => {
	it("parses art into coordinates", () => {
		expect(fromArt("\n.O\nO.\n")).toEqual([
			[1, 0],
			[0, 1],
		]);
	});

	it("centres a pattern on the point given", () => {
		const g = place(createGrid(9, 9), fromArt("OOO"), 4, 4);
		expect([3, 4, 5].map((x) => isAlive(g, x, 4))).toEqual([true, true, true]);
		expect(population(g)).toBe(3);
	});

	it("drops cells that fall off the grid", () => {
		const g = place(createGrid(4, 4), pattern("pulsar"), 2, 2);
		expect(population(g)).toBeLessThan(pattern("pulsar").length);
		expect(population(g)).toBeGreaterThan(0);
	});

	it("has the expected sizes", () => {
		expect(pattern("glider")).toHaveLength(5);
		expect(pattern("gun")).toHaveLength(36);
		expect(pattern("acorn")).toHaveLength(7);
		expect(pattern("pulsar")).toHaveLength(48);
	});
});

describe("resize", () => {
	it("keeps the centre and the ages when shrinking and growing", () => {
		let g = createGrid(10, 6);
		g = set(g, 5, 3, true);
		g = set(g, 0, 0, true);
		g = step(g, false);
		g = set(g, 5, 3, true);
		g.cells[5 * 1 + 0] = 0;
		g.cells[3 * 10 + 5] = 7;
		const small = resize(g, 6, 6);
		expect(small.cells[3 * 6 + 3]).toBe(7);
		expect(population(small)).toBe(1);
		const big = resize(small, 12, 10);
		expect(big.cells[5 * 12 + 6]).toBe(7);
		expect(population(big)).toBe(1);
	});
});

describe("randomize", () => {
	it("fills roughly the requested share with a fixed source", () => {
		let n = 0;
		const g = randomize(createGrid(10, 10), 0.3, () => (n++ % 10) / 10);
		expect(population(g)).toBe(30);
	});
});
