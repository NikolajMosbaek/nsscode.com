import { describe, expect, it } from "vitest";
import {
	formatAmount,
	formatMinutes,
	formatQuantity,
	macroSplit,
	scaleFactor,
	scaleMacros,
	totalMinutes,
} from "./scale";
import type { Ingredient, Macros, Recipe } from "./types";

const ingredient = (over: Partial<Ingredient> = {}): Ingredient => ({
	item: "rice",
	quantity: 400,
	unit: "g",
	note: null,
	scales: true,
	...over,
});

const macros: Macros = {
	calories: 500,
	protein: 20,
	carbs: 60,
	fat: 18,
	fiber: 4,
};

describe("scaleFactor", () => {
	it("is 1 when the head count matches the recipe", () => {
		expect(scaleFactor(4, 4)).toBe(1);
	});

	it("halves and doubles", () => {
		expect(scaleFactor(4, 2)).toBe(0.5);
		expect(scaleFactor(2, 6)).toBe(3);
	});

	it("falls back to 1 on nonsense input rather than dividing by zero", () => {
		expect(scaleFactor(0, 4)).toBe(1);
		expect(scaleFactor(4, 0)).toBe(1);
		expect(scaleFactor(4, Number.NaN)).toBe(1);
	});
});

describe("formatQuantity", () => {
	it("keeps whole numbers whole", () => {
		expect(formatQuantity(400)).toBe("400");
		expect(formatQuantity(2)).toBe("2");
	});

	it("writes small awkward numbers as fractions", () => {
		expect(formatQuantity(0.5)).toBe("½");
		expect(formatQuantity(2.5)).toBe("2\u2009½");
		expect(formatQuantity(1.75)).toBe("1\u2009¾");
		expect(formatQuantity(1 / 3)).toBe("⅓");
		expect(formatQuantity(2 / 3)).toBe("⅔");
	});

	it("keeps one decimal in the middle range", () => {
		expect(formatQuantity(66.666)).toBe("66.7");
		expect(formatQuantity(12.5)).toBe("12.5");
	});

	it("stops pretending to be precise on large numbers", () => {
		expect(formatQuantity(133.333)).toBe("133");
	});

	it("returns nothing for a missing or nonsense quantity", () => {
		expect(formatQuantity(0)).toBe("");
		expect(formatQuantity(Number.NaN)).toBe("");
	});
});

describe("formatAmount", () => {
	it("scales a measured ingredient and appends the unit", () => {
		expect(formatAmount(ingredient(), 1.5)).toBe("600 g");
	});

	it("leaves a non-scaling ingredient alone", () => {
		expect(formatAmount(ingredient({ scales: false }), 3)).toBe("400 g");
	});

	it("omits the unit when there is none", () => {
		expect(formatAmount(ingredient({ quantity: 2, unit: null }), 2)).toBe("4");
	});

	it("is empty for an unmeasured ingredient", () => {
		expect(formatAmount(ingredient({ quantity: null }), 2)).toBe("");
	});
});

describe("scaleMacros", () => {
	it("returns the per-serving figures for one person", () => {
		expect(scaleMacros(macros, 1)).toEqual(macros);
	});

	it("multiplies every macro by the head count", () => {
		expect(scaleMacros(macros, 3)).toEqual({
			calories: 1500,
			protein: 60,
			carbs: 180,
			fat: 54,
			fiber: 12,
		});
	});

	it("keeps a missing fibre figure missing", () => {
		expect(scaleMacros({ ...macros, fiber: null }, 2).fiber).toBeNull();
	});

	it("rounds grams to one decimal", () => {
		expect(scaleMacros({ ...macros, protein: 20.55 }, 3).protein).toBe(61.7);
	});
});

describe("totalMinutes", () => {
	const recipe = (over: Partial<Recipe>) => ({ ...over }) as Recipe;

	it("adds prep and cook time", () => {
		expect(totalMinutes(recipe({ prepMinutes: 10, cookMinutes: 20 }))).toBe(30);
	});

	it("copes with only one of the two", () => {
		expect(totalMinutes(recipe({ prepMinutes: 10, cookMinutes: null }))).toBe(
			10,
		);
	});

	it("is null when the recipe states neither", () => {
		expect(
			totalMinutes(recipe({ prepMinutes: null, cookMinutes: null })),
		).toBeNull();
	});
});

describe("formatMinutes", () => {
	it("leaves sub-hour times in minutes", () => {
		expect(formatMinutes(45)).toBe("45 min");
	});

	it("splits longer times into hours and minutes", () => {
		expect(formatMinutes(95)).toBe("1 h 35 min");
		expect(formatMinutes(120)).toBe("2 h");
	});
});

describe("macroSplit", () => {
	it("splits calories across the three macros and sums to 100", () => {
		const split = macroSplit(macros);
		expect(split.protein + split.carbs + split.fat).toBeCloseTo(100);
		expect(split.fat).toBeCloseTo((18 * 9 * 100) / (20 * 4 + 60 * 4 + 18 * 9));
	});

	it("returns zeroes rather than NaN for an empty macro block", () => {
		expect(
			macroSplit({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: null }),
		).toEqual({
			protein: 0,
			carbs: 0,
			fat: 0,
		});
	});
});
