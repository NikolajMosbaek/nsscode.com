export interface ToolMeta {
	title: string;
	description: string;
	tags: string[];
}

export interface ToolEntry extends ToolMeta {
	slug: string;
}

export function slugFromPath(path: string): string {
	const match = path.match(/\/tools\/([^/]+)\//);
	if (!match) throw new Error(`Cannot derive a tool slug from "${path}"`);
	return match[1];
}

export function buildRegistry(
	modules: Record<string, { default: ToolMeta }>,
): ToolEntry[] {
	return Object.entries(modules)
		.map(([path, mod]) => ({ ...mod.default, slug: slugFromPath(path) }))
		.sort((a, b) => a.title.localeCompare(b.title));
}

export function wrapperFor<T>(
	modules: Record<string, { default: T }>,
	slug: string,
): T {
	const hit = Object.entries(modules).find(
		([path]) => slugFromPath(path) === slug,
	);
	if (!hit) throw new Error(`No Tool.astro found for tool "${slug}"`);
	return hit[1].default;
}
