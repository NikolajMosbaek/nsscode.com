import { parseRecipeJson } from "../../lib/recipe/parse";
import type { Recipe } from "../../lib/recipe/types";
import { err, ok, type Result } from "../../lib/result";

export interface PreparedUpload {
	slug: string;
	recipe: Recipe;
	fileName: string;
	/** Exactly what belongs in `src/recipes/<slug>.json`. */
	fileText: string;
}

/** Title to file name: lowercase, ASCII-ish, hyphen-separated. */
export function slugify(title: string): string {
	return (
		title
			.normalize("NFD")
			// Strip combining accents, so "Crème" lands on "creme".
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/ø/gi, "o")
			.replace(/æ/gi, "ae")
			.replace(/å/gi, "a")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "")
			.slice(0, 60)
			.replace(/-+$/g, "")
	);
}

/** The recipe as a committable file: stable key order, tab indent, trailing newline. */
export function toFileText(recipe: Recipe): string {
	const ordered = {
		title: recipe.title,
		description: recipe.description,
		servings: recipe.servings,
		rating: recipe.rating,
		tags: recipe.tags,
		prepMinutes: recipe.prepMinutes,
		cookMinutes: recipe.cookMinutes,
		source: recipe.source,
		ingredients: recipe.ingredients,
		steps: recipe.steps,
		macros: recipe.macros,
	};
	return `${JSON.stringify(ordered, null, "\t")}\n`;
}

/**
 * Validates pasted JSON and works out where it would live. `slugOverride` lets
 * the cook rename the file without touching the recipe.
 */
export function prepareUpload(
	json: string,
	slugOverride = "",
): Result<PreparedUpload> {
	const parsed = parseRecipeJson(json);
	if (!parsed.ok) return err(parsed.error);

	const recipe = parsed.value;
	const slug = slugify(
		slugOverride.trim() === "" ? recipe.title : slugOverride,
	);
	if (slug === "")
		return err("That name leaves nothing to build a file name from.");

	return ok({
		slug,
		recipe,
		fileName: `src/recipes/${slug}.json`,
		fileText: toFileText(recipe),
	});
}
