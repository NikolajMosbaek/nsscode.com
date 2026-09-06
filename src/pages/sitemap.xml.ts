import type { APIRoute } from "astro";
import { site } from "../data/site";
import { buildRegistry, type ExperimentMeta, listed } from "../lib/registry";

export const GET: APIRoute = () => {
	const modules = import.meta.glob<{ default: ExperimentMeta }>(
		"../experiments/*/meta.ts",
		{ eager: true },
	);
	const paths = [
		"/",
		"/lab/",
		"/colophon/",
		...listed(buildRegistry(modules)).map((e) => e.href),
	];
	const urls = paths
		.map((path) => `  <url><loc>${new URL(path, site.url).href}</loc></url>`)
		.join("\n");
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
	return new Response(body, {
		headers: { "Content-Type": "application/xml; charset=utf-8" },
	});
};
