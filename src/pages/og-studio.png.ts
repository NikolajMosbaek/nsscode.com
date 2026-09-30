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

const dbfIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfbfd"/><stop offset="1" stop-color="#e6e6ec"/></linearGradient><clipPath id="c"><path d="M0 0h184v88H0zM0 96h184v88H0z"/></clipPath></defs><rect width="240" height="240" fill="url(#g)"/><g transform="translate(28 28)"><g fill="none" stroke="#00B1A3" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#c)"><path d="M18 42v100h18c26 0 39-17 39-50S62 42 36 42H18"/><path d="M87 42v100M87 42h17c20 0 30 10 30 25s-10 25-30 25H87M104 92c22 0 34 10 34 25s-12 25-34 25H87"/><path d="M151 142V42h31M151 92h29"/></g><circle cx="184" cy="92" r="6" fill="#E99B2A"/></g></svg>`;

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
			background: "radial-gradient(circle at 40% 30%, #123a36 0%, #09090a 55%)",
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
