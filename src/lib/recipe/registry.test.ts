import { describe, expect, it } from "vitest";
import { buildRecipeRegistry, collectTags, slugFromPath } from "./registry";

const recipe = (over: Record<string, unknown> = {}) => ({
	title: "Bowl",
	description: "A bowl.",
	servings: 2,
	rating: 4,
	ingredients: [{ quantity: 1, unit: "g", item: "rice" }],
	steps: ["Cook."],
	macros: { calories: 100, protein: 5, carbs: 10, fat: 2 },
	...over,
});

describe("slugFromPath", () => {
	it("takes the file name of a recipe", () => {
		expect(slugFromPath("../../recipes/lemon-orzo.json")).toBe("lemon-orzo");
	});

	it("rejects a path that is not a recipe file", () => {
		expect(() => slugFromPath("../../tools/uuid-gen/meta.ts")).toThrow(/slug/);
	});
});

describe("buildRecipeRegistry", () => {
	it("pairs each recipe with its slug", () => {
		const entries = buildRecipeRegistry({
			"../../recipes/bowl.json": { default: recipe() },
		});
		expect(entries).toHaveLength(1);
		expect(entries[0].slug).toBe("bowl");
		expect(entries[0].recipe.title).toBe("Bowl");
	});

	it("sorts by rating, then title", () => {
		const entries = buildRecipeRegistry({
			"../../recipes/b.json": { default: recipe({ title: "Beta", rating: 4 }) },
			"../../recipes/a.json": {
				default: recipe({ title: "Alpha", rating: 4 }),
			},
			"../../recipes/c.json": {
				default: recipe({ title: "Gamma", rating: 5 }),
			},
		});
		expect(entries.map((e) => e.recipe.title)).toEqual([
			"Gamma",
			"Alpha",
			"Beta",
		]);
	});

	it("fails the build on an incomplete recipe, naming the file and the field", () => {
		expect(() =>
			buildRecipeRegistry({
				"../../recipes/broken.json": { default: recipe({ macros: undefined }) },
			}),
		).toThrow(/Invalid recipe "broken"[\s\S]*macros/);
	});
});

describe("collectTags", () => {
	it("lists tags most-used first, then alphabetically", () => {
		const entries = buildRecipeRegistry({
			"../../recipes/a.json": { default: recipe({ tags: ["quick", "vegan"] }) },
			"../../recipes/b.json": { default: recipe({ tags: ["quick"] }) },
			"../../recipes/c.json": { default: recipe({ tags: ["baking"] }) },
		});
		expect(collectTags(entries)).toEqual(["quick", "baking", "vegan"]);
	});

	it("is empty when nothing is tagged", () => {
		expect(collectTags([])).toEqual([]);
	});
});
