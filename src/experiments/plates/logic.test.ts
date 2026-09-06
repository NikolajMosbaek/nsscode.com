import { describe, expect, it } from "vitest";
import {
	formatKg,
	load,
	nextAbove,
	type PlateStock,
	ramp,
	standardStock,
} from "./logic";

describe("load", () => {
	it("puts the heaviest plate first, closest to the collar", () => {
		const result = load(100, 20, standardStock);
		expect(result.perSide).toEqual([25, 15]);
		expect(result.exact).toBe(true);
		expect(result.total).toBe(100);
	});

	it("uses the fewest plates, heavier first when tied", () => {
		expect(load(60, 20, standardStock).perSide).toEqual([20]);
		expect(load(90, 20, standardStock).perSide).toEqual([25, 10]);
		expect(load(62.5, 20, standardStock).perSide).toEqual([20, 1.25]);
	});

	it("does not fall for the greedy trap", () => {
		const stock: PlateStock[] = [
			{ kg: 25, perSide: 1 },
			{ kg: 20, perSide: 1 },
			{ kg: 10, perSide: 1 },
		];
		/* 30 per side: greedy takes 25 and is stuck; 20 + 10 is exact. */
		expect(load(80, 20, stock).perSide).toEqual([20, 10]);
	});

	it("returns the nearest achievable weight below when exact is impossible", () => {
		const stock: PlateStock[] = [{ kg: 5, perSide: 2 }];
		const result = load(42, 20, stock);
		expect(result.exact).toBe(false);
		expect(result.total).toBe(40);
		expect(result.perSide).toEqual([5, 5]);
	});

	it("respects how many plates there are per side", () => {
		const stock: PlateStock[] = [{ kg: 25, perSide: 1 }];
		const result = load(120, 20, stock);
		expect(result.perSide).toEqual([25]);
		expect(result.total).toBe(70);
		expect(result.exact).toBe(false);
	});

	it("handles a target at or below the bar", () => {
		expect(load(20, 20, standardStock)).toMatchObject({
			perSide: [],
			total: 20,
			exact: true,
		});
		expect(load(15, 20, standardStock)).toMatchObject({
			perSide: [],
			total: 20,
			exact: false,
		});
	});
});

describe("nextAbove", () => {
	it("finds the next loadable weight above an impossible target", () => {
		const stock: PlateStock[] = [{ kg: 5, perSide: 3 }];
		expect(nextAbove(42, 20, stock)).toBe(50);
	});

	it("returns null when nothing heavier can be made", () => {
		const stock: PlateStock[] = [{ kg: 25, perSide: 1 }];
		expect(nextAbove(120, 20, stock)).toBeNull();
	});
});

describe("ramp", () => {
	it("starts with the bar and ends with the work weight, rising in between", () => {
		const steps = ramp(100, 20, standardStock);
		expect(steps[0].label).toBe("bar");
		expect(steps.at(-1)?.label).toBe("work");
		const totals = steps.map((s) => s.loading.total);
		for (let i = 1; i < totals.length; i++) {
			expect(totals[i]).toBeGreaterThan(totals[i - 1]);
		}
		expect(totals.at(-1)).toBe(100);
	});

	it("skips steps that would not rise for a light work weight", () => {
		const steps = ramp(25, 20, standardStock);
		expect(steps.map((s) => s.label)).toEqual(["bar", "work"]);
	});
});

describe("formatKg", () => {
	it("prints whole kilos plain and fractions tidily", () => {
		expect(formatKg(25)).toBe("25");
		expect(formatKg(2.5)).toBe("2.5");
		expect(formatKg(1.25)).toBe("1.25");
	});
});
