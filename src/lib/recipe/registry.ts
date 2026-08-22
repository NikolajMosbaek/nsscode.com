import { parseRecipe } from "./parse";
import type { RecipeEntry } from "./types";

export function slugFromPath(path: string): string {
	const match = path.match(/\/recipes\/([^/]+)\.json$/);
	if (!match) throw new Error(`Cannot derive a recipe slug from "${path}"`);
	return match[1];
}

/**
 * Validates every recipe file at build time. A recipe missing its ingredients,
 * steps, servings, macros or rating fails the build here rather than shipping a
 * half-empty page.
 */
export function buildRecipeRegistry(
	modules: Record<string, { default: unknown }>,
): RecipeEntry[] {
	return Object.entries(modules)
		.map(([path, mod]) => {
			const slug = slugFromPath(path);
			const result = parseRecipe(mod.default);
			if (!result.ok) {
				throw new Error(`Invalid recipe "${slug}":\n${result.error}`);
			}
			return { slug, recipe: result.value };
		})
		.sort(
			(a, b) =>
				b.recipe.rating - a.recipe.rating ||
				a.recipe.title.localeCompare(b.recipe.title),
		);
}

/** Every tag in use, most-used first, for the index filter. */
export function collectTags(entries: RecipeEntry[]): string[] {
	const counts = new Map<string, number>();
	for (const entry of entries) {
		for (const tag of entry.recipe.tags) {
			counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
	}
	return [...counts.entries()]
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.map(([tag]) => tag);
}
