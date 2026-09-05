/*
 * Build-time registry for experiments in `src/experiments/<slug>/`.
 * A folder is an experiment. `listed: false` keeps it off the lab index,
 * out of the sitemap and marked noindex, but it still builds at its URL.
 */

export interface ExperimentMeta {
	title: string;
	summary: string;
	/** ISO date, used for ordering. */
	date: string;
	listed: boolean;
	tags?: string[];
}

export interface ExperimentEntry extends ExperimentMeta {
	slug: string;
	href: string;
}

export function slugFromPath(path: string): string {
	const match = path.match(/\/experiments\/([^/]+)\//);
	if (!match) throw new Error(`Cannot derive a slug from "${path}"`);
	return match[1];
}

export function buildRegistry(
	modules: Record<string, { default: ExperimentMeta }>,
): ExperimentEntry[] {
	return Object.entries(modules)
		.map(([path, mod]) => {
			const slug = slugFromPath(path);
			return { ...mod.default, slug, href: `/lab/${slug}/` };
		})
		.sort(
			(a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
		);
}

export function listed(entries: ExperimentEntry[]): ExperimentEntry[] {
	return entries.filter((entry) => entry.listed);
}

export function wrapperFor<T>(
	modules: Record<string, { default: T }>,
	slug: string,
): T {
	const hit = Object.entries(modules).find(
		([path]) => slugFromPath(path) === slug,
	);
	if (!hit) throw new Error(`No Experiment.astro found for "${slug}"`);
	return hit[1].default;
}
