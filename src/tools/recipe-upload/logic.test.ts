import { describe, expect, it } from "vitest";
import { prepareUpload, slugify, toFileText } from "./logic";

const valid = {
	title: "Lemon Orzo",
	description: "One skillet.",
	servings: 4,
	rating: 4.5,
	ingredients: [{ quantity: 300, unit: "g", item: "orzo" }],
	steps: ["Cook it."],
	macros: { calories: 640, protein: 42, carbs: 58, fat: 24 },
};

describe("slugify", () => {
	it("lowercases and hyphenates", () => {
		expect(slugify("Lemon Orzo with Chicken")).toBe("lemon-orzo-with-chicken");
	});

	it("folds accents and Danish letters", () => {
		expect(slugify("Crème Brûlée")).toBe("creme-brulee");
		expect(slugify("Rødgrød med Fløde")).toBe("rodgrod-med-flode");
		expect(slugify("Æbleskiver")).toBe("aebleskiver");
	});

	it("collapses punctuation and trims stray hyphens", () => {
		expect(slugify("  Mac & Cheese!! ")).toBe("mac-cheese");
	});

	it("caps the length without leaving a trailing hyphen", () => {
		const slug = slugify(`${"a".repeat(58)} bcd`);
		expect(slug.length).toBeLessThanOrEqual(60);
		expect(slug.endsWith("-")).toBe(false);
	});

	it("is empty when there is nothing usable", () => {
		expect(slugify("!!!")).toBe("");
	});
});

describe("toFileText", () => {
	it("round-trips through JSON", () => {
		const result = prepareUpload(JSON.stringify(valid));
		if (!result.ok) throw new Error(result.error);
		expect(JSON.parse(result.value.fileText).title).toBe("Lemon Orzo");
	});

	it("writes tab-indented JSON ending in a newline", () => {
		const result = prepareUpload(JSON.stringify(valid));
		if (!result.ok) throw new Error(result.error);
		expect(result.value.fileText).toContain('\n\t"title"');
		expect(result.value.fileText.endsWith("}\n")).toBe(true);
	});

	it("keeps a stable field order regardless of the pasted order", () => {
		const shuffled = {
			macros: valid.macros,
			steps: valid.steps,
			ingredients: valid.ingredients,
			rating: valid.rating,
			servings: valid.servings,
			description: valid.description,
			title: valid.title,
		};
		const result = prepareUpload(JSON.stringify(shuffled));
		if (!result.ok) throw new Error(result.error);
		const keys = Object.keys(JSON.parse(result.value.fileText));
		expect(keys[0]).toBe("title");
		expect(keys.at(-1)).toBe("macros");
	});

	it("emits the normalised recipe, not the raw paste", () => {
		const text = toFileText({
			title: "T",
			description: "D",
			servings: 2,
			rating: 3,
			tags: [],
			prepMinutes: null,
			cookMinutes: null,
			source: null,
			ingredients: [
				{ item: "salt", quantity: null, unit: null, note: null, scales: false },
			],
			steps: [{ text: "Go.", minutes: null }],
			macros: { calories: 1, protein: 1, carbs: 1, fat: 1, fiber: null },
		});
		expect(JSON.parse(text).ingredients[0].scales).toBe(false);
	});
});

describe("prepareUpload", () => {
	it("derives the file path from the title", () => {
		const result = prepareUpload(JSON.stringify(valid));
		if (!result.ok) throw new Error(result.error);
		expect(result.value.slug).toBe("lemon-orzo");
		expect(result.value.fileName).toBe("src/recipes/lemon-orzo.json");
	});

	it("prefers an explicit slug over the title", () => {
		const result = prepareUpload(JSON.stringify(valid), "Weeknight Orzo");
		if (!result.ok) throw new Error(result.error);
		expect(result.value.slug).toBe("weeknight-orzo");
	});

	it("ignores a blank slug override", () => {
		const result = prepareUpload(JSON.stringify(valid), "   ");
		if (!result.ok) throw new Error(result.error);
		expect(result.value.slug).toBe("lemon-orzo");
	});

	it("passes the validation error straight through", () => {
		const result = prepareUpload(
			JSON.stringify({ ...valid, rating: undefined }),
		);
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toContain("rating");
	});

	it("rejects a slug override with nothing usable in it", () => {
		const result = prepareUpload(JSON.stringify(valid), "###");
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toContain("file name");
	});
});
