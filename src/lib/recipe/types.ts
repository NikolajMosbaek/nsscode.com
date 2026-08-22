/** A single ingredient line. Quantities are stored per the recipe's base servings. */
export interface Ingredient {
	item: string;
	/** `null` for unmeasured entries ("salt, to taste"). */
	quantity: number | null;
	unit: string | null;
	note: string | null;
	/** `false` keeps the quantity fixed when the cook changes the head count. */
	scales: boolean;
}

export interface Step {
	text: string;
	/** Rough hands-on time for this step, if worth stating. */
	minutes: number | null;
}

/** Always per single serving once a recipe has been through `parseRecipe`. */
export interface Macros {
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
	fiber: number | null;
}

export type MacroKey = keyof Macros;

export interface Recipe {
	title: string;
	description: string;
	/** Head count the ingredient quantities are written for. */
	servings: number;
	/** 0–5, in half steps. */
	rating: number;
	tags: string[];
	prepMinutes: number | null;
	cookMinutes: number | null;
	source: string | null;
	ingredients: Ingredient[];
	steps: Step[];
	macros: Macros;
}

export interface RecipeEntry {
	slug: string;
	recipe: Recipe;
}

/** A recipe held in the browser only, straight off the upload tool. */
export interface RecipeDraft extends RecipeEntry {
	/** Epoch millis. */
	savedAt: number;
}
