import { describe, expect, it } from "vitest";
import {
	type Boid,
	defaults,
	mulberry32,
	polarisation,
	spacing,
	spawn,
	step,
} from "./logic";

const W = 400;
const H = 300;

function run(boids: Boid[], params = defaults, n = 200): Boid[] {
	let b = boids;
	for (let i = 0; i < n; i++) b = step(b, params, W, H);
	return b;
}

describe("spawn", () => {
	it("is deterministic with a seeded source", () => {
		const a = spawn(10, W, H, mulberry32(7));
		const b = spawn(10, W, H, mulberry32(7));
		expect(a).toEqual(b);
		expect(a).not.toEqual(spawn(10, W, H, mulberry32(8)));
	});
});

describe("step", () => {
	it("keeps every boid inside the box and within the speed band", () => {
		const out = run(spawn(60, W, H, mulberry32(1)));
		for (const b of out) {
			expect(b.x).toBeGreaterThanOrEqual(0);
			expect(b.x).toBeLessThan(W);
			expect(b.y).toBeGreaterThanOrEqual(0);
			expect(b.y).toBeLessThan(H);
			const s = Math.hypot(b.vx, b.vy);
			expect(s).toBeLessThanOrEqual(defaults.maxSpeed + 1e-9);
			expect(s).toBeGreaterThanOrEqual(defaults.minSpeed - 1e-9);
		}
	});

	it("does not mutate its input", () => {
		const start = spawn(5, W, H, mulberry32(3));
		const copy = JSON.parse(JSON.stringify(start));
		step(start, defaults, W, H);
		expect(start).toEqual(copy);
	});

	it("aligns headings when alignment is on and the flock is close", () => {
		const start = spawn(40, 120, 120, mulberry32(2));
		const before = polarisation(start);
		const after = polarisation(
			run(
				start,
				{ ...defaults, separation: 0, cohesion: 0, perception: 200 },
				150,
			),
		);
		expect(after).toBeGreaterThan(before);
		expect(after).toBeGreaterThan(0.9);
	});

	it("spreads boids out when only separation is on", () => {
		const tight = spawn(30, 40, 40, mulberry32(5)).map((b) => ({
			...b,
			x: b.x + 180,
			y: b.y + 130,
		}));
		const before = spacing(tight);
		const after = spacing(
			run(
				tight,
				{ ...defaults, alignment: 0, cohesion: 0, wrap: false, minSpeed: 0.2 },
				60,
			),
		);
		expect(after).toBeGreaterThan(before);
	});

	it("flees a predator", () => {
		const boids: Boid[] = [{ x: 200, y: 150, vx: 0, vy: 1.5 }];
		const out = step(boids, defaults, W, H, { x: 180, y: 150, fear: 80 });
		expect(out[0].vx).toBeGreaterThan(0);
	});

	it("turns back at the walls when not wrapping", () => {
		const boids: Boid[] = [{ x: 5, y: 150, vx: -2, vy: 0.6 }];
		let b = boids;
		for (let i = 0; i < 40; i++)
			b = step(b, { ...defaults, wrap: false }, W, H);
		expect(b[0].vx).toBeGreaterThan(0);
		expect(b[0].x).toBeGreaterThanOrEqual(0);
	});
});

describe("measures", () => {
	it("polarisation is 1 for identical headings and near 0 for opposite ones", () => {
		expect(
			polarisation([
				{ x: 0, y: 0, vx: 1, vy: 0 },
				{ x: 1, y: 1, vx: 2, vy: 0 },
			]),
		).toBeCloseTo(1);
		expect(
			polarisation([
				{ x: 0, y: 0, vx: 1, vy: 0 },
				{ x: 1, y: 1, vx: -1, vy: 0 },
			]),
		).toBeCloseTo(0);
	});
});
