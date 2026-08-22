import { err, ok, type Result } from "../result";
import type { Ingredient, Macros, Recipe, Step } from "./types";

const MAX_SERVINGS = 100;
const REQUIRED_MACROS = ["calories", "protein", "carbs", "fat"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function round(value: number, decimals: number): number {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
}

/** Collects every problem it finds, so one paste surfaces the whole list. */
class Issues {
	readonly list: string[] = [];

	add(field: string, problem: string): void {
		this.list.push(`${field}: ${problem}`);
	}

	/** Non-empty trimmed string, or `undefined` after recording the problem. */
	text(field: string, value: unknown): string | undefined {
		if (typeof value !== "string" || value.trim() === "") {
			this.add(field, "expected a non-empty string");
			return undefined;
		}
		return value.trim();
	}

	optionalText(field: string, value: unknown): string | null {
		if (value === undefined || value === null || value === "") return null;
		return this.text(field, value) ?? null;
	}

	number(
		field: string,
		value: unknown,
		min: number,
		max: number,
	): number | undefined {
		if (typeof value !== "number" || !Number.isFinite(value)) {
			this.add(field, "expected a number");
			return undefined;
		}
		if (value < min || value > max) {
			this.add(field, `expected a number between ${min} and ${max}`);
			return undefined;
		}
		return value;
	}

	optionalNumber(
		field: string,
		value: unknown,
		min: number,
		max: number,
	): number | null {
		if (value === undefined || value === null || value === "") return null;
		return this.number(field, value, min, max) ?? null;
	}
}

function parseIngredient(
	raw: unknown,
	field: string,
	issues: Issues,
): Ingredient | undefined {
	if (!isRecord(raw)) {
		issues.add(field, "expected an object like { item, quantity, unit }");
		return undefined;
	}
	const item = issues.text(`${field}.item`, raw.item);
	const quantity =
		raw.quantity === undefined || raw.quantity === null
			? null
			: (issues.number(`${field}.quantity`, raw.quantity, 0, 100_000) ?? null);
	const unit = issues.optionalText(`${field}.unit`, raw.unit);
	const note = issues.optionalText(`${field}.note`, raw.note);
	if (raw.scales !== undefined && typeof raw.scales !== "boolean") {
		issues.add(`${field}.scales`, "expected true or false");
	}
	if (item === undefined) return undefined;
	// An unmeasured line has nothing to scale.
	const scales = quantity === null ? false : raw.scales !== false;
	return { item, quantity, unit, note, scales };
}

function parseStep(
	raw: unknown,
	field: string,
	issues: Issues,
): Step | undefined {
	if (typeof raw === "string") {
		const text = issues.text(field, raw);
		return text === undefined ? undefined : { text, minutes: null };
	}
	if (!isRecord(raw)) {
		issues.add(field, "expected a string, or an object like { text, minutes }");
		return undefined;
	}
	const text = issues.text(`${field}.text`, raw.text);
	const minutes = issues.optionalNumber(
		`${field}.minutes`,
		raw.minutes,
		0,
		10_000,
	);
	return text === undefined ? undefined : { text, minutes };
}

function parseMacros(
	raw: unknown,
	servings: number,
	issues: Issues,
): Macros | undefined {
	if (!isRecord(raw)) {
		issues.add(
			"macros",
			"expected an object with calories, protein, carbs and fat",
		);
		return undefined;
	}

	const basis = raw.basis ?? "serving";
	if (basis !== "serving" && basis !== "total") {
		issues.add("macros.basis", 'expected "serving" or "total"');
	}
	// Totals are divided down so every stored recipe means the same thing.
	const divisor = basis === "total" ? servings : 1;

	const values: Partial<Record<(typeof REQUIRED_MACROS)[number], number>> = {};
	for (const key of REQUIRED_MACROS) {
		const value = issues.number(`macros.${key}`, raw[key], 0, 100_000);
		if (value !== undefined) values[key] = value / divisor;
	}
	const fiber = issues.optionalNumber("macros.fiber", raw.fiber, 0, 100_000);

	if (REQUIRED_MACROS.some((key) => values[key] === undefined))
		return undefined;
	return {
		calories: Math.round(values.calories as number),
		protein: round(values.protein as number, 1),
		carbs: round(values.carbs as number, 1),
		fat: round(values.fat as number, 1),
		fiber: fiber === null ? null : round(fiber / divisor, 1),
	};
}

function parseList(
	raw: unknown,
	field: string,
	issues: Issues,
): unknown[] | undefined {
	if (!Array.isArray(raw) || raw.length === 0) {
		issues.add(field, "expected a non-empty array");
		return undefined;
	}
	return raw;
}

/**
 * Turns unknown data into a `Recipe`, or explains everything that is wrong with
 * it. The five things every recipe on the site owes a reader — ingredients,
 * steps, a serving count, macros and a rating — are all required here, so an
 * incomplete recipe can never reach a page.
 */
export function parseRecipe(input: unknown): Result<Recipe> {
	if (!isRecord(input))
		return err("Expected a JSON object describing one recipe.");

	const issues = new Issues();
	const title = issues.text("title", input.title);
	const description = issues.text("description", input.description);

	const servings = issues.number("servings", input.servings, 1, MAX_SERVINGS);
	if (servings !== undefined && !Number.isInteger(servings)) {
		issues.add("servings", "expected a whole number of people");
	}

	const rating = issues.number("rating", input.rating, 0, 5);
	if (rating !== undefined && Math.round(rating * 2) !== rating * 2) {
		issues.add("rating", "expected a number in half steps, like 4 or 4.5");
	}

	const tags: string[] = [];
	if (input.tags !== undefined && input.tags !== null) {
		if (!Array.isArray(input.tags)) {
			issues.add("tags", "expected an array of strings");
		} else {
			input.tags.forEach((tag, i) => {
				const parsed = issues.text(`tags[${i}]`, tag);
				if (parsed !== undefined) tags.push(parsed.toLowerCase());
			});
		}
	}

	const prepMinutes = issues.optionalNumber(
		"prepMinutes",
		input.prepMinutes,
		0,
		10_000,
	);
	const cookMinutes = issues.optionalNumber(
		"cookMinutes",
		input.cookMinutes,
		0,
		10_000,
	);
	const source = issues.optionalText("source", input.source);

	const ingredients: Ingredient[] = [];
	const rawIngredients = parseList(input.ingredients, "ingredients", issues);
	rawIngredients?.forEach((raw, i) => {
		const parsed = parseIngredient(raw, `ingredients[${i}]`, issues);
		if (parsed) ingredients.push(parsed);
	});

	const steps: Step[] = [];
	const rawSteps = parseList(input.steps, "steps", issues);
	rawSteps?.forEach((raw, i) => {
		const parsed = parseStep(raw, `steps[${i}]`, issues);
		if (parsed) steps.push(parsed);
	});

	// Macros given as totals need the serving count, so fall back to 1 when that
	// is already broken — the serving-count issue is reported either way.
	const macros = parseMacros(input.macros, servings ?? 1, issues);

	if (issues.list.length > 0) return err(issues.list.join("\n"));

	return ok({
		title: title as string,
		description: description as string,
		servings: servings as number,
		rating: rating as number,
		tags,
		prepMinutes,
		cookMinutes,
		source,
		ingredients,
		steps,
		macros: macros as Macros,
	});
}

/** `parseRecipe`, but starting from raw text. */
export function parseRecipeJson(text: string): Result<Recipe> {
	if (text.trim() === "") return err("Paste a recipe first.");
	let data: unknown;
	try {
		data = JSON.parse(text);
	} catch (e) {
		return err(
			`Not valid JSON — ${e instanceof Error ? e.message : "could not parse"}`,
		);
	}
	return parseRecipe(data);
}
