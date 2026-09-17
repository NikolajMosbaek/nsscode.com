import { describe, expect, it } from "vitest";
import {
	build531,
	buildLinear,
	buildTexas,
	decode,
	defaultRack,
	defaultState,
	encode,
	fiveRepMax,
	type Maxes,
	nearest,
} from "./logic";

const maxes: Maxes = { squat: 140, bench: 100, deadlift: 180, press: 60 };

describe("nearest", () => {
	it("rounds to the closest loadable weight, either side", () => {
		expect(nearest(101, defaultRack).weight).toBe(100);
		expect(nearest(104, defaultRack).weight).toBe(105);
		expect(nearest(102.5, defaultRack).weight).toBe(102.5);
	});

	it("never goes below the bar", () => {
		expect(nearest(10, defaultRack).weight).toBe(20);
		expect(nearest(10, defaultRack).perSide).toEqual([]);
	});
});

describe("5/3/1", () => {
	it("makes four weeks of four days with three work sets each", () => {
		const s = build531(maxes, defaultRack);
		expect(s).toHaveLength(16);
		expect(s.every((x) => x.exercises[0].sets.length === 3)).toBe(true);
		expect(s.map((x) => x.week)).toEqual([
			1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4,
		]);
	});

	it("uses 90 % training max and the classic percentages", () => {
		const s = build531(maxes, defaultRack);
		const squatW3 = s.find(
			(x) => x.week === 3 && x.exercises[0].lift === "squat",
		);
		const sets = squatW3?.exercises[0].sets ?? [];
		expect(sets.map((x) => x.target)).toEqual([
			140 * 0.9 * 0.75,
			140 * 0.9 * 0.85,
			140 * 0.9 * 0.95,
		]);
		expect(sets.map((x) => x.reps)).toEqual([5, 3, 1]);
		expect(sets[2].amrap).toBe(true);
		expect(sets[2].weight).toBe(120);
	});

	it("deloads in week four without an AMRAP", () => {
		const s = build531(maxes, defaultRack);
		const w4 = s.filter((x) => x.week === 4);
		expect(w4.every((x) => x.title === "deload")).toBe(true);
		expect(
			w4.every((x) => x.exercises[0].sets.every((set) => !set.amrap)),
		).toBe(true);
	});
});

describe("Texas Method", () => {
	it("adds 2,5 kg to the Friday squat every week and volume is 90 % of it", () => {
		const s = buildTexas(maxes, defaultRack, 3);
		expect(s).toHaveLength(9);
		const fri = s
			.filter((x) => x.day === 3)
			.map((x) => x.exercises[0].sets[0].target);
		expect(fri[1] - fri[0]).toBeCloseTo(2.5);
		expect(fri[2] - fri[1]).toBeCloseTo(2.5);
		const mon = s.find((x) => x.week === 1 && x.day === 1);
		expect(mon?.exercises[0].sets[0].target).toBeCloseTo(fri[0] * 0.9);
		expect(mon?.exercises[0].sets[0].sets).toBe(5);
	});

	it("alternates bench and press week by week", () => {
		const s = buildTexas(maxes, defaultRack, 2);
		expect(s.find((x) => x.week === 1 && x.day === 1)?.exercises[1].lift).toBe(
			"bench",
		);
		expect(s.find((x) => x.week === 2 && x.day === 1)?.exercises[1].lift).toBe(
			"press",
		);
	});
});

describe("linear progression", () => {
	it("adds weight every session and alternates A and B", () => {
		const s = buildLinear(maxes, defaultRack, 2);
		expect(s).toHaveLength(6);
		expect(s.map((x) => x.title)).toEqual(["A", "B", "A", "B", "A", "B"]);
		const squats = s.map((x) => x.exercises[0].sets[0].target);
		for (let i = 1; i < squats.length; i++)
			expect(squats[i] - squats[i - 1]).toBeCloseTo(2.5);
		const deads = s.map((x) => x.exercises[2].sets[0].target);
		expect(deads[1] - deads[0]).toBeCloseTo(5);
	});

	it("starts at 80 % of the estimated five-rep max", () => {
		const s = buildLinear(maxes, defaultRack, 1);
		expect(s[0].exercises[0].sets[0].target).toBeCloseTo(fiveRepMax(140) * 0.8);
	});
});

describe("url state", () => {
	it("round-trips", () => {
		const state = {
			...defaultState,
			programme: "texas" as const,
			weeks: 6,
			ramp: true,
		};
		expect(decode(encode(state))).toEqual(state);
	});

	it("falls back to defaults on junk", () => {
		const s = decode("p=nope&sq=abc&dl=-5&w=99");
		expect(s.programme).toBe("531");
		expect(s.maxes.squat).toBe(defaultState.maxes.squat);
		expect(s.maxes.deadlift).toBe(defaultState.maxes.deadlift);
		expect(s.weeks).toBe(defaultState.weeks);
	});
});
