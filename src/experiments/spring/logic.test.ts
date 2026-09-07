import { describe, expect, it } from "vitest";
import {
	derive,
	fromBounce,
	overshoot,
	position,
	presets,
	settleTime,
	toLinear,
} from "./logic";

describe("derive", () => {
	it("computes stiffness and damping from response and damping fraction", () => {
		const d = derive({ response: 1, dampingFraction: 0.5 });
		expect(d.omega).toBeCloseTo(2 * Math.PI);
		expect(d.stiffness).toBeCloseTo(4 * Math.PI * Math.PI);
		expect(d.damping).toBeCloseTo(2 * Math.PI);
		expect(d.bounce).toBeCloseTo(0.5);
	});

	it("round-trips Apple's bounce", () => {
		expect(fromBounce(0.5, 0.3).dampingFraction).toBeCloseTo(0.7);
		expect(fromBounce(0.5, -0.25).dampingFraction).toBeCloseTo(1 / 0.75);
		expect(derive(fromBounce(0.5, -0.25)).bounce).toBeCloseTo(-0.25);
	});
});

describe("position", () => {
	it("starts at zero and ends at one", () => {
		for (const z of [0.3, 1, 1.6]) {
			const spec = { response: 0.5, dampingFraction: z };
			expect(position(0, spec)).toBe(0);
			expect(position(20, spec)).toBeCloseTo(1, 5);
		}
	});

	it("is continuous across the critically damped boundary", () => {
		const a = position(0.3, { response: 0.5, dampingFraction: 0.999 });
		const b = position(0.3, { response: 0.5, dampingFraction: 1 });
		const c = position(0.3, { response: 0.5, dampingFraction: 1.001 });
		expect(Math.abs(a - b)).toBeLessThan(0.01);
		expect(Math.abs(c - b)).toBeLessThan(0.01);
	});

	it("overshoots only when underdamped", () => {
		expect(overshoot({ response: 0.5, dampingFraction: 0.5 })).toBeGreaterThan(
			1.1,
		);
		expect(
			overshoot({ response: 0.5, dampingFraction: 1 }),
		).toBeLessThanOrEqual(1.001);
		expect(
			overshoot({ response: 0.5, dampingFraction: 1.5 }),
		).toBeLessThanOrEqual(1.001);
	});
});

describe("settleTime", () => {
	it("takes longer with less damping and with a longer response", () => {
		const fast = settleTime({ response: 0.3, dampingFraction: 0.8 });
		const slow = settleTime({ response: 0.6, dampingFraction: 0.8 });
		const bouncy = settleTime({ response: 0.3, dampingFraction: 0.3 });
		expect(slow).toBeGreaterThan(fast);
		expect(bouncy).toBeGreaterThan(fast);
	});

	it("is within reach of the response for the default spring", () => {
		const t = settleTime(presets[0].spec);
		expect(t).toBeGreaterThan(0.4);
		expect(t).toBeLessThan(2);
	});
});

describe("toLinear", () => {
	it("starts at 0, ends at 1 and stays short", () => {
		const { stops, duration } = toLinear({
			response: 0.5,
			dampingFraction: 0.6,
		});
		expect(stops.startsWith("0,")).toBe(true);
		expect(stops.endsWith(", 1")).toBe(true);
		expect(stops.split(",").length).toBeLessThan(60);
		expect(duration).toBeGreaterThan(0.5);
	});

	it("keeps the overshoot in the stops", () => {
		const { stops } = toLinear({ response: 0.5, dampingFraction: 0.4 });
		const values = stops.split(",").map((s) => Number.parseFloat(s.trim()));
		expect(Math.max(...values)).toBeGreaterThan(1.1);
	});
});
