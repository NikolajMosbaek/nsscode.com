import type { Ingredient, Macros, Recipe } from "./types";

/** Fractions worth showing as glyphs rather than decimals. */
const FRACTIONS: [value: number, glyph: string][] = [
	[1 / 8, "⅛"],
	[1 / 4, "¼"],
	[1 / 3, "⅓"],
	[1 / 2, "½"],
	[2 / 3, "⅔"],
	[3 / 4, "¾"],
];

function trimZeros(text: string): string {
	return text.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
}

/** How much to multiply a recipe by to feed `people` instead of `servings`. */
export function scaleFactor(servings: number, people: number): number {
	if (!Number.isFinite(servings) || servings <= 0) return 1;
	if (!Number.isFinite(people) || people <= 0) return 1;
	return people / servings;
}

/**
 * Renders a scaled quantity the way a cook would write it: whole numbers stay
 * whole, awkward thirds and halves become fractions, and big numbers stop
 * pretending to be precise.
 */
export function formatQuantity(quantity: number): string {
	if (!Number.isFinite(quantity) || quantity <= 0) return "";

	const nearest = Math.round(quantity);
	if (Math.abs(quantity - nearest) < 0.02) return String(nearest);
	if (quantity >= 100) return String(nearest);
	if (quantity >= 10) return trimZeros(quantity.toFixed(1));

	const whole = Math.floor(quantity);
	const fraction = quantity - whole;
	for (const [value, glyph] of FRACTIONS) {
		if (Math.abs(fraction - value) < 0.03) {
			return whole === 0 ? glyph : `${whole} ${glyph}`;
		}
	}
	return trimZeros(quantity.toFixed(2));
}

/** The quantity + unit as one string, e.g. `1 ½ tbsp`. Empty when unmeasured. */
export function formatAmount(ingredient: Ingredient, factor: number): string {
	if (ingredient.quantity === null) return "";
	const quantity = ingredient.scales
		? ingredient.quantity * factor
		: ingredient.quantity;
	const amount = formatQuantity(quantity);
	if (amount === "") return "";
	return ingredient.unit ? `${amount} ${ingredient.unit}` : amount;
}

/** Macros for `people`, from the recipe's per-serving figures. */
export function scaleMacros(macros: Macros, people: number): Macros {
	const multiplier = Number.isFinite(people) && people > 0 ? people : 1;
	return {
		calories: Math.round(macros.calories * multiplier),
		protein: Math.round(macros.protein * multiplier * 10) / 10,
		carbs: Math.round(macros.carbs * multiplier * 10) / 10,
		fat: Math.round(macros.fat * multiplier * 10) / 10,
		fiber:
			macros.fiber === null
				? null
				: Math.round(macros.fiber * multiplier * 10) / 10,
	};
}

/** Hands-on plus cooking time, or `null` when the recipe states neither. */
export function totalMinutes(recipe: Recipe): number | null {
	if (recipe.prepMinutes === null && recipe.cookMinutes === null) return null;
	return (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);
}

/** `95 min` as `1 h 35 min`. */
export function formatMinutes(minutes: number): string {
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/**
 * Share of calories, per macro, for a stacked bar. Uses 4/4/9 kcal per gram
 * rather than the stated calorie count, so the three slices always add to 100%.
 */
export function macroSplit(macros: Macros): {
	protein: number;
	carbs: number;
	fat: number;
} {
	const proteinKcal = macros.protein * 4;
	const carbsKcal = macros.carbs * 4;
	const fatKcal = macros.fat * 9;
	const total = proteinKcal + carbsKcal + fatKcal;
	if (total <= 0) return { protein: 0, carbs: 0, fat: 0 };
	return {
		protein: (proteinKcal / total) * 100,
		carbs: (carbsKcal / total) * 100,
		fat: (fatKcal / total) * 100,
	};
}
