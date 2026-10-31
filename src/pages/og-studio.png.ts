import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { Resvg } from "@resvg/resvg-js";
import type { APIRoute } from "astro";
import satori from "satori";

/* Share image for the front page: dark, the two app icons, one line. */

const require = createRequire(import.meta.url);

const fontFile = (pkg: string, file: string) =>
	readFile(require.resolve(`${pkg}/files/${file}`));

type Node = { type: string; props: Record<string, unknown> };
const el = (
	type: string,
	style: Record<string, string | number>,
	children?: Node | Node[] | string,
	extra: Record<string, unknown> = {},
): Node => ({ type, props: { style, children, ...extra } });

const dbfIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfbfd"/><stop offset="1" stop-color="#e6e6ec"/></linearGradient><clipPath id="c"><path clip-rule="evenodd" d="M0 0h100v100H0z M37.33 76.10m-1.97 0a1.97 1.97 0 1 0 3.94 0a1.97 1.97 0 1 0 -3.94 0z" /></clipPath></defs><rect width="100" height="100" fill="url(#g)"/><g clip-path="url(#c)"><rect x="18.00" y="21.00" width="64.00" height="5.8" rx="2.9" fill="#8E8E93" fill-opacity="0.2" /><rect x="18.00" y="21.00" width="24.00" height="5.8" rx="2.9" fill="#5b5bd6" /><rect x="63.33" y="21.00" width="18.67" height="5.8" rx="2.9" fill="#5b5bd6" /><rect x="18.00" y="29.70" width="64.00" height="5.8" rx="2.9" fill="#8E8E93" fill-opacity="0.2" /><rect x="18.00" y="29.70" width="24.00" height="5.8" rx="2.9" fill="#5b5bd6" /><rect x="63.33" y="29.70" width="18.67" height="5.8" rx="2.9" fill="#5b5bd6" /><rect x="18.00" y="38.40" width="64.00" height="5.8" rx="2.9" fill="#8E8E93" fill-opacity="0.2" /><rect x="18.00" y="38.40" width="24.00" height="5.8" rx="2.9" fill="#5b5bd6" /><rect x="64.00" y="38.40" width="18.00" height="5.8" rx="2.9" fill="#5b5bd6" /><rect x="18.00" y="47.10" width="64.00" height="5.8" rx="2.9" fill="#8E8E93" fill-opacity="0.2" /><rect x="18.00" y="47.10" width="24.67" height="5.8" rx="2.9" fill="#5b5bd6" /><rect x="63.33" y="47.10" width="18.67" height="5.8" rx="2.9" fill="#5b5bd6" /><rect x="18.00" y="55.80" width="64.00" height="5.8" rx="2.9" fill="#8E8E93" fill-opacity="0.2" /><rect x="18.00" y="55.80" width="25.33" height="5.8" rx="2.9" fill="#5b5bd6" /><rect x="64.67" y="55.80" width="17.33" height="5.8" rx="2.9" fill="#5b5bd6" /><rect x="40.43" y="55.80" width="6.90" height="5.8" rx="2.9" fill="#e99b2a" /><rect x="18.00" y="64.50" width="64.00" height="5.8" rx="2.9" fill="#8E8E93" fill-opacity="0.2" /><rect x="18.00" y="64.50" width="25.33" height="5.8" rx="2.9" fill="#5b5bd6" /><rect x="63.33" y="64.50" width="18.67" height="5.8" rx="2.9" fill="#5b5bd6" /><rect x="18.00" y="73.20" width="64.00" height="5.8" rx="2.9" fill="#8E8E93" fill-opacity="0.2" /><rect x="18.00" y="73.20" width="19.33" height="5.8" rx="2.9" fill="#5b5bd6" /></g><circle cx="37.33" cy="76.10" r="3.07" fill="none" stroke="#e99b2a" stroke-width="2.20" /></svg>`;

const mealIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a7d5d"/><stop offset="1" stop-color="#24573f"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#g)"/><circle cx="512" cy="512" r="256" fill="none" stroke="#E3EBE4" stroke-opacity="0.25" stroke-width="120"/><circle cx="512" cy="512" r="256" fill="none" stroke="#E3EBE4" stroke-width="120" stroke-linecap="round" stroke-dasharray="1158.116 1608.495" transform="rotate(-90 512 512)"/></svg>`;

const icon = (svg: string): Node =>
	el("img", { width: 150, height: 150, borderRadius: 34 }, undefined, {
		src: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
		width: 150,
		height: 150,
	});

export const GET: APIRoute = async () => {
	const [semibold, medium] = await Promise.all([
		fontFile(
			"@fontsource/bricolage-grotesque",
			"bricolage-grotesque-latin-600-normal.woff",
		),
		fontFile(
			"@fontsource/bricolage-grotesque",
			"bricolage-grotesque-latin-500-normal.woff",
		),
	]);

	const tree = el(
		"div",
		{
			width: "100%",
			height: "100%",
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			gap: 44,
			background: "radial-gradient(circle at 40% 30%, #1f2347 0%, #09090a 55%)",
			color: "#f2f2ef",
			fontFamily: "Bricolage Grotesque",
		},
		[
			el("div", { display: "flex", gap: 28 }, [icon(dbfIcon), icon(mealIcon)]),
			el(
				"div",
				{
					fontSize: 92,
					fontWeight: 600,
					letterSpacing: "-0.05em",
					lineHeight: 1,
					textAlign: "center",
					maxWidth: 1000,
				},
				"Apps that keep to themselves.",
			),
			el(
				"div",
				{ fontSize: 28, fontWeight: 500, color: "#9c9e9a" },
				"nsscode · iPhone apps from Copenhagen",
			),
		],
	);

	const svg = await satori(tree as never, {
		width: 1200,
		height: 630,
		fonts: [
			{
				name: "Bricolage Grotesque",
				data: semibold,
				weight: 600,
				style: "normal",
			},
			{
				name: "Bricolage Grotesque",
				data: medium,
				weight: 500,
				style: "normal",
			},
		],
	});

	const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
		.render()
		.asPng();

	return new Response(new Uint8Array(png), {
		headers: { "Content-Type": "image/png" },
	});
};
