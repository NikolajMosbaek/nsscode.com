import { describe, expect, it } from "vitest";
import {
	annuity,
	bidragssats,
	type Deal,
	deductionValue,
	defaultDeal,
	plan,
	rentefradrag,
	shifted,
} from "./logic";

const deal: Deal = { ...defaultDeal };

describe("annuity", () => {
	it("clears the balance over the term", () => {
		const a = annuity(1_000_000, 4, 30);
		let balance = 1_000_000;
		for (let i = 0; i < 30; i++) balance = balance * 1.04 - a;
		expect(balance).toBeCloseTo(0, 4);
	});

	it("is a straight split when the rate is zero", () => {
		expect(annuity(300_000, 0, 30)).toBe(10_000);
	});
});

describe("bidragssats", () => {
	it("charges each band on the part of the debt inside it", () => {
		/* 80 % of 4 M is 3,2 M: 1,6 at 0,40, 0,8 at 0,60, 0,8 at 0,85. */
		const rate = bidragssats(3_200_000, 4_000_000, false, false);
		const expected =
			(1_600_000 * 0.4 + 800_000 * 0.6 + 800_000 * 0.85) / 3_200_000;
		expect(rate).toBeCloseTo(expected, 6);
	});

	it("is the cheapest band alone for a small loan", () => {
		expect(bidragssats(1_000_000, 4_000_000, false, false)).toBeCloseTo(0.4, 6);
	});

	it("costs more variable than fixed, and more again without afdrag", () => {
		const fixed = bidragssats(3_200_000, 4_000_000, false, false);
		const flex = bidragssats(3_200_000, 4_000_000, true, false);
		const io = bidragssats(3_200_000, 4_000_000, false, true);
		expect(flex).toBeGreaterThan(fixed);
		expect(io).toBeGreaterThan(fixed);
	});

	it("adds nothing for afdragsfrihed below 60 % of the value", () => {
		const withIo = bidragssats(2_000_000, 4_000_000, false, true);
		const without = bidragssats(2_000_000, 4_000_000, false, false);
		expect(withIo).toBeCloseTo(without, 6);
	});
});

describe("deductionValue", () => {
	it("uses the higher value below the threshold and the lower above", () => {
		expect(deductionValue(40_000, false)).toBeCloseTo(
			40_000 * rentefradrag.high,
			4,
		);
		expect(deductionValue(80_000, false)).toBeCloseTo(
			50_000 * rentefradrag.high + 30_000 * rentefradrag.low,
			4,
		);
	});

	it("doubles the threshold for two people", () => {
		expect(deductionValue(80_000, true)).toBeCloseTo(
			80_000 * rentefradrag.high,
			4,
		);
	});
});

describe("plan", () => {
	it("splits the price into udbetaling, realkredit up to 80 % and a bank loan", () => {
		const p = plan({ ...deal, price: 4_000_000, udbetaling: 200_000 });
		expect(p.provenu).toBe(3_200_000);
		expect(p.bankLoan).toBe(600_000);
		expect(p.provenu + p.bankLoan + 200_000).toBe(4_000_000);
	});

	it("needs no bank loan when the udbetaling is a fifth", () => {
		const p = plan({ ...deal, price: 4_000_000, udbetaling: 800_000 });
		expect(p.bankLoan).toBe(0);
		expect(p.provenu).toBe(3_200_000);
	});

	it("issues more debt than it pays out when the kurs is below 100", () => {
		const p = plan({ ...deal, kurs: 97 });
		expect(p.hovedstol).toBeCloseTo(p.provenu / 0.97, 4);
		expect(p.kurstab).toBeGreaterThan(0);
		const par = plan({ ...deal, kurs: 100 });
		expect(par.kurstab).toBe(0);
		expect(par.hovedstol).toBe(par.provenu);
	});

	it("clears the debt by the end of the term", () => {
		const p = plan({ ...deal, udbetaling: 800_000 });
		expect(p.years).toHaveLength(30);
		const last = p.years[p.years.length - 1];
		expect(last.debt - last.afdrag).toBeLessThan(1);
	});

	it("pays no afdrag while interest-only, then still finishes on time", () => {
		const p = plan({ ...deal, udbetaling: 800_000, interestOnlyYears: 10 });
		expect(p.years.slice(0, 10).every((y) => y.afdrag === 0)).toBe(true);
		expect(p.years[10].afdrag).toBeGreaterThan(0);
		expect(p.years).toHaveLength(30);
		const last = p.years[p.years.length - 1];
		expect(last.debt - last.afdrag).toBeLessThan(1);
	});

	it("makes afdragsfrihed cheaper monthly and dearer in total", () => {
		const straight = plan({ ...deal, udbetaling: 800_000 });
		const io = plan({ ...deal, udbetaling: 800_000, interestOnlyYears: 10 });
		expect(io.firstMonth).toBeLessThan(straight.firstMonth);
		expect(io.totalPaid).toBeGreaterThan(straight.totalPaid);
	});

	it("takes less after tax than before", () => {
		const p = plan(deal);
		expect(p.firstMonthAfterTax).toBeLessThan(p.firstMonth);
		expect(p.totalAfterTax).toBeLessThan(p.totalPaid);
	});

	it("flags a deposit under five percent", () => {
		expect(plan({ ...deal, udbetaling: 100_000 }).impossible).toBe(true);
		expect(plan({ ...deal, udbetaling: 200_000 }).impossible).toBe(false);
	});
});

describe("shifted", () => {
	it("moves the rate and costs more", () => {
		const base = plan({ ...deal, kind: "f5", rate: 2.6 });
		const up = plan(shifted({ ...deal, kind: "f5", rate: 2.6 }, 3));
		expect(up.firstMonth).toBeGreaterThan(base.firstMonth);
		expect(shifted(deal, -99).rate).toBe(0);
	});
});
