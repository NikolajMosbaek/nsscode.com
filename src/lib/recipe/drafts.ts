import type { Recipe, RecipeDraft } from "./types";

const KEY = "nsscode:recipe-drafts";

/**
 * Drafts live in the browser only — pasting a recipe into the upload tool puts
 * it on the site for you immediately, without waiting for a commit and deploy.
 * Every access is guarded: private windows and blocked site data both throw.
 */
function read(): RecipeDraft[] {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? (parsed as RecipeDraft[]) : [];
	} catch {
		return [];
	}
}

function write(drafts: RecipeDraft[]): boolean {
	try {
		localStorage.setItem(KEY, JSON.stringify(drafts));
		return true;
	} catch {
		return false;
	}
}

export function listDrafts(): RecipeDraft[] {
	return read().sort((a, b) => b.savedAt - a.savedAt);
}

export function getDraft(slug: string): RecipeDraft | null {
	return read().find((draft) => draft.slug === slug) ?? null;
}

/** Saves under `slug`, replacing any earlier draft with the same slug. */
export function saveDraft(
	slug: string,
	recipe: Recipe,
	savedAt: number,
): boolean {
	const rest = read().filter((draft) => draft.slug !== slug);
	return write([...rest, { slug, recipe, savedAt }]);
}

export function deleteDraft(slug: string): boolean {
	return write(read().filter((draft) => draft.slug !== slug));
}
