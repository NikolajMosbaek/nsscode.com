import { describe, expect, it } from "vitest";
import { brackets, compute, grossFor, type Input, marginal } from "./logic";

const base: Input = {
	salary: 500_000,
	pensionShare: 0,
	kommuneskat: 0.25,
	kirkeskat: 0.0087,
	kirke: false,
};

describe("compute", () => {
	it("matches a hand calculation for 500.000 kr. with no pension", () => {
		const b = compute(base);
		expect(b.am).toBeCloseTo(40_000, 0);
		expect(b.personligIndkomst).toBeCloseTo(460_000, 0);
		expect(b.beskaeftigelsesfradrag).toBe(63_300);
		expect(b.jobfradrag).toBe(3_100);
		expect(b.bund).toBeCloseTo((460_000 - 54_100) * 0.1201, 0);
		expect(b.skattepligtigIndkomst).toBeCloseTo(460_000 - 66_400 - 54_100, 0);
		expect(b.kommune).toBeCloseTo(339_500 * 0.25, 0);
		expect(b.mellem).toBe(0);
		expect(b.top).toBe(0);
		expect(b.tax).toBeCloseTo(40_000 + 48_748.59 + 84_875, 0);
		expect(b.net).toBeCloseTo(500_000 - b.tax, 0);
	});

	it("charges nothing on nothing and no bundskat under the personfradrag", () => {
		expect(compute({ ...base, salary: 0 }).tax).toBe(0);
		const small = compute({ ...base, salary: 50_000 });
		expect(small.bund).toBe(0);
		expect(small.kommune).toBe(0);
		expect(small.am).toBeCloseTo(4_000, 0);
	});

	it("starts mellemskat and topskat at the published thresholds after AM", () => {
		const justBelow = compute({ ...base, salary: 641_200 / 0.92 - 1 });
		const justAbove = compute({ ...base, salary: 641_200 / 0.92 + 1000 });
		expect(justBelow.mellem).toBe(0);
		expect(justAbove.mellem).toBeGreaterThan(0);
		expect(compute({ ...base, salary: 900_000 }).top).toBeCloseTo(
			(900_000 * 0.92 - 777_900) * 0.075,
			0,
		);
	});

	it("takes pension off before AM and before the brackets", () => {
		const withPension = compute({
			...base,
			salary: 900_000,
			pensionShare: 0.15,
		});
		expect(withPension.pension).toBeCloseTo(135_000, 0);
		expect(withPension.am).toBeCloseTo(765_000 * 0.08, 0);
		expect(withPension.personligIndkomst).toBeCloseTo(765_000 * 0.92, 0);
		expect(withPension.beskaeftigelsesfradrag).toBe(63_300);
	});

	it("caps the state rates with the skatteloft in a high-tax kommune", () => {
		const b = compute({ ...base, salary: 3_000_000, kommuneskat: 0.263 });
		const r = b.effectiveRates;
		expect(0.1201 + r.mellem + 0.263).toBeCloseTo(0.4457, 6);
		expect(0.1201 + r.mellem + r.top + 0.263).toBeCloseTo(0.5207, 6);
		expect(0.1201 + r.mellem + r.top + r.topTop + 0.263).toBeCloseTo(0.5707, 6);
		const avg = compute({ ...base, salary: 3_000_000 }).effectiveRates;
		expect(avg.mellem).toBe(0.075);
		expect(avg.top).toBe(0.075);
		expect(avg.topTop).toBe(0.05);
	});
});

describe("marginal", () => {
	it("is 8 % plus 92 % of the stacked rates once the fradrag are maxed", () => {
		expect(marginal(base)).toBeCloseTo(0.08 + 0.92 * (0.1201 + 0.25), 4);
		expect(marginal({ ...base, salary: 1_000_000 })).toBeCloseTo(
			0.08 + 0.92 * (0.1201 + 0.075 + 0.075 + 0.25),
			4,
		);
		expect(marginal({ ...base, salary: 3_500_000 })).toBeCloseTo(
			0.08 + 0.92 * (0.1201 + 0.075 + 0.075 + 0.05 + 0.25),
			4,
		);
	});

	it("is lower while the beskæftigelsesfradrag is still growing", () => {
		expect(marginal({ ...base, salary: 300_000 })).toBeLessThan(marginal(base));
	});
});

describe("brackets", () => {
	it("converts thresholds back to gross salary", () => {
		expect(grossFor(777_900, 0)).toBeCloseTo(777_900 / 0.92, 2);
		expect(grossFor(777_900, 0.1)).toBeCloseTo(777_900 / 0.92 / 0.9, 2);
		expect(brackets(0).map((b) => b.id)).toEqual([
			"bund",
			"mellem",
			"top",
			"topTop",
		]);
	});
});
