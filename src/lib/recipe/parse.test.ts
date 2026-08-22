import { describe, expect, it } from "vitest";
import { parseRecipe, parseRecipeJson } from "./parse";

const valid = {
	title: "Test Bowl",
	description: "A bowl for testing.",
	servings: 4,
	rating: 4.5,
	tags: ["Quick"],
	prepMinutes: 10,
	cookMinutes: 20,
	ingredients: [
		{ quantity: 400, unit: "g", item: "rice" },
		{ item: "salt", note: "to taste" },
	],
	steps: ["Cook the rice.", { text: "Season.", minutes: 1 }],
	macros: { calories: 500, protein: 20, carbs: 60, fat: 18 },
};

function expectOk<T>(
	result: { ok: true; value: T } | { ok: false; error: string },
): T {
	if (!result.ok) throw new Error(`expected success, got: ${result.error}`);
	return result.value;
}

function expectErr(result: { ok: boolean; error?: string }): string {
	if (result.ok) throw new Error("expected failure");
	return result.error as string;
}

describe("parseRecipe", () => {
	it("accepts a complete recipe", () => {
		const recipe = expectOk(parseRecipe(valid));
		expect(recipe.title).toBe("Test Bowl");
		expect(recipe.servings).toBe(4);
		expect(recipe.rating).toBe(4.5);
		expect(recipe.ingredients).toHaveLength(2);
		expect(recipe.steps).toHaveLength(2);
		expect(recipe.macros.calories).toBe(500);
	});

	it("normalises steps given as plain strings", () => {
		const recipe = expectOk(parseRecipe(valid));
		expect(recipe.steps[0]).toEqual({ text: "Cook the rice.", minutes: null });
		expect(recipe.steps[1]).toEqual({ text: "Season.", minutes: 1 });
	});

	it("lower-cases tags and defaults the optional fields", () => {
		const recipe = expectOk(parseRecipe(valid));
		expect(recipe.tags).toEqual(["quick"]);
		expect(recipe.source).toBeNull();
	});

	it("treats an unmeasured ingredient as non-scaling", () => {
		const recipe = expectOk(parseRecipe(valid));
		expect(recipe.ingredients[1]).toEqual({
			item: "salt",
			quantity: null,
			unit: null,
			note: "to taste",
			scales: false,
		});
	});

	it("honours an explicit scales: false on a measured ingredient", () => {
		const recipe = expectOk(
			parseRecipe({
				...valid,
				ingredients: [
					{ quantity: 1, unit: "tsp", item: "baking soda", scales: false },
				],
			}),
		);
		expect(recipe.ingredients[0].scales).toBe(false);
	});

	it("divides macros given as a whole-recipe total down to one serving", () => {
		const recipe = expectOk(
			parseRecipe({
				...valid,
				macros: {
					calories: 2000,
					protein: 80,
					carbs: 240,
					fat: 72,
					basis: "total",
				},
			}),
		);
		expect(recipe.macros).toEqual({
			calories: 500,
			protein: 20,
			carbs: 60,
			fat: 18,
			fiber: null,
		});
	});

	it.each([
		["ingredients", "ingredients"],
		["steps", "steps"],
		["macros", "macros"],
		["servings", "servings"],
		["rating", "rating"],
	])("rejects a recipe with no %s", (field, expected) => {
		const incomplete: Record<string, unknown> = { ...valid };
		delete incomplete[field];
		expect(expectErr(parseRecipe(incomplete))).toContain(expected);
	});

	it("rejects an empty ingredient list", () => {
		expect(expectErr(parseRecipe({ ...valid, ingredients: [] }))).toContain(
			"non-empty array",
		);
	});

	it("rejects a rating outside 0–5", () => {
		expect(expectErr(parseRecipe({ ...valid, rating: 6 }))).toContain(
			"between 0 and 5",
		);
	});

	it("rejects a rating that is not a half step", () => {
		expect(expectErr(parseRecipe({ ...valid, rating: 4.2 }))).toContain(
			"half steps",
		);
	});

	it("rejects a fractional serving count", () => {
		expect(expectErr(parseRecipe({ ...valid, servings: 2.5 }))).toContain(
			"whole number",
		);
	});

	it("rejects a partial macro block", () => {
		const error = expectErr(
			parseRecipe({ ...valid, macros: { calories: 500, protein: 20 } }),
		);
		expect(error).toContain("macros.carbs");
		expect(error).toContain("macros.fat");
	});

	it("points at the offending index inside a list", () => {
		const error = expectErr(
			parseRecipe({ ...valid, ingredients: [{ quantity: 1, unit: "g" }] }),
		);
		expect(error).toContain("ingredients[0].item");
	});

	it("reports every problem at once", () => {
		const error = expectErr(parseRecipe({ title: "Only a title" }));
		expect(error.split("\n").length).toBeGreaterThan(4);
	});

	it("rejects a non-object", () => {
		expect(expectErr(parseRecipe(["nope"]))).toContain("JSON object");
	});
});

describe("parseRecipeJson", () => {
	it("parses valid JSON text", () => {
		expect(expectOk(parseRecipeJson(JSON.stringify(valid))).title).toBe(
			"Test Bowl",
		);
	});

	it("explains malformed JSON without throwing", () => {
		expect(expectErr(parseRecipeJson("{nope}"))).toContain("Not valid JSON");
	});

	it("asks for input rather than erroring on empty text", () => {
		expect(expectErr(parseRecipeJson("   "))).toBe("Paste a recipe first.");
	});
});
