import { describe, expect, it } from "vitest";
import { type Bezier, ease, isValid, presets, samples, toCss } from "./logic";

const linear: Bezier = [0, 0, 1, 1];
const easeOut: Bezier = [0, 0, 0.58, 1];

describe("isValid", () => {
	it("accepts x within 0 to 1 and any y", () => {
		expect(isValid([0.2, -0.5, 0.8, 1.5])).toBe(true);
	});

	it("rejects x outside 0 to 1", () => {
		expect(isValid([-0.1, 0, 1, 1])).toBe(false);
		expect(isValid([0, 0, 1.1, 1])).toBe(false);
	});
});

describe("toCss", () => {
	it("formats with three decimals at most", () => {
		expect(toCss([0.25, 0.1, 0.25, 1])).toBe(
			"cubic-bezier(0.25, 0.1, 0.25, 1)",
		);
		expect(toCss([0.123456, 0, 1, 1])).toBe("cubic-bezier(0.123, 0, 1, 1)");
	});
});

describe("ease", () => {
	it("is the identity for the linear curve", () => {
		for (const x of [0, 0.25, 0.5, 0.75, 1]) {
			expect(ease(linear, x)).toBeCloseTo(x, 5);
		}
	});

	it("clamps the ends", () => {
		expect(ease(easeOut, -1)).toBe(0);
		expect(ease(easeOut, 2)).toBe(1);
	});

	it("runs ahead of linear for ease-out", () => {
		expect(ease(easeOut, 0.5)).toBeGreaterThan(0.5);
	});

	it("matches the presets' shape at the midpoint", () => {
		const easeIn = presets.find((p) => p.name === "ease-in");
		if (!easeIn) throw new Error("preset missing");
		expect(ease(easeIn.points, 0.5)).toBeLessThan(0.5);
	});
});

describe("samples", () => {
	it("starts at the origin and ends at (1, 1)", () => {
		const points = samples(easeOut, 10);
		expect(points).toHaveLength(11);
		expect(points[0]).toEqual([0, 0]);
		expect(points[10][0]).toBeCloseTo(1);
		expect(points[10][1]).toBeCloseTo(1);
	});
});
